"use client";
import React, { useState, useEffect } from "react";
import { GlassCard, Badge } from "@/components/ui";
import { AnalysisResult } from "@/lib/types";

interface Props {
  data: AnalysisResult;
}

interface SimulationState {
  liabilityCap: "Unlimited" | "3x Fees" | "1.5x Fees" | "1x Fees";
  revisionLimits: "Unlimited" | "5 Rounds" | "3 Rounds" | "2 Rounds";
  ipOwnership: "Client Owns All" | "Client Licenses Tools" | "Contractor Retains Tools";
  paymentTerms: "Net 90" | "Net 60" | "Net 30" | "50% Upfront";
  exclusivity: "100% Exclusivity" | "Non-exclusive";
  termination: "Immediate Client Only" | "30-Day Mutual" | "90-Day Mutual";
}

const ORIGINAL_DEFAULTS: SimulationState = {
  liabilityCap: "Unlimited",
  revisionLimits: "Unlimited",
  ipOwnership: "Client Owns All",
  paymentTerms: "Net 90",
  exclusivity: "100% Exclusivity",
  termination: "Immediate Client Only"
};

export default function BusinessImpactSimulator({ data }: Props) {
  const [sim, setSim] = useState<SimulationState>(ORIGINAL_DEFAULTS);
  const [originalScore, setOriginalScore] = useState(65);

  useEffect(() => {
    if (data.riskScore) {
      setOriginalScore(Math.round(data.riskScore));
    }
  }, [data]);

  // Reset simulator back to original defaults
  const handleReset = () => {
    setSim(ORIGINAL_DEFAULTS);
  };

  // 1. Calculate dynamic risk changes based on controls
  const getAdjustment = () => {
    let adj = 0;
    
    // Liability cap influence
    if (sim.liabilityCap === "Unlimited") adj += 15;
    else if (sim.liabilityCap === "3x Fees") adj += 7;
    else if (sim.liabilityCap === "1.5x Fees") adj += 2;
    else if (sim.liabilityCap === "1x Fees") adj -= 5;

    // Revision limits influence
    if (sim.revisionLimits === "Unlimited") adj += 12;
    else if (sim.revisionLimits === "5 Rounds") adj += 6;
    else if (sim.revisionLimits === "3 Rounds") adj += 1;
    else if (sim.revisionLimits === "2 Rounds") adj -= 4;

    // IP ownership influence
    if (sim.ipOwnership === "Client Owns All") adj += 10;
    else if (sim.ipOwnership === "Client Licenses Tools") adj += 3;
    else if (sim.ipOwnership === "Contractor Retains Tools") adj -= 5;

    // Payment terms influence
    if (sim.paymentTerms === "Net 90") adj += 14;
    else if (sim.paymentTerms === "Net 60") adj += 7;
    else if (sim.paymentTerms === "Net 30") adj += 1;
    else if (sim.paymentTerms === "50% Upfront") adj -= 8;

    // Exclusivity influence
    if (sim.exclusivity === "100% Exclusivity") adj += 8;
    else if (sim.exclusivity === "Non-exclusive") adj -= 4;

    // Termination influence
    if (sim.termination === "Immediate Client Only") adj += 10;
    else if (sim.termination === "90-Day Mutual") adj += 3;
    else if (sim.termination === "30-Day Mutual") adj -= 5;

    return adj;
  };

  // Heuristic adjustments relative to a baseline risk score of 50
  const simulatedRisk = Math.min(98, Math.max(5, 50 + getAdjustment()));
  const simulatedHealth = 100 - simulatedRisk;
  const simulatedRevenueAtRisk = simulatedRisk * 1250;
  const simulatedExposure = simulatedRisk * 2200;
  const simulatedSuccess = Math.min(95, Math.max(35, 95 - (simulatedRisk * 0.75)));
  
  let relationship = "Collaborative";
  let relationshipColor = "var(--emerald)";
  if (simulatedRisk >= 70) {
    relationship = "Strained";
    relationshipColor = "var(--coral)";
  } else if (simulatedRisk >= 40) {
    relationship = "Cautious";
    relationshipColor = "var(--amber)";
  }

  // Generate dynamic AI Insights based on simulated changes
  const getInsights = () => {
    const list: string[] = [];
    if (sim.liabilityCap !== ORIGINAL_DEFAULTS.liabilityCap) {
      list.push(`Capping liability at ${sim.liabilityCap} mitigates catastrophic lawsuit exposures and preserves operating assets.`);
    }
    if (sim.revisionLimits !== ORIGINAL_DEFAULTS.revisionLimits) {
      list.push(`Limiting creative iterations to ${sim.revisionLimits} saves labor hours and prevents uncompensated scope creep.`);
    }
    if (sim.paymentTerms !== ORIGINAL_DEFAULTS.paymentTerms) {
      list.push(`Transitioning payment structures to ${sim.paymentTerms} enhances cashflow predictability and cuts customer defaults.`);
    }
    if (sim.ipOwnership !== ORIGINAL_DEFAULTS.ipOwnership) {
      list.push(`Retaining pre-existing tools IP ownership safeguards reusable assets for future projects.`);
    }
    if (sim.termination !== ORIGINAL_DEFAULTS.termination) {
      list.push(`Structuring a ${sim.termination} notice period prevents sudden contract cancellations and revenue loss.`);
    }
    if (list.length === 0) {
      list.push("Adjust the simulation options above to model counter-proposals and calculate simulated business outcome metrics.");
    }
    return list;
  };

  return (
    <GlassCard style={{ padding: "1.75rem", marginBottom: "1.25rem", border: "1px solid var(--glass-border2)", position: "relative", overflow: "hidden" }} className="animate-float-in">
      <style jsx>{`
        .sim-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .controls-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .control-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          border-bottom: 0.5px solid rgba(255,255,255,0.05);
          padding-bottom: 12px;
        }
        .control-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }
        .control-select {
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--glass-border);
          color: var(--text);
          font-size: 12.5px;
          border-radius: 6px;
          padding: 6px 10px;
          outline: none;
          min-width: 150px;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .metric-card {
          background: rgba(0,0,0,0.25);
          border: 0.5px solid var(--glass-border);
          border-radius: 10px;
          padding: 12px 14px;
          text-align: center;
        }
        .metric-lbl {
          font-size: 11px;
          color: var(--text3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .metric-val {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
        }
        .comparison-panel {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          background: rgba(0,0,0,0.15);
          border: 1.5px dashed var(--glass-border);
          border-radius: 10px;
          padding: 16px;
        }
        .comp-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .comp-lbl {
          font-size: 11px;
          font-weight: 600;
          color: var(--text3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 4px;
        }
        .comp-item {
          font-size: 12px;
          color: var(--text2);
          display: flex;
          justify-content: space-between;
        }
        @media (max-width: 768px) {
          .sim-container {
            grid-template-columns: 1fr;
          }
          .comparison-panel {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)", paddingBottom: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <i className="ti ti-chart-bar" style={{ color: "#06B6D4", fontSize: 18 }} />
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", margin: 0, letterSpacing: "0.02em" }}>AI Business Impact Simulator</h2>
            <p style={{ fontSize: 11, color: "var(--text3)", margin: 0 }}>Model counter-proposals to visualize protection improvements.</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="sim-action-btn secondary"
          style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}
          title="Restore baseline terms"
        >
          <i className="ti ti-refresh" /> Restore Original Agreement
        </button>
      </div>

      {/* Grid container */}
      <div className="sim-container">
        {/* Left Column: Interactive Controls */}
        <div className="controls-card">
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", display: "block" }}>Interactive Negotiation Parameters</span>
          
          <div className="control-row">
            <span className="control-label">Liability Cap</span>
            <select
              className="control-select"
              value={sim.liabilityCap}
              onChange={(e) => setSim({ ...sim, liabilityCap: e.target.value as any })}
            >
              <option value="Unlimited">Unlimited (High Risk)</option>
              <option value="3x Fees">Capped at 3x Fees</option>
              <option value="1.5x Fees">Capped at 1.5x Fees</option>
              <option value="1x Fees">Capped at 1x Fees</option>
            </select>
          </div>

          <div className="control-row">
            <span className="control-label">Revision Limits</span>
            <select
              className="control-select"
              value={sim.revisionLimits}
              onChange={(e) => setSim({ ...sim, revisionLimits: e.target.value as any })}
            >
              <option value="Unlimited">Unlimited (High Risk)</option>
              <option value="5 Rounds">Up to 5 Rounds</option>
              <option value="3 Rounds">Up to 3 Rounds</option>
              <option value="2 Rounds">Up to 2 Rounds</option>
            </select>
          </div>

          <div className="control-row">
            <span className="control-label">Intellectual Property</span>
            <select
              className="control-select"
              value={sim.ipOwnership}
              onChange={(e) => setSim({ ...sim, ipOwnership: e.target.value as any })}
            >
              <option value="Client Owns All">Client Owns All IP</option>
              <option value="Client Licenses Tools">Client Licenses Prior Tools</option>
              <option value="Contractor Retains Tools">Contractor Retains Tools</option>
            </select>
          </div>

          <div className="control-row">
            <span className="control-label">Payment Terms</span>
            <select
              className="control-select"
              value={sim.paymentTerms}
              onChange={(e) => setSim({ ...sim, paymentTerms: e.target.value as any })}
            >
              <option value="Net 90">Net 90 Days (Delayed)</option>
              <option value="Net 60">Net 60 Days</option>
              <option value="Net 30">Net 30 Days</option>
              <option value="50% Upfront">50% Advance + Net 30</option>
            </select>
          </div>

          <div className="control-row">
            <span className="control-label">Exclusivity</span>
            <select
              className="control-select"
              value={sim.exclusivity}
              onChange={(e) => setSim({ ...sim, exclusivity: e.target.value as any })}
            >
              <option value="100% Exclusivity">100% Exclusivity Block</option>
              <option value="Non-exclusive">Non-exclusive Terms</option>
            </select>
          </div>

          <div className="control-row">
            <span className="control-label">Termination Notice</span>
            <select
              className="control-select"
              value={sim.termination}
              onChange={(e) => setSim({ ...sim, termination: e.target.value as any })}
            >
              <option value="Immediate Client Only">Immediate Client Only</option>
              <option value="90-Day Mutual">90-Day Mutual Notice</option>
              <option value="30-Day Mutual">30-Day Mutual Notice</option>
            </select>
          </div>
        </div>

        {/* Right Column: Live Recalculations & Insights */}
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Simulated Business Metrics</span>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-lbl">Risk Score</div>
              <div className="metric-val" style={{ color: simulatedRisk > 60 ? "var(--coral)" : simulatedRisk > 30 ? "var(--amber)" : "var(--emerald)" }}>
                {simulatedRisk} / 100
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-lbl">Business Health</div>
              <div className="metric-val" style={{ color: "var(--violet2)" }}>
                {simulatedHealth}%
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-lbl">Revenue at Risk</div>
              <div className="metric-val" style={{ color: "var(--coral)" }}>
                ${simulatedRevenueAtRisk.toLocaleString()}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-lbl">Negotiation Win %</div>
              <div className="metric-val" style={{ color: "var(--emerald)" }}>
                {simulatedSuccess}%
              </div>
            </div>

            <div className="metric-card" style={{ gridColumn: "span 2" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>
                <span>RELATIONSHIP OUTLOOK:</span>
                <span style={{ color: relationshipColor, fontWeight: 700 }}>{relationship.toUpperCase()}</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${100 - simulatedRisk}%`, height: "100%", background: relationshipColor }} />
              </div>
            </div>
          </div>

          {/* AI Insights Card */}
          <div style={{ background: "rgba(6, 182, 212, 0.04)", border: "1px solid rgba(6, 182, 212, 0.2)", borderRadius: 10, padding: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#06B6D4", textTransform: "uppercase", display: "block", marginBottom: 6 }}>AI Simulator Insights</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {getInsights().map((insight, idx) => (
                <div key={idx} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "var(--text2)", lineHeight: 1.5 }}>
                  <i className="ti ti-info-circle" style={{ color: "#06B6D4", flexShrink: 0, marginTop: 2 }} />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison panel */}
      <div style={{ marginTop: 20 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Side-by-Side Wording Comparison</span>
        
        <div className="comparison-panel">
          {/* Left: Original terms */}
          <div className="comp-col">
            <span className="comp-lbl">Original Contract Terms</span>
            <div className="comp-item"><span>Liability cap:</span> <span style={{ color: "var(--coral)" }}>Unlimited Liability</span></div>
            <div className="comp-item"><span>Revisions:</span> <span style={{ color: "var(--coral)" }}>Unlimited edits</span></div>
            <div className="comp-item"><span>IP ownership:</span> <span style={{ color: "var(--coral)" }}>Client owns pre-existing tools</span></div>
            <div className="comp-item"><span>Payment cycle:</span> <span style={{ color: "var(--coral)" }}>Net 90 days</span></div>
            <div className="comp-item"><span>Exclusivity:</span> <span style={{ color: "var(--coral)" }}>100% exclusive exclusivity</span></div>
            <div className="comp-item"><span>Termination notice:</span> <span style={{ color: "var(--coral)" }}>Immediate client only</span></div>
          </div>

          {/* Right: Simulated terms */}
          <div className="comp-col">
            <span className="comp-lbl">Simulated Contract Terms</span>
            
            <div className="comp-item">
              <span>Liability cap:</span>
              <span style={{ color: sim.liabilityCap === "Unlimited" ? "var(--coral)" : "var(--emerald)", fontWeight: 500 }}>
                {sim.liabilityCap === "Unlimited" ? "Unlimited (Standard)" : `${sim.liabilityCap} Cap`}
              </span>
            </div>

            <div className="comp-item">
              <span>Revisions:</span>
              <span style={{ color: sim.revisionLimits === "Unlimited" ? "var(--coral)" : "var(--emerald)", fontWeight: 500 }}>
                {sim.revisionLimits === "Unlimited" ? "Unlimited" : `${sim.revisionLimits} Limits`}
              </span>
            </div>

            <div className="comp-item">
              <span>IP ownership:</span>
              <span style={{ color: sim.ipOwnership === "Client Owns All" ? "var(--coral)" : "var(--emerald)", fontWeight: 500 }}>
                {sim.ipOwnership}
              </span>
            </div>

            <div className="comp-item">
              <span>Payment cycle:</span>
              <span style={{ color: sim.paymentTerms === "Net 90" ? "var(--coral)" : "var(--emerald)", fontWeight: 500 }}>
                {sim.paymentTerms}
              </span>
            </div>

            <div className="comp-item">
              <span>Exclusivity:</span>
              <span style={{ color: sim.exclusivity === "100% Exclusivity" ? "var(--coral)" : "var(--emerald)", fontWeight: 500 }}>
                {sim.exclusivity}
              </span>
            </div>

            <div className="comp-item">
              <span>Termination notice:</span>
              <span style={{ color: sim.termination === "Immediate Client Only" ? "var(--coral)" : "var(--emerald)", fontWeight: 500 }}>
                {sim.termination}
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
