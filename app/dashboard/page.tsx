"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import AppShell from "@/components/AppShell";
import { PageHeader, GlassCard, StatCard, Badge, EmptyState, SecondaryButton } from "@/components/ui";
import { getHistory, computeDashboardMetrics, saveLastResult } from "@/lib/storage";
import { HistoryEntry } from "@/lib/types";

const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: "mock-1", contractName: "Spring Wellness Bundle", brandName: "Vita Wellness", date: "2026-06-10",
    type: "Brand Collaboration", riskScore: 84, riskLevel: "High", status: "Negotiating",
    result: { overallRiskLevel: "High", riskScore: 84, summary: "", flags: [
      { id: "f1", severity: "red", category: "Unlimited Usage Rights", clause: "", explanation: "", creatorImpact: "", suggestedCounterLanguage: "" },
      { id: "f2", severity: "red", category: "No Kill Fee", clause: "", explanation: "", creatorImpact: "", suggestedCounterLanguage: "" },
      { id: "f3", severity: "yellow", category: "Exclusivity", clause: "", explanation: "", creatorImpact: "", suggestedCounterLanguage: "" },
    ], negotiationMessage: "", recommendedActions: [] },
  },
  {
    id: "mock-2", contractName: "Tech Unboxing Series", brandName: "Aero Audio", date: "2026-06-05",
    type: "Sponsored Post", riskScore: 22, riskLevel: "Low", status: "Signed",
    result: { overallRiskLevel: "Low", riskScore: 22, summary: "", flags: [
      { id: "f1", severity: "green", category: "Fair Payment Terms", clause: "", explanation: "", creatorImpact: "", suggestedCounterLanguage: "" },
    ], negotiationMessage: "", recommendedActions: [] },
  },
  {
    id: "mock-3", contractName: "Glow Summer Campaign", brandName: "GlowGrid", date: "2026-05-28",
    type: "Brand Collaboration", riskScore: 53, riskLevel: "Moderate", status: "Reviewed",
    result: { overallRiskLevel: "Moderate", riskScore: 53, summary: "", flags: [
      { id: "f1", severity: "yellow", category: "Vague Payment Terms", clause: "", explanation: "", creatorImpact: "", suggestedCounterLanguage: "" },
      { id: "f2", severity: "yellow", category: "Unlimited Revisions", clause: "", explanation: "", creatorImpact: "", suggestedCounterLanguage: "" },
    ], negotiationMessage: "", recommendedActions: [] },
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const real = getHistory();
    if (real.length > 0) {
      setHistory(real);
    } else {
      setHistory([]);
      setUsingMock(false);
    }
  }, []);

  const metrics = computeDashboardMetrics(usingMock ? MOCK_HISTORY : history);

  const riskDistribution = [
    { name: "Red flags", value: history.reduce((s, h) => s + h.result.flags.filter((f) => f.severity === "red").length, 0), color: "#F06B6B" },
    { name: "Yellow flags", value: history.reduce((s, h) => s + h.result.flags.filter((f) => f.severity === "yellow").length, 0), color: "#F5A623" },
    { name: "Green flags", value: history.reduce((s, h) => s + h.result.flags.filter((f) => f.severity === "green").length, 0), color: "#34D399" },
  ].filter((d) => d.value > 0);

  const revenueTrend = [...history].reverse().map((h, i) => ({
    name: `Scan ${i + 1}`,
    protected: h.result.flags.filter((f) => f.severity === "red").length * 400 + h.result.flags.filter((f) => f.severity === "yellow").length * 150,
  }));

  function viewReport(entry: HistoryEntry) {
    saveLastResult(entry.result);
    router.push("/results");
  }

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
        <PageHeader
          title="Business Intelligence Center"
          subtitle="Your business agreement analysis activity, protected revenue, and negotiation performance at a glance."
          action={<SecondaryButton onClick={() => router.push("/scanner")}><i className="ti ti-scan" /> Analyze new agreement</SecondaryButton>}
        />

        {usingMock && (
          <div style={{ marginBottom: "1.25rem", display: "inline-flex" }}>
            <Badge color="neutral"><i className="ti ti-info-circle" /> Showing sample data — analyze an agreement to see your real activity</Badge>
          </div>
        )}

        {/* METRICS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
          <StatCard icon="ti-file-search" label="Business Agreements Analyzed" value={metrics.contractsScanned} color="violet" />
          <StatCard icon="ti-flag-2" label="Business Risks Identified" value={metrics.riskyClausesFound} color="red" />
          <StatCard icon="ti-coin" label="Est. Revenue Protected" value={`$${metrics.moneyProtected.toLocaleString()}`} color="emerald" />
          <StatCard icon="ti-trending-up" label="Negotiation Success Rate" value={`${metrics.negotiationSuccessRate}%`} color="amber" />
          <StatCard icon="ti-gauge" label="Avg Risk Score" value={metrics.avgRiskScore} color="violet" />
        </div>

        {/* CHARTS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "1.5rem" }}>
          <GlassCard>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", marginBottom: 14 }}>Risk Distribution</div>
            {riskDistribution.length > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                      {riskDistribution.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1A2235", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState title="No flag data yet" />}
            <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 8 }}>
              {riskDistribution.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text2)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} /> {d.name}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", marginBottom: 14 }}>Business Health Trend</div>
            {revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={{ fill: "#5A6B8A", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
                  <YAxis tick={{ fill: "#5A6B8A", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
                  <Tooltip contentStyle={{ background: "#1A2235", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="protected" stroke="#A78BFA" strokeWidth={2.5} dot={{ fill: "#A78BFA", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyState title="No trend data yet" />}
          </GlassCard>
        </div>

        {/* AI QUICK ACTIONS */}
        <GlassCard style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", marginBottom: 14 }}>AI Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            {[
              { icon: "ti-scan", label: "Analyze new agreement", href: "/scanner" },
              { icon: "ti-wand", label: "Draft counter-language", href: "/negotiation-toolkit" },
              { icon: "ti-building-store", label: "Evaluate client trust", href: "/brand-insights" },
              { icon: "ti-gavel", label: "Access expert network", href: "/legal-help" },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => router.push(a.href)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10,
                  background: "rgba(0,0,0,0.2)", border: "0.5px solid var(--glass-border)", borderRadius: 10,
                  padding: "1rem", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s",
                }}
              >
                <i className={`ti ${a.icon}`} style={{ fontSize: 20, color: "var(--violet2)" }} />
                <span style={{ fontSize: 13, color: "var(--text)" }}>{a.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* RECENT BUSINESS ASSESSMENTS */}
        <GlassCard style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.25rem 0.75rem", fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}>Recent Business Assessments</div>
          {history.length === 0 ? (
            <div style={{ padding: "1.25rem" }}><EmptyState title="No assessments yet" subtitle="Run your first agreement analysis to see it here." /></div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderTop: "0.5px solid var(--glass-border)", borderBottom: "0.5px solid var(--glass-border)" }}>
                  {["Agreement", "Client", "Date", "Risk", "Status", ""].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 8).map((h) => (
                  <tr key={h.id} style={{ borderBottom: "0.5px solid var(--glass-border)" }}>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--text)" }}>{h.contractName}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--text2)" }}>{h.brandName}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: "var(--text3)" }}>{h.date}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <Badge color={h.riskLevel === "High" ? "red" : h.riskLevel === "Moderate" ? "amber" : "emerald"}>{h.riskScore}/100</Badge>
                    </td>
                    <td style={{ padding: "12px 14px" }}><Badge color="neutral">{h.status}</Badge></td>
                    <td style={{ padding: "12px 14px" }}>
                      <button onClick={() => viewReport(h)} style={{ background: "none", border: "none", color: "var(--violet2)", fontSize: 12.5, cursor: "pointer" }}>
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}
