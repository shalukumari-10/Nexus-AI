"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Business Intelligence Center", icon: "ti-layout-dashboard" },
  { href: "/scanner", label: "Agreement Scanner", icon: "ti-scan" },
  { href: "/results", label: "Results", icon: "ti-file-analytics" },
  { href: "/history", label: "Business Records", icon: "ti-history" },
  { href: "/brand-insights", label: "Client Intelligence", icon: "ti-building-store" },
  { href: "/negotiation-toolkit", label: "AI Communication Studio", icon: "ti-message-2" },
  { href: "/negotiation-simulator", label: "AI Negotiation Simulator", icon: "ti-messages" },
  { href: "/legal-help", label: "Expert Network", icon: "ti-gavel" },
  { href: "/reports", label: "Reports", icon: "ti-report" },
  { href: "/profile", label: "Organization Profile", icon: "ti-user-circle" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      style={{
        width: isCollapsed ? 70 : 232,
        flexShrink: 0,
        borderRight: "1px solid var(--glass-border)",
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        height: "100vh",
        overscrollBehavior: "none",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        padding: "1.25rem 0.75rem",
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between", marginBottom: "1.75rem", padding: "0 0.5rem" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              background: "linear-gradient(135deg, var(--violet), var(--blue))",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i className="ti ti-shield-exclamation" style={{ color: "#fff", fontSize: 15 }} />
          </div>
          {!isCollapsed && (
            <span style={{ fontSize: 15, fontWeight: 650, color: "var(--text)", letterSpacing: "-0.01em" }}>
              Nexus AI
            </span>
          )}
        </Link>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text3)",
            cursor: "pointer",
            display: isCollapsed ? "none" : "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            borderRadius: 4,
            transition: "all 0.2s"
          }}
          className="sidebar-toggle-btn"
          title="Collapse Sidebar"
        >
          <i className="ti ti-chevron-left" style={{ fontSize: 16 }} />
        </button>
      </div>

      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            background: "var(--glass)",
            border: "1px solid var(--glass-border)",
            color: "var(--text2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 0",
            borderRadius: 8,
            marginBottom: "1.5rem",
            width: "100%",
            transition: "all 0.2s"
          }}
          className="sidebar-toggle-btn"
          title="Expand Sidebar"
        >
          <i className="ti ti-chevron-right" style={{ fontSize: 14 }} />
        </button>
      )}

      <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="sidebar-link group"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "flex-start",
                gap: isCollapsed ? 0 : 10,
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
                color: active ? "var(--text)" : "var(--text2)",
                background: active ? "rgba(99, 102, 241, 0.12)" : "transparent",
                border: active ? "1px solid rgba(99, 102, 241, 0.25)" : "1px solid transparent",
                boxShadow: active ? "0 0 15px rgba(99, 102, 241, 0.12)" : "none",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden"
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <div style={{
                position: "absolute",
                left: 0,
                top: "20%",
                bottom: "20%",
                width: 3,
                background: "var(--violet)",
                borderRadius: "0 4px 4px 0",
                boxShadow: "0 0 8px var(--violet)",
                transform: active ? "translateX(0)" : "translateX(-100%)",
                opacity: active ? 1 : 0,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              }} />
              <i className={`ti ${item.icon} group-hover:scale-110`} style={{ fontSize: 16, color: active ? "var(--violet2)" : "var(--text3)", transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.85rem",
            background: "var(--glass)",
            border: "1px solid var(--glass-border)",
            borderRadius: 10,
            fontSize: 11,
            color: "var(--text3)",
            lineHeight: 1.5,
          }}
        >
          <i className="ti ti-info-circle" style={{ marginRight: 5, color: "var(--violet2)" }} />
          Not legal advice. Nexus AI helps you identify key business agreement risks.
        </div>
      )}
      {isCollapsed && (
        <div style={{ textAlign: "center", color: "var(--text3)", cursor: "help" }} title="Not legal advice. Nexus AI helps identify agreement risks.">
          <i className="ti ti-info-circle" style={{ fontSize: 18, color: "var(--violet2)" }} />
        </div>
      )}
    </div>
  );
}
