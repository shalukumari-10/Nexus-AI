"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import AppShell from "@/components/AppShell";
import { PageHeader, GlassCard, Badge, StatCard } from "@/components/ui";
import { BRAND_RECORDS, COMMON_EXPLOITATIVE_CLAUSES } from "@/lib/mock-data";

export default function BrandInsightsPage() {
  const fairCount = BRAND_RECORDS.filter((b) => b.riskLevel === "Low").length;
  const riskyCount = BRAND_RECORDS.filter((b) => b.riskLevel === "High").length;
  const fairRatio = Math.round((fairCount / BRAND_RECORDS.length) * 100);

  const chartData = BRAND_RECORDS.map((b) => ({
    name: b.name,
    deals: b.dealsTracked,
    color: b.riskLevel === "Low" ? "#34D399" : b.riskLevel === "Medium" ? "#F5A623" : "#F06B6B",
  }));

  const riskColor: Record<string, "emerald" | "amber" | "red"> = { Low: "emerald", Medium: "amber", High: "red" };

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
        <PageHeader title="Brand Insights" subtitle="Know how a brand behaves in contract negotiations before you sign — based on aggregated, anonymized scan data." />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
          <StatCard icon="ti-thumb-up" label="Fair brand ratio" value={`${fairRatio}%`} color="emerald" />
          <StatCard icon="ti-alert-triangle" label="Brands on watchlist" value={riskyCount} color="red" />
          <StatCard icon="ti-calendar-time" label="Avg usage window" value="4–9 mo" color="violet" />
          <StatCard icon="ti-building-store" label="Brands tracked" value={BRAND_RECORDS.length} color="amber" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: "1.5rem" }}>
          <GlassCard>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", marginBottom: 14 }}>Deals Tracked by Brand</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#5A6B8A", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94A3C0", fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={{ background: "#1A2235", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="deals" radius={[0, 6, 6, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", marginBottom: 14 }}>Common Exploitative Clauses</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {COMMON_EXPLOITATIVE_CLAUSES.map((c) => (
                <div key={c.clause}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--text2)", marginBottom: 4 }}>
                    <span>{c.clause}</span>
                    <span style={{ color: "var(--text3)" }}>{c.frequency}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${c.frequency}%`, background: "linear-gradient(90deg, var(--violet), var(--blue))", borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* BRAND LEADERBOARD */}
        <GlassCard style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.25rem 0.75rem", fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}>Brand Leaderboard</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderTop: "0.5px solid var(--glass-border)", borderBottom: "0.5px solid var(--glass-border)" }}>
                {["Brand", "Risk level", "Avg usage window", "Deals tracked", "Common issues"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BRAND_RECORDS.sort((a, b) => (a.riskLevel === "Low" ? -1 : 1)).map((b) => (
                <tr key={b.name} style={{ borderBottom: "0.5px solid var(--glass-border)" }}>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{b.name}</td>
                  <td style={{ padding: "13px 16px" }}><Badge color={riskColor[b.riskLevel]}>{b.riskLevel}</Badge></td>
                  <td style={{ padding: "13px 16px", fontSize: 12.5, color: "var(--text2)" }}>{b.avgUsageWindow}</td>
                  <td style={{ padding: "13px 16px", fontSize: 12.5, color: "var(--text2)" }}>{b.dealsTracked}</td>
                  <td style={{ padding: "13px 16px", fontSize: 12, color: "var(--text3)" }}>{b.commonIssues.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>

        <p style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", marginTop: "1.25rem" }}>
          Brand insights are based on illustrative sample data for this demo.
        </p>
      </div>
    </AppShell>
  );
}
