"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Icon components ───────────────────────────────────────────────────
function IconDashboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}
function IconInventory() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconMaintenance() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}
function IconReports() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}
function IconChevron({ collapsed }: { collapsed: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

// ── Navigation items ──────────────────────────────────────────────────
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
  { href: "/dashboard/inventory", label: "Inventario", icon: <IconInventory /> },
  { href: "/dashboard/users", label: "Usuarios", icon: <IconUsers /> },
  { href: "/dashboard/maintenance", label: "Mantenimientos", icon: <IconMaintenance /> },
  { href: "/dashboard/reports", label: "Reportes", icon: <IconReports /> },
];

// ── Sidebar component ─────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Brand */}
      <div style={{
        padding: collapsed ? "1.25rem 0.75rem" : "1.25rem 1.5rem",
        display: "flex", alignItems: "center", gap: "0.75rem",
        borderBottom: "1px solid rgba(59,130,246,0.1)",
        justifyContent: collapsed ? "center" : "flex-start",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #2563eb, #6366f1)",
          borderRadius: "10px", padding: "7px", flexShrink: 0,
          boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        {!collapsed && (
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#f0f4ff", whiteSpace: "nowrap" }}>
            Asset<span style={{ color: "#60a5fa" }}>IQ</span>
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ padding: "1rem 0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: collapsed ? "0.7rem" : "0.7rem 1rem",
                borderRadius: "0.625rem",
                color: active ? "#60a5fa" : "#9ca3af",
                background: active ? "rgba(37,99,235,0.12)" : "transparent",
                border: active ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent",
                textDecoration: "none", fontSize: "0.875rem", fontWeight: active ? 600 : 500,
                transition: "all 0.2s ease",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(59,130,246,0.08)";
                  e.currentTarget.style.color = "#f0f4ff";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#9ca3af";
                }
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div style={{
        padding: "1rem", borderTop: "1px solid rgba(59,130,246,0.1)",
        display: "flex", justifyContent: "center",
      }}
        className="sidebar-collapse-btn"
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)",
            borderRadius: "0.5rem", padding: "0.5rem", cursor: "pointer",
            color: "#9ca3af", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f0f4ff"; e.currentTarget.style.background = "rgba(59,130,246,0.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "rgba(59,130,246,0.08)"; }}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <IconChevron collapsed={collapsed} />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
        style={{
          position: "fixed", top: "1rem", left: "1rem", zIndex: 60,
          background: "rgba(13,27,62,0.9)", border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: "0.625rem", padding: "0.6rem", cursor: "pointer",
          color: "#9ca3af", backdropFilter: "blur(12px)",
          display: "none", // shown via CSS media query
        }}
      >
        <IconMenu />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 70,
            background: "rgba(3,7,18,0.6)", backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className="mobile-sidebar"
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 80,
          width: "260px",
          background: "rgba(5,8,22,0.97)", borderRight: "1px solid rgba(59,130,246,0.12)",
          backdropFilter: "blur(20px)",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          display: "flex", flexDirection: "column",
        }}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="desktop-sidebar"
        style={{
          width: collapsed ? "72px" : "240px",
          minHeight: "100vh",
          background: "rgba(5,8,22,0.85)", borderRight: "1px solid rgba(59,130,246,0.12)",
          backdropFilter: "blur(20px)",
          display: "flex", flexDirection: "column",
          transition: "width 0.3s ease",
          flexShrink: 0,
          position: "sticky", top: 0, height: "100vh", overflowY: "auto",
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
