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
            width: 30, height: 30,
            background: "linear-gradient(135deg, var(--violet), var(--blue))",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <i className="ti ti-shield-exclamation" style={{ color: "#fff", fontSize: 15 }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.01em" }}>
          Nexus AI
        </span>
      </Link>

      <div style={{ display: "flex", gap: 8 }}>
        {[{ href: "/", label: "Home" }, { href: "/scanner", label: "Scanner" }, { href: "/dashboard", label: "Dashboard" }].map(({ href, label }) => (
          <Link
            key={href}
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

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 11,
            background: "rgba(124,110,240,0.18)",
            color: "var(--violet2)",
            padding: "3px 10px",
            borderRadius: 20,
            border: "0.5px solid rgba(124,110,240,0.35)",
            fontWeight: 500,
          }}
        >
          AI-Powered
        </span>
        <Link href="/scanner" className="btn-primary" style={{ fontSize: 13, padding: "7px 16px" }}>
          Analyze Agreement
        </Link>
      </div>
    </nav>
  );
}
