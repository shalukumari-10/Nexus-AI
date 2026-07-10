import Link from "next/link";
import Navbar from "@/components/Navbar";

const PROBLEM_CARDS = [
  { icon: "ti-infinity", color: "red", title: "Unlimited Usage Rights", desc: "Perpetual, worldwide licenses let brands reuse your content forever — without paying you again." },
  { icon: "ti-eye-off", color: "amber", title: "Dark Posting Rights", desc: "Brands run your content as paid ads that never appear on your own feed, often unpaid." },
  { icon: "ti-clock-x", color: "violet", title: "No Kill Fee", desc: "If the brand cancels mid-campaign, you can be left with zero compensation for work already done." },
  { icon: "ti-lock", color: "emerald", title: "Broad Exclusivity", desc: "Long, vague exclusivity windows can block you from other deals in your niche for months." },
];

const PRICING = [
  { name: "Free", price: "$0", desc: "For creators just starting to vet brand deals.", features: ["3 contract scans / month", "Core risk flagging", "Basic negotiation copilot"], cta: "Start free" },
  { name: "Creator Pro", price: "$19/mo", desc: "For full-time creators closing deals regularly.", features: ["Unlimited scans", "Financial impact estimator", "AI clause rewrite", "Full negotiation toolkit"], cta: "Go Pro", highlight: true },
  { name: "Agency", price: "Custom", desc: "For talent agencies managing multiple creators.", features: ["Team seats", "Brand risk leaderboard", "Priority legal marketplace access", "Dedicated support"], cta: "Talk to us" },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />

      {/* HERO */}
      <div style={{ padding: "5rem 2rem 4rem", maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
        <div>
          <p className="section-label">AI Creator Contract Defense</p>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 500, lineHeight: 1.18, letterSpacing: "-0.02em", marginBottom: "1.25rem", color: "var(--text)" }}>
            Don&apos;t let a contract <span className="gradient-text">steal your influence.</span>
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--text2)", lineHeight: 1.75, marginBottom: "2rem" }}>
            ContractGuard uses AI to detect exploitative brand-deal clauses before creators sign — and writes the counter-language they can send back.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/scanner?sample=1" className="btn-primary">
              <i className="ti ti-sparkles" /> Analyze a contract
            </Link>
            <Link href="/scanner" className="btn-secondary">
              <i className="ti ti-player-play" /> Watch demo
            </Link>
          </div>
        </div>

        {/* Hero visual — fake contract preview */}
        <div className="glass-card" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "var(--violet-glow)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(240,107,107,0.18)", color: "#F99", border: "0.5px solid rgba(240,107,107,0.4)", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
              <span className="pulse-ring" /> Live AI Audit
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--coral)" }}>82/100</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.3)", border: "0.5px solid var(--glass-border)", borderRadius: 10, padding: "1rem", marginBottom: "1rem", fontFamily: "monospace", fontSize: 12, color: "var(--text3)", lineHeight: 1.8 }}>
            <div style={{ color: "var(--text2)" }}>BRAND COLLABORATION AGREEMENT</div>
            <div>2. USAGE RIGHTS — <span style={{ background: "rgba(240,107,107,0.25)", color: "#F99", padding: "1px 4px", borderRadius: 3 }}>perpetual, irrevocable, worldwide</span></div>
            <div>3. COMPENSATION — <span style={{ background: "rgba(245,166,35,0.25)", color: "#FFD080", padding: "1px 4px", borderRadius: 3 }}>Net-90 payment</span></div>
            <div>5. KILL FEE — <span style={{ background: "rgba(240,107,107,0.25)", color: "#F99", padding: "1px 4px", borderRadius: 3 }}>none specified</span></div>
            <div>4. EXCLUSIVITY — <span style={{ background: "rgba(245,166,35,0.25)", color: "#FFD080", padding: "1px 4px", borderRadius: 3 }}>12-month category lock</span></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Perpetual usage rights", sev: "Red" },
              { label: "Net-90 payment terms", sev: "Yellow" },
              { label: "Kill fee absent", sev: "Red" },
              { label: "12-month exclusivity", sev: "Yellow" },
            ].map((f, i) => (
              <div key={i} className={`animate-fadeslide-${Math.min(i, 3)}`} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--glass)", border: "0.5px solid var(--glass-border)", borderRadius: 8, padding: "8px 12px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: f.sev === "Red" ? "var(--coral)" : "var(--amber)", flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: "var(--text)", flex: 1 }}>{f.label}</span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, fontWeight: 500, background: f.sev === "Red" ? "rgba(240,107,107,0.2)" : "rgba(245,166,35,0.2)", color: f.sev === "Red" ? "#F99" : "#FFD080" }}>
                  {f.sev}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: "0.5px", background: "var(--glass-border)", maxWidth: 1100, margin: "0 auto" }} />

      {/* PROBLEM CARDS */}
      <div style={{ padding: "3rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <p className="section-label">The problem</p>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 500, letterSpacing: "-0.02em", marginBottom: "2rem", color: "var(--text)" }}>
          Brands have legal teams. Creators usually don&apos;t.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {PROBLEM_CARDS.map((card) => {
            const colorMap: Record<string, string> = { red: "var(--coral)", amber: "var(--amber)", violet: "var(--violet2)", emerald: "var(--emerald)" };
            const bgMap: Record<string, string> = { red: "rgba(240,107,107,0.15)", amber: "rgba(245,166,35,0.12)", violet: "rgba(124,110,240,0.15)", emerald: "rgba(52,211,153,0.12)" };
            return (
              <div key={card.title} className="glass-card" style={{ padding: "1.25rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: bgMap[card.color], display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                  <i className={`ti ${card.icon}`} style={{ color: colorMap[card.color], fontSize: 18 }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, color: "var(--text)" }}>{card.title}</div>
                <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.55 }}>{card.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ height: "0.5px", background: "var(--glass-border)", maxWidth: 1100, margin: "0 auto" }} />

      {/* RISK SCORE EXPLAINER */}
      <div style={{ padding: "3rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <p className="section-label">How scoring works</p>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 500, letterSpacing: "-0.02em", marginBottom: "2rem", color: "var(--text)" }}>
          Every contract gets a 0–100 risk score.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {[
            { range: "0–30", label: "Safe", color: "var(--emerald)", bg: "rgba(52,211,153,0.1)", desc: "Fair, balanced terms. Minor or no negotiation needed." },
            { range: "31–60", label: "Caution", color: "var(--amber)", bg: "rgba(245,166,35,0.12)", desc: "A handful of clauses favor the brand. Worth a counter-offer." },
            { range: "61–100", label: "Dangerous", color: "var(--coral)", bg: "rgba(240,107,107,0.15)", desc: "Significantly one-sided. Strong pushback recommended before signing." },
          ].map((tier) => (
            <div key={tier.label} className="glass-card" style={{ padding: "1.5rem", borderLeft: `3px solid ${tier.color}` }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 500, color: tier.color, marginBottom: 4 }}>{tier.range}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 6 }}>{tier.label}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.55 }}>{tier.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: "0.5px", background: "var(--glass-border)", maxWidth: 1100, margin: "0 auto" }} />

      {/* PRICING */}
      <div style={{ padding: "3rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <p className="section-label">Pricing</p>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 500, letterSpacing: "-0.02em", marginBottom: "2rem", color: "var(--text)" }}>
          Start free. Upgrade when deals get bigger.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {PRICING.map((tier) => (
            <div
              key={tier.name}
              className="glass-card"
              style={{
                padding: "1.5rem",
                borderColor: tier.highlight ? "rgba(124,110,240,0.45)" : "var(--glass-border)",
                background: tier.highlight ? "rgba(124,110,240,0.06)" : "var(--glass)",
                position: "relative",
              }}
            >
              {tier.highlight && (
                <span style={{ position: "absolute", top: -10, right: 16, background: "linear-gradient(135deg, var(--violet), var(--blue))", color: "#fff", fontSize: 10, fontWeight: 500, padding: "3px 10px", borderRadius: 12 }}>
                  Most popular
                </span>
              )}
              <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>{tier.name}</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>{tier.price}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: "1.25rem", lineHeight: 1.5 }}>{tier.desc}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.5rem" }}>
                {tier.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text2)" }}>
                    <i className="ti ti-check" style={{ color: "var(--emerald)", fontSize: 14 }} /> {f}
                  </div>
                ))}
              </div>
              <Link href="/scanner" className={tier.highlight ? "btn-primary" : "btn-secondary"} style={{ width: "100%", justifyContent: "center" }}>
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "1rem 2rem 4rem", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <Link href="/scanner" className="btn-primary" style={{ fontSize: 15, padding: "13px 28px" }}>
          <i className="ti ti-shield-check" /> Scan your first contract free
        </Link>
      </div>

      <footer style={{ borderTop: "0.5px solid var(--glass-border)", padding: "1.5rem 2rem", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.6, maxWidth: 600, margin: "0 auto" }}>
          ContractGuard does not provide legal advice. It helps creators identify common negotiation points
          and understand contract risks. Always consult a qualified attorney before signing.
        </p>
      </footer>
    </div>
  );
}
