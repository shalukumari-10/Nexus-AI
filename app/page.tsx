"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// React hook for animated counters
function useCounter(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) return;
    const totalMiliseconds = duration;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 8);
    const step = end / (totalMiliseconds / incrementTime);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// Geometric logo component
const LogoMark = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
    <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#logo-grad)" strokeWidth="2.5" fill="rgba(79, 70, 229, 0.08)" />
    <circle cx="12" cy="12" r="4" fill="url(#logo-grad)" />
    <defs>
      <linearGradient id="logo-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#06B6D4" />
        <stop offset="0.5" stopColor="#4F46E5" />
        <stop offset="1" stopColor="#818CF8" />
      </linearGradient>
    </defs>
  </svg>
);

// SVG Trust network visualizer
const TrustNetworkVisual = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: 450, margin: "0 auto", display: "block" }}>
    {/* Connection Lines */}
    <line x1="200" y1="200" x2="100" y2="100" stroke="url(#line-grad-1)" strokeWidth="1.5" strokeDasharray="4,4" className="draw-line-anim" />
    <line x1="200" y1="200" x2="300" y2="100" stroke="url(#line-grad-2)" strokeWidth="1.5" strokeDasharray="4,4" className="draw-line-anim" />
    <line x1="200" y1="200" x2="320" y2="280" stroke="url(#line-grad-3)" strokeWidth="1.5" strokeDasharray="4,4" className="draw-line-anim" />
    <line x1="200" y1="200" x2="80" y2="280" stroke="url(#line-grad-4)" strokeWidth="1.5" strokeDasharray="4,4" className="draw-line-anim" />

    {/* Nodes */}
    <circle cx="200" cy="200" r="42" fill="rgba(15, 23, 42, 0.9)" stroke="url(#violet-cyan)" strokeWidth="2" />
    <circle cx="100" cy="100" r="28" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <circle cx="300" cy="100" r="28" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <circle cx="320" cy="280" r="28" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <circle cx="80" cy="280" r="28" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

    {/* Labels */}
    <text x="200" y="204" textAnchor="middle" fill="#F8FAFC" fontSize="10" fontWeight="700" fontFamily="system-ui">NEXUS AI</text>
    <text x="100" y="103" textAnchor="middle" fill="#CBD5E1" fontSize="9" fontWeight="500" fontFamily="system-ui">AGREEMENT</text>
    <text x="300" y="103" textAnchor="middle" fill="#CBD5E1" fontSize="9" fontWeight="500" fontFamily="system-ui">LIABILITY</text>
    <text x="320" y="283" textAnchor="middle" fill="#CBD5E1" fontSize="9" fontWeight="500" fontFamily="system-ui">PARTNERS</text>
    <text x="80" y="283" textAnchor="middle" fill="#CBD5E1" fontSize="9" fontWeight="500" fontFamily="system-ui">STRATEGY</text>

    {defs}
  </svg>
);

const defs = (
  <defs>
    <linearGradient id="violet-cyan" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
      <stop stopColor="#06B6D4" />
      <stop offset="0.5" stopColor="#4F46E5" />
      <stop offset="1" stopColor="#818CF8" />
    </linearGradient>
    <linearGradient id="line-grad-1" x1="200" y1="200" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop stopColor="#4F46E5" stopOpacity="0.8" />
      <stop offset="1" stopColor="#06B6D4" stopOpacity="0.2" />
    </linearGradient>
    <linearGradient id="line-grad-2" x1="200" y1="200" x2="300" y2="100" gradientUnits="userSpaceOnUse">
      <stop stopColor="#4F46E5" stopOpacity="0.8" />
      <stop offset="1" stopColor="#818CF8" stopOpacity="0.2" />
    </linearGradient>
    <linearGradient id="line-grad-3" x1="200" y1="200" x2="320" y2="280" gradientUnits="userSpaceOnUse">
      <stop stopColor="#4F46E5" stopOpacity="0.8" />
      <stop offset="1" stopColor="#818CF8" stopOpacity="0.2" />
    </linearGradient>
    <linearGradient id="line-grad-4" x1="200" y1="200" x2="80" y2="280" gradientUnits="userSpaceOnUse">
      <stop stopColor="#4F46E5" stopOpacity="0.8" />
      <stop offset="1" stopColor="#06B6D4" stopOpacity="0.2" />
    </linearGradient>
  </defs>
);

const PROBLEM_CARDS = [
  { icon: "ti-file-analytics", color: "red", title: "Business Agreement Intelligence", desc: "Decode complex legal terms, liability exposure, and operational obligations in seconds into clear, actionable business items." },
  { icon: "ti-shield-alert", color: "amber", title: "AI Risk Detection", desc: "Automatically identify hidden hazards such as unfavorable payment schedules, licensing scope overreach, and excessive vendor liability." },
  { icon: "ti-building-store", color: "violet", title: "Client Intelligence", desc: "Access aggregated, anonymized insights regarding client negotiation histories, risk trends, and payment reliability ratings." },
  { icon: "ti-message-dots", color: "emerald", title: "AI Communication & Strategy", desc: "Instantly draft professional negotiation emails and strategic firm responses tailored to secure fairer contract terms." },
];

const PRICING = [
  { name: "Free", price: "$0", desc: "For startups and professionals vetting incoming contracts.", features: ["3 agreement scans / month", "Core risk flagging", "Basic negotiation suggestions"], cta: "Start free" },
  { name: "Business Pro", price: "$19/mo", desc: "For growing businesses and consultants closing commercial deals regularly.", features: ["Unlimited scans", "Financial impact estimator", "AI clause rewrite", "AI Communication Studio"], cta: "Go Pro", highlight: true },
  { name: "Enterprise", price: "Custom", desc: "For organizations managing multiple business units and vendor pools.", features: ["Team seats", "Client risk leaderboard", "Priority expert network access", "Dedicated compliance manager"], cta: "Talk to us" },
];

export default function HomePage() {
  const agreements = useCounter(142530, 2000);
  const protectedBiz = useCounter(18200, 2000);
  const clauses = useCounter(894110, 2000);
  const successRate = useCounter(95, 1200);

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <Navbar />

      <style jsx global>{`
        .mesh-glow-1 {
          position: absolute;
          top: -15%;
          left: -10%;
          width: 55%;
          height: 55%;
          background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%);
          animation: float-bg-1 14s infinite alternate ease-in-out;
          pointer-events: none;
        }
        .mesh-glow-2 {
          position: absolute;
          bottom: 10%;
          right: -10%;
          width: 65%;
          height: 65%;
          background: radial-gradient(circle, rgba(79,70,229,0.14) 0%, transparent 65%);
          animation: float-bg-2 18s infinite alternate ease-in-out;
          pointer-events: none;
        }
        .draw-line-anim {
          animation: draw-line 8s linear infinite;
        }
        .hero-layout {
          min-height: calc(100vh - 56px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4rem 2rem;
          position: relative;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 4rem;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
        }
        .trust-section {
          background: rgba(15, 23, 42, 0.35);
          border-top: 1px solid var(--glass-border);
          border-bottom: 1px solid var(--glass-border);
          padding: 2.5rem 2rem;
        }
        .trust-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          max-width: 1100px;
          margin: 4rem auto 0;
          width: 100%;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }
        .premium-card {
          position: relative;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%) !important;
          border: 1px solid var(--glass-border) !important;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .premium-card:hover {
          transform: translateY(-5px);
          border-color: rgba(6, 182, 212, 0.25) !important;
          box-shadow: 0 12px 30px rgba(6, 182, 212, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
        }
        @keyframes float-bg-1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, 40px) scale(1.1); }
        }
        @keyframes float-bg-2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-40px, -50px) scale(1.05); }
        }
        @keyframes draw-line {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
            text-align: center;
          }
          .hero-grid > :first-child {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .trust-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
            margin-top: 2.5rem;
          }
        }
        @media (max-width: 480px) {
          .trust-grid, .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Floating Animated Mesh Gradients */}
      <div className="mesh-glow-1" />
      <div className="mesh-glow-2" />

      {/* HERO HERO SECTION */}
      <div className="hero-layout">
        <div className="hero-grid">
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(79, 70, 229, 0.12)", border: "1px solid rgba(79, 70, 229, 0.3)", padding: "5px 12px", borderRadius: 30, marginBottom: "1.5rem" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#06B6D4" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#818CF8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Trusted Business Decisions</span>
            </div>
            
            <h1 style={{ display: "flex", alignItems: "center", fontSize: "2.8rem", fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: "1.25rem", color: "var(--text)" }} className="flex flex-wrap gap-2 items-center">
              <LogoMark /> 
              <span>Nexus AI</span>
            </h1>
            <p style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--violet2)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1rem" }}>
              AI-Powered Business Trust Intelligence Platform
            </p>
            <p style={{ fontSize: "1.05rem", color: "var(--text2)", lineHeight: 1.75, marginBottom: "2rem", maxWidth: 580 }}>
              Nexus AI helps organizations analyze agreements, detect hidden liabilities, protect recurring revenue, and generate smart negotiation strategies to build trusted partnerships. Engineered for startups, SMEs, enterprise teams, agencies, consultants, vendors, freelancers, and creators.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", zIndex: 10 }}>
              <Link href="/scanner?sample=1" className="btn-primary">
                <i className="ti ti-sparkles" /> Start Business Analysis
              </Link>
              <Link href="/scanner" className="btn-secondary">
                <i className="ti ti-player-play" /> Watch Demo
              </Link>
            </div>
          </div>

          <div>
            {/* Visual AI trust network diagram */}
            <TrustNetworkVisual />
          </div>
        </div>

        {/* Animated Metrics */}
        <div className="metrics-grid">
          {[
            { val: agreements.toLocaleString() + "+", label: "Agreements Analyzed" },
            { val: protectedBiz.toLocaleString() + "+", label: "Businesses Protected" },
            { val: clauses.toLocaleString() + "+", label: "Risk Clauses Identified" },
            { val: successRate + "%", label: "Negotiations Assisted" },
          ].map((m) => (
            <div key={m.label} style={{ background: "rgba(30,41,59,0.3)", border: "1px solid var(--glass-border)", padding: "1.25rem 1rem", borderRadius: 14, textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#F8FAFC", marginBottom: 3 }}>{m.val}</div>
              <div style={{ fontSize: 10.5, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TRUST SECTION */}
      <div className="trust-section">
        <div className="trust-grid">
          {[
            { icon: "ti-cpu", title: "AI Contract Intelligence", desc: "Automated analysis of complex operational obligations." },
            { icon: "ti-shield-alert", title: "Business Risk Detection", desc: "Exposes hidden liability and payment exposure." },
            { icon: "ti-building-store", title: "Client Trust Analysis", desc: "Aggregated, anonymous partner risk intelligence." },
            { icon: "ti-message-dots", title: "Smart Negotiation", desc: "AI strategies tailored for custom agreement terms." },
          ].map((t) => (
            <div key={t.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(79, 70, 229, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818CF8", flexShrink: 0 }}>
                <i className={`ti ${t.icon}`} style={{ fontSize: 16 }} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#F8FAFC", marginBottom: 3 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.45 }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CAPABILITIES / FEATURES PREVIEW */}
      <div style={{ padding: "5rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <p className="section-label">Platform Capabilities</p>
        <h2 style={{ fontSize: "1.85rem", fontWeight: 500, letterSpacing: "-0.02em", marginBottom: "2rem", color: "var(--text)" }}>
          AI-powered business trust intelligence capabilities.
        </h2>
        <div className="feature-grid">
          {PROBLEM_CARDS.map((card) => {
            const colorMap: Record<string, string> = { red: "var(--coral)", amber: "var(--amber)", violet: "var(--violet2)", emerald: "var(--emerald)" };
            const bgMap: Record<string, string> = { red: "rgba(240,107,107,0.15)", amber: "rgba(245,166,35,0.12)", violet: "rgba(124,110,240,0.15)", emerald: "rgba(52,211,153,0.12)" };
            return (
              <div key={card.title} className="glass-card premium-card" style={{ padding: "1.5rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: bgMap[card.color], display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                  <i className={`ti ${card.icon}`} style={{ color: colorMap[card.color], fontSize: 18 }} />
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>{card.title}</div>
                <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{card.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ height: "0.5px", background: "var(--glass-border)", maxWidth: 1100, margin: "0 auto" }} />

      {/* RISK SCORE EXPLAINER */}
      <div style={{ padding: "5rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <p className="section-label">How scoring works</p>
        <h2 style={{ fontSize: "1.85rem", fontWeight: 500, letterSpacing: "-0.02em", marginBottom: "2rem", color: "var(--text)" }}>
          Every agreement receives a 0–100 risk score.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { range: "0–30", label: "Low Risk", color: "var(--emerald)", bg: "rgba(52,211,153,0.1)", desc: "Balanced, fair terms. Protects your margins and relationship stability with little to no negotiation required." },
            { range: "31–60", label: "Moderate Risk", color: "var(--amber)", bg: "rgba(245,166,35,0.12)", desc: "Moderate exposure detected. A handful of clauses favor the client over your interests. Vetting recommended." },
            { range: "61–100", label: "High Risk", color: "var(--coral)", bg: "rgba(240,107,107,0.15)", desc: "High operational risk. Highly one-sided clauses that could impact revenue, IP, or termination rights. Redlines required." },
          ].map((tier) => (
            <div key={tier.label} className="glass-card" style={{ padding: "1.5rem", borderLeft: `4px solid ${tier.color}` }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 600, color: tier.color, marginBottom: 4 }}>{tier.range}</div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{tier.label}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.55 }}>{tier.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: "0.5px", background: "var(--glass-border)", maxWidth: 1100, margin: "0 auto" }} />

      {/* PRICING */}
      <div style={{ padding: "5rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <p className="section-label">Pricing</p>
        <h2 style={{ fontSize: "1.85rem", fontWeight: 500, letterSpacing: "-0.02em", marginBottom: "2rem", color: "var(--text)" }}>
          Smarter business agreements. Vetted in seconds.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {PRICING.map((tier) => (
            <div
              key={tier.name}
              className="glass-card"
              style={{
                padding: "1.75rem 1.5rem",
                borderColor: tier.highlight ? "rgba(124,110,240,0.45)" : "var(--glass-border)",
                background: tier.highlight ? "rgba(124,110,240,0.06)" : "var(--glass)",
                position: "relative",
              }}
            >
              {tier.highlight && (
                <span style={{ position: "absolute", top: -10, right: 16, background: "linear-gradient(135deg, var(--violet), var(--blue))", color: "#fff", fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 12 }}>
                  Most popular
                </span>
              )}
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{tier.name}</div>
              <div style={{ fontSize: "1.85rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{tier.price}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: "1.5rem", lineHeight: 1.5 }}>{tier.desc}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "2rem" }}>
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

      {/* BOTTOM CTA */}
      <div style={{ padding: "1rem 2rem 5rem", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <Link href="/scanner" className="btn-primary" style={{ fontSize: 14.5, padding: "13px 28px" }}>
          <i className="ti ti-shield-check" /> Analyze your first agreement free
        </Link>
      </div>

      <footer style={{ borderTop: "0.5px solid var(--glass-border)", padding: "2rem", textAlign: "center", background: "rgba(15,23,42,0.2)" }}>
        <p style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.6, maxWidth: 700, margin: "0 auto" }}>
          Nexus AI does not provide legal advice. It helps businesses, startups, SMEs, agencies, consultants, vendors, freelancers, and creators identify common
          negotiation points and understand agreement risks across NDAs, Service, Vendor, Consulting, Employment, Freelance, Partnership, and Creator agreements. Always consult a qualified attorney before signing.
        </p>
      </footer>
    </div>
  );
}
