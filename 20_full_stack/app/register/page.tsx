"use client";

import { useState } from "react";
import Link from "next/link";

function IconEye({ show }: { show: boolean }) {
  return show ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

// ── Password strength helper ──────────────────────────────────────────
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: "", color: "#374151" };
  let score = 0;
  if (pw.length >= 8)            score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  const map = [
    { label: "Muy débil",  color: "#ef4444" },
    { label: "Débil",      color: "#f97316" },
    { label: "Regular",    color: "#f59e0b" },
    { label: "Fuerte",     color: "#10b981" },
    { label: "Muy fuerte", color: "#06b6d4" },
  ];
  return { score, ...map[score] };
}

// ═══════════════════════════════════════════════════════════════════════
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    companyKey: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = getPasswordStrength(form.password);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim())               errs.name       = "El nombre es requerido.";
    if (!form.email.includes("@"))       errs.email      = "Correo electrónico inválido.";
    if (!form.companyKey.trim())         errs.companyKey = "La Compañía Llave es requerida.";
    if (form.password.length < 8)        errs.password   = "Mínimo 8 caracteres.";
    if (form.password !== form.confirm)  errs.confirm    = "Las contraseñas no coinciden.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsLoading(true);
    // TODO: conectar con API de registro
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    setSuccess(true);
  }

  // ── Success screen ─────────────────────────────────────────────────
  if (success) {
    return (
      <div className="bg-mesh min-h-screen flex items-center justify-center px-6">
        <div
          className="glass-card animate-fade-in-up"
          style={{ borderRadius: "1.5rem", padding: "3rem 2.5rem", maxWidth: "420px", width: "100%", textAlign: "center" }}
        >
          <div
            style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
              color: "#34d399", fontSize: "2rem",
            }}
          >
            ✓
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f0f4ff", marginBottom: "0.75rem" }}>
            ¡Cuenta creada con éxito!
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "2rem", lineHeight: 1.7 }}>
            Tu cuenta ha sido registrada. Ya puedes iniciar sesión en el sistema de gestión de activos.
          </p>
          <Link href="/">
            <button className="btn-primary">Ir a iniciar sesión</button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Register form ──────────────────────────────────────────────────
  return (
    <div className="bg-mesh min-h-screen flex items-center justify-center px-6 py-12">
      <div style={{ width: "100%", maxWidth: "480px" }}>

        {/* Logo / back link */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <Link
            href="/"
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              color: "#9ca3af", fontSize: "0.875rem", textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f0f4ff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Volver al inicio
          </Link>

          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ background: "linear-gradient(135deg,#2563eb,#6366f1)", borderRadius: "8px", padding: "5px", boxShadow: "0 4px 12px rgba(37,99,235,0.35)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, color: "#f0f4ff" }}>
              Asset<span style={{ color: "#60a5fa" }}>IQ</span>
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card animate-fade-in-up" style={{ borderRadius: "1.5rem", padding: "2.5rem" }}>

          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#f0f4ff", marginBottom: "0.4rem" }}>
              Crear cuenta
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Regístrate con la llave de tu organización
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

            {/* Full name */}
            <div>
              <label htmlFor="reg-name" className="form-label">Nombre completo</label>
              <input
                id="reg-name"
                type="text"
                className="input-field"
                placeholder="Ingresa tu nombre"
                value={form.name}
                onChange={e => update("name", e.target.value)}
                autoComplete="name"
                style={errors.name ? { borderColor: "rgba(239,68,68,0.6)" } : {}}
              />
              {errors.name && <p style={{ color: "#fca5a5", fontSize: "0.78rem", marginTop: "0.3rem" }}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="form-label">Correo electrónico</label>
              <input
                id="reg-email"
                type="email"
                className="input-field"
                placeholder="usuario@empresa.com"
                value={form.email}
                onChange={e => update("email", e.target.value)}
                autoComplete="email"
                style={errors.email ? { borderColor: "rgba(239,68,68,0.6)" } : {}}
              />
              {errors.email && <p style={{ color: "#fca5a5", fontSize: "0.78rem", marginTop: "0.3rem" }}>{errors.email}</p>}
            </div>

            {/* Company Key – campo especial */}
            <div>
              <label htmlFor="reg-company-key" className="form-label">
                Compañía Llave
                <span
                  title="Clave de organización proporcionada por el administrador. Ver README del proyecto."
                  style={{ marginLeft: "0.4rem", color: "#6b7280", cursor: "help", fontWeight: 400 }}
                >
                  ⓘ
                </span>
              </label>
              <input
                id="reg-company-key"
                type="text"
                className="input-field"
                placeholder="Ej: CUC-2026"
                value={form.companyKey}
                onChange={e => update("companyKey", e.target.value.toUpperCase())}
                autoComplete="off"
                spellCheck={false}
                style={{
                  letterSpacing: "0.08em",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  ...(errors.companyKey ? { borderColor: "rgba(239,68,68,0.6)" } : {}),
                }}
              />
              {errors.companyKey ? (
                <p style={{ color: "#fca5a5", fontSize: "0.78rem", marginTop: "0.3rem" }}>{errors.companyKey}</p>
              ) : (
                <p style={{ color: "#4b5563", fontSize: "0.75rem", marginTop: "0.3rem" }}>
                  Clave provista por el administrador de TI de tu organización.
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="form-label">Contraseña</label>
              <div style={{ position: "relative" }}>
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={e => update("password", e.target.value)}
                  autoComplete="new-password"
                  style={{ paddingRight: "3rem", ...(errors.password ? { borderColor: "rgba(239,68,68,0.6)" } : {}) }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position:"absolute",right:"0.875rem",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#6b7280",transition:"color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#93c5fd")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
                  aria-label={showPassword ? "Ocultar" : "Mostrar"}>
                  <IconEye show={showPassword}/>
                </button>
              </div>

              {/* Strength meter */}
              {form.password.length > 0 && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "0.25rem" }}>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: "3px", borderRadius: "2px",
                        background: i < strength.score ? strength.color : "#1f2937",
                        transition: "background 0.3s",
                      }}/>
                    ))}
                  </div>
                  <p style={{ color: strength.color, fontSize: "0.75rem" }}>{strength.label}</p>
                </div>
              )}
              {errors.password && <p style={{ color: "#fca5a5", fontSize: "0.78rem", marginTop: "0.25rem" }}>{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="reg-confirm" className="form-label">Confirmar contraseña</label>
              <div style={{ position: "relative" }}>
                <input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  className="input-field"
                  placeholder="Repite tu contraseña"
                  value={form.confirm}
                  onChange={e => update("confirm", e.target.value)}
                  autoComplete="new-password"
                  style={{ paddingRight: "3rem", ...(errors.confirm ? { borderColor: "rgba(239,68,68,0.6)" } : form.confirm && form.confirm === form.password ? { borderColor: "rgba(16,185,129,0.5)" } : {}) }}
                />
                {/* Match indicator */}
                {form.confirm && form.confirm === form.password && (
                  <span style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#34d399" }}>
                    <IconCheck/>
                  </span>
                )}
                {form.confirm && form.confirm !== form.password && (
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position:"absolute",right:"0.875rem",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#6b7280",transition:"color 0.2s" }}
                    aria-label={showConfirm ? "Ocultar" : "Mostrar"}>
                    <IconEye show={showConfirm}/>
                  </button>
                )}
              </div>
              {errors.confirm && <p style={{ color: "#fca5a5", fontSize: "0.78rem", marginTop: "0.3rem" }}>{errors.confirm}</p>}
            </div>

            {/* Submit */}
            <button
              id="btn-register"
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ marginTop: "0.5rem", opacity: isLoading ? 0.75 : 1 }}
            >
              {isLoading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Creando cuenta...
                </span>
              ) : "Crear mi cuenta"}
            </button>
          </form>

          {/* Login redirect */}
          <div className="divider" style={{ margin: "1.75rem 0" }}>o</div>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/" style={{ color: "#60a5fa", fontWeight: 600, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
              Inicia sesión →
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
