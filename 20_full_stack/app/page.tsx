"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function IconServer() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
function IconWrench() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}
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

// ── Feature card data ─────────────────────────────────────────────────
const features = [
  {
    icon: <IconServer />,
    title: "Inventario Total",
    description: "Documenta marcas, modelos, números de serie y especificaciones técnicas de cada activo.",
    color: "rgba(37,99,235,0.12)",
    border: "rgba(37,99,235,0.3)",
    iconColor: "#60a5fa",
  },
  {
    icon: <IconShield />,
    title: "Control de Estado",
    description: "Monitorea si cada equipo está Asignado, En mantenimiento, En bodega o Dado de baja.",
    color: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.25)",
    iconColor: "#22d3ee",
  },
  {
    icon: <IconWrench />,
    title: "Mantenimientos",
    description: "Registra reparaciones correctivas y preventivas con historial completo por activo.",
    color: "rgba(99,102,241,0.1)",
    border: "rgba(99,102,241,0.25)",
    iconColor: "#a5b4fc",
  },
  {
    icon: <IconChart />,
    title: "Reportes PDF",
    description: "Genera informes ejecutivos en PDF con estadísticas de inventario y mantenimientos.",
    color: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
    iconColor: "#34d399",
  },
];

// ── Stats data ────────────────────────────────────────────────────────
const stats = [
  { value: "100%", label: "Trazabilidad" },
  { value: "0", label: "Hojas de cálculo" },
  { value: "∞", label: "Activos gestionables" },
];

// ═══════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Estado para manejar los delays de animación de forma segura en el cliente
  const [animationDelays, setAnimationDelays] = useState<string[]>(["0s", "0s", "0s"]);

  useEffect(() => {
    // Esto se ejecuta únicamente tras el montaje en el navegador
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnimationDelays([
      `${Math.random() * 1}s`,
      `${Math.random() * 1}s`,
      `${Math.random() * 1}s`
    ]);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Credenciales inválidas.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="bg-mesh min-h-screen">
      {/* ─── Navbar ─────────────────────────────────────────────────── */}
      <nav
        style={{
          background: "rgba(3,7,18,0.7)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(59,130,246,0.12)",
        }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              style={{
                background: "linear-gradient(135deg, #2563eb, #6366f1)",
                borderRadius: "10px",
                padding: "7px",
                boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em", color: "#f0f4ff" }}>
              Asset<span style={{ color: "#60a5fa" }}>IQ</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" style={{ color: "#9ca3af", fontSize: "0.875rem", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f0f4ff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}>
              Características
            </a>
            <a href="#login" style={{ color: "#9ca3af", fontSize: "0.875rem", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f0f4ff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}>
              Acceder
            </a>
            <Link href="/register">
              <button className="btn-ghost" style={{ padding: "0.45rem 1.1rem", fontSize: "0.85rem" }}>
                Registrarse
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero + Login section ───────────────────────────────────── */}
      <section className="min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-6 py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT – Hero content */}
            <div>
              {/* Badge */}
              <div className="badge badge-blue animate-fade-in-up mb-6" style={{ display: "inline-flex" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#60a5fa", animation: "pulse-glow 2s infinite" }}/>
                Plataforma Empresarial TI
              </div>

              {/* Headline */}
              <h1
                className="animate-fade-in-up delay-100"
                style={{
                  fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  color: "#f0f4ff",
                  marginBottom: "1.5rem",
                }}
              >
                Controla cada{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #60a5fa, #818cf8)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  activo tecnológico
                </span>{" "}
                de tu empresa
              </h1>

              {/* Subtitle */}
              <p
                className="animate-fade-in-up delay-200"
                style={{ color: "#9ca3af", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "480px", marginBottom: "2rem" }}
              >
                Suprime las hojas de cálculo manuales. Gestiona el ciclo de vida completo
                de tu hardware — desde la compra hasta la disposición final — con trazabilidad absoluta.
              </p>

              {/* Stats row */}
              <div className="animate-fade-in-up delay-300 flex gap-8 mb-10">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#60a5fa", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: "0.25rem" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Floating device mockup cards */}
              <div className="stat-grid animate-fade-in-up delay-400 hidden lg:flex gap-3 flex-wrap">
                {[
                  { label: "Laptops", count: "48", color: "#60a5fa" },
                  { label: "Servidores", count: "12", color: "#22d3ee" },
                  { label: "En mantenimiento", count: "3", color: "#f59e0b" },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className={`stat-card animate-float stat-card-${index + 1}`}
                  >
                    <div className="stat-card-value" style={{ color: item.color }}>{item.count}</div>
                    <div className="stat-card-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT – Login card */}
            <div id="login" className="animate-fade-in-up delay-200">
              <div
                className="glass-card animate-pulse-glow"
                style={{ borderRadius: "1.5rem", padding: "2.5rem", maxWidth: "440px", margin: "0 auto" }}
              >
                {/* Card header */}
                <div style={{ marginBottom: "2rem" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f0f4ff", marginBottom: "0.4rem" }}>
                    Iniciar sesión
                  </h2>
                  <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                    Accede al panel de gestión de activos
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: "0.5rem",
                      padding: "0.75rem 1rem",
                      marginBottom: "1.25rem",
                      color: "#fca5a5",
                      fontSize: "0.85rem",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <label htmlFor="email" className="form-label">Correo electrónico</label>
                    <input
                      id="email"
                      type="email"
                      className="input-field"
                      placeholder="usuario@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="input-field"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        style={{ paddingRight: "3rem" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute", right: "0.875rem", top: "50%",
                          transform: "translateY(-50%)", background: "none",
                          border: "none", cursor: "pointer", color: "#6b7280",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#93c5fd")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        <IconEye show={showPassword} />
                      </button>
                    </div>
                  </div>

                  {/* Forgot password */}
                  <div style={{ textAlign: "right", marginTop: "-0.5rem" }}>
                    <a
                      href="#"
                      style={{ color: "#60a5fa", fontSize: "0.8rem", fontWeight: 500, textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>

                  {/* Submit */}
                  <button
                    id="btn-login"
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.75 : 1 }}
                  >
                    {isLoading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                          style={{ animation: "spin 0.8s linear infinite" }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Ingresando...
                      </span>
                    ) : "Ingresar al sistema"}
                  </button>
                </form>

                {/* Divider */}
                <div className="divider" style={{ margin: "1.75rem 0" }}>o</div>

                {/* Register link */}
                <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>
                  ¿No tienes una cuenta?{" "}
                  <Link
                    href="/register"
                    style={{ color: "#60a5fa", fontWeight: 600, textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                  >
                    Regístrate aquí →
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Features section ───────────────────────────────────────── */}
      <section id="features" style={{ padding: "6rem 0" }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div className="badge badge-cyan" style={{ display: "inline-flex", marginBottom: "1rem" }}>
              Características principales
            </div>
            <h2 style={{ fontSize: "clamp(1.75rem,3.5vw,2.5rem)", fontWeight: 700, color: "#f0f4ff", marginBottom: "1rem" }}>
              Todo lo que necesitas para gestionar TI
            </h2>
            <p style={{ color: "#6b7280", maxWidth: "500px", margin: "0 auto", lineHeight: 1.7 }}>
              Una plataforma completa diseñada para eliminar la dependencia de herramientas
              manuales y optimizar el presupuesto tecnológico.
            </p>
          </div>

          {/* Feature grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  background: f.color,
                  border: `1px solid ${f.border}`,
                  borderRadius: "1.125rem",
                  padding: "1.75rem",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${f.border}`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: 48, height: 48, borderRadius: "0.75rem",
                    background: `${f.border}40`,
                    border: `1px solid ${f.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: f.iconColor, marginBottom: "1.25rem",
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 600, color: "#f0f4ff", marginBottom: "0.5rem" }}>{f.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.65 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─────────────────────────────────────────────── */}
      <section style={{ padding: "5rem 0" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(99,102,241,0.12))",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: "1.5rem",
              padding: "3rem 2rem",
            }}
          >
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 700, color: "#f0f4ff", marginBottom: "1rem" }}>
              ¿Listo para tomar el control de tu inventario?
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "2rem", lineHeight: 1.7 }}>
              Crea tu cuenta en segundos con la llave de tu organización y empieza a gestionar activos hoy.
            </p>
            <Link href="/register">
              <button
                className="btn-primary"
                style={{ width: "auto", padding: "0.85rem 2.5rem", fontSize: "1rem" }}
              >
                Crear cuenta gratis
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(59,130,246,0.1)",
          padding: "2rem",
          textAlign: "center",
          color: "#374151",
          fontSize: "0.8rem",
        }}
      >
        © {new Date().getFullYear()} AssetIQ · Gestión de Activos Tecnológicos
      </footer>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}