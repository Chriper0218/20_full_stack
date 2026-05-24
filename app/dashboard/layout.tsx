"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

interface User { name: string; email: string; role: string; }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setUser(d.user); setLoading(false); })
      .catch(() => { router.push("/"); });
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--brand-950)" }}>
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" style={{ animation:"spin 0.8s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <span style={{ color:"#6b7280",fontSize:"0.875rem" }}>Cargando panel...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"var(--brand-950)" }}>
      <Sidebar />
      <div style={{ flex:1,display:"flex",flexDirection:"column",minWidth:0 }}>
        <TopBar user={user} />
        <main style={{ flex:1,padding:"1.5rem",overflowX:"hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
