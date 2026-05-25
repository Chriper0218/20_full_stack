"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

const MAINT_TYPES = ["PREVENTIVO", "CORRECTIVO"];

interface AssetOption {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
}

interface MaintenanceRecord {
  id: string;
  type: string;
  description: string;
  performedBy: string | null;
  cost: string | null;
  maintenanceDate: string;
  asset: AssetOption;
}

interface CurrentUser {
  role: string;
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [form, setForm] = useState({
    assetId: "",
    type: "PREVENTIVO",
    description: "",
    cost: "",
    performedBy: "",
    maintenanceDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchAssets();
    fetchRecords();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchRecords(), 250);
    return () => clearTimeout(timeout);
  }, [search]);

  async function fetchCurrentUser() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok) setCurrentUser(data.user);
    } catch {
      setCurrentUser(null);
    }
  }

  async function fetchAssets() {
    try {
      const res = await fetch("/api/assets?limit=200");
      const data = await res.json();
      if (res.ok) {
        setAssets(data.assets || []);
      }
    } catch {
      setAssets([]);
    }
  }

  async function fetchRecords() {
    setLoading(true);
    try {
      const res = await fetch("/api/maintenance?limit=50");
      const data = await res.json();
      if (res.ok) {
        setRecords(data.maintenances || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function filteredRecords() {
    const term = search.trim().toLowerCase();
    if (!term) return records;
    return records.filter((item) =>
      item.asset.serialNumber.toLowerCase().includes(term) ||
      item.asset.brand.toLowerCase().includes(term) ||
      item.asset.model.toLowerCase().includes(term) ||
      item.type.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      (item.performedBy || "").toLowerCase().includes(term)
    );
  }

  function openCreate() {
    setEditing(null);
    setForm({ assetId: assets[0]?.id || "", type: "PREVENTIVO", description: "", cost: "", performedBy: "", maintenanceDate: new Date().toISOString().slice(0, 10) });
    setError("");
    setModalOpen(true);
  }

  function openEdit(record: MaintenanceRecord) {
    setEditing(record);
    setForm({
      assetId: record.asset.id,
      type: record.type,
      description: record.description,
      cost: record.cost || "",
      performedBy: record.performedBy || "",
      maintenanceDate: record.maintenanceDate.slice(0, 10),
    });
    setError("");
    setModalOpen(true);
  }

  async function saveRecord() {
    setSaving(true);
    setError("");

    if (!form.assetId || !form.description.trim()) {
      setError("Selecciona un activo y describe la intervención.");
      setSaving(false);
      return;
    }

    try {
      const url = editing ? `/api/maintenance/${editing.id}` : "/api/maintenance";
      const method = editing ? "PUT" : "POST";
      const payload = {
        assetId: form.assetId,
        type: form.type,
        description: form.description,
        cost: form.cost || undefined,
        performedBy: form.performedBy || undefined,
        maintenanceDate: form.maintenanceDate,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar el registro.");
      } else {
        setModalOpen(false);
        fetchRecords();
      }
    } catch (err) {
      console.error(err);
      setError("Error de red al guardar el mantenimiento.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este registro de mantenimiento?")) return;
    try {
      const response = await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "No se pudo eliminar el registro.");
        return;
      }
      fetchRecords();
    } catch (err) {
      console.error(err);
      alert("Error de red al eliminar el registro.");
    }
  }

  const isManager = currentUser?.role !== "EMPLOYEE";
  const filtered = filteredRecords();

  const labelStyle = {
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#93c5fd",
    marginBottom: "0.35rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.03em",
  };
  const inputStyle = {
    width: "100%",
    padding: "0.65rem 0.9rem",
    background: "rgba(15,36,96,0.35)",
    border: "1px solid rgba(59,130,246,0.25)",
    borderRadius: "0.55rem",
    color: "#f0f4ff",
    fontSize: "0.9rem",
    outline: "none",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f0f4ff" }}>Mantenimientos</h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>Agenda, registra y supervisa las intervenciones técnicas.</p>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ width: "auto", padding: "0.65rem 1.3rem", fontSize: "0.9rem" }}>
          Nuevo Registro
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        <input placeholder="Buscar activo, técnico o tipo..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 360 }} />
      </div>

      <div style={{ background: "rgba(13,27,62,0.55)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "1rem", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {['Activo', 'Tipo', 'Técnico', 'Costo', 'Fecha', 'Acciones'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.85rem', fontSize: '0.73rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No hay registros disponibles.</td></tr>
              ) : filtered.map((record) => (
                <tr key={record.id} style={{ transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.85rem', fontSize: '0.9rem', color: '#f0f4ff', fontWeight: 600 }}>{record.asset.brand} {record.asset.model}<br /><span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{record.asset.serialNumber}</span></td>
                  <td style={{ padding: '0.85rem' }}><StatusBadge status={record.type} /></td>
                  <td style={{ padding: '0.85rem', fontSize: '0.85rem', color: '#9ca3af' }}>{record.performedBy || 'Sin técnico'}</td>
                  <td style={{ padding: '0.85rem', fontSize: '0.85rem', color: '#f0f4ff' }}>{record.cost ? `$${parseFloat(record.cost).toLocaleString()}` : '—'}</td>
                  <td style={{ padding: '0.85rem', fontSize: '0.85rem', color: '#9ca3af' }}>{new Date(record.maintenanceDate).toLocaleDateString('es-CO')}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button onClick={() => openEdit(record)} title="Editar" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0.45rem', padding: '0.45rem', cursor: 'pointer', color: '#60a5fa' }}>
                        Editar
                      </button>
                      {isManager && (
                        <button onClick={() => handleDelete(record.id)} title="Eliminar" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.45rem', padding: '0.45rem', cursor: 'pointer', color: '#fca5a5' }}>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Actualizar mantenimiento" : "Registrar mantenimiento"} size="md">
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.55rem', padding: '0.9rem 1rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.85rem' }}>{error}</div>}
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Activo</label>
            <select style={inputStyle} value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })}>
              <option value="">Selecciona un activo</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>{`${asset.serialNumber} — ${asset.brand} ${asset.model}`}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select style={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {MAINT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fecha</label>
              <input type="date" style={inputStyle} value={form.maintenanceDate} onChange={(e) => setForm({ ...form, maintenanceDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea style={{ ...inputStyle, minHeight: 96, resize: 'vertical' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción del servicio" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
            <div>
              <label style={labelStyle}>Costo</label>
              <input style={inputStyle} type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <label style={labelStyle}>Realizado por</label>
              <input style={inputStyle} value={form.performedBy} onChange={(e) => setForm({ ...form, performedBy: e.target.value })} placeholder="Técnico o proveedor" />
            </div>
          </div>
          <button onClick={saveRecord} disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? "Guardando..." : editing ? "Actualizar" : "Registrar"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
