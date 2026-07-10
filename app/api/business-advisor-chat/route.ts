import { NextRequest, NextResponse } from "next/server";
import { AnalysisResult } from "@/lib/types";
import { generateAdvisorResponse } from "@/lib/chat-context";

const NVIDIA_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";

interface ChatMessageInput {
  sender: "user" | "nexus";
  text: string;
}

interface ChatInput {
  message: string;
  history: ChatMessageInput[];
  analysisResult: AnalysisResult;
  contractText?: string;
  profile?: {
    name?: string;
    category?: string;
    platforms?: string[];
    followers?: string;
    location?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatInput;
    const { message, history, analysisResult, contractText, profile } = body;

    if (!message || !analysisResult) {
      return NextResponse.json({ error: "message and analysisResult are required." }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    console.log("API KEY FOUND:", !!apiKey);
    if (!apiKey) {
      // Fallback local advisor response
      const fallbackReply = generateAdvisorResponse(message, analysisResult);
      return NextResponse.json({ text: fallbackReply, source: "fallback" });
    }

    const clientName = analysisResult.brandName || "the client";
    const agreementName = analysisResult.contractName || "the agreement";
    const riskScore = Math.round(analysisResult.riskScore || 0);
    const riskLevel = analysisResult.overallRiskLevel || "Low";

    const systemPrompt = `You are Nexus, a Senior Business Consultant, Contract Intelligence Expert, Risk Advisor, and Negotiation Coach at Nexus AI. Your purpose is to assist the business user in evaluating their contract or business agreement.

Here is the context of the agreement currently under review:
- Risk Score: ${riskScore}/100
- Risk Level: ${riskLevel}
- Client Name: ${clientName}
- Agreement Name: ${agreementName}
- Summary of Findings: ${analysisResult.summary}
- Flagged Clauses:
${analysisResult.flags.map((f, i) => `${i + 1}. [${f.severity.toUpperCase()}] ${f.category}:
   - Clause: "${f.clause}"
   - Explanation: ${f.explanation}
   - Business Impact: ${f.creatorImpact || "N/A"}
   - Suggested Counter-Language: "${f.suggestedCounterLanguage}"
   - Estimated Financial Impact: ${f.estimatedFinancialImpact || "N/A"}`).join("\n\n")}

${profile ? `Organization Context:
- Name: ${profile.name || "N/A"}
- Category: ${profile.category || "N/A"}
- Industry: ${(profile.platforms || []).join(", ") || "N/A"}
- Size: ${profile.followers || "N/A"}
- Country: ${profile.location || "N/A"}` : ""}

${contractText ? `Full Agreement Snippet:
${contractText.substring(0, 8000)}` : ""}

Guidelines for response:
1. Explain clauses in simple, plain-English language.
2. Detect specific business risks and suggest clear, actionable negotiation strategies or counter-language options.
3. Recommend clear next steps.
4. Estimate operational/business impact.
5. If the user asks general questions, guide them based on the contract context. 
6. NEVER fabricate terms, numbers, or details that are not present in the contract context or analysis findings.
7. Support informal queries, spelling mistakes, and follow-up requests. Respond in a professional, helpful, premium SaaS tone. Keep responses relatively concise, well-structured (using bullet points and bold styling where appropriate). Make sure you highlight key elements using **bold** tags. Do not use markdown headers (# or ##) to format text, use standard bold tags and lists.
8. When the user asks specific questions (e.g. "Should I sign?", "What are the risks?", "Can I lose money?", "Explain payment terms"), structure your response to provide:
   - **Summary**: A concise answer to the user's question.
   - **Reasoning**: Plain-language logic explaining the answer.
   - **Business Impact**: How this affects business operations, partnerships, or workflows.
   - **Financial Impact**: Estimated monetary exposure or revenue impact.
   - **Suggested Action**: Specific next steps or negotiation counter-proposals.
9. Avoid repeating introductions, warnings, or greetings from your first message. Speak naturally.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(m => ({
        role: m.sender === "nexus" ? "assistant" : "user",
        content: m.text
      })),
      { role: "user", content: message }
    ];

    try {
      const resp = await fetch(NVIDIA_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: NVIDIA_MODEL,
          messages,
          temperature: 0.5,
          max_tokens: 1500,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!resp.ok) {
        throw new Error(`NVIDIA endpoint returned status ${resp.status}`);
      }

      const json = await resp.json();
      const reply = json.choices?.[0]?.message?.content || "";
      console.log("AI RESPONSE:", reply);

      if (!reply) {
        throw new Error("Empty reply from NVIDIA endpoint");
      }

      return NextResponse.json({ text: reply, source: "ai" });
    } catch (err) {
      clearTimeout(timeout);
      console.error("AI FAILED:", err);
      const fallbackReply = generateAdvisorResponse(message, analysisResult);
      return NextResponse.json({ text: fallbackReply, source: "fallback" });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to process chat request." }, { status: 500 });
  }
}
