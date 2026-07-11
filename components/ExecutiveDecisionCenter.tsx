"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard, Badge } from "@/components/ui";
import { AnalysisResult, Flag } from "@/lib/types";

interface Props {
  data: AnalysisResult;
}

export default function ExecutiveDecisionCenter({ data }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const reds = data.flags.filter((f) => f.severity === "red").length;
  const yels = data.flags.filter((f) => f.severity === "yellow").length;
  const score = data.riskScore || 0;

  // 1. Heuristic Recommendation
  let recommendation: "Proceed" | "Negotiate Before Signing" | "Do Not Sign" = "Proceed";
  let recColor = "var(--emerald)";
  let recIcon = "ti-circle-check";
  let recDesc = "Agreement is commercially sound with minimal risks. Proceed to signature.";

  if (score >= 70 || reds >= 3) {
    recommendation = "Do Not Sign";
    recColor = "var(--coral)";
    recIcon = "ti-alert-octagon";
    recDesc = "Critical liabilities detected. Signing in current form exposes the organization to severe risk.";
  } else if (score >= 40 || reds > 0 || yels >= 2) {
    recommendation = "Negotiate Before Signing";
    recColor = "var(--amber)";
    recIcon = "ti-arrows-left-right";
    recDesc = "Strategic revisions required. Cap liability and adjust revision limits before execution.";
  }

  // 2. Dynamic Metric Calculations
  const confidence = Math.min(98, Math.max(75, 100 - (reds * 3) - (yels * 1)));
  const riskLevel = score >= 60 || reds > 0 ? "High" : yels > 0 ? "Moderate" : "Low";
  const riskColor = riskLevel === "High" ? "var(--coral)" : riskLevel === "Moderate" ? "var(--amber)" : "var(--emerald)";
  
  const revenueAtRisk = reds * 45000 + yels * 12000;
  const successProbability = Math.min(95, Math.max(40, 90 - (reds * 6) - (yels * 2)));
  const relationshipOutlook = reds >= 3 ? "Strained" : reds > 0 ? "Cautious" : "Collaborative";
  const resolutionTime = reds > 0 || yels > 0 ? Math.max(2, reds * 3 + yels * 1) : 0;

  // 3. AI Executive Summary (Max 3 sentences in corporate executive tone)
  const firstFlagCat = data.flags[0]?.category || "liability limit";
  const summaryText = `Nexus audited "${data.contractName || "Agreement"}" and identified a ${riskLevel.toLowerCase()} risk profile, primarily driven by critical exposure in ${firstFlagCat} clauses. We estimate approximately $${revenueAtRisk.toLocaleString()} in potential contract value exposure unless key provisions are adjusted. We strongly recommend initiating structured negotiation to cap aggregate liability and align operational revision scopes prior to final signature.`;

  // 4. Focus Priorities
  const priorityClauses = data.flags.filter(f => f.severity === "red" || f.severity === "yellow").slice(0, 4);

  // 5. Dynamic priority action descriptors
  const getActionDesc = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "unlimited liability exposure":
      case "liability":
        return "Exposes company to damages exceeding project value.";
      case "unlimited revisions limit":
      case "revisions":
        return "Scope creep risk without extra compensation.";
      case "pre-existing ip overreach":
      case "intellectual property":
        return "Threatens ownership of proprietary foundational assets.";
      default:
        return "Operational term introduces structural business risk.";
    }
  };

  const handleShare = () => {
    const textToCopy = `Nexus Executive Summary - ${data.contractName || "Agreement"}\nRecommendation: ${recommendation}\nConfidence: ${confidence}%\nRisk Level: ${riskLevel}\nSummary: ${summaryText}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard style={{ padding: "1.75rem", marginBottom: "1.25rem", border: "1px solid var(--glass-border2)", position: "relative", overflow: "hidden" }} className="animate-float-in">
      <style jsx>{`
        .exec-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 14px;
          margin-bottom: 20px;
        }
        .exec-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 20px;
        }
        .metrics-bar-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .metric-item {
          background: rgba(0,0,0,0.2);
          border: 0.5px solid var(--glass-border);
          padding: 12px 14px;
          border-radius: 10px;
        }
        .metric-lbl {
          font-size: 11px;
          color: var(--text3);
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .metric-val {
          font-size: 15px;
          font-weight: 650;
          color: var(--text);
        }
        .priority-action-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .priority-action-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 14px;
          font-size: 12.5px;
        }
        @media (max-width: 1024px) {
          .priority-action-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .exec-grid {
            grid-template-columns: 1fr;
          }
          .priority-action-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Title Header */}
      <div className="exec-title-row">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <i className="ti ti-crown" style={{ color: "var(--violet2)", fontSize: 18 }} />
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", margin: 0, letterSpacing: "0.02em" }}>AI Executive Decision Center</h2>
            <p style={{ fontSize: 11, color: "var(--text3)", margin: 0 }}>Strategic corporate roadmap & counter proposal directions.</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Badge color={recommendation === "Proceed" ? "emerald" : recommendation === "Do Not Sign" ? "red" : "amber"}>
            <i className={`ti ${recIcon}`} style={{ marginRight: 4 }} /> {recommendation.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Main split grid */}
      <div className="exec-grid">
        {/* Left Side: Summary & Action priorities */}
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Executive Recommendation</span>
          <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${recColor}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 650, color: recColor, display: "block", marginBottom: 4 }}>
              {recommendation}
            </span>
            <p style={{ fontSize: 13, color: "var(--text2)", margin: 0 }}>{recDesc}</p>
          </div>

          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>AI Strategic Narrative Summary</span>
          <p style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.65, fontStyle: "italic", margin: "0 0 16px 0", background: "rgba(0,0,0,0.15)", padding: 14, borderRadius: 10, borderLeft: "3.5px solid var(--violet)" }}>
            "{summaryText}"
          </p>
        </div>

        {/* Right Side: Key metrics panels */}
        <div className="metrics-bar-grid">
          <div className="metric-item">
            <div className="metric-lbl">Confidence</div>
            <div className="metric-val">{confidence}%</div>
            <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
              <div style={{ width: `${confidence}%`, height: "100%", background: "var(--violet2)" }} />
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-lbl">Risk Level</div>
            <div className="metric-val" style={{ color: riskColor }}>{riskLevel}</div>
            <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
              <div style={{ width: riskLevel === "High" ? "90%" : riskLevel === "Moderate" ? "55%" : "20%", height: "100%", background: riskColor }} />
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-lbl">Revenue at Risk</div>
            <div className="metric-val" style={{ color: "var(--coral)" }}>${revenueAtRisk.toLocaleString()}</div>
          </div>

          <div className="metric-item">
            <div className="metric-lbl">Deal Probability</div>
            <div className="metric-val">{successProbability}%</div>
          </div>

          <div className="metric-item">
            <div className="metric-lbl">Relationship</div>
            <div className="metric-val">{relationshipOutlook}</div>
          </div>

          <div className="metric-item">
            <div className="metric-lbl">Resolution Time</div>
            <div className="metric-val">{resolutionTime} days</div>
          </div>
        </div>
      </div>

      {/* Focus Priorities Grid */}
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Key Priority Exposure Cards</span>
      <div className="priority-action-grid">
        <div className="priority-action-card" style={{ borderLeft: "3.5px solid var(--coral)" }}>
          <span style={{ fontWeight: 650, color: "var(--coral)", display: "block", marginBottom: 3 }}>Revenue Impact</span>
          <p style={{ margin: 0, color: "var(--text2)", fontSize: 12 }}>
            {reds > 0 ? "High risk of scope creep and uncompensated client revision limits." : "Low direct revenue exposure detected."}
          </p>
        </div>
        <div className="priority-action-card" style={{ borderLeft: "3.5px solid var(--violet2)" }}>
          <span style={{ fontWeight: 650, color: "var(--violet2)", display: "block", marginBottom: 3 }}>Legal Exposure</span>
          <p style={{ margin: 0, color: "var(--text2)", fontSize: 12 }}>
            {reds > 0 ? "Uncapped liability guidelines expose contractor to legal claims." : "Standard liability caps limit overall lawsuit values."}
          </p>
        </div>
        <div className="priority-action-card" style={{ borderLeft: "3.5px solid var(--amber)" }}>
          <span style={{ fontWeight: 650, color: "var(--amber)", display: "block", marginBottom: 3 }}>Operational Impact</span>
          <p style={{ margin: 0, color: "var(--text2)", fontSize: 12 }}>
            {yels > 0 ? "Strict deadlines or late payments limit performance timelines." : "Standard payment schedules require standard operational effort."}
          </p>
        </div>
        <div className="priority-action-card" style={{ borderLeft: "3.5px solid var(--blue)" }}>
          <span style={{ fontWeight: 650, color: "var(--blue)", display: "block", marginBottom: 3 }}>Reputation Risk</span>
          <p style={{ margin: 0, color: "var(--text2)", fontSize: 12 }}>
            {yels > 0 ? "IP ownership overreaches restrict future portfolio marketing." : "Clean IP licensing preserves builder credentials."}
          </p>
        </div>
      </div>

      {/* Clauses that require immediate attention */}
      {priorityClauses.length > 0 && (
        <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: 14, marginBottom: 20, border: "0.5px solid var(--glass-border)" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Immediate Action Clauses</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {priorityClauses.map((c, i) => (
              <div key={c.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < priorityClauses.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : "none", paddingBottom: i < priorityClauses.length - 1 ? 8 : 0 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Badge color={c.severity === "red" ? "red" : "amber"}>{c.severity.toUpperCase()}</Badge>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{c.category}</span>
                </div>
                <span style={{ fontSize: 11.5, color: "var(--text2)" }}>{getActionDesc(c.category)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Center Action Buttons Bar */}
      <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => router.push("/negotiation-simulator")}
            className="btn-primary"
            style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <i className="ti ti-messages" /> Start AI Negotiation
          </button>
          
          <button
            onClick={() => window.print()}
            className="sim-action-btn secondary"
            style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <i className="ti ti-download" /> Download Executive Report
          </button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => router.push("/legal-help")}
            className="sim-action-btn secondary"
            style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <i className="ti ti-gavel" /> Consult Lawyer
          </button>
          <button
            onClick={handleShare}
            className="sim-action-btn secondary"
            style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <i className={copied ? "ti ti-check" : "ti ti-share"} /> {copied ? "Copied Summary" : "Share Summary"}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
