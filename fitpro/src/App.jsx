import React, { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
// ── SUPABASE INLINE ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ciwdchbvqnjovtyzvont.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_fXTv4M2TbTlzhV4EcMHNtQ_yLsoe9xy";

const sbHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
};

const sb = async (path, opts = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { ...sbHeaders, ...(opts.headers || {}) },
    ...opts,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || `Errore ${res.status}`);
  return data;
};

const getUsers = () => sb("users?select=*&order=created_at.asc");
const getUserByEmail = (email) => sb(`users?email=eq.${encodeURIComponent(email)}&select=*`).then(r => r?.[0] || null);
const createUser = (u) => sb("users?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(u) }).then(r => r?.[0]);
const getWorkoutsForClient = (id) => sb(`workouts?client_id=eq.${id}&select=*,exercises(*)&order=created_at.asc`);
const dbCreateWorkout = (w) => sb("workouts?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(w) }).then(r => r?.[0]);
const dbDeleteWorkout = (id) => sb(`workouts?id=eq.${id}`, { method: "DELETE" });
const dbAddExercise = (e) => sb("exercises?select=*", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(e) }).then(r => r?.[0]);
const dbDeleteExercise = (id) => sb(`exercises?id=eq.${id}`, { method: "DELETE" });
const getSchedule = (clientId) => sb(`schedule?client_id=eq.${clientId}&select=*`);
const upsertScheduleDay = (row) => sb("schedule?on_conflict=client_id,day_index", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(row) });
const deleteScheduleDay = (clientId, dayIndex) => sb(`schedule?client_id=eq.${clientId}&day_index=eq.${dayIndex}`, { method: "DELETE" });
const deleteScheduleByWorkout = (workoutId) => sb(`schedule?workout_id=eq.${workoutId}`, { method: "DELETE" });

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const TRAINER_SECRET_CODE = "FITPRO-COACH-2025";

const DEFAULT_LIBRARY = [
  "Panca Piana","Panca Inclinata","Croci ai Cavi","Push-up","Dips",
  "Trazioni","Lat Machine","Rematore Bilanciere","Scrollata di Spalle",
  "Military Press","Alzate Laterali","Alzate Frontali",
  "Squat","Leg Press","Affondi","Leg Curl","Leg Extension","Hip Thrust",
  "Stacco da Terra","Stacco Rumeno",
  "Curl Bilanciere","Curl Manubri","Curl Martello",
  "Tricep Pushdown","French Press","Kickback",
  "Plank","Crunch","Russian Twist","Leg Raise",
];

const DAYS_IT = ["Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato","Domenica"];

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0a0a0f;--surface:#12121a;--surface2:#1a1a26;--surface3:#22223a;
    --border:#2a2a42;--accent:#6c63ff;--accent2:#ff6b6b;--accent3:#43e97b;
    --text:#e8e8f5;--text2:#8888aa;--gold:#f7c948;
  }
  body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px}
  .app{display:flex;height:100vh;overflow:hidden}
  .sidebar{width:220px;min-width:220px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:24px 0;overflow-y:auto}
  .sidebar-logo{font-family:'Bebas Neue',cursive;font-size:26px;letter-spacing:2px;color:var(--accent);padding:0 20px 24px;border-bottom:1px solid var(--border);line-height:1}
  .sidebar-logo span{color:var(--accent2)}
  .sidebar-section{padding:16px 12px 4px;font-size:10px;font-weight:600;letter-spacing:2px;color:var(--text2);text-transform:uppercase}
  .nav-item{display:flex;align-items:center;gap:10px;padding:10px 20px;cursor:pointer;color:var(--text2);font-size:13px;font-weight:500;border-left:3px solid transparent;transition:all .15s}
  .nav-item:hover{color:var(--text);background:var(--surface2)}
  .nav-item.active{color:var(--accent);background:rgba(108,99,255,.08);border-left-color:var(--accent)}
  .nav-icon{font-size:16px;width:20px;text-align:center}
  .sidebar-user{margin-top:auto;padding:16px 20px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px}
  .avatar{width:34px;height:34px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
  .avatar.sm{width:28px;height:28px;font-size:10px}
  .avatar.lg{width:44px;height:44px;font-size:14px}
  .avatar.accent2{background:var(--accent2)}
  .avatar.accent3{background:var(--accent3);color:#111}
  .avatar.gold{background:var(--gold);color:#111}
  .main{flex:1;overflow-y:auto;display:flex;flex-direction:column}
  .topbar{background:var(--surface);border-bottom:1px solid var(--border);padding:16px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
  .page-title{font-family:'Bebas Neue',cursive;font-size:22px;letter-spacing:1px}
  .content{padding:24px 28px;flex:1}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:20px}
  .card-title{font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--text2);margin-bottom:12px}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
  .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-family:'DM Sans';font-size:13px;font-weight:600;transition:all .15s}
  .btn-primary{background:var(--accent);color:#fff}
  .btn-primary:hover{background:#7c73ff}
  .btn-primary:disabled{opacity:.5;cursor:not-allowed}
  .btn-danger{background:rgba(255,107,107,.15);color:var(--accent2);border:1px solid rgba(255,107,107,.3)}
  .btn-danger:hover{background:rgba(255,107,107,.25)}
  .btn-ghost{background:var(--surface2);color:var(--text);border:1px solid var(--border)}
  .btn-ghost:hover{background:var(--surface3)}
  .btn-success{background:rgba(67,233,123,.15);color:var(--accent3);border:1px solid rgba(67,233,123,.3)}
  .btn-sm{padding:5px 10px;font-size:12px}
  .btn-xs{padding:3px 8px;font-size:11px;border-radius:4px}
  .input,.select,.textarea{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:8px 12px;color:var(--text);font-family:'DM Sans';font-size:13px;outline:none;transition:border .15s}
  .input:focus,.select:focus,.textarea:focus{border-color:var(--accent)}
  .select option{background:var(--surface2)}
  .textarea{resize:vertical;min-height:60px}
  .form-row{display:flex;gap:12px;margin-bottom:12px}
  .form-group{flex:1}
  .form-label{font-size:11px;font-weight:600;letter-spacing:1px;color:var(--text2);margin-bottom:5px;display:block;text-transform:uppercase}
  .badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600}
  .badge-accent{background:rgba(108,99,255,.2);color:var(--accent)}
  .badge-green{background:rgba(67,233,123,.15);color:var(--accent3)}
  .stat{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:16px}
  .stat-value{font-family:'Bebas Neue',cursive;font-size:32px;line-height:1}
  .stat-label{font-size:11px;color:var(--text2);margin-top:4px;font-weight:500}
  .table{width:100%;border-collapse:collapse}
  .table th{padding:10px 12px;text-align:left;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--text2);border-bottom:1px solid var(--border)}
  .table td{padding:12px 12px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
  .table tr:hover td{background:rgba(255,255,255,.02)}
  .table tr:last-child td{border-bottom:none}
  .ex-card{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:14px 16px;display:flex;align-items:flex-start;gap:14px;margin-bottom:8px}
  .ex-num{font-family:'Bebas Neue',cursive;font-size:22px;color:var(--accent);width:28px;text-align:center;flex-shrink:0;line-height:1;margin-top:2px}
  .ex-name{font-weight:600;font-size:14px;margin-bottom:4px}
  .ex-meta{display:flex;gap:14px;flex-wrap:wrap}
  .ex-meta-item{font-size:12px;color:var(--text2)}
  .ex-meta-item strong{color:var(--text);font-weight:600}
  .ex-note{font-size:12px;color:var(--text2);margin-top:6px;font-style:italic;border-left:2px solid var(--accent);padding-left:8px}
  .week-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}
  .day-cell{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px;min-height:90px;cursor:pointer;transition:all .15s;display:flex;flex-direction:column;gap:6px}
  .day-cell:hover{border-color:var(--accent)}
  .day-cell.has-workout{border-color:rgba(108,99,255,.4);background:rgba(108,99,255,.06)}
  .day-name{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--text2)}
  .day-workout-chip{background:var(--accent);color:#fff;border-radius:4px;padding:3px 8px;font-size:11px;font-weight:600}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px}
  .modal{background:var(--surface);border:1px solid var(--border);border-radius:12px;width:100%;max-width:520px;max-height:85vh;overflow-y:auto;padding:24px}
  .modal-title{font-family:'Bebas Neue',cursive;font-size:22px;letter-spacing:1px;margin-bottom:20px}
  .login-screen{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center}
  .login-box{width:100%;max-width:390px;padding:20px}
  .login-logo{font-family:'Bebas Neue',cursive;font-size:42px;letter-spacing:3px;color:var(--accent);margin-bottom:4px}
  .login-sub{color:var(--text2);font-size:13px;margin-bottom:28px}
  .tabs{display:flex;gap:2px;background:var(--surface2);border-radius:8px;padding:4px;margin-bottom:20px}
  .tab{flex:1;padding:8px;text-align:center;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;color:var(--text2);transition:all .15s}
  .tab.active{background:var(--accent);color:#fff}
  .client-card{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:14px 16px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:all .15s;margin-bottom:8px}
  .client-card:hover{border-color:var(--accent);background:rgba(108,99,255,.06)}
  .flex{display:flex}
  .flex-center{display:flex;align-items:center}
  .flex-between{display:flex;align-items:center;justify-content:space-between}
  .gap-8{gap:8px}.gap-12{gap:12px}.gap-16{gap:16px}
  .mt-4{margin-top:4px}.mt-8{margin-top:8px}.mt-12{margin-top:12px}.mt-16{margin-top:16px}
  .mb-8{margin-bottom:8px}.mb-12{margin-bottom:12px}.mb-16{margin-bottom:16px}
  .text-sm{font-size:12px}.text-xs{font-size:11px}
  .text-muted{color:var(--text2)}.text-accent{color:var(--accent)}
  .text-red{color:var(--accent2)}.text-green{color:var(--accent3)}
  .font-bold{font-weight:700}
  .divider{height:1px;background:var(--border);margin:16px 0}
  ::-webkit-scrollbar{width:6px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
  .spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .loading-screen{position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
  .loading-logo{font-family:'Bebas Neue',cursive;font-size:48px;letter-spacing:4px;color:var(--accent)}
`;

// ── HELPERS ───────────────────────────────────────────────────────────────────
const avatarColors = ["accent2", "accent3", "gold", "accent"];
const getAvatarColor = (id) => avatarColors[String(id).charCodeAt(0) % avatarColors.length] || "accent";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px" }}>
      <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.name}: {p.value}{p.unit || " kg"}
        </div>
      ))}
    </div>
  );
};

// ── EXERCISE AUTOCOMPLETE ─────────────────────────────────────────────────────
function ExerciseAutocomplete({ value, onChange, library, onAddToLibrary }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const ref = React.useRef(null);

  const suggestions = (query.length > 0
    ? library.filter(ex => ex.toLowerCase().includes(query.toLowerCase()))
    : library).slice(0, 8);

  const isCustom = query.trim() && !library.map(l => l.toLowerCase()).includes(query.trim().toLowerCase());

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const select = (name) => { setQuery(name); onChange(name); setOpen(false); };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input className="input" value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Cerca o scrivi nome esercizio..." autoComplete="off" />
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,.4)", overflow: "hidden", maxHeight: 260, overflowY: "auto"
        }}>
          {suggestions.length > 0 && (
            <>
              <div style={{ padding: "6px 12px", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "var(--text2)", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>Libreria</div>
              {suggestions.map(ex => (
                <div key={ex} onMouseDown={() => select(ex)}
                  style={{ padding: "9px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500, color: ex === value ? "var(--accent)" : "var(--text)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {ex}
                </div>
              ))}
            </>
          )}
          {isCustom && (
            <div style={{ borderTop: suggestions.length ? "1px solid var(--border)" : "none" }}>
              <div onMouseDown={() => select(query.trim())}
                style={{ padding: "9px 14px", cursor: "pointer", fontSize: 13, color: "var(--accent3)", fontWeight: 600 }}>
                ✏️ Usa "{query.trim()}"
              </div>
              <div onMouseDown={() => { onAddToLibrary(query.trim()); select(query.trim()); }}
                style={{ padding: "9px 14px", cursor: "pointer", fontSize: 13, color: "var(--gold)", fontWeight: 600, borderTop: "1px solid var(--border)" }}>
                ⭐ Aggiungi "{query.trim()}" alla libreria
              </div>
            </div>
          )}
          {!suggestions.length && !isCustom && (
            <div style={{ padding: "12px 14px", fontSize: 13, color: "var(--text2)" }}>Nessun risultato</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regPass2, setRegPass2] = useState("");
  const [regGoal, setRegGoal] = useState("Ipertrofia");
  const [regTrainerCode, setRegTrainerCode] = useState("");
  const [showTrainerField, setShowTrainerField] = useState(false);

  const handleLogin = async () => {
    setErr(""); setLoading(true);
    try {
      const user = await getUserByEmail(email.trim().toLowerCase());
      if (!user || user.password !== pass) { setErr("Email o password non corretti."); return; }
      onLogin(user);
    } catch (e) { setErr("Errore di connessione. Riprova."); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setErr("");
    if (!regName.trim()) return setErr("Inserisci il tuo nome.");
    if (!regEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return setErr("Email non valida.");
    if (regPass.length < 6) return setErr("Password: minimo 6 caratteri.");
    if (regPass !== regPass2) return setErr("Le password non coincidono.");
    setLoading(true);
    try {
      const existing = await getUserByEmail(regEmail.trim().toLowerCase());
      if (existing) { setErr("Email già registrata."); return; }
      const initials = regName.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
      const isTrainer = regTrainerCode.trim() === TRAINER_SECRET_CODE;
      const newUser = await createUser({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPass,
        role: isTrainer ? "trainer" : "client",
        avatar: initials,
        goal: isTrainer ? "" : regGoal,
      });
      onLogin(newUser);
    } catch (e) { setErr("Errore durante la registrazione. Riprova."); console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-logo">FIT<span style={{ color: "var(--accent2)" }}>PRO</span></div>
        <div className="login-sub">{mode === "login" ? "Accedi al tuo account" : "Crea il tuo account"}</div>
        <div className="tabs">
          <div className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setErr(""); }}>Accedi</div>
          <div className={`tab ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setErr(""); }}>Registrati</div>
        </div>

        {mode === "login" ? (
          <>
            <div className="form-group mb-12">
              <label className="form-label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tua@email.com" />
            </div>
            <div className="form-group mb-16">
              <label className="form-label">Password</label>
              <input className="input" type="password" value={pass} onChange={e => setPass(e.target.value)}
                placeholder="••••••" onKeyDown={e => e.key === "Enter" && !loading && handleLogin()} />
            </div>
            {err && <div className="text-red text-sm mb-12">⚠ {err}</div>}
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: 11 }}
              onClick={handleLogin} disabled={loading}>
              {loading ? <><span className="spinner" /> Accesso...</> : "Accedi →"}
            </button>
          </>
        ) : (
          <>
            <div className="form-group mb-12">
              <label className="form-label">Nome Completo</label>
              <input className="input" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Mario Rossi" />
            </div>
            <div className="form-group mb-12">
              <label className="form-label">Email</label>
              <input className="input" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="mario@email.com" />
            </div>
            <div className="form-group mb-12">
              <label className="form-label">Obiettivo</label>
              <select className="select" value={regGoal} onChange={e => setRegGoal(e.target.value)}>
                {["Ipertrofia","Forza","Dimagrimento","Resistenza","Mobilità","Benessere Generale"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="input" type="password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Min. 6 caratteri" />
              </div>
              <div className="form-group">
                <label className="form-label">Conferma</label>
                <input className="input" type="password" value={regPass2} onChange={e => setRegPass2(e.target.value)} placeholder="Ripeti" onKeyDown={e => e.key === "Enter" && !loading && handleRegister()} />
              </div>
            </div>
            <div className="mb-12">
              <div onClick={() => setShowTrainerField(p => !p)}
                style={{ cursor: "pointer", fontSize: 12, color: "var(--text2)", display: "flex", alignItems: "center", gap: 6, userSelect: "none" }}>
                <span>{showTrainerField ? "▾" : "▸"}</span> Sei un personal trainer?
              </div>
              {showTrainerField && (
                <div style={{ marginTop: 8 }}>
                  <label className="form-label">Codice Trainer</label>
                  <input className="input" type="password" value={regTrainerCode} onChange={e => setRegTrainerCode(e.target.value)} placeholder="Codice segreto" />
                  {regTrainerCode && regTrainerCode !== TRAINER_SECRET_CODE && <div className="text-xs text-red mt-4">⚠ Codice non valido</div>}
                  {regTrainerCode === TRAINER_SECRET_CODE && <div className="text-xs text-green mt-4">✓ Verrai registrato come Coach</div>}
                </div>
              )}
            </div>
            {err && <div className="text-red text-sm mb-12">⚠ {err}</div>}
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: 11 }}
              onClick={handleRegister} disabled={loading}>
              {loading ? <><span className="spinner" /> Creazione account...</> : regTrainerCode === TRAINER_SECRET_CODE ? "Crea Account Coach 🏅" : "Crea Account ✨"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── DASHBOARD CLIENT ──────────────────────────────────────────────────────────
function ClientDashboard({ user, workouts, schedule }) {
  const weekSessions = Object.keys(schedule).length;
  const totalEx = workouts.reduce((s, w) => s + (w.exercises?.length || 0), 0);
  const mainW = workouts[0];
  const mainEx = mainW?.exercises?.[0];
  const progressData = (mainEx?.history || []).map(h => ({ date: h.date?.slice(5), load: h.load })).filter(d => d.load);

  return (
    <div>
      <div className="grid-4 mb-16">
        <div className="stat"><div className="stat-value">{workouts.length}</div><div className="stat-label">Schede Attive</div></div>
        <div className="stat"><div className="stat-value">{totalEx}</div><div className="stat-label">Esercizi Totali</div></div>
        <div className="stat"><div className="stat-value">{weekSessions}</div><div className="stat-label">Sessioni / Settimana</div></div>
        <div className="stat"><div className="stat-value" style={{ fontSize: 18, marginTop: 6 }}>{user.goal || "–"}</div><div className="stat-label">Obiettivo</div></div>
      </div>
      <div className="card mb-16">
        <div className="card-title">📅 Piano Settimanale</div>
        <div className="week-grid">
          {DAYS_IT.map((day, i) => {
            const wId = schedule[i];
            const w = workouts.find(x => x.id === wId);
            return (
              <div key={i} className={`day-cell ${w ? "has-workout" : ""}`}>
                <div className="day-name">{day.slice(0, 3)}</div>
                {w ? <div className="day-workout-chip">{w.name}</div> : <div className="text-xs text-muted" style={{ marginTop: 4 }}>Riposo</div>}
              </div>
            );
          })}
        </div>
      </div>
      {progressData.length > 1 && mainEx && (
        <div className="card">
          <div className="card-title">📈 Progressione — {mainEx.name}</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill: "var(--text2)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--text2)", fontSize: 11 }} unit="kg" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="load" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)", r: 3 }} name="Carico" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MY WORKOUTS ───────────────────────────────────────────────────────────────
function MyWorkouts({ workouts }) {
  const [selected, setSelected] = useState(workouts[0]?.id || null);
  const w = workouts.find(x => x.id === selected);
  if (!workouts.length) return (
    <div className="card" style={{ textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🏋️</div>
      <div className="text-muted">Nessuna scheda assegnata ancora.</div>
    </div>
  );
  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <div>
        <div className="card-title mb-8">Le Mie Schede</div>
        {workouts.map(wk => (
          <div key={wk.id} className="client-card"
            style={{ borderColor: selected === wk.id ? "var(--accent)" : undefined, background: selected === wk.id ? "rgba(108,99,255,.08)" : undefined }}
            onClick={() => setSelected(wk.id)}>
            <div className="avatar">{wk.name.slice(0, 2)}</div>
            <div><div className="font-bold">{wk.name}</div><div className="text-sm text-muted">{wk.exercises?.length || 0} esercizi</div></div>
          </div>
        ))}
      </div>
      {w && (
        <div className="card">
          <div className="flex-between mb-16">
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1 }}>{w.name}</div>
            <span className="badge badge-accent">{w.exercises?.length || 0} esercizi</span>
          </div>
          {(w.exercises || []).map((ex, i) => (
            <div key={ex.id} className="ex-card">
              <div className="ex-num">{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div className="ex-name">{ex.name}</div>
                <div className="ex-meta">
                  <div className="ex-meta-item">Serie: <strong>{ex.sets}</strong></div>
                  <div className="ex-meta-item">Reps: <strong>{ex.reps}</strong></div>
                  <div className="ex-meta-item">Carico: <strong>{ex.load || "BW"}{ex.load ? " kg" : ""}</strong></div>
                  <div className="ex-meta-item">Rec: <strong>{ex.rest}"</strong></div>
                </div>
                {ex.notes && <div className="ex-note">{ex.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TRAINER: MANAGE CLIENT ────────────────────────────────────────────────────
function TrainerManageClient({ client, onBack, reload }) {
  const [tab, setTab] = useState("schede");
  const [workouts, setWorkouts] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [editWorkoutId, setEditWorkoutId] = useState(null);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWName, setNewWName] = useState("");
  const [showExForm, setShowExForm] = useState(false);
  const [showLibMgr, setShowLibMgr] = useState(false);
  const [library, setLibrary] = useState([...DEFAULT_LIBRARY]);
  const [exForm, setExForm] = useState({ name: DEFAULT_LIBRARY[0], sets: 3, reps: "10", load: 0, rest: 60, notes: "" });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [wData, sData] = await Promise.all([
        getWorkoutsForClient(client.id),
        getSchedule(client.id),
      ]);
      const sorted = (wData || []).map(w => ({
        ...w,
        exercises: (w.exercises || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
      }));
      setWorkouts(sorted);
      const sMap = {};
      (sData || []).forEach(s => { sMap[s.day_index] = s.workout_id; });
      setSchedule(sMap);
    } finally { setLoading(false); }
  }, [client.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const ew = workouts.find(w => w.id === editWorkoutId);

  const createWorkout = async () => {
    if (!newWName.trim()) return;
    setSaving(true);
    try {
      const w = await dbCreateWorkout({ name: newWName.trim(), client_id: client.id });
      setWorkouts(prev => [...prev, { ...w, exercises: [] }]);
      setEditWorkoutId(w.id);
      setNewWName(""); setShowAddWorkout(false);
    } finally { setSaving(false); }
  };

  const deleteWorkout = async (wId) => {
    await deleteScheduleByWorkout(wId);
    await dbDeleteWorkout(wId);
    setWorkouts(prev => prev.filter(w => w.id !== wId));
    setSchedule(prev => { const s = { ...prev }; Object.keys(s).forEach(k => { if (s[k] === wId) delete s[k]; }); return s; });
    if (editWorkoutId === wId) setEditWorkoutId(null);
  };

  const addExercise = async (wId) => {
    if (!exForm.name.trim()) return;
    setSaving(true);
    try {
      const sortOrder = (ew?.exercises?.length || 0);
      const ex = await dbAddExercise({ ...exForm, workout_id: wId, sort_order: sortOrder });
      setWorkouts(prev => prev.map(w => w.id === wId ? { ...w, exercises: [...(w.exercises || []), ex] } : w));
      setExForm({ name: DEFAULT_LIBRARY[0], sets: 3, reps: "10", load: 0, rest: 60, notes: "" });
      setShowExForm(false);
    } finally { setSaving(false); }
  };

  const removeExercise = async (wId, exId) => {
    await dbDeleteExercise(exId);
    setWorkouts(prev => prev.map(w => w.id === wId ? { ...w, exercises: w.exercises.filter(e => e.id !== exId) } : w));
  };

  const toggleSchedule = async (dayIdx, wId) => {
    if (schedule[dayIdx] === wId) {
      await deleteScheduleDay(client.id, dayIdx);
      setSchedule(prev => { const s = { ...prev }; delete s[dayIdx]; return s; });
    } else {
      await upsertScheduleDay({ client_id: client.id, day_index: dayIdx, workout_id: wId });
      setSchedule(prev => ({ ...prev, [dayIdx]: wId }));
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "var(--text2)" }}><span className="spinner" style={{ width: 24, height: 24 }} /></div>;

  return (
    <div>
      <div className="flex-center gap-12 mb-16">
        <div className={`avatar lg ${getAvatarColor(client.id)}`}>{client.avatar}</div>
        <div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 1 }}>{client.name}</div>
          <div className="flex-center gap-8 mt-4">
            <span className="badge badge-accent">{client.goal || "–"}</span>
            <span className="text-xs text-muted">{client.email}</span>
          </div>
        </div>
      </div>
      <div className="tabs">
        <div className={`tab ${tab === "schede" ? "active" : ""}`} onClick={() => setTab("schede")}>📋 Schede</div>
        <div className={`tab ${tab === "pianificazione" ? "active" : ""}`} onClick={() => setTab("pianificazione")}>📅 Pianificazione</div>
      </div>

      {tab === "schede" && (
        <div className="grid-2" style={{ alignItems: "start" }}>
          <div>
            <div className="flex-between mb-12">
              <div className="card-title" style={{ margin: 0 }}>Schede di {client.name.split(" ")[0]}</div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddWorkout(true)}>+ Nuova</button>
            </div>
            {showAddWorkout && (
              <div className="card mb-12">
                <label className="form-label">Nome Scheda</label>
                <input className="input mb-8" value={newWName} onChange={e => setNewWName(e.target.value)}
                  placeholder="es. Push A, Full Body..." onKeyDown={e => e.key === "Enter" && createWorkout()} />
                <div className="flex gap-8">
                  <button className="btn btn-primary btn-sm" onClick={createWorkout} disabled={saving}>{saving ? <span className="spinner" /> : "Crea"}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowAddWorkout(false)}>Annulla</button>
                </div>
              </div>
            )}
            {!workouts.length && <div className="text-muted text-sm">Nessuna scheda. Creane una!</div>}
            {workouts.map(w => (
              <div key={w.id} className="client-card"
                style={{ borderColor: editWorkoutId === w.id ? "var(--accent)" : undefined, background: editWorkoutId === w.id ? "rgba(108,99,255,.08)" : undefined }}
                onClick={() => { setEditWorkoutId(w.id); setShowExForm(false); }}>
                <div className="avatar">{w.name.slice(0, 2)}</div>
                <div style={{ flex: 1 }}><div className="font-bold">{w.name}</div><div className="text-xs text-muted">{w.exercises?.length || 0} esercizi</div></div>
                <button className="btn btn-danger btn-xs" onClick={e => { e.stopPropagation(); deleteWorkout(w.id); }}>🗑</button>
              </div>
            ))}
          </div>

          {ew && (
            <div className="card">
              <div className="flex-between mb-16">
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1 }}>{ew.name}</div>
                <div className="flex gap-8">
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowLibMgr(p => !p)} title="Libreria">📚</button>
                  <button className="btn btn-success btn-sm" onClick={() => { setShowExForm(true); setExForm({ name: DEFAULT_LIBRARY[0], sets: 3, reps: "10", load: 0, rest: 60, notes: "" }); }}>+ Esercizio</button>
                </div>
              </div>

              {showLibMgr && (
                <div className="card mb-12" style={{ background: "var(--surface3)" }}>
                  <div className="flex-between mb-10">
                    <div className="card-title" style={{ margin: 0 }}>📚 Libreria Esercizi</div>
                    <button className="btn btn-ghost btn-xs" onClick={() => setShowLibMgr(false)}>✕</button>
                  </div>
                  <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 10 }}>
                    {library.map((ex, i) => (
                      <div key={ex} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                        <span style={{ fontSize: 13 }}>{ex}</span>
                        {i >= DEFAULT_LIBRARY.length
                          ? <button className="btn btn-danger btn-xs" onClick={() => setLibrary(prev => prev.filter(e => e !== ex))}>✕</button>
                          : <span className="text-xs text-muted">default</span>}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-8">
                    <input className="input" id="lib-inp" placeholder="Nuovo esercizio..."
                      onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { const n = e.target.value.trim(); if (!library.includes(n)) setLibrary(p => [...p, n]); e.target.value = ""; } }} />
                    <button className="btn btn-primary btn-sm" onClick={() => { const inp = document.getElementById("lib-inp"); const n = inp?.value.trim(); if (n && !library.includes(n)) { setLibrary(p => [...p, n]); inp.value = ""; } }}>+</button>
                  </div>
                </div>
              )}

              {showExForm && (
                <div className="card mb-12" style={{ background: "var(--surface3)" }}>
                  <div className="card-title">Nuovo Esercizio</div>
                  <div className="form-group mb-8">
                    <label className="form-label">Esercizio</label>
                    <ExerciseAutocomplete value={exForm.name} onChange={name => setExForm(p => ({ ...p, name }))}
                      library={library} onAddToLibrary={name => setLibrary(p => [...p, name])} />
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Serie</label><input className="input" type="number" min={1} value={exForm.sets} onChange={e => setExForm(p => ({ ...p, sets: +e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Reps</label><input className="input" value={exForm.reps} onChange={e => setExForm(p => ({ ...p, reps: e.target.value }))} placeholder="10 o 8-12" /></div>
                    <div className="form-group"><label className="form-label">Carico (kg)</label><input className="input" type="number" min={0} value={exForm.load} onChange={e => setExForm(p => ({ ...p, load: +e.target.value }))} /></div>
                    <div className="form-group"><label className="form-label">Rec. (s)</label><input className="input" type="number" min={0} step={15} value={exForm.rest} onChange={e => setExForm(p => ({ ...p, rest: +e.target.value }))} /></div>
                  </div>
                  <div className="form-group mb-12">
                    <label className="form-label">Note</label>
                    <textarea className="textarea" value={exForm.notes} onChange={e => setExForm(p => ({ ...p, notes: e.target.value }))} placeholder="Tecnica, avvertenze..." />
                  </div>
                  <div className="flex gap-8">
                    <button className="btn btn-primary btn-sm" onClick={() => addExercise(ew.id)} disabled={saving}>{saving ? <span className="spinner" /> : "Aggiungi"}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowExForm(false)}>Annulla</button>
                  </div>
                </div>
              )}

              {!(ew.exercises?.length) && <div className="text-muted text-sm">Aggiungi il primo esercizio.</div>}
              {(ew.exercises || []).map((ex, i) => (
                <div key={ex.id} className="ex-card">
                  <div className="ex-num">{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div className="ex-name">{ex.name}</div>
                    <div className="ex-meta">
                      <div className="ex-meta-item">Serie: <strong>{ex.sets}</strong></div>
                      <div className="ex-meta-item">Reps: <strong>{ex.reps}</strong></div>
                      <div className="ex-meta-item">Carico: <strong>{ex.load || "BW"}{ex.load ? " kg" : ""}</strong></div>
                      <div className="ex-meta-item">Rec: <strong>{ex.rest}"</strong></div>
                    </div>
                    {ex.notes && <div className="ex-note">{ex.notes}</div>}
                  </div>
                  <button className="btn btn-danger btn-xs" onClick={() => removeExercise(ew.id, ex.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "pianificazione" && (
        <div className="card">
          <div className="card-title">Piano Settimanale</div>
          {!workouts.length ? <div className="text-muted text-sm">Prima crea almeno una scheda.</div> : (
            <>
              <div className="text-xs text-muted mb-16">Clicca su una scheda per assegnarla/rimuoverla dal giorno.</div>
              <div className="week-grid">
                {DAYS_IT.map((day, i) => (
                  <div key={i} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, minHeight: 120 }}>
                    <div className="day-name mb-8">{day}</div>
                    {workouts.map(wk => (
                      <div key={wk.id} onClick={() => toggleSchedule(i, wk.id)}
                        style={{ padding: "4px 8px", borderRadius: 4, marginBottom: 4, cursor: "pointer", fontSize: 11, fontWeight: 600, transition: "all .15s",
                          background: schedule[i] === wk.id ? "var(--accent)" : "var(--surface3)",
                          color: schedule[i] === wk.id ? "#fff" : "var(--text2)" }}>
                        {wk.name}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── TRAINER CLIENTS LIST ──────────────────────────────────────────────────────
function TrainerClients({ clients, onSelect }) {
  return (
    <div>
      <div className="grid-4 mb-16">
        <div className="stat"><div className="stat-value">{clients.length}</div><div className="stat-label">Clienti Totali</div></div>
        <div className="stat"><div className="stat-value">{clients.filter(c => c.goal === "Ipertrofia").length}</div><div className="stat-label">Ipertrofia</div></div>
        <div className="stat"><div className="stat-value">{clients.filter(c => c.goal === "Forza").length}</div><div className="stat-label">Forza</div></div>
        <div className="stat"><div className="stat-value">{clients.filter(c => c.goal === "Dimagrimento").length}</div><div className="stat-label">Dimagrimento</div></div>
      </div>
      <div className="card">
        <div className="card-title">Tutti i Clienti</div>
        {!clients.length && <div className="text-muted text-sm">Nessun cliente registrato ancora.</div>}
        <table className="table">
          <thead><tr><th>Atleta</th><th>Obiettivo</th><th></th></tr></thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => onSelect(c)}>
                <td>
                  <div className="flex-center gap-8">
                    <div className={`avatar sm ${getAvatarColor(c.id)}`}>{c.avatar}</div>
                    <div><div className="font-bold">{c.name}</div><div className="text-xs text-muted">{c.email}</div></div>
                  </div>
                </td>
                <td><span className="badge badge-accent">{c.goal || "–"}</span></td>
                <td><button className="btn btn-ghost btn-sm">Apri →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [mySchedule, setMySchedule] = useState({});
  const [appLoading, setAppLoading] = useState(false);

  // Load data after login
  useEffect(() => {
    if (!user) return;
    setAppLoading(true);
    const load = async () => {
      try {
        if (user.role === "trainer") {
          const all = await getUsers();
          setClients((all || []).filter(u => u.role === "client"));
        } else {
          const [wData, sData] = await Promise.all([
            getWorkoutsForClient(user.id),
            getSchedule(user.id),
          ]);
          const sorted = (wData || []).map(w => ({
            ...w,
            exercises: (w.exercises || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
          }));
          setMyWorkouts(sorted);
          const sMap = {};
          (sData || []).forEach(s => { sMap[s.day_index] = s.workout_id; });
          setMySchedule(sMap);
        }
      } finally { setAppLoading(false); }
    };
    load();
  }, [user]);

  const reloadClients = async () => {
    const all = await getUsers();
    setClients((all || []).filter(u => u.role === "client"));
  };

  const isTrainer = user?.role === "trainer";

  const navItems = isTrainer
    ? [
        { id: "dashboard", icon: "⚡", label: "Dashboard" },
        { id: "clients", icon: "👥", label: "Clienti" },
        ...(selectedClient ? [{ id: "manage", icon: "📝", label: selectedClient.name.split(" ")[0] }] : []),
      ]
    : [
        { id: "dashboard", icon: "⚡", label: "Dashboard" },
        { id: "workouts", icon: "🏋️", label: "Le Mie Schede" },
      ];

  if (!user) return (
    <>
      <style>{css}</style>
      <AuthScreen onLogin={u => { setUser(u); setPage("dashboard"); }} />
    </>
  );

  if (appLoading) return (
    <>
      <style>{css}</style>
      <div className="loading-screen">
        <div className="loading-logo">FITPRO</div>
        <span className="spinner" style={{ width: 24, height: 24 }} />
        <div className="text-muted text-sm">Caricamento dati...</div>
      </div>
    </>
  );

  const pageTitles = { dashboard: "Dashboard", clients: "Clienti", manage: selectedClient?.name || "Gestisci", workouts: "Le Mie Schede" };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-logo">FIT<span>PRO</span></div>
          <div className="sidebar-section">Menu</div>
          {navItems.map(n => (
            <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </div>
          ))}
          <div className="sidebar-user">
            <div className={`avatar sm ${isTrainer ? "gold" : "accent2"}`}>{user.avatar}</div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontSize: 10, color: "var(--text2)" }}>{isTrainer ? "Trainer" : "Atleta"}</div>
            </div>
            <button className="btn btn-ghost btn-xs" onClick={() => { setUser(null); setPage("dashboard"); setSelectedClient(null); }}>↩</button>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div className="page-title">{pageTitles[page] || "FitPro"}</div>
            {isTrainer && page === "manage" && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setPage("clients"); setSelectedClient(null); }}>← Clienti</button>
            )}
          </div>
          <div className="content">
            {isTrainer && page === "dashboard" && (
              <div>
                <div className="grid-4 mb-16">
                  <div className="stat"><div className="stat-value">{clients.length}</div><div className="stat-label">Clienti Attivi</div></div>
                  <div className="stat"><div className="stat-value" style={{ fontSize: 20, marginTop: 6 }}>∞</div><div className="stat-label">Schede Illimitate</div></div>
                  <div className="stat"><div className="stat-value">DB</div><div className="stat-label">Dati Persistenti</div></div>
                  <div className="stat"><div className="stat-value">✓</div><div className="stat-label">Supabase Attivo</div></div>
                </div>
                <div className="card">
                  <div className="card-title">Accesso Rapido Clienti</div>
                  {!clients.length && <div className="text-muted text-sm">Nessun cliente registrato ancora.</div>}
                  {clients.map(c => (
                    <div key={c.id} className="client-card" onClick={() => { setSelectedClient(c); setPage("manage"); }}>
                      <div className={`avatar sm ${getAvatarColor(c.id)}`}>{c.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div className="font-bold">{c.name}</div>
                        <div className="text-xs text-muted">{c.goal}</div>
                      </div>
                      <span className="text-muted text-xs">Gestisci →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {isTrainer && page === "clients" && (
              <TrainerClients clients={clients} onSelect={c => { setSelectedClient(c); setPage("manage"); }} />
            )}
            {isTrainer && page === "manage" && selectedClient && (
              <TrainerManageClient client={selectedClient} onBack={() => { setPage("clients"); setSelectedClient(null); }} reload={reloadClients} />
            )}
            {!isTrainer && page === "dashboard" && (
              <ClientDashboard user={user} workouts={myWorkouts} schedule={mySchedule} />
            )}
            {!isTrainer && page === "workouts" && (
              <MyWorkouts workouts={myWorkouts} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
