"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { PageHeader, GlassCard, PrimaryButton, CopyButton } from "@/components/ui";

const CATEGORIES = [
  "Unlimited Usage Rights", "Paid Ad Usage / Whitelisting", "Vague Payment Terms", "Missing Kill Fee",
  "Broad Exclusivity", "Unlimited Revisions", "Vague Termination Clause", "Content Ownership",
];
const TONES = ["Friendly", "Firm", "Professional"] as const;

interface ToolkitResult {
  whatsapp: string;
  email: string;
  firm: string;
  source?: string;
}

export default function NegotiationToolkitPage() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tone, setTone] = useState<(typeof TONES)[number]>("Professional");
  const [dealValue, setDealValue] = useState("");
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolkitResult | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/negotiation-toolkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, tone, dealValue, brandName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate messages.");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
        <PageHeader title="Negotiation Toolkit" subtitle="Generate a ready-to-send message for any risky clause, in the tone that fits you." />

        <GlassCard style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <Field label="Clause category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Desired tone">
              <div style={{ display: "flex", gap: 6 }}>
                {TONES.map((t) => (
                  <button key={t} onClick={() => setTone(t)} style={{
                    padding: "8px 14px", borderRadius: 8, fontSize: 12.5, cursor: "pointer", flex: 1,
                    border: `0.5px solid ${tone === t ? "rgba(124,110,240,0.45)" : "var(--glass-border)"}`,
                    background: tone === t ? "rgba(124,110,240,0.15)" : "var(--glass2)",
                    color: tone === t ? "var(--violet2)" : "var(--text2)",
                  }}>{t}</button>
                ))}
              </div>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <Field label="Deal value (optional)">
              <input value={dealValue} onChange={(e) => setDealValue(e.target.value)} placeholder="e.g. $3,000" style={inputStyle} />
            </Field>
            <Field label="Brand name (optional)">
              <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Luxe Cosmetics" style={inputStyle} />
            </Field>
          </div>
          <PrimaryButton onClick={generate} disabled={loading}>
            {loading ? (<><span className="spinner" /> Generating…</>) : (<><i className="ti ti-sparkles" /> Generate messages</>)}
          </PrimaryButton>
          {error && <p style={{ color: "#F99", fontSize: 13, marginTop: 10 }}>{error}</p>}
        </GlassCard>

        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <MessageCard icon="ti-brand-whatsapp" label="WhatsApp-style reply" text={result.whatsapp} color="emerald" />
            <MessageCard icon="ti-mail" label="Professional email reply" text={result.email} color="violet" />
            <MessageCard icon="ti-shield" label="Firm negotiation reply" text={result.firm} color="amber" />
          </div>
        )}
      </div>
    </AppShell>
  );
}

function MessageCard({ icon, label, text, color }: { icon: string; label: string; text: string; color: "emerald" | "violet" | "amber" }) {
  const colorMap = { emerald: "var(--emerald)", violet: "var(--violet2)", amber: "var(--amber)" };
  return (
    <GlassCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
          <i className={`ti ${icon}`} style={{ color: colorMap[color] }} /> {label}
        </div>
        <CopyButton text={text} />
      </div>
      <pre style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{text}</pre>
    </GlassCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(0,0,0,0.25)", border: "0.5px solid var(--glass-border)",
  borderRadius: 8, padding: "9px 12px", fontSize: 13.5, color: "var(--text)", outline: "none",
};
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };
