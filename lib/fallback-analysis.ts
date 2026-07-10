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
    category: "IP Overreach / Unlimited Usage",
    keywords: ["perpetuity", "perpetual", "in perpetuity", "irrevocable", "worldwide", "any and all media", "hereafter developed"],
    severity: "red",
    explanation: "This clause grants the client permanent, unrestricted rights to use your assets, work, or IP in any format, forever, with no expiration date.",
    creatorImpact: "You lose control over where and how long your assets or intellectual property appear. The client can keep using your work indefinitely without paying you again.",
    suggestedCounterLanguage: "Client may use the deliverables organically for 90 days from the completion date. Any extended usage, advertising promotion, or derivative use requires separate written approval and additional compensation.",
    estimatedFinancialImpact: "Potential impact: 2x–5x agreement value in unpaid reuse",
    weight: 22,
  },
  {
    category: "Unclear Service Usage / License Overreach",
    keywords: ["whitelisting", "whitelist", "dark post", "dark posting", "boosted", "paid advertising", "paid media", "sponsored placement"],
    severity: "red",
    explanation: "The client can leverage your deliverables or services for paid advertising beyond the agreed organic scope without additional payment or your ongoing approval.",
    creatorImpact: "Clients typically pay separately for extended advertising and licensing rights. Giving this away for free undervalues your services significantly.",
    suggestedCounterLanguage: "Any use of deliverables in paid advertising, whitelisting, or dark posts requires a separate written agreement and additional compensation of no less than [X]% of the base fee.",
    estimatedFinancialImpact: "Potential impact: 30–100% of agreement value in lost licensing fees",
    weight: 18,
  },
  {
    category: "Vague Payment Terms",
    keywords: ["net-90", "net 90", "net-60", "net 60", "upon internal approval", "sole discretion of brand", "at brand's discretion", "after final review"],
    severity: "yellow",
    explanation: "Payment is tied to vague internal approval steps or long net-payment windows, giving the client wide latitude to delay payment.",
    creatorImpact: "Without a fixed payment date, you have little leverage if payment is delayed for months — common cash flow risk for business users.",
    suggestedCounterLanguage: "Client shall pay within 15 days of service delivery, regardless of internal review timelines. Late payments accrue 1.5% interest per month.",
    estimatedFinancialImpact: "Potential impact: 60–90 day delay in cash flow",
    weight: 12,
  },
  {
    category: "Missing Termination Fees",
    keywords: ["no kill fee", "without further financial obligation", "cancel without", "brand may cancel", "terminate without compensation"],
    severity: "red",
    explanation: "If the client cancels the project after you've started work, there's no guaranteed payment for the time and resources you already spent.",
    creatorImpact: "You bear all the financial risk of a cancelled project even though you may have already produced deliverables, allocated resources, or turned down other work.",
    suggestedCounterLanguage: "If Client cancels after work has begun, Client shall pay a cancellation fee of 50% of the total fee for work-in-progress, or 100% if final deliverables have been completed.",
    estimatedFinancialImpact: "Potential impact: 100% of project payment at risk",
    weight: 16,
    excludeIfNear: ["cancellation fee of", "kill fee of", "shall pay a kill fee"],
  },
  {
    category: "Restricted Client Exclusivity",
    keywords: ["exclusivity", "exclusive", "competing brand", "competitor", "competing product", "12 months", "12-month", "category exclusivity"],
    severity: "yellow",
    explanation: "You're being asked to avoid working with competing clients in your category for an extended period, which can be much longer than the project itself.",
    creatorImpact: "Broad, long exclusivity windows can lock you out of other income opportunities in your industry, sometimes for a fee that doesn't compensate for the lost income.",
    suggestedCounterLanguage: "Business agrees to a 60-day exclusivity period limited to direct competitors in the specific industry, in exchange for an exclusivity fee equal to 25% of the base project fee.",
    estimatedFinancialImpact: "Potential impact: Future opportunities lost in your industry category",
    weight: 10,
    excludeIfNear: ["non-exclusive", "non exclusive"],
  },
  {
    category: "Unlimited Revision Rounds",
    keywords: ["unlimited revisions", "no limit on the number of revision", "any time until final approval", "revise at any time"],
    severity: "yellow",
    explanation: "There's no cap on how many rounds of changes the client can request before approving deliverables, which can turn one project into many.",
    creatorImpact: "Unlimited revisions eat into your team's time without additional pay, effectively lowering your margins the longer the back-and-forth continues.",
    suggestedCounterLanguage: "Service provider will provide up to 2 rounds of revisions. Additional revision rounds will be billed at $[X] per round.",
    estimatedFinancialImpact: "Potential impact: 10–40% effective rate reduction from uncompensated rework",
    weight: 8,
  },
  {
    category: "Vague Morality / Termination Clause",
    keywords: ["sole discretion", "sole opinion", "contrary to brand's values", "any reason", "for any reason", "public image"],
    severity: "red",
    explanation: "The client can terminate the agreement at any time for vague, subjectively-defined reasons, with little recourse for you.",
    creatorImpact: "A clause this broad means you could lose the agreement — and payment — over something undefined and entirely at the client's discretion.",
    suggestedCounterLanguage: "Client may terminate only for material breach, with 14 days written notice and an opportunity to cure. Termination without cause requires payment of all fees for work completed.",
    estimatedFinancialImpact: "Potential impact: Full deal value at risk from subjective termination",
    weight: 14,
  },
  {
    category: "Intellectual Property Ownership",
    keywords: ["work-for-hire", "work for hire", "brand shall own", "all intellectual property rights therein", "assigns all rights"],
    severity: "red",
    explanation: "The deliverables are classified as 'work-for-hire,' meaning the client — not you — legally owns the work product you created.",
    creatorImpact: "You may lose the right to reuse, distribute, or showcase this intellectual property yourself, even though you created it.",
    suggestedCounterLanguage: "Service provider retains ownership and copyright of the deliverables. Client receives a non-exclusive license to use the deliverables as outlined in Section 2.",
    estimatedFinancialImpact: "Potential impact: Full ownership and licensing rights lost",
    weight: 16,
  },
  {
    category: "Moral Rights Waiver",
    keywords: ["waives all moral rights", "moral rights", "waive moral rights"],
    severity: "yellow",
    explanation: "You're giving up your right to be credited for the work and to object to the work being altered in ways you might disagree with.",
    creatorImpact: "The client could edit, recontextualize, or use your deliverables in ways that don't reflect your brand values or standards, without your input.",
    suggestedCounterLanguage: "Service provider retains moral rights including attribution and the right to object to derogatory treatment of the deliverables.",
    estimatedFinancialImpact: "Potential impact: Loss of creative and reputational control",
    weight: 6,
  },
  {
    category: "Confidentiality Overreach",
    keywords: ["confidential", "non-disclosure", "shall not disclose the terms"],
    severity: "yellow",
    explanation: "Broad confidentiality requirements may prevent you from discussing agreement terms, even with your partners, accountants, or advisors.",
    creatorImpact: "This can make it hard to benchmark fair rates or get advice on the deal before signing.",
    suggestedCounterLanguage: "Confidentiality applies to non-public corporate strategy materials only. Party may disclose agreement terms to their managers, accountants, or legal counsel.",
    estimatedFinancialImpact: "Potential impact: Reduced negotiating leverage on future agreements",
    weight: 5,
  },
  {
    category: "Transferable / Sublicensable Rights",
    keywords: ["sublicense", "sublicensable", "transfer this agreement", "assign this agreement", "third parties"],
    severity: "yellow",
    explanation: "The client can hand off or sell the rights to use your deliverables or IP to other companies without asking you first.",
    creatorImpact: "Your IP could end up being used by a company you never agreed to work with.",
    suggestedCounterLanguage: "Client's license is non-transferable and non-sublicensable without prior written consent.",
    estimatedFinancialImpact: "Potential impact: Loss of control over client associations",
    weight: 7,
  },
  {
    category: "No Approval Rights",
    keywords: ["without creator's approval", "brand may edit", "brand may modify the content", "no approval required"],
    severity: "yellow",
    explanation: "The client can edit or repurpose your deliverables without showing you the final version first.",
    creatorImpact: "Deliverables could be published in a way that doesn't match your brand voice, style, or standards.",
    suggestedCounterLanguage: "Client shall provide final edited version for approval prior to use.",
    estimatedFinancialImpact: "Potential impact: Reputational risk from misrepresented work product",
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
    category: "Termination Fees Included",
    keywords: ["kill fee", "cancellation fee"],
    explanation: "The agreement includes a defined cancellation fee, protecting you financially if the project is cancelled.",
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
        creatorImpact: "This term is fair to businesses and doesn't require negotiation.",
        suggestedCounterLanguage: "No changes recommended — this clause is already business-friendly.",
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
      creatorImpact: "This doesn't guarantee the agreement is fully fair — always read the full document closely.",
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
      ? `This agreement contains ${reds} serious red flag${reds === 1 ? "" : "s"} and ${yellows} additional point${yellows === 1 ? "" : "s"} worth negotiating. Significant changes are recommended before signing.`
      : overallRiskLevel === "Moderate"
      ? `This agreement has ${yellows + reds} clause${yellows + reds === 1 ? "" : "s"} worth negotiating. It's not unreasonable, but a few terms favor the client more than your business.`
      : `This agreement looks reasonably fair based on automated keyword analysis. Still worth a final read-through before signing.`;

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
    actions.push(`Push back on ${reds.length} high-severity clause${reds.length === 1 ? "" : "s"} before signing — these significantly favor the client.`);
  }
  if (flags.some((f) => f.category.includes("Usage Rights"))) {
    actions.push("Negotiate a defined IP usage window instead of unlimited/perpetual rights.");
  }
  if (flags.some((f) => f.category.includes("Kill Fee") || f.category.includes("Termination"))) {
    actions.push("Request a cancellation/termination fee clause to protect against uncompensated project cancellation.");
  }
  if (flags.some((f) => f.category.includes("Payment"))) {
    actions.push("Ask for a fixed payment date (e.g. Net-15) instead of vague approval-based timing.");
  }
  if (actions.length === 0) {
    actions.push("Do a final read-through of the full agreement before signing.");
    actions.push("Keep a copy of the signed agreement and all written communication with the client.");
  }
  actions.push("Consider a quick legal review if the agreement value is significant.");
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

  const bulletBlock = issues || "• A few agreement terms";

  if (tone === "Friendly") {
    return `Hi! 😊 Thanks so much for sending over the agreement — I'm really excited about this partnership!\n\nI gave it a read and had a couple small details I wanted to discuss before signing:\n\n${bulletBlock}\n\nI've got some suggested tweaks for each of these that I think would work well for both of us — happy to hop on a quick call whenever works for you!\n\nLooking forward to it!`;
  }

  if (tone === "Firm") {
    return `Hi,\n\nThank you for the agreement. Before I can sign, the following terms need to be revised:\n\n${bulletBlock}\n\nI've outlined fair, counter-language for each clause. These changes are necessary for us to move forward with this partnership. Please confirm you're able to accommodate these revisions, and I'll have the signed agreement back to you promptly.\n\nLooking forward to your response.`;
  }

  return `Hi [Client Contact],\n\nThank you for sending over the agreement — I'm excited about this partnership and want to make sure we're set up for a smooth project.\n\nAfter reviewing the document, I'd love to discuss a few points before signing:\n\n${bulletBlock}\n\nI've prepared suggested counter-language for each of these clauses that I believe creates a fairer foundation for both of us. I'd be happy to jump on a quick call to walk through them together.\n\nLooking forward to making this work!\n\n[Your Name]`;
}
