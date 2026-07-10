"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { PageHeader, GlassCard, PrimaryButton } from "@/components/ui";
import { getProfile, saveProfile } from "@/lib/storage";
import { CreatorProfile } from "@/lib/types";

const CATEGORIES = ["Beauty", "Fashion", "Fitness", "Gaming", "Tech", "Education", "Finance", "Lifestyle", "Food", "Travel"];
const PLATFORMS = ["Instagram", "YouTube", "TikTok", "LinkedIn", "X"];
const FOLLOWER_RANGES = ["< 10K", "10K–50K", "50K–200K", "200K–1M", "1M+"];
const TONES: CreatorProfile["negotiationTone"][] = ["Friendly", "Firm", "Professional"];

const EMPTY: CreatorProfile = {
  name: "",
  category: "",
  platforms: [],
  followers: "",
  location: "",
  avgDealValue: "",
  negotiationTone: "Professional",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<CreatorProfile>(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getProfile();
    if (existing) setProfile({ ...EMPTY, ...existing });
  }, []);

  function togglePlatform(p: string) {
    setProfile((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p) ? prev.platforms.filter((x) => x !== p) : [...prev.platforms, p],
    }));
    setSaved(false);
  }

  function handleSave() {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
        <PageHeader title="Creator Profile" subtitle="Used to tailor contract analysis and financial impact estimates to your situation." />

        <GlassCard style={{ padding: "1.75rem" }}>
          <Field label="Name">
            <input value={profile.name} onChange={(e) => { setProfile({ ...profile, name: e.target.value }); setSaved(false); }} placeholder="e.g. Jordan Lee" style={inputStyle} />
          </Field>

          <Field label="Creator category">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CATEGORIES.map((c) => (
                <Chip key={c} active={profile.category === c} onClick={() => { setProfile({ ...profile, category: c }); setSaved(false); }}>{c}</Chip>
              ))}
            </div>
          </Field>

          <Field label="Platforms">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PLATFORMS.map((p) => (
                <Chip key={p} active={profile.platforms.includes(p)} onClick={() => togglePlatform(p)}>{p}</Chip>
              ))}
            </div>
          </Field>

          <Field label="Followers range">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FOLLOWER_RANGES.map((f) => (
                <Chip key={f} active={profile.followers === f} onClick={() => { setProfile({ ...profile, followers: f }); setSaved(false); }}>{f}</Chip>
              ))}
            </div>
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Location">
              <input value={profile.location} onChange={(e) => { setProfile({ ...profile, location: e.target.value }); setSaved(false); }} placeholder="e.g. Mumbai, India" style={inputStyle} />
            </Field>
            <Field label="Average deal value">
              <input value={profile.avgDealValue} onChange={(e) => { setProfile({ ...profile, avgDealValue: e.target.value }); setSaved(false); }} placeholder="e.g. $2,000" style={inputStyle} />
            </Field>
          </div>

          <Field label="Preferred negotiation tone">
            <div style={{ display: "flex", gap: 8 }}>
              {TONES.map((t) => (
                <Chip key={t} active={profile.negotiationTone === t} onClick={() => { setProfile({ ...profile, negotiationTone: t }); setSaved(false); }}>{t}</Chip>
              ))}
            </div>
          </Field>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "1.5rem" }}>
            <PrimaryButton onClick={handleSave}>
              <i className="ti ti-device-floppy" /> Save profile
            </PrimaryButton>
            {saved && (
              <span style={{ fontSize: 13, color: "var(--emerald)", display: "flex", alignItems: "center", gap: 5 }}>
                <i className="ti ti-check" /> Saved to your browser
              </span>
            )}
          </div>
        </GlassCard>

        <p style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", marginTop: "1.5rem", lineHeight: 1.55 }}>
          Profile data is stored locally in your browser only — it's never sent anywhere except as context for contract analysis.
        </p>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px", borderRadius: 20, fontSize: 12.5, cursor: "pointer",
        border: `0.5px solid ${active ? "rgba(124,110,240,0.45)" : "var(--glass-border)"}`,
        background: active ? "rgba(124,110,240,0.18)" : "var(--glass2)",
        color: active ? "var(--violet2)" : "var(--text2)",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(0,0,0,0.25)", border: "0.5px solid var(--glass-border)",
  borderRadius: 8, padding: "10px 12px", fontSize: 13.5, color: "var(--text)", outline: "none",
};
