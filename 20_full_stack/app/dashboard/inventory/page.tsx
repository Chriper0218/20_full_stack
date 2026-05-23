"use client";
import { useEffect, useState, useCallback } from "react";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";

interface Asset {
  id: string; serialNumber: string; brand: string; model: string;
  category: string; status: string; purchaseDate: string | null; warrantyExpiry: string | null;
  assignedTo: { id: string; name: string; email: string } | null;
}

const catOpts = ["","LAPTOP","CELLPHONE","NETWORK_DEVICE","PRINTER","SERVER"];
const statOpts = ["","ASIGNADO","MANTENIMIENTO","BAJA","BODEGA"];
const catLabels: Record<string,string> = { LAPTOP:"Laptop",CELLPHONE:"Celular",NETWORK_DEVICE:"Dispositivo de Red",PRINTER:"Impresora",SERVER:"Servidor" };

export default function InventoryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statFilter, setStatFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [users, setUsers] = useState<{id:string;name:string}[]>([]);
  const [form, setForm] = useState({ serialNumber:"",brand:"",model:"",category:"LAPTOP",status:"BODEGA",purchaseDate:"",warrantyExpiry:"",userId:"" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAssets = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams({ page:String(page),limit:"15" });
    if (search) p.set("search", search);
    if (catFilter) p.set("category", catFilter);
    if (statFilter) p.set("status", statFilter);
    fetch(`/api/assets?${p}`)
      .then(r => r.json())
      .then(d => { setAssets(d.assets||[]); setTotal(d.total||0); setTotalPages(d.totalPages||1); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page, search, catFilter, statFilter]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);
  useEffect(() => { fetch("/api/users").then(r=>r.json()).then(d=>setUsers(d.users||[])).catch(()=>{}); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ serialNumber:"",brand:"",model:"",category:"LAPTOP",status:"BODEGA",purchaseDate:"",warrantyExpiry:"",userId:"" });
    setError("");
    setModalOpen(true);
  }

  function openEdit(a: Asset) {
    setEditing(a);
    setForm({
      serialNumber:a.serialNumber, brand:a.brand, model:a.model, category:a.category,
      status:a.status, purchaseDate:a.purchaseDate?.substring(0,10)||"",
      warrantyExpiry:a.warrantyExpiry?.substring(0,10)||"",
      userId:a.assignedTo?.id||"",
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true); setError("");
    const url = editing ? `/api/assets/${editing.id}` : "/api/assets";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error||"Error"); setSaving(false); return; }
    setSaving(false); setModalOpen(false); fetchAssets();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este activo?")) return;
    const res = await fetch(`/api/assets/${id}`, { method:"DELETE" });
    if (res.ok) fetchAssets();
    else { const d = await res.json(); alert(d.error||"Error al eliminar"); }
  }

  // Maintenance quick-assign
  const [maintModal, setMaintModal] = useState(false);
  const [maintAsset, setMaintAsset] = useState<Asset|null>(null);
  const [maintForm, setMaintForm] = useState({ type:"PREVENTIVO",description:"",cost:"",performedBy:"" });
  const [maintSaving, setMaintSaving] = useState(false);

  function openMaint(a: Asset) { setMaintAsset(a); setMaintForm({ type:"PREVENTIVO",description:"",cost:"",performedBy:"" }); setMaintModal(true); }

  async function saveMaint() {
    if (!maintAsset) return;
    setMaintSaving(true);
    await fetch("/api/maintenance", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ assetId:maintAsset.id, ...maintForm }) });
    setMaintSaving(false); setMaintModal(false); fetchAssets();
  }

  const inputStyle = { width:"100%",padding:"0.6rem 0.85rem",background:"rgba(15,36,96,0.35)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:"0.5rem",color:"#f0f4ff",fontSize:"0.85rem",outline:"none" };
  const labelStyle = { display:"block",fontSize:"0.78rem",fontWeight:600,color:"#93c5fd",marginBottom:"0.3rem",textTransform:"uppercase" as const,letterSpacing:"0.03em" };

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem",marginBottom:"1.5rem" }}>
        <div>
          <h1 style={{ fontSize:"1.5rem",fontWeight:700,color:"#f0f4ff" }}>Inventario</h1>
          <p style={{ color:"#6b7280",fontSize:"0.85rem" }}>{total} activo(s) registrado(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ width:"auto",padding:"0.6rem 1.5rem",fontSize:"0.85rem",display:"flex",alignItems:"center",gap:"0.4rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo Activo
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:"flex",gap:"0.75rem",flexWrap:"wrap",marginBottom:"1.25rem" }}>
        <input placeholder="Buscar serial, marca, responsable..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
          style={{ ...inputStyle,maxWidth:320 }} />
        <select value={catFilter} onChange={e=>{setCatFilter(e.target.value);setPage(1);}} style={{ ...inputStyle,maxWidth:180 }}>
          <option value="">Categoría</option>
          {catOpts.filter(Boolean).map(c => <option key={c} value={c}>{catLabels[c]}</option>)}
        </select>
        <select value={statFilter} onChange={e=>{setStatFilter(e.target.value);setPage(1);}} style={{ ...inputStyle,maxWidth:180 }}>
          <option value="">Estado</option>
          {statOpts.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background:"rgba(13,27,62,0.55)",border:"1px solid rgba(59,130,246,0.15)",borderRadius:"1rem",overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Serial","Marca","Modelo","Categoría","Estado","Responsable","Acciones"].map(h=>(
                  <th key={h} style={{ textAlign:"left",padding:"0.75rem",fontSize:"0.73rem",fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid rgba(59,130,246,0.1)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding:"3rem",textAlign:"center",color:"#6b7280" }}>Cargando...</td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:"3rem",textAlign:"center",color:"#6b7280" }}>No se encontraron activos.</td></tr>
              ) : assets.map(a => (
                <tr key={a.id} style={{ transition:"background 0.15s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(59,130,246,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"0.65rem 0.75rem",fontSize:"0.85rem",color:"#f0f4ff",fontWeight:600,fontFamily:"monospace" }}>{a.serialNumber}</td>
                  <td style={{ padding:"0.65rem 0.75rem",fontSize:"0.85rem",color:"#d1d5db" }}>{a.brand}</td>
                  <td className="hide-mobile" style={{ padding:"0.65rem 0.75rem",fontSize:"0.85rem",color:"#9ca3af" }}>{a.model}</td>
                  <td className="hide-mobile" style={{ padding:"0.65rem 0.75rem" }}><StatusBadge status={a.category.replace("_"," ")} /></td>
                  <td style={{ padding:"0.65rem 0.75rem" }}><StatusBadge status={a.status} /></td>
                  <td className="hide-mobile" style={{ padding:"0.65rem 0.75rem",fontSize:"0.83rem",color:"#9ca3af" }}>{a.assignedTo?.name||"—"}</td>
                  <td style={{ padding:"0.65rem 0.75rem" }}>
                    <div style={{ display:"flex",gap:"0.4rem" }}>
                      <button onClick={()=>openEdit(a)} title="Editar" style={{ background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:"0.4rem",padding:"0.35rem",cursor:"pointer",color:"#60a5fa",transition:"all 0.15s" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={()=>openMaint(a)} title="Mantenimiento" style={{ background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:"0.4rem",padding:"0.35rem",cursor:"pointer",color:"#fbbf24",transition:"all 0.15s" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                      </button>
                      <button onClick={()=>handleDelete(a.id)} title="Eliminar" style={{ background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"0.4rem",padding:"0.35rem",cursor:"pointer",color:"#fca5a5",transition:"all 0.15s" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:"flex",justifyContent:"center",gap:"0.5rem",padding:"1rem",borderTop:"1px solid rgba(59,130,246,0.1)" }}>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{ padding:"0.4rem 0.75rem",borderRadius:"0.4rem",fontSize:"0.8rem",fontWeight:600,cursor:"pointer",border:page===p?"1px solid rgba(59,130,246,0.4)":"1px solid transparent",background:page===p?"rgba(59,130,246,0.15)":"transparent",color:page===p?"#60a5fa":"#6b7280",transition:"all 0.15s" }}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editing?"Editar Activo":"Nuevo Activo"} size="md">
        {error && <div style={{ background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"0.5rem",padding:"0.6rem 0.85rem",marginBottom:"1rem",color:"#fca5a5",fontSize:"0.82rem" }}>{error}</div>}
        <div style={{ display:"flex",flexDirection:"column",gap:"0.9rem" }}>
          <div><label style={labelStyle}>Número de Serie</label><input style={inputStyle} value={form.serialNumber} onChange={e=>setForm({...form,serialNumber:e.target.value})} placeholder="LAP-001"/></div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem" }}>
            <div><label style={labelStyle}>Marca</label><input style={inputStyle} value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} placeholder="Dell"/></div>
            <div><label style={labelStyle}>Modelo</label><input style={inputStyle} value={form.model} onChange={e=>setForm({...form,model:e.target.value})} placeholder="Latitude 5420"/></div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem" }}>
            <div><label style={labelStyle}>Categoría</label><select style={inputStyle} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{catOpts.filter(Boolean).map(c=><option key={c} value={c}>{catLabels[c]}</option>)}</select></div>
            <div><label style={labelStyle}>Estado</label><select style={inputStyle} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{statOpts.filter(Boolean).map(s=><option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem" }}>
            <div><label style={labelStyle}>Fecha Compra</label><input type="date" style={inputStyle} value={form.purchaseDate} onChange={e=>setForm({...form,purchaseDate:e.target.value})}/></div>
            <div><label style={labelStyle}>Garantía hasta</label><input type="date" style={inputStyle} value={form.warrantyExpiry} onChange={e=>setForm({...form,warrantyExpiry:e.target.value})}/></div>
          </div>
          <div><label style={labelStyle}>Responsable</label><select style={inputStyle} value={form.userId} onChange={e=>setForm({...form,userId:e.target.value})}><option value="">Sin asignar</option>{users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ marginTop:"0.5rem",opacity:saving?0.7:1 }}>{saving?"Guardando...":editing?"Guardar cambios":"Crear activo"}</button>
        </div>
      </Modal>

      {/* Maintenance quick modal */}
      <Modal isOpen={maintModal} onClose={()=>setMaintModal(false)} title={`Mantenimiento — ${maintAsset?.serialNumber||""}`} size="md">
        <div style={{ display:"flex",flexDirection:"column",gap:"0.9rem" }}>
          <div><label style={labelStyle}>Tipo</label><select style={inputStyle} value={maintForm.type} onChange={e=>setMaintForm({...maintForm,type:e.target.value})}><option value="PREVENTIVO">Preventivo</option><option value="CORRECTIVO">Correctivo</option></select></div>
          <div><label style={labelStyle}>Descripción</label><textarea style={{ ...inputStyle,minHeight:80,resize:"vertical" }} value={maintForm.description} onChange={e=>setMaintForm({...maintForm,description:e.target.value})} placeholder="Describa el mantenimiento..."/></div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem" }}>
            <div><label style={labelStyle}>Costo</label><input type="number" style={inputStyle} value={maintForm.cost} onChange={e=>setMaintForm({...maintForm,cost:e.target.value})} placeholder="0.00"/></div>
            <div><label style={labelStyle}>Realizado por</label><input style={inputStyle} value={maintForm.performedBy} onChange={e=>setMaintForm({...maintForm,performedBy:e.target.value})} placeholder="Técnico"/></div>
          </div>
          <button onClick={saveMaint} disabled={maintSaving} className="btn-primary" style={{ marginTop:"0.5rem",opacity:maintSaving?0.7:1 }}>{maintSaving?"Registrando...":"Registrar mantenimiento"}</button>
        </div>
      </Modal>
    </div>
  );
}
