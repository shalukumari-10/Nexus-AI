"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { PageHeader, GlassCard, Badge } from "@/components/ui";
import { LAWYERS } from "@/lib/mock-data";

export default function LegalHelpPage() {
  const [specialization, setSpecialization] = useState("all");
  const [location, setLocation] = useState("all");
  const [language, setLanguage] = useState("all");
  const [budget, setBudget] = useState("all");

  const specializations = useMemo(() => ["all", ...Array.from(new Set(LAWYERS.map((l) => l.specialization)))], []);
  const locations = useMemo(() => ["all", ...Array.from(new Set(LAWYERS.map((l) => l.location)))], []);
  const languages = useMemo(() => ["all", ...Array.from(new Set(LAWYERS.flatMap((l) => l.languages)))], []);

  function feeValue(fee: string): number {
    const match = fee.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, ""), 10) : 0;
  }

  const filtered = LAWYERS.filter((l) => {
    const matchSpec = specialization === "all" || l.specialization === specialization;
    const matchLoc = location === "all" || l.location === location;
    const matchLang = language === "all" || l.languages.includes(language);
    const matchBudget =
      budget === "all" ||
      (budget === "under-80" && feeValue(l.fee) < 80) ||
      (budget === "80-120" && feeValue(l.fee) >= 80 && feeValue(l.fee) <= 120) ||
      (budget === "over-120" && feeValue(l.fee) > 120);
    return matchSpec && matchLoc && matchLang && matchBudget;
  });

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
        <PageHeader title="Legal Help Marketplace" subtitle="Connect with lawyers and legal consultants who specialize in creator and influencer contracts." />

        <GlassCard style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <FilterSelect label="Specialization" value={specialization} onChange={setSpecialization} options={specializations} />
            <FilterSelect label="Location" value={location} onChange={setLocation} options={locations} />
            <FilterSelect label="Language" value={language} onChange={setLanguage} options={languages} />
            <FilterSelect
              label="Budget"
              value={budget}
              onChange={setBudget}
              options={["all", "under-80", "80-120", "over-120"]}
              labels={{ all: "All budgets", "under-80": "Under $80", "80-120": "$80–$120", "over-120": "Over $120" }}
            />
          </div>
        </GlassCard>

        <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 12 }}>{filtered.length} legal professional{filtered.length !== 1 ? "s" : ""} found</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map((lawyer) => (
            <GlassCard key={lawyer.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text)" }}>{lawyer.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--violet2)" }}>{lawyer.specialization}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: "var(--amber)" }}>
                  <i className="ti ti-star-filled" style={{ fontSize: 13 }} /> {lawyer.rating}
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.55, marginBottom: 12 }}>{lawyer.bio}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14, fontSize: 12.5, color: "var(--text2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><i className="ti ti-map-pin" style={{ color: "var(--text3)", fontSize: 14 }} /> {lawyer.location}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><i className="ti ti-language" style={{ color: "var(--text3)", fontSize: 14 }} /> {lawyer.languages.join(", ")}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><i className="ti ti-currency-dollar" style={{ color: "var(--text3)", fontSize: 14 }} /> {lawyer.fee}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => window.open(`mailto:${lawyer.email}`, "_blank")}
                  style={{ flex: 1, background: "linear-gradient(135deg, var(--violet), var(--blue))", color: "#fff", border: "none", padding: "9px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}
                >
                  Book consultation
                </button>
              </div>
            </GlassCard>
          ))}
        </div>

        {filtered.length === 0 && (
          <GlassCard style={{ textAlign: "center", padding: "2.5rem" }}>
            <i className="ti ti-search-off" style={{ fontSize: 28, color: "var(--text3)", display: "block", marginBottom: 10 }} />
            <p style={{ color: "var(--text2)", fontSize: 14 }}>No lawyers match your filters. Try adjusting them.</p>
          </GlassCard>
        )}

        <p style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", marginTop: "1.5rem", lineHeight: 1.55 }}>
          ContractGuard may earn a commission from successful legal consultations booked through this marketplace.
        </p>
      </div>
    </AppShell>
  );
}

function FilterSelect({ label, value, onChange, options, labels }: { label: string; value: string; onChange: (v: string) => void; options: string[]; labels?: Record<string, string> }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", background: "rgba(0,0,0,0.25)", border: "0.5px solid var(--glass-border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "var(--text)", outline: "none", cursor: "pointer" }}>
        {options.map((o) => <option key={o} value={o}>{labels?.[o] || (o === "all" ? "All" : o)}</option>)}
      </select>
    </div>
  );
}
