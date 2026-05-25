"use client";

import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

const ROLE_OPTIONS = ["ADMIN", "TECHNICIAN", "EMPLOYEE"];

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyKey: string;
  createdAt: string;
  _count: { assets: number };
}

interface CurrentUser {
  role: string;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "EMPLOYEE",
    companyKey: "",
    password: "",
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(), 250);
    return () => clearTimeout(timeout);
  }, [search]);

  async function fetchCurrentUser() {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
      }
    } catch {
      setCurrentUser(null);
    }
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", email: "", role: "EMPLOYEE", companyKey: "", password: "" });
    setError("");
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setForm({ name: user.name, email: user.email, role: user.role, companyKey: user.companyKey, password: "" });
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const url = editing ? `/api/users/${editing.id}` : "/api/users";
      const method = editing ? "PUT" : "POST";
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        role: form.role,
      };

      if (!editing) {
        payload.companyKey = form.companyKey;
        if (form.password.trim()) payload.password = form.password.trim();
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Error al guardar el usuario.");
      } else {
        setModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      setError("Error de red al guardar el usuario.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "No se pudo eliminar el usuario.");
        return;
      }
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Error de red al eliminar el usuario.");
    }
  }

  const canManage = currentUser?.role === "ADMIN";

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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f0f4ff" }}>Usuarios</h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>Administración de responsables, perfiles y accesos.</p>
        </div>
        {canManage && (
          <button onClick={openCreate} className="btn-primary" style={{ width: "auto", padding: "0.65rem 1.3rem", fontSize: "0.9rem" }}>
            Nuevo Usuario
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        <input
          placeholder="Buscar nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 360 }}
        />
      </div>

      <div style={{ background: "rgba(13,27,62,0.55)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "1rem", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {['Nombre', 'Email', 'Rol', 'Activos', 'Creado', 'Acciones'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.85rem', fontSize: '0.73rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No hay usuarios registrados.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} style={{ transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.85rem', fontSize: '0.9rem', color: '#f0f4ff', fontWeight: 600 }}>{user.name}</td>
                  <td style={{ padding: '0.85rem', fontSize: '0.85rem', color: '#9ca3af' }}>{user.email}</td>
                  <td style={{ padding: '0.85rem' }}><StatusBadge status={user.role} /></td>
                  <td style={{ padding: '0.85rem', fontSize: '0.85rem', color: '#9ca3af' }}>{user._count.assets}</td>
                  <td style={{ padding: '0.85rem', fontSize: '0.85rem', color: '#9ca3af' }}>{new Date(user.createdAt).toLocaleDateString('es-CO')}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button onClick={() => openEdit(user)} title="Editar usuario" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0.45rem', padding: '0.45rem', cursor: 'pointer', color: '#60a5fa' }}>
                        Editar
                      </button>
                      {canManage && (
                        <button onClick={() => handleDelete(user.id)} title="Eliminar usuario" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.45rem', padding: '0.45rem', cursor: 'pointer', color: '#fca5a5' }}>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar usuario" : "Nuevo usuario"} size="md">
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.55rem', padding: '0.9rem 1rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.85rem' }}>{error}</div>}
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Nombre completo</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre" />
          </div>
          <div>
            <label style={labelStyle}>Correo electrónico</label>
            <input style={inputStyle} value={form.email} type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="usuario@empresa.com" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
            <div>
              <label style={labelStyle}>Rol</label>
              <select style={inputStyle} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            {!editing && (
              <div>
                <label style={labelStyle}>Compañía Llave</label>
                <input style={inputStyle} value={form.companyKey} onChange={(e) => setForm({ ...form, companyKey: e.target.value.toUpperCase() })} placeholder="Llave de la organización" />
              </div>
            )}
          </div>
          {!editing && (
            <div>
              <label style={labelStyle}>Contraseña inicial</label>
              <input style={inputStyle} type={form.password ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Opcional: contraseña inicial" />
            </div>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? "Guardando..." : editing ? "Actualizar usuario" : "Crear usuario"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
