"use client";
import React from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: "1.75rem", flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 5, color: "var(--text)" }}>
          {title}
        </h1>
        {subtitle && <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, maxWidth: 560 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="glass-card" style={{ padding: "1.25rem", ...style }}>{children}</div>;
}

export function StatCard({
  icon, label, value, color = "violet", sub,
}: { icon: string; label: string; value: string | number; color?: "red" | "amber" | "violet" | "emerald"; sub?: string }) {
  const colorMap: Record<string, { c: string; bg: string }> = {
    red: { c: "var(--coral)", bg: "rgba(240,107,107,0.15)" },
    amber: { c: "var(--amber)", bg: "rgba(245,166,35,0.12)" },
    violet: { c: "var(--violet2)", bg: "rgba(124,110,240,0.15)" },
    emerald: { c: "var(--emerald)", bg: "rgba(52,211,153,0.12)" },
  };
  const cc = colorMap[color];
  return (
    <GlassCard>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: cc.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <i className={`ti ${icon}`} style={{ color: cc.c, fontSize: 17 }} />
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 500, letterSpacing: "-0.02em", color: cc.c, marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>{sub}</div>}
    </GlassCard>
  );
}

export function Badge({ children, color = "violet" }: { children: React.ReactNode; color?: "red" | "amber" | "violet" | "emerald" | "neutral" }) {
  const map: Record<string, { bg: string; c: string; b: string }> = {
    red: { bg: "rgba(240,107,107,0.18)", c: "#F99", b: "rgba(240,107,107,0.4)" },
    amber: { bg: "rgba(245,166,35,0.15)", c: "#FFD080", b: "rgba(245,166,35,0.35)" },
    violet: { bg: "rgba(124,110,240,0.18)", c: "var(--violet2)", b: "rgba(124,110,240,0.35)" },
    emerald: { bg: "rgba(52,211,153,0.1)", c: "var(--emerald)", b: "rgba(52,211,153,0.3)" },
    neutral: { bg: "var(--glass2)", c: "var(--text2)", b: "var(--glass-border2)" },
  };
  const s = map[color];
  return (
    <span style={{ background: s.bg, color: s.c, border: `0.5px solid ${s.b}`, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}>
      {children}
    </span>
  );
}

export function PrimaryButton({ children, onClick, disabled, style, type = "button" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "linear-gradient(135deg, var(--violet), var(--blue))",
        color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8,
        fontSize: 13.5, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
        opacity: disabled ? 0.5 : 1, transition: "opacity 0.15s", ...style,
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "var(--glass2)", color: "var(--text)", border: "0.5px solid var(--glass-border2)",
        padding: "10px 20px", borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
        transition: "background 0.15s", ...style,
      }}
    >
      {children}
    </button>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {});
      }}
      style={{
        background: "rgba(52,211,153,0.15)", border: "0.5px solid rgba(52,211,153,0.35)",
        borderRadius: 6, padding: "5px 12px", fontSize: 11.5, color: "var(--emerald)",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
      }}
    >
      <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
      {copied ? "Copied!" : label}
    </button>
  );
}

export function EmptyState({ icon = "ti-mood-empty", title, subtitle, action }: { icon?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text3)" }}>
      <i className={`ti ${icon}`} style={{ fontSize: 32, display: "block", marginBottom: 10, color: "var(--text3)" }} />
      <p style={{ fontSize: 14.5, color: "var(--text2)", marginBottom: 6 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13, marginBottom: 14 }}>{subtitle}</p>}
      {action}
    </div>
  );
}
