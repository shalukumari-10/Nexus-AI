"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isLight, setIsLight] = useState(false);
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const pathname = usePathname();

  // Map path to page titles for breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    return ["Platform", ...paths.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace("-", " "))];
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Navigation */}
        <header
          style={{
            height: 60,
            borderBottom: "1px solid var(--glass-border)",
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1.5rem",
            position: "sticky",
            top: 0,
            zIndex: 90,
          }}
        >
          {/* Breadcrumbs */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text3)" }}>
            {getBreadcrumbs().map((b, idx, arr) => (
              <span key={b} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: idx === arr.length - 1 ? "var(--text)" : "var(--text3)", fontWeight: idx === arr.length - 1 ? 600 : 400 }}>
                  {b}
                </span>
                {idx < arr.length - 1 && <i className="ti ti-chevron-right" style={{ fontSize: 10 }} />}
              </span>
            ))}
          </div>

          {/* Center search (UI only) */}
          <div style={{ position: "relative", width: 280 }} className="top-search-container">
            <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", fontSize: 14 }} />
            <input
              type="text"
              placeholder="Search agreements or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--glass-border)",
                borderRadius: 8,
                padding: "6px 12px 6px 30px",
                fontSize: 12,
                color: "var(--text)",
                outline: "none",
              }}
            />
          </div>

          {/* Right side controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* AI Status */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "4px 10px", borderRadius: 20 }}>
              <span className="pulse-ring" style={{ width: 6, height: 6, background: "var(--emerald)" }} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--emerald)", textTransform: "uppercase", letterSpacing: "0.02em" }}>Nexus AI Online</span>
            </div>

            {/* Theme Toggle (UI only) */}
            <button
              onClick={() => setIsLight(!isLight)}
              style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
              title="Toggle Theme"
            >
              <i className={`ti ${isLight ? "ti-sun" : "ti-moon"}`} style={{ fontSize: 17 }} />
            </button>

            {/* Notifications (UI only) */}
            <button
              style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", position: "relative" }}
              title="Notifications"
            >
              <i className="ti ti-bell" style={{ fontSize: 17 }} />
              <span style={{ position: "absolute", top: 2, right: 2, width: 5, height: 5, background: "var(--coral)", borderRadius: "50%" }} />
            </button>

            {/* Profile Avatar Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: 0 }}
              >
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, var(--violet), var(--blue))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: "bold" }}>
                  HQ
                </div>
              </button>

              {showProfile && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 36,
                    width: 180,
                    background: "var(--navy2)",
                    border: "1px solid var(--glass-border2)",
                    borderRadius: 8,
                    padding: "6px 0",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
                    zIndex: 100,
                  }}
                >
                  <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--glass-border)", fontSize: 11.5, color: "var(--text3)" }}>
                    Signed in as <strong style={{ color: "var(--text)" }}>admin@acme.co</strong>
                  </div>
                  <Link href="/profile" onClick={() => setShowProfile(false)} style={{ display: "block", padding: "8px 12px", fontSize: 12, color: "var(--text2)", textDecoration: "none" }} className="profile-dropdown-item">
                    Organization Profile
                  </Link>
                  <Link href="/dashboard" onClick={() => setShowProfile(false)} style={{ display: "block", padding: "8px 12px", fontSize: 12, color: "var(--text2)", textDecoration: "none" }} className="profile-dropdown-item">
                    Workspace Settings
                  </Link>
                  <div style={{ height: "0.5px", background: "var(--glass-border)", margin: "4px 0" }} />
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowProfile(false); }} style={{ display: "block", padding: "8px 12px", fontSize: 12, color: "var(--coral)", textDecoration: "none" }}>
                    Sign Out
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Global Page Content Container */}
        <main style={{ flex: 1, overflowY: "auto", position: "relative" }} className="animate-fadeslide">
          {children}
        </main>
      </div>
    </div>
  );
}
