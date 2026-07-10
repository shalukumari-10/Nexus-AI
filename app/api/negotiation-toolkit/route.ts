import { NextRequest, NextResponse } from "next/server";
import { buildNegotiationMessage } from "@/lib/fallback-analysis";
import { Flag } from "@/lib/types";

const NVIDIA_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";

interface ToolkitInput {
  category: string;
  tone: "Friendly" | "Firm" | "Professional";
  dealValue?: string;
  brandName?: string;
}

function fakeFlagFromCategory(category: string): Flag {
  return {
    id: "flag-1",
    severity: "yellow",
    category,
    clause: "",
    explanation: "",
    creatorImpact: "",
    suggestedCounterLanguage: "",
  };
}

function localTemplates(input: ToolkitInput) {
  const flag = fakeFlagFromCategory(input.category);
  const brand = input.brandName ? ` ${input.brandName}` : "";
  const value = input.dealValue ? ` for the ${input.dealValue} deal` : "";

  return {
    whatsapp: `Hey${brand}! 👋 Quick one — before I sign, can we tweak the ${input.category.toLowerCase()} clause${value}? I sent over some suggested wording, lmk what you think!`,
    email: buildNegotiationMessage([flag], "Professional"),
    firm: buildNegotiationMessage([flag], "Firm"),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ToolkitInput;
    const { category, tone, dealValue, brandName } = body;

    if (!category) {
      return NextResponse.json({ error: "category is required." }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ...localTemplates(body), source: "fallback" });
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const prompt = `Generate 3 negotiation messages a creator can send to a brand${brandName ? ` (${brandName})` : ""} about a "${category}" contract clause${dealValue ? `, deal value ${dealValue}` : ""}. Preferred tone: ${tone}.

Return ONLY valid JSON, no markdown:
{
  "whatsapp": "<short casual WhatsApp-style message, 2-3 sentences>",
  "email": "<professional email, 4-6 sentences with greeting and sign-off>",
  "firm": "<firm/direct negotiation message, 3-5 sentences>"
}`;

      const resp = await fetch(NVIDIA_ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: NVIDIA_MODEL,
          messages: [
            { role: "system", content: "You write negotiation messages for creators dealing with brand contracts. Return only valid JSON." },
            { role: "user", content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 800,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!resp.ok) throw new Error(`NVIDIA API error ${resp.status}`);
      const data = await resp.json();
      const text: string = data?.choices?.[0]?.message?.content || "";
      const cleaned = text.replace(/```json[\s\S]*?```/g, (m) => m.slice(7, -3)).replace(/```/g, "").trim();

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
        else throw new Error("Could not parse toolkit JSON");
      }

      if (!parsed.whatsapp || !parsed.email || !parsed.firm) {
        throw new Error("Incomplete toolkit response");
      }

      return NextResponse.json({ ...parsed, source: "ai" });
    } catch (e) {
      console.error("[negotiation-toolkit] AI failed, using fallback:", e);
      return NextResponse.json({ ...localTemplates(body), source: "fallback" });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
