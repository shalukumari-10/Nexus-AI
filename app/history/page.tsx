"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { PageHeader, GlassCard, Badge, SecondaryButton, EmptyState } from "@/components/ui";
import { getHistory, historyToCSV, downloadCSV, saveLastResult } from "@/lib/storage";
import { HistoryEntry } from "@/lib/types";

type RiskFilter = "all" | "Low" | "Moderate" | "High";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const filtered = useMemo(() => {
    return history.filter((h) => {
      const matchesSearch =
        search.trim() === "" ||
        h.contractName.toLowerCase().includes(search.toLowerCase()) ||
        h.brandName.toLowerCase().includes(search.toLowerCase()) ||
        h.result.flags.some((f) => f.category.toLowerCase().includes(search.toLowerCase()));
      const matchesRisk = riskFilter === "all" || h.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [history, search, riskFilter]);

  function viewReport(entry: HistoryEntry) {
    saveLastResult(entry.result);
    router.push("/results");
  }

  function exportCSV() {
    const csv = historyToCSV(filtered);
    downloadCSV(`nexus-ai-history-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
        <PageHeader
          title="Business Records"
          subtitle="Every agreement you've analyzed, searchable and exportable."
          action={
            <SecondaryButton onClick={exportCSV}>
              <i className="ti ti-download" /> Export CSV
            </SecondaryButton>
          }
        />

        <GlassCard style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
              <i className="ti ti-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", fontSize: 14 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by agreement name, client, or risk category…"
                style={{ width: "100%", background: "rgba(0,0,0,0.25)", border: "0.5px solid var(--glass-border)", borderRadius: 8, padding: "9px 12px 9px 34px", fontSize: 13, color: "var(--text)", outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["all", "Low", "Moderate", "High"] as RiskFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setRiskFilter(f)}
                  style={{
                    padding: "7px 14px", borderRadius: 8, fontSize: 12.5, cursor: "pointer",
                    border: `0.5px solid ${riskFilter === f ? "var(--glass-border2)" : "var(--glass-border)"}`,
                    background: riskFilter === f ? "var(--glass2)" : "transparent",
                    color: riskFilter === f ? "var(--text)" : "var(--text2)",
                  }}
                >
                  {f === "all" ? "All risk levels" : f}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard style={{ padding: 0, overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "2rem" }}>
              <EmptyState
                icon="ti-history"
                title={history.length === 0 ? "No records yet" : "No results match your filters"}
                subtitle={history.length === 0 ? "Analyze your first agreement to build your business records." : undefined}
                action={history.length === 0 ? <SecondaryButton onClick={() => router.push("/scanner")}><i className="ti ti-scan" /> Go to Agreement Scanner</SecondaryButton> : undefined}
              />
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid var(--glass-border)" }}>
                  {["Agreement", "Client", "Date", "Type", "Risk Score", "Status", ""].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => (
                  <tr key={h.id} style={{ borderBottom: "0.5px solid var(--glass-border)" }}>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{h.contractName}</td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text2)" }}>{h.brandName}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12.5, color: "var(--text3)" }}>{h.date}</td>
                    <td style={{ padding: "13px 16px", fontSize: 12.5, color: "var(--text3)" }}>{h.type}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <Badge color={h.riskLevel === "High" ? "red" : h.riskLevel === "Moderate" ? "amber" : "emerald"}>{h.riskScore}/100 · {h.riskLevel}</Badge>
                    </td>
                    <td style={{ padding: "13px 16px" }}><Badge color="neutral">{h.status}</Badge></td>
                    <td style={{ padding: "13px 16px" }}>
                      <button onClick={() => viewReport(h)} style={{ background: "var(--glass2)", border: "0.5px solid var(--glass-border)", color: "var(--text)", fontSize: 12, cursor: "pointer", padding: "5px 12px", borderRadius: 6 }}>
                        View report
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
