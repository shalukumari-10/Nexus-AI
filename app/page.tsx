import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", position: "relative", background: "#0A0F1E" }}>
      <Navbar />
      
      {/* Overflow wrapper for background blobs only */}
      <div style={{ position: "relative", overflowX: "clip" }}>
      {/* Background gradients */}
      <div style={{ position: "absolute", top: 0, right: 0, width: "60%", height: "800px", background: "radial-gradient(ellipse at top right, rgba(99,102,241,0.15), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", left: "-10%", width: "50%", height: "600px", background: "radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)", pointerEvents: "none" }} />
      
      {/* Hero */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "6rem 2rem", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "4rem", alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 30, padding: "6px 14px", marginBottom: "2rem" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60A5FA" }} />
            <span style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 500 }}>Smarter Agreements. Stronger Relationships.</span>
          </div>
          
          {/* Hero Title: Nexus AI large, subtitle below */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "1.25rem" }}>
            <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, #4F7FFF 0%, #6366F1 100%)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
              <i className="ti ti-shield-exclamation" style={{ color: "#fff", fontSize: 24 }} />
            </div>
            <h1 style={{ fontSize: "3.75rem", fontWeight: 800, lineHeight: 1, color: "#fff", margin: 0, letterSpacing: "-0.03em" }}>
              Nexus AI
            </h1>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "1.35rem", fontWeight: 600, color: "#60A5FA", margin: "0 0 0.25rem", letterSpacing: "0.01em", textTransform: "uppercase" }}>AI-Powered</p>
            <p style={{ fontSize: "1.35rem", fontWeight: 600, color: "#60A5FA", margin: "0 0 0.25rem", letterSpacing: "0.01em", textTransform: "uppercase" }}>Business Trust</p>
            <p style={{ fontSize: "1.35rem", fontWeight: 600, color: "#60A5FA", margin: 0, letterSpacing: "0.01em", textTransform: "uppercase" }}>Intelligence</p>
          </div>
          
          <p style={{ fontSize: "1.1rem", color: "#94A3B8", lineHeight: 1.6, marginBottom: "2.5rem", maxWidth: 480 }}>
            Nexus AI analyzes agreements, detects hidden risks, and empowers you to build trust, protect revenue, and negotiate smarter with confidence.
          </p>
          
          <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem" }}>
            <Link href="/scanner" style={{ background: "#6366F1", color: "#fff", padding: "12px 24px", borderRadius: 8, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, textDecoration: "none", transition: "all 0.2s" }} className="hover:opacity-90">
              Analyze Agreement <i className="ti ti-arrow-right" />
            </Link>
            <Link href="/scanner" style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "12px 24px", borderRadius: 8, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, textDecoration: "none", transition: "all 0.2s", cursor: "pointer" }}>
              <i className="ti ti-player-play" /> Watch Demo
            </Link>
          </div>
          
          {/* Compact stats row — single line */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "nowrap", alignItems: "center" }}>
            {[
              { icon: "ti-cpu", title: "AI-Powered", sub: "Advanced NLP" },
              { icon: "ti-lock", title: "Secure & Private", sub: "Enterprise Grade" },
              { icon: "ti-bolt", title: "Fast & Accurate", sub: "Real-time" },
              { icon: "ti-users", title: "Trusted", sub: "Reliable Results" }
            ].map(f => (
              <div key={f.title} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 10px", whiteSpace: "nowrap" }}>
                <i className={`ti ${f.icon}`} style={{ color: "#818CF8", fontSize: 14 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#E2E8F0", lineHeight: 1.2 }}>{f.title}</div>
                  <div style={{ fontSize: 10, color: "#64748B", lineHeight: 1 }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right side Dashboard Mock */}
        <div style={{ position: "relative" }}>
          {/* Main card — float + shimmer border */}
          <div style={{
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16,
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
            position: "relative",
            overflow: "hidden"
          }} className="float-card risk-card-glow">
            {/* Animated scan line */}
            <div className="scan-line" />

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="pulse-dot" style={{ "--dot-color": "#FBBF24" } as React.CSSProperties} />
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Risk Overview</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-chart-pie" style={{ fontSize: 12, color: "#818CF8" }} /></div>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-layers-subtract" style={{ fontSize: 12, color: "#FBBF24" }} /></div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
              {/* Donut chart mock — animated spin-in */}
              <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
                <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} className="donut-spin">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FBBF24" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="80" strokeLinecap="round" className="arc-draw" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="180" strokeLinecap="round" className="arc-draw-2" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EF4444" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="220" strokeLinecap="round" className="arc-draw-3" />
                </svg>
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>Risk Level</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#FBBF24" }} className="risk-pulse">Moderate</span>
                </div>
              </div>
              
              {/* List with animated status dots */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Liability", status: "Moderate Risk", color: "#FBBF24", delay: "0s" },
                  { label: "Payment Terms", status: "Low Risk", color: "#34D399", delay: "0.3s" },
                  { label: "Termination", status: "High Risk", color: "#EF4444", delay: "0.6s" }
                ].map(item => (
                  <div key={item.label} style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid rgba(255,255,255,0.05)`,
                    borderLeft: `3px solid ${item.color}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    animationDelay: item.delay
                  }} className="risk-row-slide">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="ti ti-file-text" style={{ fontSize: 14, color: "#64748B" }} />
                      <span style={{ fontSize: 13, color: "#CBD5E1" }}>{item.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, color: item.color }}>{item.status}</span>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}`, display: "inline-block" }} className="status-blink" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Animated key insights bars */}
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <i className="ti ti-sparkles" style={{ color: "#818CF8", fontSize: 13 }} />
                Key Insights
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, flex: 1, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "linear-gradient(90deg, #6366F1, #818CF8)", borderRadius: 3, width: "78%" }} className="bar-grow" />
                  </div>
                  <span style={{ fontSize: 10, color: "#64748B", width: 28 }}>78%</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, flex: 1, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "linear-gradient(90deg, #FBBF24, #F59E0B)", borderRadius: 3, width: "54%" }} className="bar-grow bar-grow-2" />
                  </div>
                  <span style={{ fontSize: 10, color: "#64748B", width: 28 }}>54%</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, flex: 1, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "linear-gradient(90deg, #34D399, #10B981)", borderRadius: 3, width: "35%" }} className="bar-grow bar-grow-3" />
                  </div>
                  <span style={{ fontSize: 10, color: "#64748B", width: 28 }}>35%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating AI Insight Card */}
          <div style={{ position: "absolute", bottom: -20, right: -40, background: "rgba(17, 24, 39, 0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(99,102,241,0.35)", borderRadius: 12, padding: "1.25rem", width: 280, boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.25)" }} className="float-card-slow insight-card-glow">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brain" style={{ fontSize: 14, color: "#818CF8" }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#818CF8" }}>AI Insight</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#34D399", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34D399", display: "inline-block" }} className="status-blink" />
                Live
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#E2E8F0", lineHeight: 1.5, margin: "0 0 10px" }}>
              Unusual termination clause detected. Review suggested.
            </p>
            <div style={{ height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg, #6366F1, #818CF8, #6366F1)", backgroundSize: "200% 100%" }} className="shimmer-bar" />
            </div>
          </div>
        </div>
      </div>
      
      {/* What Nexus AI helps you achieve */}
      <div style={{ padding: "5rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "3.5rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 600, color: "#fff", textAlign: "center", marginBottom: "3rem" }}>What Nexus AI helps you achieve</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1.5rem" }}>
            {[
              { icon: "ti-shield-exclamation", color: "#3B82F6", title: "Detect Hidden Risks", desc: "Identify liabilities, unfair terms, and potential loopholes." },
              { icon: "ti-lock", color: "#F59E0B", title: "Protect Revenue", desc: "Safeguard your business from costly surprises." },
              { icon: "ti-scale", color: "#10B981", title: "Negotiate Smarter", desc: "Get AI-backed insights to strengthen your position." },
              { icon: "ti-users", color: "#A855F7", title: "Build Trusted Partnerships", desc: "Foster transparency and long-term business trust." },
              { icon: "ti-clock", color: "#60A5FA", title: "Save Time & Effort", desc: "Automate analysis and focus on what matters most." }
            ].map(item => (
              <div key={item.title} style={{ textAlign: "center" }} className="hover-scale">
                <i className={`ti ${item.icon}`} style={{ fontSize: 32, color: item.color, marginBottom: "1rem", display: "block" }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: "0.5rem" }}>{item.title}</h3>
                <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* How It Works */}
      <div style={{ padding: "4rem 2rem", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 600, color: "#fff", textAlign: "center", marginBottom: "4rem" }}>How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem", position: "relative" }}>
          {/* Connecting line */}
          <div style={{ position: "absolute", top: 12, left: "12%", right: "12%", height: 1, borderTop: "1px dashed rgba(255,255,255,0.2)", zIndex: 0 }} />
          
          {[
            { num: 1, icon: "ti-upload", title: "Upload Agreement", desc: "Securely upload your contract in seconds." },
            { num: 2, icon: "ti-brain", title: "AI Analysis", desc: "Our AI scans and analyzes the agreement deeply." },
            { num: 3, icon: "ti-file-analytics", title: "Get Insights", desc: "Receive clear risk scores and actionable insights." },
            { num: 4, icon: "ti-shield-check", title: "Make Confident Decisions", desc: "Negotiate better and close deals with confidence." }
          ].map(item => (
            <div key={item.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "#0A0F1E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, marginBottom: "1.5rem" }}>
                {item.num}
              </div>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                <i className={`ti ${item.icon}`} style={{ fontSize: 28, color: "#3B82F6" }} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: "0.5rem", textAlign: "center" }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Powerful Capabilities */}
      <div style={{ padding: "5rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 600, color: "#fff", textAlign: "center", marginBottom: "3rem" }}>Powerful Capabilities</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
          {[
            { icon: "ti-file-text", color: "#A855F7", title: "AI Contract Intelligence", desc: "Understand complex legal language in simple terms." },
            { icon: "ti-shield-exclamation", color: "#F59E0B", title: "Risk Detection", desc: "Spot liabilities, payment risks, and unfavorable terms." },
            { icon: "ti-file-check", color: "#10B981", title: "Clause Analysis", desc: "Break down key clauses with contextual insights." },
            { icon: "ti-bulb", color: "#A855F7", title: "Smart Recommendations", desc: "Get actionable suggestions to reduce risk." },
            { icon: "ti-shield-lock", color: "#3B82F6", title: "Secure & Confidential", desc: "Your data is encrypted and never shared." }
          ].map(item => (
            <div key={item.title} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "2rem 1.5rem", textAlign: "center" }} className="hover-scale">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.05)", margin: "0 auto 1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`ti ${item.icon}`} style={{ fontSize: 24, color: item.color }} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: "0.75rem" }}>{item.title}</h3>
              <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pricing */}
      <div id="pricing" style={{ padding: "5rem 2rem", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 600, color: "#fff", marginBottom: "0.5rem" }}>Simple, Transparent Pricing</h2>
          <p style={{ fontSize: 14, color: "#94A3B8" }}>Choose the plan that works for you.</p>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", alignItems: "center" }}>
          {[
            { 
              name: "Starter", desc: "For individuals and startups getting started.", price: "Free", subtext: "Forever", 
              features: ["Up to 3 agreement analyses / month", "Basic risk insights", "Standard support"], 
              cta: "Get Started", primary: false 
            },
            { 
              name: "Professional", desc: "For growing businesses and frequent users.", price: "$19", subtext: "/month\nBilled monthly", 
              features: ["Up to 50 agreement analyses / month", "Advanced risk insights", "Download reports", "Priority support"], 
              cta: "Start Free Trial", primary: true 
            },
            { 
              name: "Enterprise", desc: "For large organizations with advanced needs.", price: "Custom", subtext: "Tailored for you", 
              features: ["Unlimited agreements", "Custom integrations", "Dedicated account manager", "Advanced security & compliance"], 
              cta: "Contact Sales", primary: false 
            }
          ].map(plan => (
            <div key={plan.name} style={{ 
              background: plan.primary ? "rgba(255,255,255,0.05)" : "transparent", 
              border: plan.primary ? "1px solid #818CF8" : "1px solid rgba(255,255,255,0.1)", 
              borderRadius: 16, 
              padding: "2.5rem 2rem",
              position: "relative",
              transform: plan.primary ? "scale(1.05)" : "none",
              zIndex: plan.primary ? 10 : 1
            }}>
              {plan.primary && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#6366F1", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 12 }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: "0.5rem" }}>{plan.name}</h3>
              <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: "2rem", minHeight: 40 }}>{plan.desc}</p>
              
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: "2.5rem", fontWeight: 700, color: "#fff" }}>{plan.price}</span>
                  {plan.subtext.includes("/month") && <span style={{ fontSize: 13, color: "#94A3B8" }}>/month</span>}
                </div>
                {!plan.subtext.includes("/month") && <div style={{ fontSize: 13, color: "#94A3B8", whiteSpace: "pre-line" }}>{plan.subtext}</div>}
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <i className="ti ti-check" style={{ color: "#34D399", fontSize: 16, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: "#CBD5E1" }}>{f}</span>
                  </div>
                ))}
              </div>
              
              <Link href="/scanner" style={{ 
                display: "block", 
                textAlign: "center", 
                padding: "12px", 
                borderRadius: 8, 
                textDecoration: "none", 
                fontWeight: 500,
                background: plan.primary ? "#6366F1" : "transparent",
                color: plan.primary ? "#fff" : "#E2E8F0",
                border: plan.primary ? "none" : "1px solid rgba(255,255,255,0.2)",
                transition: "all 0.2s"
              }} className="hover:opacity-90">
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom CTA */}
      <div style={{ padding: "0 2rem 5rem", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "3rem", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div style={{ width: 80, height: 80, background: "rgba(99,102,241,0.1)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(99,102,241,0.2)", flexShrink: 0 }}>
              <i className="ti ti-file-certificate" style={{ fontSize: 40, color: "#818CF8" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 600, color: "#fff", marginBottom: "0.5rem" }}>Ready to build trust in every agreement?</h2>
              <p style={{ fontSize: 13.5, color: "#94A3B8", margin: 0 }}>Join businesses making smarter, safer, and stronger deals with Nexus AI.</p>
            </div>
          </div>
          <Link href="/scanner" style={{ background: "#6366F1", color: "#fff", padding: "12px 24px", borderRadius: 8, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", transition: "all 0.2s", whiteSpace: "nowrap" }} className="hover:opacity-90">
            Analyze Your First Agreement <i className="ti ti-arrow-right" />
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer id="about" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "4rem 2rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.5fr", gap: "3rem", marginBottom: "4rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
              <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #4F7FFF 0%, #6366F1 100%)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(99,102,241,0.4)" }}>
                <i className="ti ti-shield-exclamation" style={{ color: "#fff", fontSize: 14 }} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Nexus AI</span>
            </div>
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, maxWidth: 280 }}>
              AI-powered business trust intelligence platform that helps organizations analyze agreements, detect risks, and negotiate with confidence.
            </p>
          </div>
          
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: "1.5rem" }}>Product</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {["Scanner", "Dashboard", "Pricing", "Security"].map(link => (
                <Link key={link} href="#" style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none" }}>{link}</Link>
              ))}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: "1.5rem" }}>Company</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {["About Us", "Blog", "Careers", "Contact"].map(link => (
                <Link key={link} href="#" style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none" }}>{link}</Link>
              ))}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: "1.5rem" }}>Resources</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {["Help Center", "Privacy Policy", "Terms of Service", "Data Security"].map(link => (
                <Link key={link} href="#" style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none" }}>{link}</Link>
              ))}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: "1.5rem" }}>Stay Updated</div>
            <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Get the latest updates and insights delivered to your inbox.
            </p>
            <div style={{ position: "relative" }}>
              <input type="text" placeholder="Enter your email" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 40px 10px 16px", fontSize: 13, color: "#fff", outline: "none" }} />
              <button style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer", display: "flex" }}>
                <i className="ti ti-send" style={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: "center", fontSize: 12, color: "#64748B", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          © 2024 Nexus AI. All rights reserved.
        </div>
      </footer>
    </div>{/* end overflowX clip wrapper */}
  </div>
  );
}
