import { NextRequest, NextResponse } from "next/server";

const NVIDIA_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";

const SYSTEM = `You rewrite one-sided brand-creator contract clauses into fair, creator-friendly versions. Keep the rewritten clause concise (2-4 sentences), professional, and realistic for an influencer marketing contract. Return ONLY the rewritten clause text, no preamble, no quotes, no markdown.`;

function localRewrite(clause: string): string {
  const lower = clause.toLowerCase();
  if (lower.includes("perpetu") || lower.includes("worldwide") || lower.includes("irrevocable")) {
    return "Brand may use the Content organically for 90 days from the post date. Any paid advertising, whitelisting, or extended usage requires separate written approval and additional compensation.";
  }
  if (lower.includes("whitelist") || lower.includes("dark post") || lower.includes("boosted")) {
    return "Any use of Creator's Content in paid advertising, whitelisting, or dark posts requires a separate written agreement and additional compensation of no less than 50% of the base fee.";
  }
  if (lower.includes("kill fee") || lower.includes("cancel")) {
    return "If Brand cancels after Creator has begun production, Brand shall pay a kill fee of 50% of the total fee for work-in-progress, or 100% if final content has been delivered.";
  }
  if (lower.includes("exclus")) {
    return "Creator agrees to a 60-day exclusivity period limited to direct competitors in the specific product category, in exchange for an exclusivity fee equal to 25% of the base campaign fee.";
  }
  if (lower.includes("revision")) {
    return "Creator will provide up to 2 rounds of revisions. Additional revision rounds will be billed at an hourly rate agreed in advance.";
  }
  if (lower.includes("terminat") || lower.includes("sole discretion")) {
    return "Brand may terminate only for material breach, with 14 days written notice and an opportunity to cure. Termination without cause requires payment of all fees for work completed.";
  }
  if (lower.includes("work-for-hire") || lower.includes("work for hire") || lower.includes("own")) {
    return "Creator retains ownership and copyright of the Content. Brand receives a non-exclusive license to use the Content as outlined in the usage rights section.";
  }
  return "This clause should be revised to clearly define scope, duration, and compensation in a way that's balanced for both parties. Consider adding specific limits, timelines, and fair compensation terms.";
}

export async function POST(req: NextRequest) {
  try {
    const { clause } = await req.json();
    if (!clause || typeof clause !== "string" || clause.trim().length < 5) {
      return NextResponse.json({ error: "A clause of at least 5 characters is required." }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ rewrittenClause: localRewrite(clause), source: "fallback" });
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const resp = await fetch(NVIDIA_ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: NVIDIA_MODEL,
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: `Original clause:\n"${clause}"\n\nRewrite this fairly for the creator.` },
          ],
          temperature: 0.4,
          max_tokens: 400,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!resp.ok) throw new Error(`NVIDIA API error ${resp.status}`);
      const data = await resp.json();
      const text: string = data?.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("Empty rewrite response");

      return NextResponse.json({ rewrittenClause: text.replace(/^["']|["']$/g, ""), source: "ai" });
    } catch (e) {
      console.error("[rewrite-clause] AI failed, using fallback:", e);
      return NextResponse.json({ rewrittenClause: localRewrite(clause), source: "fallback" });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
