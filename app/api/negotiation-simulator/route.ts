import { NextRequest, NextResponse } from "next/server";

const NVIDIA_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";

interface ChatMessage {
  sender: "client" | "nexus";
  text: string;
}

interface SimulatorInput {
  message: string;
  history: ChatMessage[];
  clause: {
    category: string;
    originalClause: string;
    nexusProposal: string;
    severity: string;
    clientCounter?: string;
  };
  difficulty: "easy" | "medium" | "hard";
  agreementName: string;
  profile?: any;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SimulatorInput;
    const { message, history, clause, difficulty, agreementName, profile } = body;

    if (!message || !clause) {
      return NextResponse.json({ error: "message and clause are required." }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      // Fallback response generator if API key is not configured
      return generateMockResponse(message, clause, difficulty);
    }

    // Determine persona based on difficulty & agreement
    let persona = "Procurement Head";
    let styleGuide = "polite, reasonable, willing to compromise quickly if the user makes sense.";
    if (difficulty === "hard") {
      persona = "Enterprise Corporate Legal Counsel";
      styleGuide = "very defensive of company liabilities, stubborn, insists on strict legal limits, demands concessions, rejects weak arguments, and only agrees to balanced terms after a strong fight.";
    } else if (difficulty === "medium") {
      persona = "Startup Founder & Ops Lead";
      styleGuide = "focused on business speed, fair, seeks balanced compromises, and counters with reasonable numbers.";
    }

    const systemPrompt = `You are playing the role of the CLIENT representative in a contract negotiation. 
Your persona is: ${persona}.
Your negotiation style is: ${styleGuide}

You are negotiating the following contract clause for the agreement "${agreementName}":
- Category: ${clause.category}
- Risk Severity: ${clause.severity}
- Original Clause (which favors you): "${clause.originalClause}"
- Nexus Proposal (which favors the contractor/user): "${clause.nexusProposal}"

Your goal is to defend your company's interests while maintaining a professional business relationship. 
- You must NOT agree immediately. Pushes back against proposals that leave you unprotected.
- Assess the user's counter-proposals based on your style guide.
- If terms are fair and balanced, you can counter-offer or agree.
- You must output your response in JSON format. Do not write anything outside the JSON blocks.

Format your output exactly as a JSON object:
{
  "text": "Your conversational reply to the user, arguing or countering as the client representative.",
  "successRate": 0-100 percentage representing progress toward deal agreement (starts low, increases as terms are settled),
  "protectionRate": 0-100 percentage representing user/contractor protection under current terms,
  "moneySaved": estimated USD amount saved by the contractor/user due to terms negotiated so far,
  "riskReduced": 0-100 percentage representing risk reduction for user/contractor,
  "agreed": true/false (set to true ONLY when you accept the user's terms completely and final wording is settled),
  "finalVersion": "The final mutually agreed clause wording (set ONLY when agreed is true)"
}

Do not repeat introductions or greetings. Act as a human negotiator in a multi-turn conversation.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(m => ({
        role: m.sender === "client" ? "assistant" : "user",
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
          response_format: { type: "json_object" }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!resp.ok) {
        throw new Error(`NVIDIA endpoint returned status ${resp.status}`);
      }

      const json = await resp.json();
      const rawText = json.choices?.[0]?.message?.content || "";
      const result = JSON.parse(rawText);

      return NextResponse.json(result);
    } catch (err) {
      clearTimeout(timeout);
      console.error("NVIDIA simulator fetch failed, falling back:", err);
      return generateMockResponse(message, clause, difficulty);
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to process negotiation response." }, { status: 500 });
  }
}

// Fallback logic to generate realistic counter offers without API
function generateMockResponse(message: string, clause: any, difficulty: string) {
  const lower = message.toLowerCase();
  let text = "";
  let successRate = 45;
  let protectionRate = 50;
  let moneySaved = 500;
  let riskReduced = 30;
  let agreed = false;
  let finalVersion = "";

  if (lower.includes("agree") || lower.includes("accept") || lower.includes("compromise")) {
    text = `We appreciate your flexibility. We can agree to standard terms on this clause if we set a reasonable cap. Let's document this revision.`;
    successRate = 90;
    protectionRate = 75;
    moneySaved = 1500;
    riskReduced = 70;
    agreed = true;
    finalVersion = clause.nexusProposal;
  } else if (lower.includes("cap") || lower.includes("limit") || lower.includes("round") || lower.includes("fee")) {
    text = `We see your point about operational risk, but a full cap is too low. We can accept a compromise of 1.5x standard terms or 3 revision rounds instead. What do you think?`;
    successRate = 70;
    protectionRate = 60;
    moneySaved = 1000;
    riskReduced = 50;
  } else {
    text = `Our operations team requires strict coverage under this clause. Your proposal of "${clause.nexusProposal}" leaves us too exposed. Can we explore a middle ground?`;
    successRate = 50;
    protectionRate = 40;
    moneySaved = 200;
    riskReduced = 20;
  }

  return NextResponse.json({
    text,
    successRate,
    protectionRate,
    moneySaved,
    riskReduced,
    agreed,
    finalVersion
  });
}
