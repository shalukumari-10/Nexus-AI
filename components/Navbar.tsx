"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        height: 56,
        borderBottom: "0.5px solid var(--glass-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(16px)",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div
          style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #4F7FFF 0%, #6366F1 100%)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(99,102,241,0.45)",
          }}
        >
          <i className="ti ti-shield-exclamation" style={{ color: "#fff", fontSize: 16 }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>
          Nexus AI
        </span>
      </Link>

      <div style={{ display: "flex", gap: 8 }}>
        {[
          { href: "/", label: "Home" },
          { href: "/scanner", label: "Scanner" },
          { href: "/dashboard", label: "Dashboard" },
          { href: "#pricing", label: "Pricing" },
        ].map(({ href, label }) => (
          <Link
            key={label}
            href={href}
            style={{
              fontSize: 13,
              color: pathname === href ? "var(--text)" : "var(--text2)",
              background: pathname === href ? "var(--glass2)" : "none",
              border: "none",
              padding: "6px 14px",
              borderRadius: 6,
              textDecoration: "none",
              transition: "background 0.15s",
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            fontSize: 12,
            background: "rgba(255,255,255,0.05)",
            color: "#94A3B8",
            padding: "6px 14px",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.1)",
            fontWeight: 500,
          }}
        >
          AI-Powered
        </span>
        <Link href="/scanner" style={{ background: "#6366F1", color: "#fff", padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none", transition: "all 0.2s" }} className="hover:opacity-90">
          Analyze Agreement
        </Link>
      </div>
    </nav>
  );
}
