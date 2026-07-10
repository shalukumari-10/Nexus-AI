import { AnalysisResult, Flag } from "./types";

/**
 * Fallback keyword-based contract analyzer.
 * Runs when the NVIDIA API fails, times out, or returns unparseable JSON.
 * Produces DIFFERENT results for different contract text by scanning for
 * known risk phrases — this is not static/hardcoded output.
 */

interface RiskRule {
  category: string;
  keywords: string[];
  severity: "red" | "yellow";
  explanation: string;
  creatorImpact: string;
  suggestedCounterLanguage: string;
  estimatedFinancialImpact: string;
  weight: number; // contribution to risk score
  excludeIfNear?: string[]; // phrases that negate a match (e.g. "non-exclusive" negates "exclusive")
}

const RULES: RiskRule[] = [
  {
    category: "Unlimited Usage Rights",
    keywords: ["perpetuity", "perpetual", "in perpetuity", "irrevocable", "worldwide", "any and all media", "hereafter developed"],
    severity: "red",
    explanation: "This clause grants the brand permanent, unrestricted rights to use your content in any format, forever, with no expiration date.",
    creatorImpact: "You lose control over where and how long your likeness and work appear. The brand can keep using the content indefinitely without paying you again.",
    suggestedCounterLanguage: "Brand may use the Content organically for 90 days from the post date. Any extended usage, paid promotion, or derivative use requires separate written approval and additional compensation.",
    estimatedFinancialImpact: "Potential impact: 2x–5x campaign value in unpaid reuse",
    weight: 22,
  },
  {
    category: "Paid Ad Usage / Whitelisting",
    keywords: ["whitelisting", "whitelist", "dark post", "dark posting", "boosted", "paid advertising", "paid media", "sponsored placement"],
    severity: "red",
    explanation: "The brand can run your content as paid ads (including 'dark posts' that never appear on your own feed) without additional payment or your ongoing approval.",
    creatorImpact: "Brands typically pay separately — and often more — for whitelisting rights. Giving this away for free undervalues your work significantly.",
    suggestedCounterLanguage: "Any use of Creator's Content in paid advertising, whitelisting, or dark posts requires a separate written agreement and additional compensation of no less than [X]% of the base fee.",
    estimatedFinancialImpact: "Potential impact: 30–100% of campaign value in lost whitelisting fees",
    weight: 18,
  },
  {
    category: "Vague Payment Terms",
    keywords: ["net-90", "net 90", "net-60", "net 60", "upon internal approval", "sole discretion of brand", "at brand's discretion", "after final review"],
    severity: "yellow",
    explanation: "Payment is tied to vague internal approval steps or long net-payment windows, giving the brand wide latitude to delay payment.",
    creatorImpact: "Without a fixed payment date, you have little leverage if payment is delayed for months — common cash flow risk for creators.",
    suggestedCounterLanguage: "Brand shall pay Creator within 15 days of content delivery, regardless of internal review timelines. Late payments accrue 1.5% interest per month.",
    estimatedFinancialImpact: "Potential impact: 60–90 day delay in cash flow",
    weight: 12,
  },
  {
    category: "Missing Kill Fee",
    keywords: ["no kill fee", "without further financial obligation", "cancel without", "brand may cancel", "terminate without compensation"],
    severity: "red",
    explanation: "If the brand cancels the campaign after you've started work, there's no guaranteed payment for the time and resources you already spent.",
    creatorImpact: "You bear all the financial risk of a cancelled campaign even though you may have already produced content, blocked your calendar, or turned down other deals.",
    suggestedCounterLanguage: "If Brand cancels after Creator has begun production, Brand shall pay a kill fee of 50% of the total fee for work-in-progress, or 100% if final content has been delivered.",
    estimatedFinancialImpact: "Potential impact: 100% of campaign payment at risk",
    weight: 16,
    excludeIfNear: ["cancellation fee of", "kill fee of", "shall pay a kill fee"],
  },
  {
    category: "Broad Exclusivity",
    keywords: ["exclusivity", "exclusive", "competing brand", "competitor", "competing product", "12 months", "12-month", "category exclusivity"],
    severity: "yellow",
    explanation: "You're being asked to avoid working with competing brands in your category for an extended period, which can be much longer than the campaign itself.",
    creatorImpact: "Broad, long exclusivity windows can lock you out of other income opportunities in your niche, sometimes for a fee that doesn't compensate for the lost income.",
    suggestedCounterLanguage: "Creator agrees to a 60-day exclusivity period limited to direct competitors in the specific product category, in exchange for an exclusivity fee equal to 25% of the base campaign fee.",
    estimatedFinancialImpact: "Potential impact: Future sponsorship opportunities lost in your category",
    weight: 10,
    excludeIfNear: ["non-exclusive", "non exclusive"],
  },
  {
    category: "Unlimited Revisions",
    keywords: ["unlimited revisions", "no limit on the number of revision", "any time until final approval", "revise at any time"],
    severity: "yellow",
    explanation: "There's no cap on how many rounds of changes the brand can request before approving content, which can turn one deliverable into many.",
    creatorImpact: "Unlimited revisions eat into your time without additional pay, effectively lowering your hourly rate the longer the back-and-forth continues.",
    suggestedCounterLanguage: "Creator will provide up to 2 rounds of revisions. Additional revision rounds will be billed at $[X] per round.",
    estimatedFinancialImpact: "Potential impact: 10–40% effective rate reduction from uncompensated rework",
    weight: 8,
  },
  {
    category: "Vague Morality / Termination Clause",
    keywords: ["sole discretion", "sole opinion", "contrary to brand's values", "any reason", "for any reason", "public image"],
    severity: "red",
    explanation: "The brand can terminate the agreement at any time for vague, subjectively-defined reasons, with little recourse for you.",
    creatorImpact: "A clause this broad means you could lose the deal — and payment — over something undefined and entirely at the brand's discretion.",
    suggestedCounterLanguage: "Brand may terminate only for material breach, with 14 days written notice and an opportunity to cure. Termination without cause requires payment of all fees for work completed.",
    estimatedFinancialImpact: "Potential impact: Full deal value at risk from subjective termination",
    weight: 14,
  },
  {
    category: "Brand Ownership of Content",
    keywords: ["work-for-hire", "work for hire", "brand shall own", "all intellectual property rights therein", "assigns all rights"],
    severity: "red",
    explanation: "The content is classified as 'work-for-hire,' meaning the brand — not you — legally owns the content you created.",
    creatorImpact: "You may lose the right to repost, feature in your portfolio, or reuse this content yourself, even though you created it.",
    suggestedCounterLanguage: "Creator retains ownership and copyright of the Content. Brand receives a non-exclusive license to use the Content as outlined in Section 2.",
    estimatedFinancialImpact: "Potential impact: Full ownership and portfolio rights lost",
    weight: 16,
  },
  {
    category: "Moral Rights Waiver",
    keywords: ["waives all moral rights", "moral rights", "waive moral rights"],
    severity: "yellow",
    explanation: "You're giving up your right to be credited as the creator and to object to the content being altered in ways you might disagree with.",
    creatorImpact: "The brand could edit, recontextualize, or use your content in ways that don't reflect your voice or brand, without your input.",
    suggestedCounterLanguage: "Creator retains moral rights including attribution and the right to object to derogatory treatment of the Content.",
    estimatedFinancialImpact: "Potential impact: Loss of creative and reputational control",
    weight: 6,
  },
  {
    category: "Confidentiality Overreach",
    keywords: ["confidential", "non-disclosure", "shall not disclose the terms"],
    severity: "yellow",
    explanation: "Broad confidentiality requirements may prevent you from discussing deal terms, even with your manager, accountant, or other creators.",
    creatorImpact: "This can make it hard to benchmark fair rates or get advice on the deal before signing.",
    suggestedCounterLanguage: "Confidentiality applies to non-public brand strategy materials only. Creator may disclose deal terms to their manager, agent, accountant, or legal counsel.",
    estimatedFinancialImpact: "Potential impact: Reduced negotiating leverage on future deals",
    weight: 5,
  },
  {
    category: "Transferable / Sublicensable Rights",
    keywords: ["sublicense", "sublicensable", "transfer this agreement", "assign this agreement", "third parties"],
    severity: "yellow",
    explanation: "The brand can hand off or sell the rights to use your content to other companies without asking you first.",
    creatorImpact: "Your content could end up being used by a company you never agreed to work with.",
    suggestedCounterLanguage: "Brand's license is non-transferable and non-sublicensable without Creator's prior written consent.",
    estimatedFinancialImpact: "Potential impact: Loss of control over brand associations",
    weight: 7,
  },
  {
    category: "No Approval Rights",
    keywords: ["without creator's approval", "brand may edit", "brand may modify the content", "no approval required"],
    severity: "yellow",
    explanation: "The brand can edit or repurpose your content without showing you the final version first.",
    creatorImpact: "Content could be published in a way that doesn't match your voice, style, or values — and your name is still on it.",
    suggestedCounterLanguage: "Brand shall provide Creator with the final edited version for approval at least 48 hours prior to publication.",
    estimatedFinancialImpact: "Potential impact: Reputational risk from misrepresented content",
    weight: 6,
  },
];

const GREEN_SIGNALS: { category: string; keywords: string[]; explanation: string; excludeIfNear?: string[] }[] = [
  {
    category: "Fair Payment Terms",
    keywords: ["net-15", "net 15", "within 7 days", "within 10 days"],
    explanation: "Payment is tied to a short, fixed timeline after delivery rather than vague internal approval steps.",
  },
  {
    category: "Defined Usage Window",
    keywords: ["organic use only", "30-day usage", "60-day usage", "limited license", "non-exclusive license"],
    explanation: "Usage rights are scoped to a specific, reasonable time window rather than granted in perpetuity.",
  },
  {
    category: "Kill Fee Included",
    keywords: ["kill fee", "cancellation fee"],
    explanation: "The contract includes a defined kill fee, protecting you financially if the campaign is cancelled.",
    excludeIfNear: ["no kill fee", "without a kill fee", "not include a kill fee", "no cancellation fee"],
  },
];

function scanGreenSignal(text: string, signal: (typeof GREEN_SIGNALS)[number]): boolean {
  const lower = text.toLowerCase();
  const hasKeyword = signal.keywords.some((kw) => lower.includes(kw.toLowerCase()));
  if (!hasKeyword) return false;
  if (signal.excludeIfNear && signal.excludeIfNear.some((neg) => lower.includes(neg.toLowerCase()))) {
    return false;
  }
  return true;
}

function scanText(text: string, rule: { keywords: string[]; excludeIfNear?: string[] }): boolean {
  const lower = text.toLowerCase();
  const hasKeyword = rule.keywords.some((kw) => lower.includes(kw.toLowerCase()));
  if (!hasKeyword) return false;
  if (rule.excludeIfNear && rule.excludeIfNear.some((neg) => lower.includes(neg.toLowerCase()))) {
    return false;
  }
  return true;
}

export function runFallbackAnalysis(contractText: string): AnalysisResult {
  const flags: Flag[] = [];
  let score = 0;
  let flagIdx = 1;

  for (const rule of RULES) {
    if (scanText(contractText, rule)) {
      flags.push({
        id: `flag-${flagIdx++}`,
        severity: rule.severity,
        category: rule.category,
        clause: extractSnippet(contractText, rule.keywords) || `Clause referencing: ${rule.keywords[0]}`,
        explanation: rule.explanation,
        creatorImpact: rule.creatorImpact,
        suggestedCounterLanguage: rule.suggestedCounterLanguage,
        estimatedFinancialImpact: rule.estimatedFinancialImpact,
      });
      score += rule.weight;
    }
  }

  // Green flags for fair terms found
  for (const signal of GREEN_SIGNALS) {
    if (scanGreenSignal(contractText, signal)) {
      flags.push({
        id: `flag-${flagIdx++}`,
        severity: "green",
        category: signal.category,
        clause: extractSnippet(contractText, signal.keywords) || `Clause referencing: ${signal.keywords[0]}`,
        explanation: signal.explanation,
        creatorImpact: "This term is fair to creators and doesn't require negotiation.",
        suggestedCounterLanguage: "No changes recommended — this clause is already creator-friendly.",
      });
    }
  }

  if (flags.length === 0) {
    flags.push({
      id: "flag-1",
      severity: "green",
      category: "General Review",
      clause: contractText.slice(0, 180).trim() + (contractText.length > 180 ? "…" : ""),
      explanation: "No common red-flag patterns were detected in the scanned text using keyword analysis.",
      creatorImpact: "This doesn't guarantee the contract is fully fair — always read the full document closely.",
      suggestedCounterLanguage: "No specific changes flagged. Consider having a professional review the full document.",
    });
  }

  score = Math.min(100, score);
  const overallRiskLevel: "Low" | "Moderate" | "High" =
    score <= 30 ? "Low" : score <= 60 ? "Moderate" : "High";

  const reds = flags.filter((f) => f.severity === "red").length;
  const yellows = flags.filter((f) => f.severity === "yellow").length;

  const summary =
    overallRiskLevel === "High"
      ? `This contract contains ${reds} serious red flag${reds === 1 ? "" : "s"} and ${yellows} additional point${yellows === 1 ? "" : "s"} worth negotiating. Significant changes are recommended before signing.`
      : overallRiskLevel === "Moderate"
      ? `This contract has ${yellows + reds} clause${yellows + reds === 1 ? "" : "s"} worth negotiating. It's not unreasonable, but a few terms favor the brand more than the creator.`
      : `This contract looks reasonably fair based on automated keyword analysis. Still worth a final read-through before signing.`;

  const recommendedActions = buildRecommendedActions(flags);
  const negotiationMessage = buildNegotiationMessage(flags, "Professional");

  return {
    overallRiskLevel,
    riskScore: score,
    summary,
    flags,
    negotiationMessage,
    recommendedActions,
    source: "fallback",
  };
}

function extractSnippet(text: string, keywords: string[]): string | null {
  const lower = text.toLowerCase();
  for (const kw of keywords) {
    const idx = lower.indexOf(kw.toLowerCase());
    if (idx !== -1) {
      const start = Math.max(0, idx - 80);
      const end = Math.min(text.length, idx + kw.length + 80);
      let snippet = text.slice(start, end).trim();
      if (start > 0) snippet = "…" + snippet;
      if (end < text.length) snippet = snippet + "…";
      return snippet;
    }
  }
  return null;
}

function buildRecommendedActions(flags: Flag[]): string[] {
  const actions: string[] = [];
  const reds = flags.filter((f) => f.severity === "red");
  if (reds.length > 0) {
    actions.push(`Push back on ${reds.length} high-severity clause${reds.length === 1 ? "" : "s"} before signing — these significantly favor the brand.`);
  }
  if (flags.some((f) => f.category.includes("Usage Rights"))) {
    actions.push("Negotiate a defined usage window instead of unlimited/perpetual rights.");
  }
  if (flags.some((f) => f.category.includes("Kill Fee"))) {
    actions.push("Request a kill fee clause to protect against uncompensated cancellation.");
  }
  if (flags.some((f) => f.category.includes("Payment"))) {
    actions.push("Ask for a fixed payment date (e.g. Net-15) instead of vague approval-based timing.");
  }
  if (actions.length === 0) {
    actions.push("Do a final read-through of the full contract before signing.");
    actions.push("Keep a copy of the signed agreement and all written communication with the brand.");
  }
  actions.push("Consider a quick legal review if the deal value is significant.");
  return actions;
}

export function buildNegotiationMessage(
  flags: Flag[],
  tone: "Friendly" | "Firm" | "Professional" = "Professional"
): string {
  const issues = [...flags.filter((f) => f.severity === "red"), ...flags.filter((f) => f.severity === "yellow")]
    .slice(0, 4)
    .map((f) => `• ${f.category}`)
    .join("\n");

  const bulletBlock = issues || "• A few contract terms";

  if (tone === "Friendly") {
    return `Hey! 😊 Thanks so much for sending over the contract — I'm really excited about this collab!\n\nI gave it a read and had a couple small things I wanted to chat about before signing:\n\n${bulletBlock}\n\nI've got some suggested tweaks for each of these that I think would work well for both of us — happy to hop on a quick call whenever works for you!\n\nLooking forward to it!`;
  }

  if (tone === "Firm") {
    return `Hi,\n\nThank you for the contract. Before I can sign, the following terms need to be revised:\n\n${bulletBlock}\n\nI've outlined fair, industry-standard counter-language for each clause. These changes are necessary for me to move forward with this partnership. Please confirm you're able to accommodate these revisions, and I'll have the signed agreement back to you promptly.\n\nLooking forward to your response.`;
  }

  return `Hi [Brand Contact],\n\nThank you for sending over the collaboration agreement — I'm excited about this partnership and want to make sure we're set up for a smooth campaign.\n\nAfter reviewing the contract, I'd love to discuss a few points before signing:\n\n${bulletBlock}\n\nI've prepared suggested counter-language for each of these clauses that I believe creates a fairer foundation for both of us. I'd be happy to jump on a quick call to walk through them together.\n\nLooking forward to making this work!\n\n[Your Name]`;
}
