import { AnalysisResult, Flag } from "./types";

export interface ChatMessage {
  id: string;
  sender: "user" | "nexus";
  text: string;
  timestamp: Date;
}

export function generateAdvisorResponse(query: string, data: AnalysisResult): string {
  const lower = query.toLowerCase().trim();
  const clientName = data.brandName || "the client";
  const agreementName = data.contractName || "the agreement";
  const riskScore = Math.round(data.riskScore || 0);
  const riskLevel = data.overallRiskLevel || "Low";

  const redFlags = data.flags.filter(f => f.severity === "red");
  const yellowFlags = data.flags.filter(f => f.severity === "yellow");
  const greenFlags = data.flags.filter(f => f.severity === "green");

  // Question 1: Is this contract safe / Can I sign this?
  if (
    lower.includes("safe") ||
    lower.includes("sign") ||
    lower.includes("ok") ||
    lower.includes("good")
  ) {
    if (riskScore >= 60) {
      return `Based on my analysis, signing **${agreementName}** in its current form carries significant operational risk. 

I've identified **${redFlags.length} high-severity red flags** and **${yellowFlags.length} warnings** that seriously disadvantage your business. I strongly recommend pushing back on these clauses before signing. Specifically, review the ${redFlags.map(f => `**${f.category}**`).join(", ")} clauses.`;
    }
    if (riskScore >= 31) {
      return `Signing **${agreementName}** is relatively standard, but you should proceed with caution. 

I've flagged **${redFlags.length + yellowFlags.length} items** worth negotiating. Vetting these terms will protect your cash flow and IP control. Consider proposing the suggested counter-language for the **${(redFlags[0] || yellowFlags[0])?.category}** clause before signing.`;
    }
    return `Yes! **${agreementName}** looks exceptionally clean and balanced (Risk Score: **${riskScore}/100**). 

The terms are fair to both parties. No major contract adjustments are needed. You are clear to proceed with signing!`;
  }

  // Question 2: Explain in simple language
  if (
    lower.includes("explain") ||
    lower.includes("simple") ||
    lower.includes("plain") ||
    lower.includes("understand") ||
    lower.includes("summary")
  ) {
    const list = data.flags
      .slice(0, 3)
      .map(f => `• **${f.category}**: ${f.explanation}`)
      .join("\n");

    return `Here is a plain-English summary of **${agreementName}** with **${clientName}**:

1. **Risk Score**: **${riskScore}/100** (${riskLevel} Risk).
2. **Top flagged points**:
${list || "• No significant risks detected. The agreement terms are balanced."}

Would you like me to draft counter-language or estimate the financial exposure of any of these points?`;
  }

  // Question 3: Biggest business risk
  if (
    lower.includes("biggest") ||
    lower.includes("worst") ||
    lower.includes("risk") ||
    lower.includes("danger")
  ) {
    const highestRisk = redFlags[0] || yellowFlags[0];
    if (!highestRisk) {
      return `No serious risks were detected in this agreement. The terms appear fair and balanced.`;
    }
    return `The biggest business risk in **${agreementName}** is the **${highestRisk.category}** clause.

**Original Text**:
> "${highestRisk.clause}"

**Why it's a risk**:
${highestRisk.explanation}
${highestRisk.creatorImpact ? `\n**Operational Impact**: ${highestRisk.creatorImpact}` : ""}

I suggest counter-proposing:
*"${highestRisk.suggestedCounterLanguage}"*`;
  }

  // Question 4: What should I negotiate / counter-language
  if (
    lower.includes("negotiate") ||
    lower.includes("change") ||
    lower.includes("tweak") ||
    lower.includes("counter") ||
    lower.includes("propose")
  ) {
    const points = [...redFlags, ...yellowFlags].slice(0, 2);
    if (points.length === 0) {
      return `This agreement looks very fair. There are no critical clauses that require renegotiation.`;
    }

    const bulletList = points
      .map(
        (f, i) =>
          `**${i + 1}. ${f.category}**\n• *Suggested Counter*: "${f.suggestedCounterLanguage}"`
      )
      .join("\n\n");

    return `Here are the top priorities you should negotiate in **${agreementName}**:

${bulletList}

You can use the **Negotiation Copilot** at the bottom of the page to copy a draft email to send to the client contact.`;
  }

  // Question 5: Estimate my financial exposure
  if (
    lower.includes("financial") ||
    lower.includes("exposure") ||
    lower.includes("money") ||
    lower.includes("cost") ||
    lower.includes("loss") ||
    lower.includes("impact") ||
    lower.includes("fee")
  ) {
    const financialImpacts = data.flags
      .filter(f => f.estimatedFinancialImpact)
      .map(f => `• **${f.category}**: ${f.estimatedFinancialImpact}`)
      .join("\n");

    if (!financialImpacts) {
      return `Based on my analysis, there is no direct unquantifiable financial exposure flagged in **${agreementName}**. The payment and scope terms appear stable.`;
    }

    return `Here is the estimated financial exposure of terms found in **${agreementName}**:

${financialImpacts}

Securing cap limits on liabilities and scoping usage rights will protect your revenue margins.`;
  }

  // Search by specific keywords (payment, exclusivity, liability, ip)
  if (lower.includes("payment") || lower.includes("pay") || lower.includes("net-")) {
    const match = data.flags.find(f => f.category.toLowerCase().includes("payment") || f.explanation.toLowerCase().includes("payment"));
    if (match) return `Here is the payment risk flagged in this agreement:\n\n**${match.category}**: ${match.explanation}\n\n*Propose instead*: "${match.suggestedCounterLanguage}"`;
  }

  if (lower.includes("exclusive") || lower.includes("exclusivity")) {
    const match = data.flags.find(f => f.category.toLowerCase().includes("exclusivity") || f.explanation.toLowerCase().includes("exclusivity"));
    if (match) return `Here is the exclusivity clause risk:\n\n**${match.category}**: ${match.explanation}\n\n*Propose instead*: "${match.suggestedCounterLanguage}"`;
  }

  if (lower.includes("ip") || lower.includes("intellectual") || lower.includes("ownership") || lower.includes("rights")) {
    const match = data.flags.find(f => f.category.toLowerCase().includes("ownership") || f.category.toLowerCase().includes("ip") || f.explanation.toLowerCase().includes("rights"));
    if (match) return `Here is the Intellectual Property risk found:\n\n**${match.category}**: ${match.explanation}\n\n*Propose instead*: "${match.suggestedCounterLanguage}"`;
  }

  // Fallback greeting / information help
  return `I'm **Nexus**, your business compliance advisor. I've analyzed **${agreementName}** (Risk Score: **${riskScore}/100**).

I can help you deep-dive into:
- Vetting specific payment/liability clauses
- Estimating potential financial exposure
- Proposing fair counter-language options
- Explaining the agreement in plain language

Please click one of the quick chips above or ask a specific question about the terms!`;
}
