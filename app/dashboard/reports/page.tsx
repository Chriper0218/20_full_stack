"use client";

import { useEffect, useState } from "react";
import StatsCard from "../components/StatsCard";

interface StatsResponse {
  totalAssets: number;
  totalUsers: number;
  totalMaintenances: number;
  warrantyAlerts: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}

const categoryLabels: Record<string, string> = {
  LAPTOP: "Laptops",
  SERVER: "Servidores",
  NETWORK_DEVICE: "Dispositivos de red",
  PRINTER: "Impresoras",
  CELLPHONE: "Celulares",
};

type ReportType = "general" | "maintenance";

type GeneralReport = {
  type: "general";
  generatedAt: string;
  generatedBy: string;
  total: number;
  assets: Array<{
    serialNumber: string;
    brand: string;
    model: string;
    category: string;
    status: string;
    assignedTo: { name: string } | null;
    purchaseDate: string | null;
    warrantyExpiry: string | null;
  }>;
  totalByCategory: Array<{ category: string; _count: { category: number } }>;
  totalByStatus: Array<{ status: string; _count: { status: number } }>;
};

type MaintenanceReport = {
  type: "maintenance";
  generatedAt: string;
  generatedBy: string;
  total: number;
  maintenances: Array<{
    id: string;
    type: string;
    description: string;
    maintenanceDate: string;
    cost: string | null;
    performedBy: string | null;
    asset: { serialNumber: string; brand: string; model: string; category: string };
  }>;
  totalCost: string | null;
  totalCount: number;
};

export default function ReportsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [reportType, setReportType] = useState<ReportType>("general");
  const [reportPreview, setReportPreview] = useState<GeneralReport | MaintenanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloading, setDownloading] = useState<ReportType | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchReportPreview(reportType);
  }, [reportType]);

  async function fetchReportPreview(type: ReportType) {
    setPreviewLoading(true);
    try {
      const response = await fetch(`/api/reports/inventory?type=${type}`);
      const data = await response.json();
      if (response.ok) {
        setReportPreview(data);
      } else {
        setReportPreview(null);
      }
    } catch (err) {
      console.error(err);
      setReportPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function downloadReport(type: ReportType) {
    setDownloading(type);
    try {
      const res = await fetch(`/api/reports/inventory?type=${type}&format=pdf`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se pudo generar el reporte.");
      }
      const blob = await res.blob();
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `reporte-${type}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al descargar el reporte.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f0f4ff" }}>Reportes</h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>Genera informes listos para PDF y revisa un resumen previo antes de descargar.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button onClick={() => downloadReport("general")} className="btn-primary" style={{ width: "auto", padding: "0.75rem 1.3rem", opacity: downloading === "general" ? 0.7 : 1 }}>
            {downloading === "general" ? "Generando..." : "Descargar general"}
          </button>
          <button onClick={() => downloadReport("maintenance")} className="btn-primary" style={{ width: "auto", padding: "0.75rem 1.3rem", opacity: downloading === "maintenance" ? 0.7 : 1 }}>
            {downloading === "maintenance" ? "Generando..." : "Descargar mantenimiento"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(["general", "maintenance"] as ReportType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setReportType(type)}
            style={{
              padding: "0.85rem 1.2rem",
              borderRadius: "0.85rem",
              border: reportType === type ? "1px solid rgba(96,165,250,0.7)" : "1px solid rgba(59,130,246,0.12)",
              color: reportType === type ? "#f0f4ff" : "#c7d2fe",
              background: reportType === type ? "rgba(37,99,235,0.16)" : "rgba(15,23,42,0.62)",
              cursor: "pointer",
              minWidth: 170,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {type === "general" ? "Reporte general" : "Reporte de mantenimiento"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatsCard icon={<span>📦</span>} label="Total Activos" value={stats?.totalAssets ?? "–"} color="#60a5fa" borderColor="#3b82f6" />
        <StatsCard icon={<span>👥</span>} label="Total Usuarios" value={stats?.totalUsers ?? "–"} color="#818cf8" borderColor="#6366f1" />
        <StatsCard icon={<span>🛠️</span>} label="Mantenimientos" value={stats?.totalMaintenances ?? "–"} color="#fbbf24" borderColor="#f59e0b" />
        <StatsCard icon={<span>🚨</span>} label="Alertas de garantía" value={stats?.warrantyAlerts ?? "–"} color="#f87171" borderColor="#ef4444" />
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <div style={{ background: "rgba(13,27,62,0.55)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "1rem", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#f0f4ff", marginBottom: "0.8rem" }}>Resumen de {reportType === "general" ? "inventario" : "mantenimientos"}</h2>

          {previewLoading ? (
            <p style={{ color: "#6b7280" }}>Cargando vista previa...</p>
          ) : !reportPreview ? (
            <p style={{ color: "#6b7280" }}>No se encontró información para este tipo de reporte.</p>
          ) : reportType === "general" ? (
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                {(reportPreview as GeneralReport).totalByCategory.map((item) => (
                  <div key={item.category} style={{ background: "rgba(15,36,96,0.65)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "0.85rem", padding: "1rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.4rem" }}>{categoryLabels[item.category] || item.category}</p>
                    <p style={{ fontSize: "1.35rem", fontWeight: 700, color: "#f0f4ff" }}>{item._count.category}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(15,36,96,0.65)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "0.85rem", padding: "1rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f0f4ff", marginBottom: "0.75rem" }}>Activos recientes</h3>
                {(reportPreview as GeneralReport).assets.slice(0, 4).map((asset) => (
                  <div key={asset.serialNumber} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
                    <div>
                      <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f0f4ff" }}>{asset.brand} {asset.model}</p>
                      <p style={{ fontSize: "0.78rem", color: "#6b7280" }}>{asset.serialNumber}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ color: "#9ca3af", fontSize: "0.78rem" }}>{asset.assignedTo?.name || "Sin asignar"}</p>
                      <p style={{ color: "#6b7280", fontSize: "0.78rem" }}>{new Date(asset.purchaseDate || "").toLocaleDateString("es-CO") || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                <div style={{ background: "rgba(15,36,96,0.65)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "0.85rem", padding: "1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.4rem" }}>Registros totales</p>
                  <p style={{ fontSize: "1.35rem", fontWeight: 700, color: "#f0f4ff" }}>{(reportPreview as MaintenanceReport).totalCount}</p>
                </div>
                <div style={{ background: "rgba(15,36,96,0.65)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "0.85rem", padding: "1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.4rem" }}>Costo total</p>
                  <p style={{ fontSize: "1.35rem", fontWeight: 700, color: "#f0f4ff" }}>{(reportPreview as MaintenanceReport).totalCost ?? "0.00"}</p>
                </div>
              </div>
              <div style={{ background: "rgba(15,36,96,0.65)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "0.85rem", padding: "1rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f0f4ff", marginBottom: "0.75rem" }}>Mantenimientos recientes</h3>
                {(reportPreview as MaintenanceReport).maintenances.slice(0, 4).map((item) => (
                  <div key={item.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f0f4ff" }}>{item.asset.brand} {item.asset.model}</p>
                    <p style={{ fontSize: "0.78rem", color: "#6b7280" }}>{labelForMaintenance(item.type)} · {new Date(item.maintenanceDate).toLocaleDateString("es-CO")}</p>
                    <p style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function labelForMaintenance(type: string) {
  return type === "PREVENTIVO" ? "Preventivo" : type === "CORRECTIVO" ? "Correctivo" : type;
}
