"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface TopBarProps {
  user: { name: string; email: string; role: string } | null;
}

export default function TopBar({ user }: TopBarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const roleLabels: Record<string, string> = {
    ADMIN: "Administrador",
    TECHNICIAN: "Técnico",
    EMPLOYEE: "Empleado",
  };

  const roleColors: Record<string, string> = {
    ADMIN: "#f59e0b",
    TECHNICIAN: "#06b6d4",
    EMPLOYEE: "#6b7280",
  };

  return (
    <header style={{
      height: "64px",
      background: "rgba(5,8,22,0.7)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(59,130,246,0.1)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 1.5rem", gap: "1rem",
    }}>
      {/* Left — Page title area (filled by page) */}
      <div style={{ flex: 1 }} />

      {/* Right — User info + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.85rem", fontWeight: 700, color: "#fff",
              boxShadow: "0 2px 12px rgba(37,99,235,0.3)",
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="topbar-user-info" style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f0f4ff", lineHeight: 1.2 }}>
                {user.name}
              </span>
              <span style={{ fontSize: "0.7rem", fontWeight: 500, color: roleColors[user.role] || "#6b7280" }}>
                {roleLabels[user.role] || user.role}
              </span>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "0.5rem", padding: "0.45rem 0.9rem",
            color: "#fca5a5", fontSize: "0.8rem", fontWeight: 500,
            cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: "0.4rem",
            opacity: loggingOut ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.2)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {loggingOut ? "Saliendo..." : "Cerrar sesión"}
        </button>
      </div>
    </header>
  );
}
