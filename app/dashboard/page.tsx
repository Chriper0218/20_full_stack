"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import StatsCard from "./components/StatsCard";
import StatusBadge from "./components/StatusBadge";

interface Stats {
  totalAssets: number;
  totalUsers: number;
  totalMaintenances: number;
  warrantyAlerts: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  recentMaintenances: Array<{
    id: string; type: string; description: string; maintenanceDate: string;
    cost: string | null;
    asset: { serialNumber: string; brand: string; model: string };
  }>;
}

const categoryLabels: Record<string, string> = {
  LAPTOP: "Laptops", SERVER: "Servidores", NETWORK_DEVICE: "Red",
  PRINTER: "Impresoras", CELLPHONE: "Celulares",
};

const PIE_COLORS = ["#60a5fa", "#fbbf24", "#fca5a5", "#34d399"];
const statusLabels: Record<string, string> = {
  ASIGNADO: "Asignado", MANTENIMIENTO: "Mantenimiento", BAJA: "Baja", BODEGA: "Bodega",
};

function IconBox() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
}
function IconAssign() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
}
function IconWrench() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
}
function IconAlert() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" style={{ animation:"spin 0.8s linear infinite" }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!stats) return <p style={{ color:"#6b7280" }}>Error al cargar estadísticas.</p>;

  const barData = Object.entries(stats.byCategory).map(([key, val]) => ({
    name: categoryLabels[key] || key, total: val,
  }));

  const pieData = Object.entries(stats.byStatus).map(([key, val]) => ({
    name: statusLabels[key] || key, value: val,
  }));

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom:"1.75rem" }}>
        <h1 style={{ fontSize:"1.6rem",fontWeight:700,color:"#f0f4ff",marginBottom:"0.3rem" }}>Dashboard</h1>
        <p style={{ color:"#6b7280",fontSize:"0.875rem" }}>Resumen general del sistema de gestión de activos</p>
      </div>

      {/* Stats cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:"1rem",marginBottom:"2rem" }}>
        <StatsCard icon={<IconBox/>} label="Total Activos" value={stats.totalAssets} color="#60a5fa" borderColor="#3b82f6" />
        <StatsCard icon={<IconAssign/>} label="Asignados" value={stats.byStatus.ASIGNADO || 0} color="#818cf8" borderColor="#6366f1" />
        <StatsCard icon={<IconWrench/>} label="En Mantenimiento" value={stats.byStatus.MANTENIMIENTO || 0} color="#fbbf24" borderColor="#f59e0b" />
        <StatsCard icon={<IconAlert/>} label="Alertas Garantía" value={stats.warrantyAlerts} color="#f87171" borderColor="#ef4444" />
      </div>

      {/* Charts row */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(340px, 1fr))",gap:"1.25rem",marginBottom:"2rem" }}>
        {/* Bar chart */}
        <div style={{ background:"rgba(13,27,62,0.55)",border:"1px solid rgba(59,130,246,0.15)",borderRadius:"1rem",padding:"1.5rem" }}>
          <h3 style={{ fontSize:"0.95rem",fontWeight:600,color:"#f0f4ff",marginBottom:"1rem" }}>Equipos por Categoría</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top:5,right:10,left:-10,bottom:5 }}>
              <XAxis dataKey="name" tick={{ fill:"#6b7280",fontSize:12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#6b7280",fontSize:12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background:"rgba(13,27,62,0.95)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:"0.5rem",color:"#f0f4ff",fontSize:"0.85rem" }} />
              <Bar dataKey="total" fill="#3b82f6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div style={{ background:"rgba(13,27,62,0.55)",border:"1px solid rgba(59,130,246,0.15)",borderRadius:"1rem",padding:"1.5rem" }}>
          <h3 style={{ fontSize:"0.95rem",fontWeight:600,color:"#f0f4ff",marginBottom:"1rem" }}>Distribución por Estado</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background:"rgba(13,27,62,0.95)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:"0.5rem",color:"#f0f4ff",fontSize:"0.85rem" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent maintenances table */}
      <div style={{ background:"rgba(13,27,62,0.55)",border:"1px solid rgba(59,130,246,0.15)",borderRadius:"1rem",padding:"1.5rem" }}>
        <h3 style={{ fontSize:"0.95rem",fontWeight:600,color:"#f0f4ff",marginBottom:"1rem" }}>Últimos Mantenimientos</h3>
        {stats.recentMaintenances.length === 0 ? (
          <p style={{ color:"#6b7280",fontSize:"0.85rem",textAlign:"center",padding:"2rem 0" }}>No hay mantenimientos registrados aún.</p>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["Activo","Tipo","Descripción","Costo","Fecha"].map(h => (
                    <th key={h} style={{ textAlign:"left",padding:"0.6rem 0.75rem",fontSize:"0.75rem",fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid rgba(59,130,246,0.1)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentMaintenances.map((m) => (
                  <tr key={m.id} style={{ transition:"background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(59,130,246,0.05)"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"0.65rem 0.75rem",fontSize:"0.85rem",color:"#f0f4ff",fontWeight:500 }}>{m.asset.brand} {m.asset.model}<br/><span style={{ fontSize:"0.72rem",color:"#6b7280" }}>{m.asset.serialNumber}</span></td>
                    <td style={{ padding:"0.65rem 0.75rem" }}><StatusBadge status={m.type} /></td>
                    <td style={{ padding:"0.65rem 0.75rem",fontSize:"0.83rem",color:"#9ca3af",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.description}</td>
                    <td style={{ padding:"0.65rem 0.75rem",fontSize:"0.85rem",color:"#f0f4ff" }}>{m.cost ? `$${parseFloat(m.cost).toLocaleString()}` : "—"}</td>
                    <td style={{ padding:"0.65rem 0.75rem",fontSize:"0.8rem",color:"#6b7280" }}>{new Date(m.maintenanceDate).toLocaleDateString("es-CO")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
