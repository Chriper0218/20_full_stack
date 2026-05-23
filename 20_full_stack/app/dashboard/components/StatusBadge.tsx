"use client";

const statusConfig: Record<string, { label: string; bg: string; border: string; text: string }> = {
  ASIGNADO:      { label: "Asignado",       bg: "rgba(37,99,235,0.12)", border: "rgba(37,99,235,0.3)",  text: "#60a5fa" },
  MANTENIMIENTO: { label: "Mantenimiento",  bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", text: "#fbbf24" },
  BAJA:          { label: "Dado de baja",   bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)",   text: "#fca5a5" },
  BODEGA:        { label: "En bodega",      bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", text: "#34d399" },
  PREVENTIVO:    { label: "Preventivo",     bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", text: "#34d399" },
  CORRECTIVO:    { label: "Correctivo",     bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)",   text: "#fca5a5" },
  ADMIN:         { label: "Admin",          bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", text: "#fbbf24" },
  TECHNICIAN:    { label: "Técnico",        bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.3)",   text: "#22d3ee" },
  EMPLOYEE:      { label: "Empleado",       bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.3)", text: "#9ca3af" },
};

export default function StatusBadge({ status, size = "sm" }: { status: string; size?: "sm" | "md" }) {
  const c = statusConfig[status] || { label: status, bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.3)", text: "#9ca3af" };
  const p = size === "sm" ? "0.2rem 0.6rem" : "0.3rem 0.85rem";
  const f = size === "sm" ? "0.72rem" : "0.8rem";
  const d = size === "sm" ? 6 : 7;
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:"0.3rem",padding:p,borderRadius:"9999px",background:c.bg,border:`1px solid ${c.border}`,color:c.text,fontSize:f,fontWeight:600,letterSpacing:"0.03em",whiteSpace:"nowrap" }}>
      <span style={{ width:d,height:d,borderRadius:"50%",background:c.text }} />
      {c.label}
    </span>
  );
}
