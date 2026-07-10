"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Business Intelligence Center", icon: "ti-layout-dashboard" },
  { href: "/scanner", label: "Agreement Scanner", icon: "ti-scan" },
  { href: "/results", label: "Results", icon: "ti-file-analytics" },
  { href: "/history", label: "Business Records", icon: "ti-history" },
  { href: "/brand-insights", label: "Client Intelligence", icon: "ti-building-store" },
  { href: "/negotiation-toolkit", label: "AI Communication Studio", icon: "ti-message-2" },
  { href: "/legal-help", label: "Expert Network", icon: "ti-gavel" },
  { href: "/reports", label: "Reports", icon: "ti-report" },
  { href: "/profile", label: "Organization Profile", icon: "ti-user-circle" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      style={{
        width: 232,
        flexShrink: 0,
        borderRight: "0.5px solid var(--glass-border)",
        background: "rgba(11,15,26,0.6)",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        padding: "1.25rem 0.75rem",
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          padding: "0 0.5rem",
          marginBottom: "1.75rem",
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
        <span style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.01em" }}>
          Nexus AI
        </span>
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 500,
                textDecoration: "none",
                color: active ? "var(--text)" : "var(--text2)",
                background: active ? "var(--glass2)" : "transparent",
                border: active ? "0.5px solid var(--glass-border2)" : "0.5px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <i className={`ti ${item.icon}`} style={{ fontSize: 16, color: active ? "var(--violet2)" : "var(--text3)" }} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: "1rem",
          padding: "0.85rem",
          background: "var(--glass)",
          border: "0.5px solid var(--glass-border)",
          borderRadius: 10,
          fontSize: 11.5,
          color: "var(--text3)",
          lineHeight: 1.5,
        }}
      >
        <i className="ti ti-info-circle" style={{ marginRight: 5, color: "var(--violet2)" }} />
        Not legal advice. Nexus AI helps you identify key business agreement risks.
      </div>
    </div>
  );
}
