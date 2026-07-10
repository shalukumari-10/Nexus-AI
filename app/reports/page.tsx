"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { PageHeader, GlassCard, Badge, SecondaryButton, EmptyState } from "@/components/ui";
import { getLastResult } from "@/lib/storage";
import { AnalysisResult } from "@/lib/types";

export default function ReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    setData(getLastResult());
  }, []);

  function downloadTextReport() {
    if (!data) return;
    const lines: string[] = [];
    lines.push(`NEXUS AI — RISK ANALYSIS REPORT`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Contract: ${data.contractName || "Untitled"}`);
    lines.push(`Brand: ${data.brandName || "Unknown"}`);
    lines.push("");
    lines.push(`OVERALL RISK: ${data.overallRiskLevel} (${data.riskScore}/100)`);
    lines.push("");
    lines.push(`SUMMARY`);
    lines.push(data.summary);
    lines.push("");
    lines.push(`CLAUSE BREAKDOWN`);
    data.flags.forEach((f, i) => {
      lines.push("");
      lines.push(`${i + 1}. [${f.severity.toUpperCase()}] ${f.category}`);
      lines.push(`   Clause: ${f.clause}`);
      lines.push(`   Explanation: ${f.explanation}`);
      lines.push(`   Creator Impact: ${f.creatorImpact}`);
      if (f.estimatedFinancialImpact) lines.push(`   Financial Impact: ${f.estimatedFinancialImpact}`);
      lines.push(`   Suggested Counter-Language: ${f.suggestedCounterLanguage}`);
    });
    lines.push("");
    lines.push(`NEGOTIATION MESSAGE`);
    lines.push(data.negotiationMessage);
    lines.push("");
    lines.push(`RECOMMENDED ACTIONS`);
    (data.recommendedActions || []).forEach((a, i) => lines.push(`${i + 1}. ${a}`));
    lines.push("");
    lines.push(`---`);
    lines.push(`This is not legal advice. Nexus AI is an AI-powered tool designed to help business users identify potential negotiation points.`);

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus-ai-report-${(data.contractName || "contract").replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (!data) {
    return (
      <AppShell>
        <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
          <EmptyState
            icon="ti-report"
            title="No report available"
            subtitle="Scan a contract first to generate a report."
            action={<SecondaryButton onClick={() => router.push("/scanner")}><i className="ti ti-scan" /> Go to Scanner</SecondaryButton>}
          />
        </div>
      </AppShell>
    );
  }

  const lvl = data.overallRiskLevel.toLowerCase();
  const lvlColor = lvl === "high" ? "red" : lvl === "moderate" ? "amber" : "emerald";

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
        <PageHeader
          title="Report"
          subtitle="A printable, shareable summary of your latest agreement analysis."
          action={<SecondaryButton onClick={downloadTextReport}><i className="ti ti-download" /> Download report</SecondaryButton>}
        />

        <GlassCard style={{ padding: "2rem" }}>
          <div style={{ borderBottom: "0.5px solid var(--glass-border)", paddingBottom: "1.25rem", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: 11, color: "var(--violet2)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Nexus AI Risk Report</div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>{data.contractName || "Untitled Agreement"}</h2>
            <p style={{ fontSize: 13, color: "var(--text3)" }}>{data.brandName || "Unknown client"} · Generated {new Date(data.scannedAt || Date.now()).toLocaleDateString()}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "1.5rem" }}>
            <Badge color={lvlColor}>{data.overallRiskLevel} Risk — {data.riskScore}/100</Badge>
            <Badge color="neutral">{data.flags.length} clauses reviewed</Badge>
          </div>

          <Section title="Summary"><p style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.7 }}>{data.summary}</p></Section>

          <Section title="Clause Breakdown">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {data.flags.map((f, i) => (
                <div key={f.id} style={{ paddingLeft: 14, borderLeft: `3px solid ${f.severity === "red" ? "var(--coral)" : f.severity === "yellow" ? "var(--amber)" : "var(--emerald)"}` }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>{i + 1}. {f.category}</div>
                  <p style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.6, marginBottom: 4 }}>{f.explanation}</p>
                  {f.estimatedFinancialImpact && <p style={{ fontSize: 12, color: "var(--violet2)" }}>{f.estimatedFinancialImpact}</p>}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Negotiation Message">
            <pre style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "inherit", background: "rgba(0,0,0,0.2)", padding: 14, borderRadius: 8, border: "0.5px solid var(--glass-border)" }}>
              {data.negotiationMessage}
            </pre>
          </Section>

          {data.recommendedActions && data.recommendedActions.length > 0 && (
            <Section title="Recommended Actions">
              <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                {data.recommendedActions.map((a, i) => (
                  <li key={i} style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.6 }}>{a}</li>
                ))}
              </ul>
            </Section>
          )}

          <div style={{ borderTop: "0.5px solid var(--glass-border)", paddingTop: "1.25rem", marginTop: "1.5rem" }}>
            <p style={{ fontSize: 11.5, color: "var(--text3)", lineHeight: 1.6 }}>
              ⚠️ This is not legal advice. Nexus AI is an AI-powered tool designed to help business users identify potential negotiation points. Always consult a qualified attorney before signing.
            </p>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}
