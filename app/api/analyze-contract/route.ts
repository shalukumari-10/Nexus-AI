import { NextRequest, NextResponse } from "next/server";
import { runFallbackAnalysis, buildNegotiationMessage } from "@/lib/fallback-analysis";
import { AnalysisResult } from "@/lib/types";

const NVIDIA_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";

interface CreatorProfileInput {
  name?: string;
  category?: string;
  platforms?: string[];
  followers?: string;
  location?: string;
}

function buildSystemPrompt(profile?: CreatorProfileInput): string {
  const profileContext = profile
    ? `\n\nOrganization context (use this to tailor business impact estimates and tone, but analyze the contract on its own merits):
- Organization Name: ${profile.name || "N/A"}
- Business Category: ${profile.category || "N/A"}
- Industry: ${(profile.platforms || []).join(", ") || "N/A"}
- Organization Size: ${profile.followers || "N/A"}
- Country: ${profile.location || "N/A"}`
    : "";

  return `You are Nexus AI, a universal AI business trust intelligence platform. You analyze business agreements (such as employment, vendor, service, SaaS, freelance, creator, partnership, consulting, and NDAs) from the business user's perspective. You are not providing formal legal advice — you identify one-sided or risky clauses business users should review before signing.${profileContext}

Analyze the agreement clause by clause. Detect these risk categories wherever present:
1. IP Overreach / Unlimited Usage Rights (perpetual, irrevocable, worldwide licenses)
2. Unclear Service Usage / License Overreach
3. Vague or delayed payment terms
4. Missing termination protection / kill fees
5. Restricted client exclusivity
6. Unlimited revision rounds
7. Vague morality or conduct clauses
8. One-sided termination rights
9. Client ownership of assets / IP (work-for-hire, complete IP transfer)
10. Confidentiality overreach
11. Transferable / sublicensable rights to third parties without consent
12. No approval rights before publishing or publishing alterations

For each flagged clause return:
- severity: "red" (seriously disadvantages the business), "yellow" (worth negotiating), or "green" (fair/business-friendly)
- category: short name of the issue
- clause: the original clause text (verbatim or closely paraphrased, max ~250 chars)
- explanation: plain-English explanation of what the clause actually means
- creatorImpact: specifically why this matters to the business's operations, rights, or financial health (Note: Keep JSON key as "creatorImpact" for compatibility, but write the text value for the business perspective)
- suggestedCounterLanguage: fairer replacement clause the business could propose
- estimatedFinancialImpact: a short phrase estimating financial/opportunity risk (e.g. "Potential impact: 2x-5x project value in unpaid reuse")

Calculate riskScore (0-100) based on: severity of each flag, number of red flags, financial impact, and how much the clauses restrict the business. Low Risk: 0-30. Moderate Risk: 31-60. High Risk: 61-100. A fair agreement should score around 15-25. A highly exploitative agreement should score 80+.

Also generate:
- negotiationMessage: a ready-to-send, professional negotiation email addressing the top issues found
- recommendedActions: an array of 3-5 short, specific next-step strings for the business user

Return ONLY a valid JSON object, no markdown, no code fences, no preamble. Exactly this shape:
{
  "overallRiskLevel": "Low" | "Moderate" | "High",
  "riskScore": <integer 0-100>,
  "summary": "<2-3 sentence overview>",
  "flags": [
    {
      "id": "flag-1",
      "severity": "red" | "yellow" | "green",
      "category": "<category>",
      "clause": "<clause text>",
      "explanation": "<plain-English explanation>",
      "creatorImpact": "<business-specific impact>",
      "suggestedCounterLanguage": "<fairer replacement>",
      "estimatedFinancialImpact": "<short financial impact phrase>"
    }
  ],
  "negotiationMessage": "<ready-to-send email>",
  "recommendedActions": ["<action 1>", "<action 2>", "<action 3>"]
}

If the contract has no risky clauses, return a low risk score with green flags noting what the contract does well, plus appropriate recommendedActions.`;
}

function parseModelJSON(raw: string): AnalysisResult | null {
  const cleaned = raw
    .replace(/```json[\s\S]*?```/g, (m) => m.slice(7, -3))
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function isValidAnalysis(obj: unknown): obj is AnalysisResult {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    Array.isArray(o.flags) &&
    typeof o.riskScore === "number" &&
    typeof o.summary === "string" &&
    typeof o.overallRiskLevel === "string"
  );
}

async function callNvidia(contractText: string, profile?: CreatorProfileInput): Promise<AnalysisResult> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const resp = await fetch(NVIDIA_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt(profile) },
          { role: "user", content: `Analyze this contract:\n\n${contractText.substring(0, 10000)}` },
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 4096,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => "");
      throw new Error(`NVIDIA API error (${resp.status}): ${errBody.slice(0, 200)}`);
    }

    const data = await resp.json();
    const rawText: string = data?.choices?.[0]?.message?.content || "";
    if (!rawText) throw new Error("Empty response from NVIDIA API");

    const parsed = parseModelJSON(rawText);
    if (!parsed || !isValidAnalysis(parsed)) {
      throw new Error("Could not parse valid analysis JSON from NVIDIA response");
    }

    // normalize flag ids if missing
    parsed.flags = parsed.flags.map((f, i) => ({ ...f, id: f.id || `flag-${i + 1}` }));
    parsed.source = "ai";
    if (!parsed.negotiationMessage) {
      parsed.negotiationMessage = buildNegotiationMessage(parsed.flags, "Professional");
    }
    if (!Array.isArray(parsed.recommendedActions)) {
      parsed.recommendedActions = [];
    }

    return parsed;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractText, creatorProfile } = body as {
      contractText?: string;
      creatorProfile?: CreatorProfileInput;
    };

    if (!contractText || typeof contractText !== "string") {
      return NextResponse.json(
        { error: "contractText is required and must be a string." },
        { status: 400 }
      );
    }

    const trimmed = contractText.trim();
    if (trimmed.length < 50) {
      return NextResponse.json(
        { error: "Contract text is too short. Please paste more of the document (minimum 50 characters)." },
        { status: 400 }
      );
    }

    try {
      const result = await callNvidia(trimmed, creatorProfile);
      return NextResponse.json(result);
    } catch (aiError) {
      // AI failed — use keyword-based fallback so the demo never breaks
      console.error("[analyze-contract] NVIDIA API failed, using fallback:", aiError);
      const fallback = runFallbackAnalysis(trimmed);
      return NextResponse.json(fallback);
    }
  } catch (err: unknown) {
    console.error("[analyze-contract] fatal error:", err);
    const message = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
