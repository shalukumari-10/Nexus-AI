"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { GlassCard, Badge, CopyButton, SecondaryButton, EmptyState } from "@/components/ui";
import { getLastResult } from "@/lib/storage";
import { buildNegotiationMessageClient } from "@/lib/client-negotiation";
import { AnalysisResult, Flag } from "@/lib/types";
import NexusAdvisor from "@/components/NexusAdvisor";

type Filter = "all" | "red" | "yellow" | "green";
type Tone = "Friendly" | "Firm" | "Professional";

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [openCards, setOpenCards] = useState<Set<string>>(new Set());
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [tone, setTone] = useState<Tone>("Professional");
  const [negMsg, setNegMsg] = useState("");
  const [rewriting, setRewriting] = useState<string | null>(null);
  const [rewrittenClauses, setRewrittenClauses] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = getLastResult();
    if (!stored) return;
    setData(stored);
    setNegMsg(stored.negotiationMessage || "");
    if (stored.flags.length > 0) setSelectedFlag(stored.flags[0]);
  }, []);

  if (!data) {
    return (
      <AppShell>
        <div style={{ padding: "2rem", maxWidth: 1000, margin: "0 auto" }}>
          <EmptyState
            icon="ti-file-off"
            title="No analysis found"
            subtitle="Run a scan first to see results here."
            action={<SecondaryButton onClick={() => router.push("/scanner")}><i className="ti ti-scan" /> Go to Scanner</SecondaryButton>}
          />
        </div>
      </AppShell>
    );
  }

  const reds = data.flags.filter((f) => f.severity === "red").length;
  const yels = data.flags.filter((f) => f.severity === "yellow").length;
  const grns = data.flags.filter((f) => f.severity === "green").length;
  const lvlRaw = (data.overallRiskLevel || "Low").toLowerCase();
  const lvl = lvlRaw === "high" ? "high" : lvlRaw === "moderate" ? "moderate" : "low";
  const lvlLabel = lvl === "high" ? "High Risk" : lvl === "moderate" ? "Moderate Risk" : "Low Risk";

  const riskCircleStyle = {
    high: { bg: "rgba(240,107,107,0.15)", border: "2px solid rgba(240,107,107,0.5)", numColor: "var(--coral)" },
    moderate: { bg: "rgba(245,166,35,0.12)", border: "2px solid rgba(245,166,35,0.4)", numColor: "var(--amber)" },
    low: { bg: "rgba(52,211,153,0.1)", border: "2px solid rgba(52,211,153,0.4)", numColor: "var(--emerald)" },
  }[lvl];
  const labelColors = { high: "var(--coral)", moderate: "var(--amber)", low: "var(--emerald)" };

  const shown = filter === "all" ? data.flags : data.flags.filter((f) => f.severity === filter);

  function toggleCard(id: string) {
    setOpenCards((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function changeTone(t: Tone) {
    setTone(t);
    setNegMsg(buildNegotiationMessageClient(data!.flags, t));
  }

  async function rewriteClause(flag: Flag) {
    setRewriting(flag.id);
    try {
      const res = await fetch("/api/rewrite-clause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clause: flag.clause }),
      });
      const json = await res.json();
      setRewrittenClauses((prev) => ({ ...prev, [flag.id]: json.rewrittenClause || flag.suggestedCounterLanguage }));
    } catch {
      setRewrittenClauses((prev) => ({ ...prev, [flag.id]: flag.suggestedCounterLanguage }));
    } finally {
      setRewriting(null);
    }
  }

  const sevColorMap: Record<string, "red" | "amber" | "emerald"> = { red: "red", yellow: "amber", green: "emerald" };
  const sevLabelMap: Record<string, string> = { red: "🔴 Red", yellow: "🟡 Yellow", green: "🟢 Green" };
  const borderMap: Record<string, string> = { red: "rgba(240,107,107,0.6)", yellow: "rgba(245,166,35,0.5)", green: "rgba(52,211,153,0.4)" };

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
        <button onClick={() => router.push("/scanner")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text2)", background: "none", border: "none", cursor: "pointer", marginBottom: "1.5rem", padding: 0 }}>
          <i className="ti ti-arrow-left" /> Back to scanner
        </button>

        {/* RISK HEADER */}
        <GlassCard style={{ padding: "1.75rem", marginBottom: "1.25rem", position: "relative", overflow: "hidden", borderColor: "var(--glass-border2)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: riskCircleStyle.bg, border: riskCircleStyle.border, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 22, fontWeight: 500, lineHeight: 1, color: riskCircleStyle.numColor }}>{Math.round(data.riskScore || 0)}</span>
                <span style={{ fontSize: 10, color: "var(--text3)" }}>/ 100</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 8, color: labelColors[lvl] }}>{lvlLabel.toUpperCase()}</span>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 500, letterSpacing: "-0.01em", marginBottom: 4, color: "var(--text)" }}>
                {data.contractName || "Contract Analysis"} {data.brandName ? `— ${data.brandName}` : ""}
              </h2>
              <p style={{ fontSize: "13.5px", color: "var(--text2)", lineHeight: 1.65, marginBottom: 6 }}>{data.summary}</p>
              {data.source && <Badge color={data.source === "ai" ? "violet" : "neutral"}><i className={`ti ${data.source === "ai" ? "ti-cpu" : "ti-keyboard"}`} />{data.source === "ai" ? "AI-analyzed" : "Keyword fallback analysis"}</Badge>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: "1.25rem" }}>
            {[
              { label: "Red flags", val: reds, icon: "ti-alert-circle", color: "var(--coral)" },
              { label: "Warnings", val: yels, icon: "ti-alert-triangle", color: "var(--amber)" },
              { label: "Business-friendly", val: grns, icon: "ti-circle-check", color: "var(--emerald)" },
              { label: "Negotiation points", val: reds + yels, icon: "ti-sword", color: "var(--violet2)" },
            ].map((card) => (
              <div key={card.label} style={{ background: "rgba(0,0,0,0.25)", border: "0.5px solid var(--glass-border)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
                  <i className={`ti ${card.icon}`} style={{ fontSize: 12 }} /> {card.label}
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: 500, color: card.color }}>{card.val}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["all", "red", "yellow", "green"] as Filter[]).map((f) => {
              const active = filter === f;
              const count = f === "all" ? data.flags.length : f === "red" ? reds : f === "yellow" ? yels : grns;
              const label = f === "all" ? "All" : f === "red" ? "🔴 Red" : f === "yellow" ? "🟡 Yellow" : "🟢 Green";
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer",
                    border: `0.5px solid ${active ? "var(--glass-border2)" : "transparent"}`,
                    background: active ? "var(--glass2)" : "var(--glass)", color: active ? "var(--text)" : "var(--text2)",
                  }}
                >
                  {label} {count}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* FLAGS + CONTRACT HIGHLIGHT */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shown.length === 0 ? (
              <EmptyState icon="ti-mood-smile" title="No clauses in this category." />
            ) : (
              shown.map((flag: Flag) => {
                const open = openCards.has(flag.id);
                return (
                  <div
                    key={flag.id}
                    className="glass-card animate-float-in"
                    style={{ borderLeft: `3px solid ${borderMap[flag.severity] || borderMap.green}`, padding: 0 }}
                  >
                    <div
                      onClick={() => { toggleCard(flag.id); setSelectedFlag(flag); }}
                      style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}
                    >
                      <Badge color={sevColorMap[flag.severity]}>{sevLabelMap[flag.severity]}</Badge>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 2 }}>{flag.category}</h3>
                        <span style={{ fontSize: 12, color: "var(--text3)" }}>Click to expand</span>
                      </div>
                      <i className="ti ti-chevron-down" style={{ color: "var(--text3)", fontSize: 16, marginTop: 2, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} />
                    </div>

                    {open && (
                      <div style={{ background: "rgba(0,0,0,0.2)", borderTop: "0.5px solid var(--glass-border)", padding: "1.25rem" }}>
                        <Section label="Clause text">
                          <div style={{ fontSize: 13, color: "var(--text2)", background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: 8, borderLeft: "3px solid rgba(255,255,255,0.12)", lineHeight: 1.6, fontStyle: "italic" }}>
                            &ldquo;{flag.clause}&rdquo;
                          </div>
                        </Section>
                        <Section label="What this means">
                          <p style={{ fontSize: "13.5px", color: "var(--text)", lineHeight: 1.65 }}>{flag.explanation}</p>
                        </Section>
                        {flag.creatorImpact && (
                          <Section label="Business Impact">
                            <div style={{ background: "rgba(245,166,35,0.08)", border: "0.5px solid rgba(245,166,35,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#FFD080", lineHeight: 1.6, display: "flex", gap: 8 }}>
                              <i className="ti ti-bolt" style={{ fontSize: 15, color: "var(--amber)", flexShrink: 0, marginTop: 1 }} />
                              {flag.creatorImpact}
                            </div>
                          </Section>
                        )}
                        {flag.estimatedFinancialImpact && (
                          <Section label="Estimated financial impact">
                            <div style={{ background: "rgba(124,110,240,0.08)", border: "0.5px solid rgba(124,110,240,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--violet2)", lineHeight: 1.6, display: "flex", gap: 8 }}>
                              <i className="ti ti-coin" style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }} />
                              {flag.estimatedFinancialImpact}
                            </div>
                          </Section>
                        )}
                        <Section label="Suggested counter-language">
                          <div style={{ background: "rgba(52,211,153,0.07)", border: "0.5px solid rgba(52,211,153,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#A7F3D0", lineHeight: 1.65, position: "relative" }}>
                            <div style={{ position: "absolute", top: 8, right: 8 }}>
                              <CopyButton text={flag.suggestedCounterLanguage} />
                            </div>
                            <div style={{ paddingRight: 70 }}>{flag.suggestedCounterLanguage}</div>
                          </div>
                        </Section>

                        {flag.severity !== "green" && (
                          <Section label="AI clause rewrite">
                            {rewrittenClauses[flag.id] ? (
                              <div style={{ background: "rgba(91,141,239,0.08)", border: "0.5px solid rgba(91,141,239,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#BFD4FA", lineHeight: 1.6, position: "relative" }}>
                                <div style={{ position: "absolute", top: 8, right: 8 }}>
                                  <CopyButton text={rewrittenClauses[flag.id]} />
                                </div>
                                <div style={{ paddingRight: 70 }}>{rewrittenClauses[flag.id]}</div>
                              </div>
                            ) : (
                              <SecondaryButton onClick={() => rewriteClause(flag)} style={{ fontSize: 12.5 }}>
                                {rewriting === flag.id ? (<><span className="spinner" /> Rewriting…</>) : (<><i className="ti ti-wand" /> Rewrite Clause Fairly</>)}
                              </SecondaryButton>
                            )}
                          </Section>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* CONTRACT HIGHLIGHT SIDE PANEL */}
          <div style={{ position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <GlassCard>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 10 }}>
                Selected clause
              </div>
              {selectedFlag ? (
                <>
                  <Badge color={sevColorMap[selectedFlag.severity]}>{sevLabelMap[selectedFlag.severity]}</Badge>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", margin: "8px 0 6px" }}>{selectedFlag.category}</div>
                  <p style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.6 }}>{selectedFlag.explanation}</p>
                </>
              ) : (
                <p style={{ fontSize: 12.5, color: "var(--text3)" }}>Click a flag card to see it here.</p>
              )}
            </GlassCard>
            {data.contractText && (
              <GlassCard>
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 10 }}>
                  Document view
                </div>
                <div style={{ maxHeight: 320, overflowY: "auto", fontSize: 11.5, color: "var(--text2)", lineHeight: 1.7, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                  <HighlightedContract text={data.contractText} flags={data.flags} />
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* NEGOTIATION COPILOT */}
        <GlassCard style={{ padding: "1.5rem", marginTop: "1.25rem", borderColor: "var(--glass-border2)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
              <i className="ti ti-message-share" style={{ color: "var(--violet2)", fontSize: 16 }} />
              Negotiation Copilot
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["Friendly", "Firm", "Professional"] as Tone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => changeTone(t)}
                  style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                    border: `0.5px solid ${tone === t ? "var(--glass-border2)" : "var(--glass-border)"}`,
                    background: tone === t ? "rgba(124,110,240,0.15)" : "var(--glass2)",
                    color: tone === t ? "var(--violet2)" : "var(--text2)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.25)", border: "0.5px solid var(--glass-border)", borderRadius: 10, padding: "1rem 1.25rem", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(124,110,240,0.15)", color: "var(--violet2)", border: "0.5px solid rgba(124,110,240,0.35)", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
                <i className="ti ti-robot" /> AI-generated draft
              </span>
              <CopyButton text={negMsg} />
            </div>
            <pre style={{ fontSize: "13.5px", color: "var(--text2)", lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{negMsg}</pre>
          </div>
        </GlassCard>

        {/* RECOMMENDED ACTIONS */}
        {data.recommendedActions && data.recommendedActions.length > 0 && (
          <GlassCard style={{ marginTop: "1.25rem" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ti ti-list-check" style={{ color: "var(--violet2)" }} /> Recommended Actions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.recommendedActions.map((action, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--text2)", lineHeight: 1.55 }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(124,110,240,0.15)", color: "var(--violet2)", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                  {action}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* NEXUS AI ADVISOR */}
        <NexusAdvisor analysisResult={data} />
      </div>
    </AppShell>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 6 }}>{label}</p>
      {children}
    </div>
  );
}

function HighlightedContract({ text, flags }: { text: string; flags: Flag[] }) {
  // Simple highlight: wrap any substring matching a flagged clause snippet
  let html = text;
  const escaped = html.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] || c));
  let result = escaped;
  for (const flag of flags) {
    if (flag.severity === "green") continue;
    const snippet = flag.clause.replace(/^…/, "").replace(/…$/, "").trim();
    if (snippet.length < 10) continue;
    const escapedSnippet = snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 80);
    try {
      const re = new RegExp(escapedSnippet.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] || c)), "i");
      const color = flag.severity === "red" ? "rgba(240,107,107,0.25)" : "rgba(245,166,35,0.25)";
      result = result.replace(re, (m) => `<mark style="background:${color};color:inherit;border-radius:2px;padding:0 2px;">${m}</mark>`);
    } catch {
      // skip invalid regex
    }
  }
  return <div dangerouslySetInnerHTML={{ __html: result }} />;
}
