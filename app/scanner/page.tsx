"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { PageHeader, GlassCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { SAMPLE_CONTRACT, SAMPLE_CONTRACT_NAME, SAMPLE_BRAND_NAME } from "@/lib/sample";
import { getProfile, saveLastResult, addHistoryEntry } from "@/lib/storage";
import { AnalysisResult, HistoryEntry } from "@/lib/types";

const CHECK_ITEMS = [
  "Usage Rights Analysis",
  "Payment Terms Review",
  "Exclusivity Detection",
  "Whitelisting / Dark Posting",
  "Termination Clause Review",
  "Kill Fee Verification",
  "Revision Rounds Check",
];

const STATUSES = [
  "Sending to AI scanner…",
  "Reading clause by clause…",
  "Flagging risky language…",
  "Building counter-language…",
  "Assembling your report…",
];

type CheckState = "idle" | "scanning" | "done";

function ScannerInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [text, setText] = useState("");
  const [contractName, setContractName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checks, setChecks] = useState<CheckState[]>(Array(7).fill("idle"));
  const [statusMsg, setStatusMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const ckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (params.get("sample") === "1") {
      setText(SAMPLE_CONTRACT);
      setContractName(SAMPLE_CONTRACT_NAME);
      setBrandName(SAMPLE_BRAND_NAME);
    }
  }, [params]);

  function animateChecklist() {
    setChecks(Array(7).fill("idle"));
    let idx = 0;
    const advance = () => {
      setChecks((prev) => {
        const next = [...prev];
        if (idx > 0) next[idx - 1] = "done";
        if (idx < 7) next[idx] = "scanning";
        return next;
      });
      idx++;
      if (idx <= 7) ckTimer.current = setTimeout(advance, 480);
    };
    advance();
  }

  function finishChecklist() {
    if (ckTimer.current) clearTimeout(ckTimer.current);
    setChecks(Array(7).fill("done"));
  }

  function loadSample() {
    setText(SAMPLE_CONTRACT);
    setContractName(SAMPLE_CONTRACT_NAME);
    setBrandName(SAMPLE_BRAND_NAME);
    setError("");
  }

  async function handleAnalyze() {
    setError("");
    const trimmed = text.trim();
    if (!trimmed) { setError("Please paste contract text or upload a PDF first."); return; }
    if (trimmed.length < 50) { setError("Too short — paste more of the contract for a meaningful analysis (minimum 50 characters)."); return; }

    setLoading(true);
    animateChecklist();
    let sIdx = 0;
    setStatusMsg(STATUSES[0]);
    statusTimer.current = setInterval(() => {
      sIdx++;
      if (sIdx < STATUSES.length) setStatusMsg(STATUSES[sIdx]);
    }, 1800);

    try {
      const profile = getProfile();
      const res = await fetch("/api/analyze-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractText: trimmed,
          creatorProfile: profile
            ? {
                name: profile.name,
                category: profile.category,
                platforms: profile.platforms,
                followers: profile.followers,
                location: profile.location,
              }
            : undefined,
        }),
      });
      const data: AnalysisResult | { error: string } = await res.json();
      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Analysis failed.");
      }

      finishChecklist();

      const finalContractName = contractName.trim() || "Untitled Contract";
      const finalBrandName = brandName.trim() || "Unknown Brand";
      const enriched: AnalysisResult = {
        ...data,
        contractName: finalContractName,
        brandName: finalBrandName,
        scannedAt: new Date().toISOString(),
        contractText: trimmed,
      };

      saveLastResult(enriched);

      const entry: HistoryEntry = {
        id: `scan-${Date.now()}`,
        contractName: finalContractName,
        brandName: finalBrandName,
        date: new Date().toISOString().slice(0, 10),
        type: "Brand Collaboration",
        riskScore: data.riskScore,
        riskLevel: data.overallRiskLevel,
        status: "Reviewed",
        result: enriched,
      };
      addHistoryEntry(entry);

      router.push("/results");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
      if (statusTimer.current) clearInterval(statusTimer.current);
    }
  }

  function handleFile() {
    setError("PDF upload coming soon — please paste the contract text below for now.");
  }

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: 1000, margin: "0 auto" }}>
        <PageHeader
          title="AI Scanner Workspace"
          subtitle="Paste your contract or campaign brief. The AI reads every clause and flags risks across 12+ categories."
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Metadata row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <GlassCard>
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 8 }}>
                  Contract name
                </div>
                <input
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  placeholder="e.g. Summer Skincare Campaign"
                  style={inputStyle}
                />
              </GlassCard>
              <GlassCard>
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 8 }}>
                  Brand name
                </div>
                <input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Luxe Cosmetics Inc."
                  style={inputStyle}
                />
              </GlassCard>
            </div>

            {/* Upload */}
            <GlassCard>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <i className="ti ti-file-upload" /> Upload PDF
              </div>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ border: "1.5px dashed rgba(255,255,255,0.12)", borderRadius: 10, padding: "1.1rem", textAlign: "center", cursor: "pointer" }}
              >
                <i className="ti ti-file-upload" style={{ fontSize: 24, color: "var(--text3)", display: "block", marginBottom: 6 }} />
                <p style={{ fontSize: 13, color: "var(--text2)" }}>
                  <span style={{ color: "var(--violet2)" }}>Choose a PDF</span>
                </p>
                <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>PDF upload coming soon — paste text below for now</p>
              </div>
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handleFile} />
            </GlassCard>

            {/* Text */}
            <GlassCard>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <i className="ti ti-text-size" /> Contract text
              </div>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setError(""); }}
                placeholder={"Paste the full contract or campaign brief here…\n\nFor best results, include the complete document."}
                style={{
                  width: "100%", minHeight: 220, padding: "1rem",
                  fontSize: "13.5px", fontFamily: "inherit",
                  color: "var(--text)", background: "rgba(0,0,0,0.25)",
                  border: "0.5px solid var(--glass-border)", borderRadius: 10,
                  resize: "vertical", lineHeight: 1.65, outline: "none",
                }}
              />
              <div style={{ textAlign: "right", marginTop: 6, fontSize: 11, color: "var(--text3)" }}>
                {text.length.toLocaleString()} characters
                {text.length > 0 && text.length < 50 && <span style={{ color: "var(--amber)" }}> — minimum 50</span>}
              </div>
            </GlassCard>

            {error && (
              <div style={{ background: "rgba(240,107,107,0.12)", border: "0.5px solid rgba(240,107,107,0.35)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#F99", display: "flex", gap: 8 }}>
                <i className="ti ti-alert-circle" style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }} />
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <SecondaryButton onClick={loadSample} style={{ whiteSpace: "nowrap" }}>
                <i className="ti ti-file-text" /> Use sample contract
              </SecondaryButton>
              <PrimaryButton onClick={handleAnalyze} disabled={loading} style={{ flex: 1 }}>
                {loading ? (<><span className="spinner" /> Analyzing…</>) : (<><i className="ti ti-sparkles" /> Analyze contract</>)}
              </PrimaryButton>
            </div>

            {loading && (
              <>
                <div style={{ height: 2, background: "var(--glass-border)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg, var(--violet), var(--blue))", borderRadius: 2, animation: "progflow 4s ease-in-out forwards" }} />
                </div>
                <p style={{ fontSize: 12, color: "var(--text3)", textAlign: "center" }}>{statusMsg}</p>
              </>
            )}

            <p style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", lineHeight: 1.55 }}>
              Not legal advice. AI-powered tool to help creators identify negotiation points.
            </p>
          </div>

          {/* RIGHT — Checklist */}
          <div>
            <GlassCard>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: "1rem", color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="ti ti-cpu" style={{ color: "var(--violet2)", fontSize: 15 }} />
                AI Analysis Checklist
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {CHECK_ITEMS.map((item, i) => {
                  const state = checks[i];
                  return (
                    <div
                      key={item}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 8, fontSize: 13,
                        border: `0.5px solid ${state === "done" ? "rgba(52,211,153,0.25)" : state === "scanning" ? "rgba(124,110,240,0.3)" : "var(--glass-border)"}`,
                        background: state === "done" ? "rgba(52,211,153,0.08)" : state === "scanning" ? "rgba(124,110,240,0.08)" : "rgba(0,0,0,0.2)",
                        color: state === "done" ? "var(--text)" : state === "scanning" ? "var(--violet2)" : "var(--text2)",
                        animation: state === "scanning" ? "checkpulse 1.5s ease-in-out infinite" : "none",
                        transition: "all 0.3s",
                      }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, background: state === "done" ? "rgba(52,211,153,0.2)" : state === "scanning" ? "rgba(124,110,240,0.2)" : "var(--glass2)", color: state === "done" ? "var(--emerald)" : state === "scanning" ? "var(--violet2)" : "var(--text3)" }}>
                        <i className={`ti ${state === "done" ? "ti-check" : state === "scanning" ? "ti-loader" : "ti-circle"}`} />
                      </div>
                      {item}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(0,0,0,0.25)", border: "0.5px solid var(--glass-border)",
  borderRadius: 8, padding: "9px 12px", fontSize: 13.5, color: "var(--text)", outline: "none",
};

export default function ScannerPage() {
  return (
    <Suspense fallback={null}>
      <ScannerInner />
    </Suspense>
  );
}
