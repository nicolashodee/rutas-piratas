import { useState } from "react";
import { FONT_B64, TOPO_B64, HERO_B64 } from "./assets.js";

const SK_HIKES = "rp10_hikes";
const SK_REGS  = "rp10_regs";
const load = (k,fb) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):fb; } catch { return fb; } };
const persist = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} };

const DIFF = [
  { label:"Fácil",       color:"#2d7a3a", bg:"#eaf5ec" },
  { label:"Moderada",    color:"#7a6b00", bg:"#fdf8e1" },
  { label:"Difícil",     color:"#b04a00", bg:"#fff0e6" },
  { label:"Muy difícil", color:"#1a1a18", bg:"#e8e8e8" },
];





const CSS = `
@font-face { font-family:'Kara'; src:url('data:font/otf;base64,${FONT_B64}') format('opentype'); }
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

html,body,#root { margin:0; padding:0; height:100%; font-family:'DM Sans',sans-serif; color:#1a1a18; }
*,*::before,*::after { box-sizing:border-box; }

input,select,textarea {
  font-family:'DM Sans',sans-serif; font-size:15px; color:#1a1a18;
  background:#fff; border:1.5px solid #d8d4cc; border-radius:10px;
  padding:10px 14px; width:100%; outline:none;
  transition:border-color .18s,box-shadow .18s; display:block;
}
input:focus,select:focus,textarea:focus { border-color:#3a7a42; box-shadow:0 0 0 3px rgba(58,122,66,.1); }
input.err,select.err,textarea.err { border-color:#e53e3e!important; box-shadow:0 0 0 3px rgba(229,62,62,.1)!important; }
select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:36px; }
button { font-family:'DM Sans',sans-serif; cursor:pointer; border:none; background:none; }
a { color:inherit; text-decoration:none; }
::-webkit-scrollbar { width:5px; }
::-webkit-scrollbar-thumb { background:#ccc8c0; border-radius:3px; }
.kara { font-family:'Kara',serif; }

/* ── Shell ── */
.shell { display:flex; flex-direction:row; height:100vh; width:100vw; overflow:hidden; }

/* ── Sidebar ── */
.sidebar {
  width:220px; flex-shrink:0; background:#111;
  border-right:1px solid #222;
  display:flex; flex-direction:column;
  height:100vh; overflow-y:auto; position:relative;
}
.sidebar-topo {
  position:absolute; inset:0;
  background-image:url('data:image/png;base64,${TOPO_B64}');
  background-size:500px; opacity:.04; pointer-events:none;
}

/* ── Main ── */
.main-scroll {
  flex:1; overflow-y:auto; height:100vh;
  background:#f5f2ed; position:relative;
}
.main-scroll::after {
  content:''; position:absolute; inset:0;
  background-image:url('data:image/png;base64,${TOPO_B64}');
  background-size:900px; background-repeat:repeat;
  opacity:.025; pointer-events:none; z-index:0;
}
.main-scroll > * { position:relative; z-index:1; }

/* ── Nav ── */
.nav-item {
  display:flex; align-items:center; gap:12px;
  padding:13px 20px; width:100%; text-align:left;
  border-left:3px solid transparent;
  color:#666; font-size:14px; font-weight:400;
  transition:all .15s; cursor:pointer; position:relative; z-index:1;
}
.nav-item:hover { background:#1a1a1a; color:#ccc; }
.nav-item.active { border-left:3px solid #5db85d; color:#5db85d; background:#161616; font-weight:600; }

/* ── Mobile ── */
@media (max-width:680px) {
  .shell { flex-direction:column; }
  .sidebar {
    width:100%; height:auto; min-height:0;
    border-right:none; border-bottom:1px solid #222;
    flex-direction:row; overflow-x:auto; overflow-y:hidden; flex-shrink:0;
  }
  .sidebar-logo-block { display:none!important; }
  .sidebar-bottom { display:none!important; }
  .sidebar-nav { flex-direction:row!important; padding:0!important; gap:0!important; }
  .nav-item {
    flex-direction:column; gap:3px; padding:10px 12px; font-size:11px;
    border-left:none; border-bottom:3px solid transparent;
    flex:1; justify-content:center; align-items:center; white-space:nowrap; min-width:60px;
  }
  .nav-item:hover { background:#1a1a1a; }
  .nav-item.active { border-left:none; border-bottom:3px solid #5db85d; background:#161616; }
  .nav-icon { font-size:18px; }
  .main-scroll { flex:1; height:0; }
}

/* ── Animations ── */
@keyframes fadeUp { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
@keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
@keyframes scaleIn { from{opacity:0;transform:scale(.95);}to{opacity:1;transform:scale(1);} }
.fu { animation:fadeUp .28s ease both; }

/* ── Modals ── */
.overlay { position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:900; display:flex; align-items:center; justify-content:center; padding:16px; animation:fadeIn .15s ease; }
.modal { background:#fff; border-radius:18px; width:100%; max-width:420px; box-shadow:0 24px 64px rgba(0,0,0,.25); animation:scaleIn .18s ease; overflow:hidden; }
.modal-wide { max-width:660px; }

/* ── Hero page ── */
.hero-page {
  position:relative; width:100%; height:100%;
  background-image:url('data:image/png;base64,${HERO_B64}');
  background-size:cover; background-position:center;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  overflow:hidden;
}
.hero-overlay {
  position:absolute; inset:0;
  background:linear-gradient(to bottom, rgba(0,0,0,.35) 0%, rgba(0,0,0,.55) 60%, rgba(0,0,0,.8) 100%);
}
.hero-content { position:relative; z-index:1; text-align:center; padding:32px 24px; }

/* ── Hike card ── */
.hike-card {
  background:#fff; border-radius:16px; border:1px solid #e8e4dd;
  overflow:hidden; transition:box-shadow .15s,transform .15s; cursor:pointer;
}
.hike-card:hover { box-shadow:0 6px 24px rgba(0,0,0,.09); transform:translateY(-2px); }
.hike-card-header { position:relative; height:8px; }
.cal-icon {
  display:inline-flex; flex-direction:column; align-items:center;
  background:#fff; border:1.5px solid #e8e4dd; border-radius:10px;
  overflow:hidden; width:46px; flex-shrink:0;
}
.cal-icon-top { background:#1a1a18; width:100%; padding:3px 0; text-align:center; font-size:9px; color:#fff; letter-spacing:.08em; text-transform:uppercase; font-weight:600; }
.cal-icon-day { font-family:'Kara',serif; font-size:20px; color:#1a1a18; line-height:1.1; padding:2px 0 3px; }

/* ── Step form ── */
.step-bar { display:flex; gap:0; margin-bottom:24px; }
.step-seg { height:4px; flex:1; border-radius:2px; background:#f0ece6; transition:background .3s; }
.step-seg.done { background:#2d6e35; }
.step-seg.active { background:#5db85d; }
.step-tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
.step-tab { padding:7px 14px; border-radius:20px; font-size:13px; font-weight:500; border:1.5px solid #e0dbd3; color:#aaa; background:transparent; cursor:pointer; transition:all .15s; display:flex; align-items:center; gap:5px; }
.step-tab.done { border-color:#a8d5b0; color:#2d6e35; background:#eaf5ec; }
.step-tab.active { border-color:#2d6e35; color:#2d6e35; background:#fff; font-weight:600; }
`;

// ── Helpers ──────────────────────────────────────────────────────────────────
const maskName = (f,l) => `${f} ${l?.[0]??""}.`;
const fmtDate  = d => new Date(d).toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"});
const fmtDay   = d => new Date(d).getDate();
const fmtMonth = d => new Date(d).toLocaleDateString("es-ES",{month:"short"}).replace(".","").toUpperCase();
const isPast   = d => new Date(d) < new Date();
const waLink   = p => `https://wa.me/${(p||"").replace(/\D/g,"")}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const Btn = ({children,variant="primary",style,...p}) => (
  <button style={{
    borderRadius:10,padding:"10px 20px",fontSize:14,fontWeight:500,
    transition:"all .18s",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,lineHeight:1,
    ...(variant==="primary"    &&{background:"#2d6e35",color:"#fff"}),
    ...(variant==="outline"    &&{background:"transparent",color:"#2d6e35",border:"1.5px solid #2d6e35"}),
    ...(variant==="ghost"      &&{background:"transparent",color:"#777",border:"1.5px solid #e0dbd3"}),
    ...(variant==="danger"     &&{background:"#fff5f5",color:"#c0392b",border:"1.5px solid #e8c0bc"}),
    ...(variant==="soft-green" &&{background:"#eaf5ec",color:"#2d6e35",border:"1.5px solid #a8d5b0"}),
    ...style}} {...p}>{children}</button>
);
const Card = ({children,style}) => <div style={{background:"#fff",borderRadius:16,border:"1px solid #e8e4dd",...style}}>{children}</div>;
const Divider = ({style}) => <div style={{height:1,background:"#f0ece6",...style}} />;
const DiffBadge = ({label}) => { const d=DIFF.find(x=>x.label===label)||DIFF[1]; return <span style={{background:d.bg,color:d.color,borderRadius:20,padding:"3px 11px",fontSize:12,fontWeight:500,display:"inline-block"}}>{label}</span>; };
const WaBtn = ({phone}) => phone ? (
  <a href={waLink(phone)} target="_blank" rel="noreferrer"
    style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:13,color:"#128C7E",
      background:"#f0fdf8",border:"1px solid #c3e6d8",borderRadius:8,padding:"3px 10px",fontWeight:500,marginTop:3,textAlign:"left"}}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#128C7E" style={{flexShrink:0}}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.563 4.14 1.544 5.878L.057 23.25c-.07.299.015.611.224.82.208.208.52.293.82.224l5.372-1.487A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.823 9.823 0 01-5.012-1.37l-.36-.213-3.733 1.034 1.034-3.733-.213-.36A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
    </svg>
    {phone}
  </a>
) : null;

const Field = ({label,error,required,children,style}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5,...style}}>
    <label style={{fontSize:12,fontWeight:500,color:error?"#e53e3e":"#666",letterSpacing:".05em",textTransform:"uppercase",display:"block"}}>
      {label}{required&&<span style={{color:"#e53e3e",marginLeft:2}}>*</span>}
    </label>
    {children}
    {error&&<div style={{fontSize:12,color:"#e53e3e",marginTop:1}}>{error}</div>}
  </div>
);

// ── Modals ────────────────────────────────────────────────────────────────────
function ConfirmModal({message,onConfirm,onCancel}) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{padding:28,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
        <div style={{fontSize:15,color:"#333",lineHeight:1.6,marginBottom:24}}>{message}</div>
        <div style={{display:"flex",gap:10}}>
          <Btn variant="ghost" style={{flex:1}} onClick={onCancel}>Cancelar</Btn>
          <Btn variant="danger" style={{flex:1}} onClick={onConfirm}>Confirmar</Btn>
        </div>
      </div>
    </div>
  );
}

function IframeModal({route,onClose}) {
  if(!route)return null;
  const src=route.iframe?.match(/src=["']([^"']+)["']/)?.[1];
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",borderBottom:"1px solid #f0ece6"}}>
          <div>
            <div className="kara" style={{fontSize:17,letterSpacing:".04em"}}>{route.name}</div>
            <div style={{fontSize:12,color:"#aaa",marginTop:2,display:"flex",gap:12,textAlign:"left"}}>
              {route.distance&&<span>📏 {route.distance} km</span>}
              {route.elevation&&<span>⛰ +{route.elevation} m</span>}
            </div>
          </div>
          <button onClick={onClose} style={{fontSize:24,color:"#bbb",lineHeight:1,padding:"0 6px"}}>×</button>
        </div>
        <div style={{background:"#f5f5f3"}}>
          {src?<iframe src={src} width="100%" height="340" scrolling="no" frameBorder="0" style={{display:"block"}} title={route.name} />
            :<div style={{height:200,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,color:"#aaa"}}><div style={{fontSize:36}}>🗺</div><div style={{fontSize:13}}>No hay mapa configurado</div></div>}
        </div>
        <div style={{padding:"12px 20px",display:"flex",justifyContent:"flex-end"}}>
          <Btn variant="ghost" style={{fontSize:13,padding:"7px 16px"}} onClick={onClose}>Cerrar</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Hero page ─────────────────────────────────────────────────────────────────
function HeroPage({onEnter}) {
  return (
    <div className="hero-page">
      <div className="hero-overlay" />
      <div className="hero-content fu">
        <div style={{fontSize:52,marginBottom:16,filter:"grayscale(1) brightness(2)"}}>☠️</div>
        <div className="kara" style={{fontSize:48,color:"#fff",letterSpacing:".1em",lineHeight:1,marginBottom:8,
          textShadow:"0 2px 20px rgba(0,0,0,.6)"}}>
          RUTAS PIRATAS
        </div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.5)",letterSpacing:".2em",marginBottom:48,textTransform:"uppercase"}}>
          ⚓ Euskal Lurretan Abenturak
        </div>
        <button onClick={onEnter} style={{
          background:"transparent",border:"1.5px solid rgba(255,255,255,.6)",
          color:"#fff",borderRadius:12,padding:"14px 40px",
          fontSize:15,fontWeight:500,letterSpacing:".08em",
          fontFamily:"'Kara',serif",
          transition:"all .2s",cursor:"pointer",
          backdropFilter:"blur(4px)",
        }}
          onMouseEnter={e=>{e.target.style.background="rgba(255,255,255,.15)";e.target.style.borderColor="#fff";}}
          onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.borderColor="rgba(255,255,255,.6)";}}>
          COMENZAR
        </button>
      </div>
      {/* bottom gradient with attribution hint */}
      <div style={{position:"absolute",bottom:20,left:0,right:0,textAlign:"center",zIndex:1}}>
        <div style={{fontSize:10,color:"rgba(255,255,255,.2)",letterSpacing:".1em"}}>PAÍS VASCO · NAVARRA · LAPURDI</div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  {id:"hikes", icon:"🏕", label:"Expediciones"},
  {id:"admin", icon:"🏴‍☠️", label:"Capitán"},
];

function Sidebar({page,onNav,adminOk}) {
  const isActive = id => id===page||(id==="hikes"&&page==="detail");
  return (
    <aside className="sidebar">
      <div className="sidebar-topo" />
      <div className="sidebar-logo-block" style={{padding:"20px 20px 16px",borderBottom:"1px solid #222",position:"relative",zIndex:1}}>
        <button onClick={()=>onNav("home")} style={{display:"flex",flexDirection:"column",gap:6,width:"100%",textAlign:"left",cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:26,filter:"grayscale(1) brightness(1.8)"}}>☠️</span>
            <div className="kara" style={{fontSize:18,color:"#fff",letterSpacing:".1em",lineHeight:1}}>RUTAS PIRATAS</div>
          </div>
          <div style={{fontSize:10,color:"#444",letterSpacing:".12em",paddingLeft:2}}>⚓ EUSKAL LURRETAN ABENTURAK</div>
        </button>
      </div>
      <nav className="sidebar-nav" style={{display:"flex",flexDirection:"column",padding:"8px 0",flex:1,position:"relative",zIndex:1}}>
        {NAV.map(({id,icon,label})=>(
          <button key={id} className={`nav-item${isActive(id)?" active":""}`} onClick={()=>onNav(id)}>
            <span className="nav-icon" style={{fontSize:16}}>{icon}</span>
            <span>{label}</span>
            {id==="admin"&&adminOk&&<span style={{marginLeft:"auto",fontSize:10,color:"#5db85d",background:"rgba(93,184,93,.15)",borderRadius:8,padding:"1px 7px"}}>✓</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom" style={{padding:"14px 20px",borderTop:"1px solid #222",position:"relative",zIndex:1}}>
        <div style={{fontSize:10,color:"#333",letterSpacing:".12em",textTransform:"uppercase",textAlign:"center"}}>☠ RUTAS PIRATAS ☠</div>
      </div>
    </aside>
  );
}

// ── Admin login ───────────────────────────────────────────────────────────────
function AdminLogin({onUnlock}) {
  const [pwd,setPwd]=useState("");const [err,setErr]=useState(false);
  const try_=()=>pwd==="piratas2024"?onUnlock():setErr(true);
  return (
    <div style={{maxWidth:380,margin:"40px auto",padding:16}}>
      <Card style={{padding:28}}>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{fontSize:42,marginBottom:8}}>🏴‍☠️</div>
          <div className="kara" style={{fontSize:20,letterSpacing:".08em"}}>Acceso del Capitán</div>
          <div style={{color:"#888",fontSize:14,marginTop:5}}>Solo el organizador puede gestionar las rutas</div>
        </div>
        <Field label="Contraseña" error={err?"Contraseña incorrecta":""} required>
          <input type="password" placeholder="••••••••" value={pwd} onChange={e=>{setPwd(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&try_()} className={err?"err":""} />
        </Field>
        <Btn style={{width:"100%",marginTop:16}} onClick={try_}>Entrar</Btn>
        <div style={{color:"#bbb",fontSize:12,textAlign:"center",marginTop:12}}>Por defecto: <code style={{background:"#f5f2ed",padding:"1px 6px",borderRadius:4}}>piratas2024</code></div>
      </Card>
    </div>
  );
}

// ── Wikiloc guide ─────────────────────────────────────────────────────────────
function WikilocGuide() {
  const [open,setOpen]=useState(false);
  return (
    <div style={{marginTop:6}}>
      <button onClick={()=>setOpen(v=>!v)} style={{color:"#2d6e35",fontSize:13,padding:0}}>{open?"▲":"▼"} ¿Cómo obtener el iframe de Wikiloc?</button>
      {open&&<div style={{background:"#f8fdf8",border:"1px solid #c8e6cc",borderRadius:10,padding:14,marginTop:8,fontSize:13,color:"#444",lineHeight:1.8}}>
        <ol style={{paddingLeft:18}}>
          <li>Abre la ruta en <strong>wikiloc.com</strong> → <strong>"Compartir"</strong></li>
          <li>Selecciona <strong>"Insertar"</strong> o <strong>"Embed"</strong></li>
          <li>Copia el código <code style={{background:"#e8f5e9",padding:"1px 5px",borderRadius:3}}>&lt;iframe ...&gt;&lt;/iframe&gt;</code></li>
          <li>Pégalo en el campo de abajo</li>
        </ol>
        <div style={{marginTop:8,padding:"7px 10px",background:"#fff3cd",borderRadius:7,color:"#856404",fontSize:12}}>⚠ Puede no mostrarse en vista previa de Claude. Funciona en la app desplegada.</div>
      </div>}
    </div>
  );
}

// ── Route row ─────────────────────────────────────────────────────────────────
function RouteRow({route,idx,onChange,onRemove,canRemove,errors}) {
  const [open,setOpen]=useState(true);
  return (
    <div style={{border:"1px solid #e8e4dd",borderRadius:12,overflow:"hidden",marginBottom:10}}>
      <button onClick={()=>setOpen(v=>!v)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",background:"#fafaf8",textAlign:"left"}}>
        <div className="kara" style={{fontSize:14,color:"#555",letterSpacing:".04em"}}>{route.name||`Recorrido ${idx+1}`}</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {canRemove&&<span onClick={e=>{e.stopPropagation();onRemove();}} style={{fontSize:13,color:"#c0392b",padding:"2px 8px",border:"1px solid #e8c0bc",borderRadius:6}}>× Quitar</span>}
          <span style={{color:"#aaa",fontSize:12}}>{open?"▲":"▼"}</span>
        </div>
      </button>
      {open&&<div style={{padding:14,display:"flex",flexDirection:"column",gap:10}}>
        <Field label="Nombre del recorrido" error={errors?.name} required>
          <input placeholder="Ruta del Pico Norte" value={route.name} onChange={e=>onChange("name",e.target.value)} className={errors?.name?"err":""} />
        </Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Distancia (km)"><input type="number" placeholder="12" value={route.distance} onChange={e=>onChange("distance",e.target.value)} /></Field>
          <Field label="Desnivel (m)"><input type="number" placeholder="500" value={route.elevation} onChange={e=>onChange("elevation",e.target.value)} /></Field>
        </div>
        <Field label="Código iframe Wikiloc">
          <textarea rows={3} placeholder='<iframe src="https://es.wikiloc.com/..." ...></iframe>' value={route.iframe} onChange={e=>onChange("iframe",e.target.value)} style={{fontSize:12,fontFamily:"monospace"}} />
          <WikilocGuide />
        </Field>
      </div>}
    </div>
  );
}

// ── Step progress bar ─────────────────────────────────────────────────────────
function StepBar({current,total,labels}) {
  return (
    <div style={{marginBottom:24}}>
      <div className="step-bar">
        {Array.from({length:total}).map((_,i)=>(
          <div key={i} className={`step-seg${i<current?" done":i===current?" active":""}`}
            style={{marginRight:i<total-1?3:0}} />
        ))}
      </div>
      <div className="step-tabs">
        {labels.map((l,i)=>(
          <div key={i} className={`step-tab${i<current?" done":i===current?" active":""}`}>
            {i<current&&<span>✓</span>}{l}
          </div>
        ))}
      </div>
    </div>
  );
}

const STEP_LABELS = ["Información general","Punto de encuentro","Itinerarios"];

// ── Admin panel ───────────────────────────────────────────────────────────────
function AdminPanel({hikes,allRegs,onSave,onDeleteHike}) {
  const blankR={name:"",distance:"",elevation:"",iframe:""};
  const blank={id:null,title:"",date:"",difficulty:"Moderada",mapsUrl:"",mapsTime:"",maxParticipants:"",description:"",duration:"",transport:"car",transitStation:"",transitTime:"",routes:[{...blankR}]};
  const [form,setForm]=useState(blank);
  const [editing,setEditing]=useState(null);
  const [flash,setFlash]=useState(false);
  const [formOpen,setFormOpen]=useState(false);
  const [step,setStep]=useState(0);
  const [errors,setErrors]=useState({});
  const [confirmDel,setConfirmDel]=useState(null);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const setR=(i,k,v)=>set("routes",form.routes.map((r,j)=>j===i?{...r,[k]:v}:r));

  const validateStep=(s)=>{
    const e={};
    if(s===0){
      if(!form.title.trim())e.title="Campo obligatorio";
      if(!form.date)e.date="Campo obligatorio";
      if(!form.duration.trim())e.duration="Campo obligatorio";
    }
    if(s===1){
      if(!form.mapsUrl.trim())e.mapsUrl="Campo obligatorio";
      if(!form.mapsTime)e.mapsTime="Campo obligatorio";
      if(form.transport==="transit"&&!form.transitStation.trim())e.transitStation="Campo obligatorio";
      if(form.transport==="transit"&&!form.transitTime)e.transitTime="Campo obligatorio";
    }
    if(s===2){
      const re=form.routes.map(r=>r.name.trim()?{}:{name:"Campo obligatorio"});
      if(re.some(x=>x.name))e.routes=re;
    }
    return e;
  };

  const nextStep=()=>{
    const e=validateStep(step);
    if(Object.keys(e).length){setErrors(e);return;}
    setErrors({});setStep(s=>Math.min(s+1,2));
  };
  const prevStep=()=>{setErrors({});setStep(s=>Math.max(s-1,0));};

  const submit=()=>{
    const e=validateStep(2);
    if(Object.keys(e).length){setErrors(e);return;}
    setErrors({});
    onSave({...form,id:editing||Date.now()});
    setForm(blank);setEditing(null);setStep(0);
    setFlash(true);setTimeout(()=>setFlash(false),2500);setFormOpen(false);
  };

  const startEdit=h=>{
    setForm({...blank,...h,routes:h.routes?.length?h.routes:[{...blankR}]});
    setEditing(h.id);setErrors({});setStep(0);setFormOpen(true);
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const openNew=()=>{setForm(blank);setEditing(null);setErrors({});setStep(0);setFormOpen(true);};

  return (
    <div style={{maxWidth:680,margin:"0 auto",padding:"24px 20px 60px"}}>
      {confirmDel&&<ConfirmModal message="¿Eliminar esta ruta y todas sus inscripciones?" onConfirm={()=>{onDeleteHike(confirmDel);setConfirmDel(null);}} onCancel={()=>setConfirmDel(null)} />}
      {flash&&<div style={{background:"#eaf5ec",border:"1px solid #a8d5b0",borderRadius:10,padding:"12px 16px",marginBottom:16,color:"#2d6e35",fontWeight:500}}>✓ Ruta guardada</div>}

      {/* Form accordion */}
      <Card style={{marginBottom:20,overflow:"hidden"}}>
        <button onClick={()=>{if(!formOpen)openNew();else setFormOpen(false);}}
          style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px",textAlign:"left"}}>
          <div>
            <div className="kara" style={{fontSize:18,letterSpacing:".05em"}}>{editing?"✏ Editar ruta":"➕ Nueva ruta"}</div>
            {!formOpen&&<div style={{fontSize:13,color:"#aaa",marginTop:2}}>Haz clic para desplegar el formulario</div>}
          </div>
          <span style={{fontSize:18,color:"#aaa"}}>{formOpen?"▲":"▼"}</span>
        </button>

        {formOpen&&<div style={{padding:"0 22px 22px",borderTop:"1px solid #f0ece6"}} className="fu">
          <div style={{height:16}} />
          <StepBar current={step} total={3} labels={STEP_LABELS} />

          {/* Step 0: Info general */}
          {step===0&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Field label="Nombre de la ruta" error={errors.title} required>
                <input placeholder="El Gran Pico" value={form.title} onChange={e=>set("title",e.target.value)} className={errors.title?"err":""} />
              </Field>
              <Field label="Fecha" error={errors.date} required>
                <input type="date" value={form.date} onChange={e=>set("date",e.target.value)} className={errors.date?"err":""} />
              </Field>
              <Field label="Duración" error={errors.duration} required>
                <input placeholder="4–5 horas" value={form.duration} onChange={e=>set("duration",e.target.value)} className={errors.duration?"err":""} />
              </Field>
              <Field label="Máx. participantes">
                <input type="number" placeholder="Sin límite" value={form.maxParticipants} onChange={e=>set("maxParticipants",e.target.value)} />
              </Field>
            </div>
            <Field label="Dificultad" required>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:2}}>
                {DIFF.map(d=><button key={d.label} onClick={()=>set("difficulty",d.label)} style={{borderRadius:20,padding:"6px 14px",fontSize:13,fontWeight:500,background:form.difficulty===d.label?d.bg:"transparent",color:form.difficulty===d.label?d.color:"#aaa",border:`1.5px solid ${form.difficulty===d.label?d.color:"#e0dbd3"}`,transition:"all .15s"}}>{d.label}</button>)}
              </div>
            </Field>
            <Field label="Descripción / Notas">
              <textarea rows={2} placeholder="Equipamiento recomendado..." value={form.description} onChange={e=>set("description",e.target.value)} />
            </Field>
          </div>}

          {/* Step 1: Punto de encuentro */}
          {step===1&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Field label="Punto de inicio — enlace Google Maps" error={errors.mapsUrl} required>
              <input placeholder="https://maps.google.com/?q=40.4153,-3.7074" value={form.mapsUrl} onChange={e=>set("mapsUrl",e.target.value)} className={errors.mapsUrl?"err":""} />
              <div style={{fontSize:12,color:"#aaa",marginTop:4}}>Clic derecho en Maps → "¿Qué hay aquí?" → copiar enlace</div>
            </Field>
            <Field label="Hora de cita — punto de inicio" error={errors.mapsTime} required>
              <input type="time" value={form.mapsTime} onChange={e=>set("mapsTime",e.target.value)} className={errors.mapsTime?"err":""} style={{maxWidth:160}} />
            </Field>
            <Field label="¿Cómo se llega?" required>
              <div style={{display:"flex",gap:10,marginTop:2}}>
                {[{val:"car",label:"🚗 En coche"},{val:"transit",label:"🚌 Transporte público"}].map(({val,label})=>(
                  <button key={val} onClick={()=>set("transport",val)} style={{flex:1,padding:"10px",borderRadius:10,fontSize:14,fontWeight:500,background:form.transport===val?"#1a1a18":"transparent",color:form.transport===val?"#fff":"#aaa",border:`1.5px solid ${form.transport===val?"#1a1a18":"#e0dbd3"}`,transition:"all .15s"}}>{label}</button>
                ))}
              </div>
            </Field>
            {form.transport==="transit"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <Field label="Estación / Parada" error={errors.transitStation} required>
                <input placeholder="Metro Sol, línea 1" value={form.transitStation} onChange={e=>set("transitStation",e.target.value)} className={errors.transitStation?"err":""} />
              </Field>
              <Field label="Hora de cita transporte" error={errors.transitTime} required>
                <input type="time" value={form.transitTime} onChange={e=>set("transitTime",e.target.value)} className={errors.transitTime?"err":""} />
              </Field>
            </div>}
          </div>}

          {/* Step 2: Itinerarios */}
          {step===2&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div>
                <div className="kara" style={{fontSize:16,letterSpacing:".05em"}}>Recorridos propuestos</div>
                <div style={{fontSize:13,color:"#888",marginTop:2}}>Los participantes votarán su preferido</div>
              </div>
              <Btn variant="ghost" style={{fontSize:13,padding:"7px 14px"}} onClick={()=>set("routes",[...form.routes,{...blankR}])}>+ Añadir</Btn>
            </div>
            {form.routes.map((r,i)=><RouteRow key={i} route={r} idx={i} onChange={(k,v)=>setR(i,k,v)} onRemove={()=>set("routes",form.routes.filter((_,j)=>j!==i))} canRemove={form.routes.length>1} errors={errors.routes?.[i]} />)}
          </div>}

          {/* Step nav */}
          <div style={{display:"flex",gap:10,marginTop:24,paddingTop:16,borderTop:"1px solid #f0ece6"}}>
            {step>0&&<Btn variant="ghost" onClick={prevStep}>← Anterior</Btn>}
            {step<2&&<Btn style={{flex:1}} onClick={nextStep}>Siguiente →</Btn>}
            {step===2&&<>
              <Btn style={{flex:1}} onClick={submit}>{editing?"Actualizar ruta":"Crear ruta"}</Btn>
              {editing&&<Btn variant="ghost" onClick={()=>{setForm(blank);setEditing(null);setStep(0);setErrors({});}}>Cancelar</Btn>}
            </>}
          </div>
        </div>}
      </Card>

      {/* Existing hikes */}
      {hikes.length>0&&<Card style={{overflow:"hidden"}}>
        <div style={{padding:"18px 22px 12px"}}><div className="kara" style={{fontSize:17,letterSpacing:".05em"}}>Rutas gestionadas</div></div>
        {hikes.map((h,i)=>(
          <div key={h.id}>
            {i>0&&<Divider />}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 22px"}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,color:isPast(h.date)?"#aaa":"#1a1a18"}}>{h.title}</div>
                <div style={{fontSize:13,color:"#aaa",marginTop:2}}>{fmtDate(h.date)} · {(allRegs[h.id]||[]).length} inscritos</div>
              </div>
              <Btn variant="ghost" style={{padding:"6px 12px",fontSize:13}} onClick={()=>startEdit(h)}>Editar</Btn>
              <Btn variant="danger" style={{padding:"6px 12px",fontSize:13}} onClick={()=>setConfirmDel(h.id)}>Eliminar</Btn>
            </div>
          </div>
        ))}
      </Card>}
    </div>
  );
}

// ── Hike card ─────────────────────────────────────────────────────────────────
function HikeCard({h,count,onSelect}) {
  const full = h.maxParticipants&&count>=parseInt(h.maxParticipants);
  const old  = isPast(h.date);
  const diff = DIFF.find(x=>x.label===h.difficulty)||DIFF[1];

  return (
    <div className="hike-card" onClick={()=>!old&&onSelect(h.id)} style={{opacity:old?.55:1,cursor:old?"default":"pointer"}}>
      {/* Color bar top */}
      <div style={{height:4,background:old?"#ccc":diff.color,opacity:old?.5:1}} />

      <div style={{padding:"18px 20px"}}>
        <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
          {/* Calendar icon */}
          <div className="cal-icon">
            <div className="cal-icon-top">{fmtMonth(h.date)}</div>
            <div className="cal-icon-day">{fmtDay(h.date)}</div>
          </div>

          {/* Content */}
          <div style={{flex:1,minWidth:0}}>
            <div className="kara" style={{fontSize:18,letterSpacing:".04em",marginBottom:6,lineHeight:1.2}}>{h.title}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center",marginBottom:8}}>
              <DiffBadge label={h.difficulty} />
              {h.duration&&<span style={{fontSize:13,fontWeight:600,color:"#1a1a18",background:"#f0ede8",borderRadius:20,padding:"3px 10px"}}>⏱ {h.duration}</span>}
              {h.routes?.length>1&&<span style={{fontSize:12,color:"#7a6b00",background:"#fdf8e1",borderRadius:20,padding:"2px 9px"}}>🗳 {h.routes.length} recorridos</span>}
              {h.transport==="transit"&&<span style={{fontSize:12,color:"#4a6fa5",background:"#f0f4ff",borderRadius:20,padding:"2px 9px"}}>🚌 TTPÚB</span>}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:13,color:full?"#c0392b":"#2d6e35",fontWeight:500}}>
                {old?"Expedición finalizada":full?"🔴 Completa":"→ Ver e inscribirse"}
              </div>
              <div style={{textAlign:"right"}}>
                <span className="kara" style={{fontSize:22,color:full?"#c0392b":"#2d6e35",lineHeight:1}}>{count}</span>
                <span style={{fontSize:12,color:"#aaa",marginLeft:4}}>{h.maxParticipants?`/ ${h.maxParticipants}`:"piratas"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hike list ─────────────────────────────────────────────────────────────────
function HikeList({hikes,allRegs,onSelect}) {
  const [showPast,setShowPast]=useState(false);
  const upcoming=hikes.filter(h=>!isPast(h.date));
  const past=hikes.filter(h=>isPast(h.date));
  if(hikes.length===0) return (
    <div style={{maxWidth:520,margin:"80px auto",padding:16,textAlign:"center"}}>
      <div style={{fontSize:52,marginBottom:16}}>⛰️</div>
      <div className="kara" style={{fontSize:22,letterSpacing:".06em",marginBottom:8}}>Sin rutas programadas</div>
      <div style={{color:"#888"}}>El capitán aún no ha trazado el rumbo.</div>
    </div>
  );
  return (
    <div style={{maxWidth:640,margin:"0 auto",padding:"28px 20px 60px"}}>
      <div style={{fontSize:11,color:"#aaa",letterSpacing:".12em",textTransform:"uppercase",marginBottom:14}}>Próximas expediciones</div>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:28}}>
        {upcoming.length>0?upcoming.map(h=><HikeCard key={h.id} h={h} count={(allRegs[h.id]||[]).length} onSelect={onSelect} />)
          :<div style={{color:"#aaa",fontSize:14}}>No hay rutas próximas programadas.</div>}
      </div>
      {past.length>0&&<>
        <button onClick={()=>setShowPast(v=>!v)} style={{color:"#aaa",fontSize:13,padding:0,marginBottom:12}}>{showPast?"▲":"▼"} Rutas pasadas ({past.length})</button>
        {showPast&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{past.slice().reverse().map(h=><HikeCard key={h.id} h={h} count={(allRegs[h.id]||[]).length} onSelect={onSelect} />)}</div>}
      </>}
    </div>
  );
}

// ── Vote results ──────────────────────────────────────────────────────────────
function VoteResults({routes,regs,onRouteClick}) {
  const counts={};
  routes.forEach(r=>{counts[r.name]=0;});
  regs.forEach(r=>{if(r.routeVote&&counts[r.routeVote]!==undefined)counts[r.routeVote]++;});
  const maxV=Math.max(...Object.values(counts),1);
  const top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0];
  const totalV=Object.values(counts).reduce((a,b)=>a+b,0);
  return (
    <div>
      {routes.map(r=>{
        const votes=counts[r.name]||0;
        const pct=totalV>0?Math.round((votes/maxV)*100):0;
        const isTop=r.name===top&&votes>0;
        return (
          <div key={r.name} style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                <span style={{flexShrink:0}}>{isTop?"🏆":"🗺"}</span>
                <span style={{fontWeight:isTop?600:400,fontSize:14}}>{r.name}</span>
                {(r.distance||r.elevation)&&<span style={{fontSize:12,color:"#aaa"}}>{r.distance&&`${r.distance}km`}{r.distance&&r.elevation&&" · "}{r.elevation&&`+${r.elevation}m`}</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <span style={{fontSize:13,color:isTop?"#2d6e35":"#888",fontWeight:isTop?600:400}}>{votes} voto{votes!==1?"s":""}</span>
                <button onClick={()=>onRouteClick(r)} style={{background:"#f5f2ed",border:"1px solid #e0dbd3",borderRadius:8,padding:"4px 10px",fontSize:12,color:"#555",cursor:"pointer"}}>🗺 Ver</button>
              </div>
            </div>
            <div style={{height:7,background:"#f0ece6",borderRadius:8,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:isTop?"#2d6e35":"#b8d4bb",borderRadius:8,transition:"width .6s ease"}} />
            </div>
          </div>
        );
      })}
      {totalV===0&&<div style={{fontSize:13,color:"#bbb",textAlign:"center",padding:"8px 0"}}>Aún no hay votos</div>}
    </div>
  );
}

// ── Hike detail ───────────────────────────────────────────────────────────────
function HikeDetail({hike,regs,onRegister,onDeleteReg,onJoinCar,onLeaveCar,onBack}) {
  const [step,setStep]=useState("info");
  const [form,setForm]=useState({firstName:"",lastName:"",phone:"",hasCar:null,seats:"",routeVote:"",carpoolJoin:undefined});
  const [myRegId,setMyRegId]=useState(null);
  const [flash,setFlash]=useState(false);
  const [errors,setErrors]=useState({});
  const [modalRoute,setModalRoute]=useState(null);
  const [confirmDel,setConfirmDel]=useState(null);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const routes=hike.routes||[];
  const isFull=hike.maxParticipants&&regs.length>=parseInt(hike.maxParticipants);
  const past=isPast(hike.date);
  const myReg=regs.find(r=>r.id===myRegId);
  const myCarReg=myReg?.joinedCarId?regs.find(r=>r.id===myReg.joinedCarId):null;
  const driversWithSeats=regs.filter(r=>{const m=r.members?.[0]||r;if(!m.hasCar||!parseInt(m.seats||0))return false;return parseInt(m.seats||0)>regs.filter(p=>p.joinedCarId===r.id).length;});
  const validate=()=>{const e={};if(!form.firstName.trim())e.firstName="Campo obligatorio";if(!form.lastName.trim())e.lastName="Campo obligatorio";if(form.hasCar===null)e.hasCar="Indica si tienes coche";if(routes.length>1&&!form.routeVote)e.routeVote="Elige tu recorrido preferido";return e;};
  const submitForm=()=>{
    const e=validate();if(Object.keys(e).length){setErrors(e);return;}setErrors({});
    const newId=Date.now();
    onRegister({id:newId,registeredAt:new Date().toISOString(),members:[{firstName:form.firstName,lastName:form.lastName,phone:form.phone,hasCar:form.hasCar,seats:form.seats}],routeVote:form.routeVote||(routes[0]?.name??""),joinedCarId:form.carpoolJoin||null});
    setMyRegId(newId);setForm({firstName:"",lastName:"",phone:"",hasCar:null,seats:"",routeVote:"",carpoolJoin:undefined});setStep("info");setFlash(true);setTimeout(()=>setFlash(false),4000);
  };
  const handleJoinCar=carId=>{if(!myRegId)return;onJoinCar(myRegId,carId);};
  const handleLeaveCar=()=>{if(!myReg?.joinedCarId)return;onLeaveCar(myRegId);};
  const doDelete=()=>{onDeleteReg(confirmDel.id);if(confirmDel.id===myRegId)setMyRegId(null);setConfirmDel(null);};

  return (
    <div style={{maxWidth:640,margin:"0 auto",padding:"24px 20px 80px"}} className="fu">
      <IframeModal route={modalRoute} onClose={()=>setModalRoute(null)} />
      {confirmDel&&<ConfirmModal message={`¿Desapuntar a ${confirmDel.name}?`} onConfirm={doDelete} onCancel={()=>setConfirmDel(null)} />}
      <button onClick={onBack} style={{color:"#888",fontSize:14,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← Volver</button>

      {/* Header */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:10}}>
          <h1 className="kara" style={{fontSize:26,letterSpacing:".04em",lineHeight:1.2}}>{hike.title}</h1>
          <DiffBadge label={hike.difficulty} />
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
          <span style={{fontSize:14,color:"#555"}}>📅 {fmtDate(hike.date)}</span>
          {hike.duration&&<span style={{fontSize:15,fontWeight:700,color:"#1a1a18",background:"#ede8e1",borderRadius:20,padding:"4px 14px"}}>⏱ {hike.duration}</span>}
        </div>
      </div>

      {step==="info"&&<>
        {flash&&<div style={{background:"#eaf5ec",border:"1px solid #a8d5b0",borderRadius:10,padding:"12px 16px",marginBottom:16,color:"#2d6e35",fontWeight:500}}>✓ ¡Inscripción confirmada! Hasta la aventura.</div>}
        <Card style={{marginBottom:14,padding:20}}>
          {hike.description&&<><p style={{color:"#555",lineHeight:1.7,fontSize:15,marginBottom:14}}>{hike.description}</p><Divider style={{marginBottom:14}} /></>}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {hike.mapsUrl&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:14,fontWeight:500}}>📍 Punto de inicio</div>
                {hike.mapsTime&&<div style={{fontSize:13,color:"#555",marginTop:3}}>🕐 Cita: <strong>{hike.mapsTime}</strong></div>}
              </div>
              <a href={hike.mapsUrl} target="_blank" rel="noreferrer"><Btn variant="outline" style={{fontSize:13,padding:"7px 14px"}}>Ver en Maps</Btn></a>
            </div>}
            {hike.transport==="transit"&&<div style={{background:"#f0f4ff",borderRadius:10,padding:"12px 14px",textAlign:"left"}}>
              <div style={{fontSize:14,fontWeight:600,color:"#4a6fa5",marginBottom:4}}>🚌 Transporte público</div>
              {hike.transitStation&&<div style={{fontSize:14,color:"#555"}}>📍 {hike.transitStation}</div>}
              {hike.transitTime&&<div style={{fontSize:14,color:"#555",marginTop:3}}>🕐 Cita: <strong>{hike.transitTime}</strong></div>}
            </div>}
          </div>
        </Card>

        {myReg&&myCarReg&&(()=>{const dm=myCarReg.members?.[0]||myCarReg;return(
          <div style={{background:"#f4fbf5",border:"1.5px solid #2d6e35",borderRadius:12,padding:"12px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
            <div style={{textAlign:"left"}}><div style={{fontWeight:600,color:"#2d6e35",fontSize:14}}>🚗 Vas en el coche de {maskName(dm.firstName,dm.lastName)}</div><WaBtn phone={dm.phone} /></div>
            <Btn variant="danger" style={{fontSize:13,padding:"7px 14px"}} onClick={handleLeaveCar}>Salir del coche</Btn>
          </div>
        );})()}

        {routes.length>0&&<Card style={{marginBottom:14,padding:20}}>
          <div className="kara" style={{fontSize:16,letterSpacing:".05em",marginBottom:14}}>Recorridos propuestos</div>
          <VoteResults routes={routes} regs={regs} onRouteClick={setModalRoute} />
        </Card>}

        <Card style={{marginBottom:14,padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
            <div className="kara" style={{fontSize:16,letterSpacing:".05em"}}>
              Tripulación <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:400,color:"#888"}}>{regs.length}{hike.maxParticipants?` / ${hike.maxParticipants}`:""} piratas</span>
            </div>
          </div>
          {regs.length===0?<div style={{color:"#ccc",fontSize:14,textAlign:"center",padding:"16px 0"}}>¡Sé el primero en apuntarse!</div>
          :<div>{(()=>{
            const driverRegs=regs.filter(r=>!!(r.members?.[0]||r).hasCar);
            const loneRegs=regs.filter(r=>{const m=r.members?.[0]||r;return !m.hasCar&&!r.joinedCarId;});
            return [...driverRegs,...loneRegs].map((reg,i)=>{
              const m=reg.members?.[0]||reg;const isMe=reg.id===myRegId;
              const passengers=regs.filter(r=>r.joinedCarId===reg.id);
              const freeSeats=parseInt(m.seats||0)-passengers.length;
              const canJoin=!!m.hasCar&&!isMe&&freeSeats>0&&myReg&&!myReg.joinedCarId&&!(myReg.members?.[0]||myReg).hasCar;
              return (
                <div key={reg.id} style={{padding:"11px 0",borderBottom:"1px solid #f5f2ee"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:isMe?"#eaf5ec":"#f0ede8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:isMe?"#2d6e35":"#888",flexShrink:0,fontWeight:isMe?700:400,marginTop:1}}>{i+1}</div>
                    <div style={{flex:1,minWidth:0,textAlign:"left"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                        <span style={{fontWeight:500,fontSize:15}}>{maskName(m.firstName,m.lastName)}</span>
                        {isMe&&<span style={{fontSize:11,color:"#2d6e35",background:"#eaf5ec",borderRadius:10,padding:"1px 8px"}}>tú</span>}
                        {!!m.hasCar&&<span style={{fontSize:12,color:freeSeats>0?"#2d7a3a":"#999",background:freeSeats>0?"#eaf5ec":"#f5f5f5",borderRadius:10,padding:"2px 9px",whiteSpace:"nowrap"}}>🚗 {freeSeats>0?`+${freeSeats} plaza${freeSeats!==1?"s":""}`:"completo"}</span>}
                      </div>
                      <WaBtn phone={m.phone} />
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      {canJoin&&<Btn variant="soft-green" style={{fontSize:12,padding:"5px 10px"}} onClick={()=>handleJoinCar(reg.id)}>Subirme</Btn>}
                      <button onClick={()=>setConfirmDel({id:reg.id,name:maskName(m.firstName,m.lastName)})} style={{color:"#d0ccc5",fontSize:19,padding:"0 4px",lineHeight:1,transition:"color .15s"}} onMouseEnter={e=>e.target.style.color="#c0392b"} onMouseLeave={e=>e.target.style.color="#d0ccc5"}>×</button>
                    </div>
                  </div>
                  {passengers.length>0&&<div style={{paddingLeft:36,marginTop:5}}>
                    {passengers.map(p=>{const pm=p.members?.[0]||p;return(
                      <div key={p.id} style={{display:"flex",alignItems:"center",gap:7,fontSize:13,color:"#777",marginTop:4,textAlign:"left"}}>
                        <span style={{color:"#b8d4bb",fontSize:11}}>└</span><span>{maskName(pm.firstName,pm.lastName)}</span>
                        {p.id===myRegId&&<span style={{fontSize:11,color:"#2d6e35",background:"#eaf5ec",borderRadius:10,padding:"1px 6px"}}>tú</span>}
                        <WaBtn phone={pm.phone} />
                      </div>
                    );})}
                  </div>}
                </div>
              );
            });
          })()}</div>}
        </Card>

        {!past&&(isFull
          ?<Card style={{textAlign:"center",padding:24}}><div style={{fontSize:28,marginBottom:8}}>⚓</div><div className="kara" style={{fontSize:18,color:"#c0392b"}}>Ruta completa</div></Card>
          :<div style={{display:"flex",gap:10}}>
            {myRegId
              ?<><div style={{flex:1,background:"#eaf5ec",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}><span>✓</span><div><div style={{fontWeight:600,color:"#2d6e35",fontSize:14}}>Estás inscrito</div><div style={{fontSize:12,color:"#7a9e7e"}}>Usa "Subirme" para unirte a un coche</div></div></div><Btn variant="danger" style={{padding:"14px 16px"}} onClick={()=>setConfirmDel({id:myRegId,name:"tu inscripción"})}>Desapuntarme</Btn></>
              :<Btn style={{width:"100%",padding:"14px",fontSize:15}} onClick={()=>setStep("form")}>Inscribirme en esta ruta →</Btn>
            }
          </div>
        )}
      </>}

      {step==="form"&&<Card style={{padding:24}} className="fu">
        <div className="kara" style={{fontSize:20,letterSpacing:".05em",marginBottom:4}}>Tu inscripción</div>
        <div style={{color:"#888",fontSize:14,marginBottom:20}}>Confirma tu lugar en la expedición</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <Field label="Nombre" error={errors.firstName} required><input placeholder="Ana" value={form.firstName} onChange={e=>set("firstName",e.target.value)} className={errors.firstName?"err":""} /></Field>
          <Field label="Apellido" error={errors.lastName} required><input placeholder="García" value={form.lastName} onChange={e=>set("lastName",e.target.value)} className={errors.lastName?"err":""} /></Field>
          <div style={{gridColumn:"1/-1"}}><Field label="Teléfono — para WhatsApp"><input type="tel" placeholder="+34 600 000 000" value={form.phone} onChange={e=>set("phone",e.target.value)} /></Field></div>
        </div>
        <Field label="¿Tienes coche?" error={errors.hasCar} required style={{marginBottom:14}}>
          <div style={{display:"flex",gap:10,marginTop:2}}>
            {[{val:true,label:"🚗  Sí, tengo coche",color:"#2d7a3a",bg:"#eaf5ec"},{val:false,label:"🚶  Sin coche",color:"#666",bg:"#f5f5f5"}].map(({val,label,color,bg})=>(
              <button key={String(val)} onClick={()=>set("hasCar",val)} style={{flex:1,padding:"11px 12px",borderRadius:10,fontSize:14,fontWeight:500,background:form.hasCar===val?bg:"transparent",color:form.hasCar===val?color:"#bbb",border:`1.5px solid ${form.hasCar===val?(val?"#2d7a3a":"#aaa"):"#e0dbd3"}`,transition:"all .15s"}}>{label}</button>
            ))}
          </div>
        </Field>
        {form.hasCar===true&&<Field label="Plazas disponibles (además de ti)" style={{marginBottom:14}}><input type="number" min="0" max="7" placeholder="0" value={form.seats} onChange={e=>set("seats",e.target.value)} style={{maxWidth:120}} /></Field>}
        {form.hasCar===false&&driversWithSeats.length>0&&<>
          <Divider style={{margin:"14px 0"}} />
          <Field label="¿Quieres unirte a un coche?" style={{marginBottom:14}}>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:4}}>
              {driversWithSeats.map(reg=>{const m=reg.members?.[0]||reg;const free=parseInt(m.seats||0)-regs.filter(r=>r.joinedCarId===reg.id).length;const sel=form.carpoolJoin===reg.id;return(
                <button key={reg.id} onClick={()=>set("carpoolJoin",sel?undefined:reg.id)} style={{textAlign:"left",padding:"12px 14px",borderRadius:10,background:sel?"#eaf5ec":"#fafaf8",border:`1.5px solid ${sel?"#2d6e35":"#e0dbd3"}`,cursor:"pointer",transition:"all .15s"}}>
                  <div style={{fontWeight:500,color:sel?"#2d6e35":"#1a1a18"}}>🚗 {maskName(m.firstName,m.lastName)} — {free} plaza{free!==1?"s":""}</div>
                  {m.phone&&<div style={{fontSize:13,color:"#128C7E",marginTop:2}}>💬 {m.phone}</div>}
                </button>
              );})}
              <button onClick={()=>set("carpoolJoin",undefined)} style={{textAlign:"left",padding:"10px 14px",borderRadius:10,background:form.carpoolJoin===undefined?"#f0ede8":"transparent",border:`1.5px solid ${form.carpoolJoin===undefined?"#888":"#e0dbd3"}`,cursor:"pointer",color:"#555",fontSize:14}}>🚶 Me las arreglo por mi cuenta</button>
            </div>
          </Field>
        </>}
        {routes.length>1&&<>
          <Divider style={{margin:"14px 0"}} />
          <Field label="Recorrido preferido" error={errors.routeVote} required style={{marginBottom:14}}>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:4}}>
              {routes.map(r=>(
                <div key={r.name} style={{borderRadius:10,border:`1.5px solid ${form.routeVote===r.name?"#2d6e35":"#e0dbd3"}`,background:form.routeVote===r.name?"#eaf5ec":"#fafaf8",overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"stretch"}}>
                    <button onClick={()=>set("routeVote",r.name)} style={{flex:1,textAlign:"left",padding:"12px 14px",background:"transparent",cursor:"pointer"}}>
                      <div style={{fontWeight:500,color:form.routeVote===r.name?"#2d6e35":"#1a1a18",marginBottom:2}}>{form.routeVote===r.name?"✓ ":""}{r.name}</div>
                      <div style={{fontSize:12,color:"#aaa",display:"flex",gap:10}}>{r.distance&&<span>📏 {r.distance} km</span>}{r.elevation&&<span>⛰ +{r.elevation} m</span>}</div>
                    </button>
                    <button onClick={()=>setModalRoute(r)} style={{padding:"0 14px",background:"transparent",borderLeft:`1px solid ${form.routeVote===r.name?"#a8d5b0":"#e0dbd3"}`,color:"#666",fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>🗺 Ver</button>
                  </div>
                </div>
              ))}
            </div>
          </Field>
        </>}
        <Divider style={{margin:"16px 0"}} />
        <div style={{display:"flex",gap:10}}>
          <Btn variant="ghost" onClick={()=>{setStep("info");setErrors({});}}>Cancelar</Btn>
          <Btn style={{flex:1}} onClick={submitForm}>Confirmar inscripción</Btn>
        </div>
      </Card>}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [hikes,   setHikes]   = useState(()=>load(SK_HIKES,[]));
  const [allRegs, setAllRegs] = useState(()=>load(SK_REGS,{}));
  const [page,    setPage]    = useState("home");
  const [selId,   setSelId]   = useState(null);
  const [adminOk, setAdminOk] = useState(false);

  const saveHikes=h=>{setHikes(h);persist(SK_HIKES,h);};
  const saveRegs=r=>{setAllRegs(r);persist(SK_REGS,r);};
  const upsertHike=hike=>{const up=hikes.find(h=>h.id===hike.id)?hikes.map(h=>h.id===hike.id?hike:h):[...hikes,hike];saveHikes(up.sort((a,b)=>new Date(a.date)-new Date(b.date)));};
  const deleteHike=id=>{saveHikes(hikes.filter(h=>h.id!==id));const r={...allRegs};delete r[id];saveRegs(r);};
  const getRegs=()=>allRegs[selId]||[];
  const setRegs=r=>saveRegs({...allRegs,[selId]:r});
  const addReg=reg=>setRegs([...getRegs(),reg]);
  const delReg=id=>setRegs(getRegs().filter(r=>r.id!==id));
  const joinCar=(myId,cId)=>setRegs(getRegs().map(r=>r.id===myId?{...r,joinedCarId:cId}:r));
  const leaveCar=myId=>setRegs(getRegs().map(r=>r.id===myId?{...r,joinedCarId:null}:r));
  const selectedHike=hikes.find(h=>h.id===selId);

  const navigate=id=>{
    if(id==="home"){setPage("home");return;}
    if(id==="admin"&&!adminOk){setPage("admin");return;}
    setPage(id);
  };

  // Hero page has no sidebar
  if(page==="home") return (
    <>
      <style>{CSS}</style>
      <div style={{height:"100vh",width:"100vw"}}>
        <HeroPage onEnter={()=>setPage("hikes")} />
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        <Sidebar page={page} onNav={navigate} adminOk={adminOk} />
        <main className="main-scroll">
          {page==="admin"&&!adminOk&&<AdminLogin onUnlock={()=>setAdminOk(true)} />}
          {page==="admin"&&adminOk&&<AdminPanel hikes={hikes} allRegs={allRegs} onSave={upsertHike} onDeleteHike={deleteHike} />}
          {page==="hikes"&&<HikeList hikes={hikes} allRegs={allRegs} onSelect={id=>{setSelId(id);setPage("detail");}} />}
          {page==="detail"&&selectedHike&&<HikeDetail hike={selectedHike} regs={getRegs()} onRegister={addReg} onDeleteReg={delReg} onJoinCar={joinCar} onLeaveCar={leaveCar} onBack={()=>setPage("hikes")} />}
        </main>
      </div>
    </>
  );
}
