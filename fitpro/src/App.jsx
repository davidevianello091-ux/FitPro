import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
const INITIAL_USERS = [
  { id: 1, name: "Marco Bianchi", email: "marco@email.com", password: "123", role: "client", avatar: "MB", goal: "Ipertrofia" },
  { id: 2, name: "Sara Rossi", email: "sara@email.com", password: "123", role: "client", avatar: "SR", goal: "Dimagrimento" },
  { id: 3, name: "Luca Verdi", email: "luca@email.com", password: "123", role: "client", avatar: "LV", goal: "Forza" },
  { id: 99, name: "Coach Alex", email: "coach@email.com", password: "coach", role: "trainer", avatar: "CA", goal: "" },
];

const EXERCISE_LIBRARY = [
  "Panca Piana", "Panca Inclinata", "Croci ai Cavi", "Push-up", "Dips",
  "Trazioni", "Lat Machine", "Rematore Bilanciere", "Scrollata di Spalle",
  "Military Press", "Alzate Laterali", "Alzate Frontali",
  "Squat", "Leg Press", "Affondi", "Leg Curl", "Leg Extension", "Hip Thrust",
  "Stacco da Terra", "Stacco Rumeno",
  "Curl Bilanciere", "Curl Manubri", "Curl Martello",
  "Tricep Pushdown", "French Press", "Kickback",
  "Plank", "Crunch", "Russian Twist", "Leg Raise"
];

const DAYS_IT = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

const genId = () => Math.random().toString(36).slice(2);

// ── CODICE SEGRETO TRAINER ────────────────────────────────────────────────────
// Cambia questa stringa con il tuo codice segreto prima del deploy!
const TRAINER_SECRET_CODE = "FITPRO-COACH-2025";

const INITIAL_WORKOUTS = {
  1: [
    {
      id: "w1", name: "Push A", clientId: 1,
      exercises: [
        { id: "e1", name: "Panca Piana", sets: 4, reps: "8-10", load: 80, rest: 90, notes: "Tieni i gomiti a 45°" },
        { id: "e2", name: "Military Press", sets: 3, reps: "10-12", load: 50, rest: 75, notes: "" },
        { id: "e3", name: "Alzate Laterali", sets: 4, reps: "15", load: 12, rest: 60, notes: "Movimento controllato" },
      ],
      history: [
        { date: "2025-01-10", entries: [{ exId: "e1", load: 75 }, { exId: "e2", load: 47.5 }] },
        { date: "2025-02-01", entries: [{ exId: "e1", load: 77.5 }, { exId: "e2", load: 50 }] },
        { date: "2025-03-01", entries: [{ exId: "e1", load: 80 }, { exId: "e2", load: 50 }] },
        { date: "2025-04-01", entries: [{ exId: "e1", load: 82.5 }, { exId: "e2", load: 52.5 }] },
        { date: "2025-05-01", entries: [{ exId: "e1", load: 80 }, { exId: "e2", load: 55 }] },
      ]
    },
    {
      id: "w2", name: "Pull A", clientId: 1,
      exercises: [
        { id: "e4", name: "Trazioni", sets: 4, reps: "6-8", load: 0, rest: 120, notes: "Peso corporeo + zavorra" },
        { id: "e5", name: "Rematore Bilanciere", sets: 4, reps: "8-10", load: 70, rest: 90, notes: "" },
      ],
      history: [
        { date: "2025-01-15", entries: [{ exId: "e5", load: 60 }] },
        { date: "2025-02-10", entries: [{ exId: "e5", load: 65 }] },
        { date: "2025-03-10", entries: [{ exId: "e5", load: 70 }] },
        { date: "2025-04-10", entries: [{ exId: "e5", load: 70 }] },
        { date: "2025-05-10", entries: [{ exId: "e5", load: 72.5 }] },
      ]
    },
    {
      id: "w3", name: "Legs A", clientId: 1,
      exercises: [
        { id: "e6", name: "Squat", sets: 5, reps: "5", load: 100, rest: 180, notes: "Full depth" },
        { id: "e7", name: "Leg Press", sets: 3, reps: "12-15", load: 160, rest: 90, notes: "" },
      ],
      history: [
        { date: "2025-01-20", entries: [{ exId: "e6", load: 90 }] },
        { date: "2025-02-20", entries: [{ exId: "e6", load: 95 }] },
        { date: "2025-03-20", entries: [{ exId: "e6", load: 100 }] },
        { date: "2025-04-20", entries: [{ exId: "e6", load: 105 }] },
        { date: "2025-05-05", entries: [{ exId: "e6", load: 100 }] },
      ]
    }
  ],
  2: [
    {
      id: "w4", name: "Full Body 1", clientId: 2,
      exercises: [
        { id: "e8", name: "Squat", sets: 3, reps: "12", load: 40, rest: 60, notes: "" },
        { id: "e9", name: "Panca Piana", sets: 3, reps: "12", load: 30, rest: 60, notes: "" },
        { id: "e10", name: "Lat Machine", sets: 3, reps: "12", load: 40, rest: 60, notes: "" },
      ],
      history: [
        { date: "2025-03-01", entries: [{ exId: "e8", load: 35 }, { exId: "e9", load: 27.5 }] },
        { date: "2025-04-01", entries: [{ exId: "e8", load: 37.5 }, { exId: "e9", load: 30 }] },
        { date: "2025-05-01", entries: [{ exId: "e8", load: 40 }, { exId: "e9", load: 30 }] },
      ]
    }
  ],
  3: []
};

const INITIAL_SCHEDULE = {
  1: { 0: "w1", 2: "w2", 4: "w3" },
  2: { 0: "w4", 2: "w4", 4: "w4" },
  3: {}
};

// ── STYLES ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #12121a;
    --surface2: #1a1a26;
    --surface3: #22223a;
    --border: #2a2a42;
    --accent: #6c63ff;
    --accent2: #ff6b6b;
    --accent3: #43e97b;
    --text: #e8e8f5;
    --text2: #8888aa;
    --text3: #5555770;
    --gold: #f7c948;
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px; }

  .app { display: flex; height: 100vh; overflow: hidden; }

  /* SIDEBAR */
  .sidebar {
    width: 220px; min-width: 220px; background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 24px 0;
    overflow-y: auto;
  }
  .sidebar-logo {
    font-family: 'Bebas Neue', cursive; font-size: 26px; letter-spacing: 2px;
    color: var(--accent); padding: 0 20px 24px; border-bottom: 1px solid var(--border);
    line-height: 1;
  }
  .sidebar-logo span { color: var(--accent2); }
  .sidebar-section { padding: 16px 12px 4px; font-size: 10px; font-weight: 600; letter-spacing: 2px; color: var(--text2); text-transform: uppercase; }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 20px;
    cursor: pointer; border-radius: 0; transition: all 0.15s;
    color: var(--text2); font-size: 13px; font-weight: 500;
    border-left: 3px solid transparent;
  }
  .nav-item:hover { color: var(--text); background: var(--surface2); }
  .nav-item.active { color: var(--accent); background: rgba(108,99,255,0.08); border-left-color: var(--accent); }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; }

  .sidebar-user {
    margin-top: auto; padding: 16px 20px; border-top: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .avatar.sm { width: 28px; height: 28px; font-size: 10px; }
  .avatar.lg { width: 44px; height: 44px; font-size: 14px; }
  .avatar.accent2 { background: var(--accent2); }
  .avatar.accent3 { background: var(--accent3); color: #111; }
  .avatar.gold { background: var(--gold); color: #111; }

  /* MAIN */
  .main { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
  .topbar {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 16px 28px; display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 10;
  }
  .page-title { font-family: 'Bebas Neue', cursive; font-size: 22px; letter-spacing: 1px; color: var(--text); }
  .content { padding: 24px 28px; flex: 1; }

  /* CARDS */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 20px;
  }
  .card-title { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text2); margin-bottom: 12px; }

  /* GRID */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

  /* BUTTONS */
  .btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
    border: none; border-radius: 6px; cursor: pointer; font-family: 'DM Sans'; font-size: 13px; font-weight: 600;
    transition: all 0.15s;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #7c73ff; }
  .btn-danger { background: rgba(255,107,107,0.15); color: var(--accent2); border: 1px solid rgba(255,107,107,0.3); }
  .btn-danger:hover { background: rgba(255,107,107,0.25); }
  .btn-ghost { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--surface3); }
  .btn-sm { padding: 5px 10px; font-size: 12px; }
  .btn-xs { padding: 3px 8px; font-size: 11px; border-radius: 4px; }
  .btn-success { background: rgba(67,233,123,0.15); color: var(--accent3); border: 1px solid rgba(67,233,123,0.3); }

  /* INPUTS */
  .input, .select, .textarea {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 6px; padding: 8px 12px; color: var(--text); font-family: 'DM Sans'; font-size: 13px;
    outline: none; transition: border 0.15s;
  }
  .input:focus, .select:focus, .textarea:focus { border-color: var(--accent); }
  .select option { background: var(--surface2); }
  .textarea { resize: vertical; min-height: 60px; }
  .form-row { display: flex; gap: 12px; margin-bottom: 12px; }
  .form-group { flex: 1; }
  .form-label { font-size: 11px; font-weight: 600; letter-spacing: 1px; color: var(--text2); margin-bottom: 5px; display: block; text-transform: uppercase; }

  /* BADGE */
  .badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-accent { background: rgba(108,99,255,0.2); color: var(--accent); }
  .badge-red { background: rgba(255,107,107,0.2); color: var(--accent2); }
  .badge-green { background: rgba(67,233,123,0.15); color: var(--accent3); }
  .badge-gold { background: rgba(247,201,72,0.15); color: var(--gold); }

  /* STAT BOX */
  .stat { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 16px; }
  .stat-value { font-family: 'Bebas Neue', cursive; font-size: 32px; line-height: 1; color: var(--text); }
  .stat-label { font-size: 11px; color: var(--text2); margin-top: 4px; font-weight: 500; }
  .stat-delta { font-size: 12px; font-weight: 600; margin-top: 6px; }
  .delta-up { color: var(--accent3); }
  .delta-down { color: var(--accent2); }

  /* TABLE */
  .table { width: 100%; border-collapse: collapse; }
  .table th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text2); border-bottom: 1px solid var(--border); }
  .table td { padding: 12px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
  .table tr:hover td { background: rgba(255,255,255,0.02); }
  .table tr:last-child td { border-bottom: none; }

  /* EXERCISE CARD */
  .ex-card {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 8px;
    padding: 14px 16px; display: flex; align-items: flex-start; gap: 14px; margin-bottom: 8px;
  }
  .ex-num { font-family: 'Bebas Neue', cursive; font-size: 22px; color: var(--accent); width: 28px; text-align: center; flex-shrink: 0; line-height: 1; margin-top: 2px; }
  .ex-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
  .ex-meta { display: flex; gap: 14px; flex-wrap: wrap; }
  .ex-meta-item { font-size: 12px; color: var(--text2); }
  .ex-meta-item strong { color: var(--text); font-weight: 600; }
  .ex-note { font-size: 12px; color: var(--text2); margin-top: 6px; font-style: italic; border-left: 2px solid var(--accent); padding-left: 8px; }

  /* WEEK GRID */
  .week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
  .day-cell {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 8px;
    padding: 12px; min-height: 90px; cursor: pointer; transition: all 0.15s;
    display: flex; flex-direction: column; gap: 6px;
  }
  .day-cell:hover { border-color: var(--accent); }
  .day-cell.has-workout { border-color: rgba(108,99,255,0.4); background: rgba(108,99,255,0.06); }
  .day-name { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text2); }
  .day-workout-chip { background: var(--accent); color: #fff; border-radius: 4px; padding: 3px 8px; font-size: 11px; font-weight: 600; }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex;
    align-items: center; justify-content: center; z-index: 100; padding: 20px;
  }
  .modal {
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    width: 100%; max-width: 580px; max-height: 85vh; overflow-y: auto;
    padding: 24px;
  }
  .modal-title { font-family: 'Bebas Neue', cursive; font-size: 22px; letter-spacing: 1px; margin-bottom: 20px; }

  /* LOGIN */
  .login-screen {
    position: fixed; inset: 0; background: var(--bg);
    display: flex; align-items: center; justify-content: center;
  }
  .login-box { width: 100%; max-width: 380px; padding: 20px; }
  .login-logo { font-family: 'Bebas Neue', cursive; font-size: 42px; letter-spacing: 3px; color: var(--accent); margin-bottom: 4px; }
  .login-sub { color: var(--text2); font-size: 13px; margin-bottom: 32px; }

  /* TABS */
  .tabs { display: flex; gap: 2px; background: var(--surface2); border-radius: 8px; padding: 4px; margin-bottom: 20px; }
  .tab {
    flex: 1; padding: 8px; text-align: center; border-radius: 6px; cursor: pointer;
    font-size: 12px; font-weight: 600; color: var(--text2); transition: all 0.15s;
  }
  .tab.active { background: var(--accent); color: #fff; }

  /* CHART WRAPPER */
  .chart-wrap { height: 200px; }

  /* CLIENT ROW */
  .client-card {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 8px;
    padding: 14px 16px; display: flex; align-items: center; gap: 14px;
    cursor: pointer; transition: all 0.15s; margin-bottom: 8px;
  }
  .client-card:hover { border-color: var(--accent); background: rgba(108,99,255,0.06); }

  /* FLEX UTILS */
  .flex { display: flex; }
  .flex-center { display: flex; align-items: center; }
  .flex-between { display: flex; align-items: center; justify-content: space-between; }
  .gap-8 { gap: 8px; }
  .gap-12 { gap: 12px; }
  .gap-16 { gap: 16px; }
  .mt-4 { margin-top: 4px; }
  .mt-8 { margin-top: 8px; }
  .mt-12 { margin-top: 12px; }
  .mt-16 { margin-top: 16px; }
  .mt-20 { margin-top: 20px; }
  .mb-8 { margin-bottom: 8px; }
  .mb-12 { margin-bottom: 12px; }
  .mb-16 { margin-bottom: 16px; }
  .text-sm { font-size: 12px; }
  .text-xs { font-size: 11px; }
  .text-muted { color: var(--text2); }
  .text-accent { color: var(--accent); }
  .text-red { color: var(--accent2); }
  .text-green { color: var(--accent3); }
  .font-bold { font-weight: 700; }
  .divider { height: 1px; background: var(--border); margin: 16px 0; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* Tooltip custom */
  .recharts-tooltip-wrapper .recharts-default-tooltip {
    background: var(--surface2) !important; border: 1px solid var(--border) !important;
    border-radius: 6px !important; font-family: 'DM Sans' !important;
  }
`;

// ── EMAIL PREVIEW MODAL ───────────────────────────────────────────────────────
function EmailPreviewModal({ email, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(email.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="flex-between mb-16">
          <div className="modal-title" style={{ margin: 0 }}>✉️ Email di Benvenuto</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Chiudi</button>
        </div>
        {/* email header */}
        <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px", marginBottom: 12 }}>
          <div className="text-xs text-muted mb-4"><strong style={{ color: "var(--text)" }}>A:</strong> {email.to}</div>
          <div className="text-xs text-muted mb-4"><strong style={{ color: "var(--text)" }}>Da:</strong> noreply@fitpro.app</div>
          <div className="text-xs text-muted"><strong style={{ color: "var(--text)" }}>Oggetto:</strong> {email.subject}</div>
        </div>
        {/* email body */}
        <div style={{
          background: "#fff", borderRadius: 8, padding: 0, overflow: "hidden",
          border: "1px solid var(--border)", maxHeight: 420, overflowY: "auto"
        }}>
          <div dangerouslySetInnerHTML={{ __html: email.body }} />
        </div>
        <div className="flex gap-8 mt-12">
          <button className="btn btn-ghost btn-sm" onClick={copy}>
            {copied ? "✓ Copiato!" : "📋 Copia HTML"}
          </button>
          <div className="text-xs text-muted" style={{ display: "flex", alignItems: "center" }}>
            In produzione questa email verrebbe inviata automaticamente.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── GENERATE WELCOME EMAIL VIA CLAUDE API ─────────────────────────────────────
async function generateWelcomeEmail(user) {
  const prompt = `Genera una email HTML di benvenuto per un nuovo utente che si è appena registrato alla piattaforma FitPro, un'app per la gestione delle schede di allenamento.

Dati utente:
- Nome: ${user.name}
- Email: ${user.email}
- Obiettivo: ${user.goal || "non specificato"}

L'email deve:
1. Essere in italiano
2. Avere un design moderno con sfondo scuro (#0a0a0f), colori viola (#6c63ff) e bianco
3. Includere: intestazione con logo FITPRO, messaggio di benvenuto personalizzato, riepilogo dell'obiettivo, lista di cosa può fare con l'app (schede, progressioni, pianificazione), call-to-action per accedere
4. Footer con testo "© 2025 FitPro — La tua piattaforma di allenamento"
5. Essere HTML completo e autonomo (inline CSS, niente link esterni)
6. Tono motivazionale e professionale

Rispondi SOLO con il codice HTML dell'email, senza nessun testo aggiuntivo, senza markdown, senza backtick.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  const html = data.content?.find(b => b.type === "text")?.text || "";
  return html.replace(/```html|```/g, "").trim();
}

// ── AUTH SCREEN (login + registrazione) ───────────────────────────────────────
function LoginScreen({ onLogin, users, onRegister }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  // register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regPass2, setRegPass2] = useState("");
  const [regGoal, setRegGoal] = useState("Ipertrofia");
  const [regLoading, setRegLoading] = useState(false);
  const [welcomeEmail, setWelcomeEmail] = useState(null);
  const [regTrainerCode, setRegTrainerCode] = useState("");
  const [showTrainerField, setShowTrainerField] = useState(false); // { to, subject, body }

  const handleLogin = () => {
    setErr("");
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) onLogin(user);
    else setErr("Credenziali non valide. Controlla email e password.");
  };

  const validateRegister = () => {
    if (!regName.trim()) return "Inserisci il tuo nome completo.";
    if (!regEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Email non valida.";
    if (users.find(u => u.email === regEmail)) return "Questa email è già registrata.";
    if (regPass.length < 6) return "La password deve avere almeno 6 caratteri.";
    if (regPass !== regPass2) return "Le password non coincidono.";
    return null;
  };

  const handleRegister = async () => {
    setErr("");
    const validErr = validateRegister();
    if (validErr) { setErr(validErr); return; }
    setRegLoading(true);

    const initials = regName.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const isTrainerReg = regTrainerCode.trim() === TRAINER_SECRET_CODE;
    const newUser = {
      id: Date.now(),
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      password: regPass,
      role: isTrainerReg ? "trainer" : "client",
      avatar: initials,
      goal: isTrainerReg ? "" : regGoal,
    };

    // Registra l'utente SUBITO — indipendentemente dall'email
    onRegister(newUser);

    // Prova a generare l'email in background (opzionale, non blocca)
    try {
      const emailBody = await generateWelcomeEmail(newUser);
      setWelcomeEmail({
        to: newUser.email,
        subject: `Benvenuto su FitPro, ${newUser.name.split(" ")[0]}! 🏋️`,
        body: emailBody
      });
    } catch (e) {
      // Email fallita — non importa, l'account è già creato
      console.warn("Email generation skipped:", e.message);
      // Vai direttamente all'app
      onLogin(newUser);
    } finally {
      setRegLoading(false);
    }
  };

  const finishRegistration = (user) => {
    setWelcomeEmail(null);
    onLogin(user);
  };

  // When email is ready, show success screen with preview option
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  if (welcomeEmail) {
    const newUser = users[users.length - 1];
    return (
      <>
        <div className="login-screen">
          <div className="login-box" style={{ maxWidth: 420 }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 52, marginBottom: 10 }}>🎉</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 2, color: "var(--accent3)" }}>
                Account Creato!
              </div>
              <div className="text-muted mt-8" style={{ lineHeight: 1.6 }}>
                Benvenuto su FitPro, <strong style={{ color: "var(--text)" }}>{newUser?.name.split(" ")[0]}</strong>!
              </div>
            </div>
            <div style={{
              background: "var(--surface2)", border: "1px solid rgba(67,233,123,0.3)",
              borderRadius: 8, padding: "12px 16px", marginBottom: 16
            }}>
              <div className="text-xs" style={{ color: "var(--accent3)", marginBottom: 4 }}>✓ Email di benvenuto generata</div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{welcomeEmail.to}</div>
              <div className="text-xs text-muted mt-2">{welcomeEmail.subject}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn btn-ghost" style={{ justifyContent: "center" }}
                onClick={() => setShowEmailPreview(true)}>
                👁 Vedi Anteprima Email
              </button>
              <button className="btn btn-primary" style={{ justifyContent: "center", padding: 12 }}
                onClick={() => finishRegistration(newUser)}>
                Accedi alla tua Area →
              </button>
            </div>
          </div>
        </div>
        {showEmailPreview && <EmailPreviewModal email={welcomeEmail} onClose={() => setShowEmailPreview(false)} />}
      </>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-box" style={{ maxWidth: mode === "register" ? 420 : 380 }}>
        <div className="login-logo">FITPRO</div>
        <div className="login-sub">{mode === "login" ? "Gestione Schede Allenamento" : "Crea il tuo account"}</div>

        {/* TABS */}
        <div className="tabs" style={{ marginBottom: 20 }}>
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
                placeholder="••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            {err && <div className="text-red text-sm mb-12">⚠ {err}</div>}
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px" }} onClick={handleLogin}>
              Accedi
            </button>
            <div className="divider" />
            <div className="text-xs text-muted">
              <strong>Demo:</strong> coach@email.com / coach &nbsp;|&nbsp; marco@email.com / 123
            </div>
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
                <option>Ipertrofia</option>
                <option>Forza</option>
                <option>Dimagrimento</option>
                <option>Resistenza</option>
                <option>Mobilità</option>
                <option>Benessere Generale</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="input" type="password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Min. 6 caratteri" />
              </div>
              <div className="form-group">
                <label className="form-label">Conferma</label>
                <input className="input" type="password" value={regPass2} onChange={e => setRegPass2(e.target.value)}
                  placeholder="Ripeti password" onKeyDown={e => e.key === "Enter" && !regLoading && handleRegister()} />
              </div>
            </div>

            {/* Trainer code toggle */}
            <div className="mb-12">
              <div
                onClick={() => setShowTrainerField(p => !p)}
                style={{ cursor: "pointer", fontSize: 12, color: "var(--text2)", display: "flex", alignItems: "center", gap: 6, userSelect: "none" }}>
                <span style={{ fontSize: 14 }}>{showTrainerField ? "▾" : "▸"}</span>
                Sei un personal trainer?
              </div>
              {showTrainerField && (
                <div style={{ marginTop: 8 }}>
                  <label className="form-label">Codice Trainer</label>
                  <input
                    className="input"
                    type="password"
                    value={regTrainerCode}
                    onChange={e => setRegTrainerCode(e.target.value)}
                    placeholder="Inserisci il codice segreto"
                  />
                  {regTrainerCode && regTrainerCode !== TRAINER_SECRET_CODE && (
                    <div className="text-xs text-red mt-4">⚠ Codice non valido</div>
                  )}
                  {regTrainerCode === TRAINER_SECRET_CODE && (
                    <div className="text-xs text-green mt-4">✓ Codice trainer valido — verrai registrato come Coach</div>
                  )}
                </div>
              )}
            </div>

            {err && <div className="text-red text-sm mb-12">⚠ {err}</div>}
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px", marginTop: 4 }}
              onClick={handleRegister} disabled={regLoading}>
              {regLoading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Creazione account...
                </span>
              ) : regTrainerCode === TRAINER_SECRET_CODE ? "Crea Account Coach 🏅" : "Crea Account ✨"}
            </button>
            <div className="text-xs text-muted mt-12" style={{ textAlign: "center" }}>
              {regTrainerCode === TRAINER_SECRET_CODE
                ? "Avrai accesso completo alla gestione dei clienti."
                : "Registrati come atleta — il tuo coach ti assegnerà le schede."}
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── TOOLTIP CUSTOM ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px" }}>
      <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.name}: {p.value} {p.unit || "kg"}
        </div>
      ))}
    </div>
  );
};

// ── DASHBOARD (client) ────────────────────────────────────────────────────────
function ClientDashboard({ user, workouts, schedule }) {
  const myWorkouts = workouts[user.id] || [];
  const schedDays = schedule[user.id] || {};
  const totalEx = myWorkouts.reduce((s, w) => s + w.exercises.length, 0);
  const weekSessions = Object.keys(schedDays).length;

  // volume chart per workout
  const volumeData = myWorkouts.map(w => {
    const lastHist = w.history[w.history.length - 1];
    const vol = w.exercises.reduce((s, ex) => {
      const entry = lastHist?.entries.find(e => e.exId === ex.id);
      return s + (entry?.load || ex.load) * ex.sets * (parseInt(ex.reps) || 10);
    }, 0);
    return { name: w.name, volume: vol };
  });

  // Progress of first workout first exercise
  const mainWorkout = myWorkouts[0];
  const mainEx = mainWorkout?.exercises[0];
  const progressData = mainWorkout?.history.map(h => {
    const e = h.entries.find(x => x.exId === mainEx?.id);
    return { date: h.date.slice(5), load: e?.load || null };
  }).filter(d => d.load !== null) || [];

  return (
    <div>
      <div className="grid-4 mb-16">
        <div className="stat">
          <div className="stat-value">{myWorkouts.length}</div>
          <div className="stat-label">Schede Attive</div>
        </div>
        <div className="stat">
          <div className="stat-value">{totalEx}</div>
          <div className="stat-label">Esercizi Totali</div>
        </div>
        <div className="stat">
          <div className="stat-value">{weekSessions}</div>
          <div className="stat-label">Sessioni / Settimana</div>
        </div>
        <div className="stat">
          <div className="stat-value">{user.goal || "–"}</div>
          <div className="stat-label">Obiettivo</div>
        </div>
      </div>

      <div className="grid-2 mb-16">
        {progressData.length > 1 && mainEx && (
          <div className="card">
            <div className="card-title">📈 Progressione — {mainEx.name}</div>
            <div className="chart-wrap">
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
        {volumeData.length > 0 && (
          <div className="card">
            <div className="card-title">📊 Volume per Scheda</div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--text2)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--text2)", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="volume" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Volume" unit="" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">📅 Piano Settimanale</div>
        <div className="week-grid">
          {DAYS_IT.map((day, i) => {
            const wId = schedDays[i];
            const w = myWorkouts.find(x => x.id === wId);
            return (
              <div key={i} className={`day-cell ${w ? "has-workout" : ""}`}>
                <div className="day-name">{day.slice(0, 3)}</div>
                {w ? <div className="day-workout-chip">{w.name}</div> : <div className="text-xs text-muted" style={{ marginTop: 4 }}>Riposo</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── MY WORKOUTS (client) ──────────────────────────────────────────────────────
function MyWorkouts({ user, workouts }) {
  const myWorkouts = workouts[user.id] || [];
  const [selected, setSelected] = useState(myWorkouts[0]?.id || null);
  const w = myWorkouts.find(x => x.id === selected);

  if (!myWorkouts.length) return (
    <div className="card" style={{ textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🏋️</div>
      <div className="text-muted">Nessuna scheda assegnata ancora.</div>
    </div>
  );

  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <div>
        <div className="card-title mb-8">Le Mie Schede</div>
        {myWorkouts.map(wk => (
          <div key={wk.id} className="client-card" style={{ borderColor: selected === wk.id ? "var(--accent)" : undefined, background: selected === wk.id ? "rgba(108,99,255,0.08)" : undefined }}
            onClick={() => setSelected(wk.id)}>
            <div className="avatar accent">{wk.name.slice(0, 2)}</div>
            <div>
              <div className="font-bold">{wk.name}</div>
              <div className="text-sm text-muted">{wk.exercises.length} esercizi</div>
            </div>
          </div>
        ))}
      </div>
      {w && (
        <div className="card">
          <div className="flex-between mb-16">
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1 }}>{w.name}</div>
            <span className="badge badge-accent">{w.exercises.length} esercizi</span>
          </div>
          {w.exercises.map((ex, i) => (
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

// ── PROGRESSION (client) ──────────────────────────────────────────────────────
function ProgressionView({ user, workouts }) {
  const myWorkouts = workouts[user.id] || [];
  const [selW, setSelW] = useState(myWorkouts[0]?.id || "");
  const [selEx, setSelEx] = useState("");
  const [tab, setTab] = useState("load");

  const w = myWorkouts.find(x => x.id === selW);
  const exercises = w?.exercises || [];

  useEffect(() => {
    if (exercises.length && !selEx) setSelEx(exercises[0]?.id);
  }, [selW]);

  const ex = exercises.find(e => e.id === selEx);

  const loadData = w?.history.map(h => {
    const entry = h.entries.find(e => e.exId === selEx);
    return entry ? { date: h.date.slice(5), load: entry.load } : null;
  }).filter(Boolean) || [];

  const volumeData = w?.history.map(h => {
    const entry = h.entries.find(e => e.exId === selEx);
    if (!entry || !ex) return null;
    const reps = parseInt(ex.reps) || 10;
    return { date: h.date.slice(5), volume: entry.load * ex.sets * reps };
  }).filter(Boolean) || [];

  return (
    <div>
      <div className="card mb-16">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Scheda</label>
            <select className="select" value={selW} onChange={e => { setSelW(e.target.value); setSelEx(""); }}>
              {myWorkouts.map(wk => <option key={wk.id} value={wk.id}>{wk.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Esercizio</label>
            <select className="select" value={selEx} onChange={e => setSelEx(e.target.value)}>
              {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {ex && loadData.length > 0 ? (
        <>
          <div className="tabs">
            <div className={`tab ${tab === "load" ? "active" : ""}`} onClick={() => setTab("load")}>📈 Carico</div>
            <div className={`tab ${tab === "volume" ? "active" : ""}`} onClick={() => setTab("volume")}>📊 Volume</div>
          </div>
          <div className="card">
            <div className="card-title">{tab === "load" ? "Progressione Carico" : "Progressione Volume"} — {ex.name}</div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tab === "load" ? loadData : volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fill: "var(--text2)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--text2)", fontSize: 11 }} unit={tab === "load" ? "kg" : ""} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey={tab === "load" ? "load" : "volume"} stroke={tab === "load" ? "var(--accent)" : "var(--accent3)"}
                    strokeWidth={2.5} dot={{ fill: tab === "load" ? "var(--accent)" : "var(--accent3)", r: 4 }}
                    name={tab === "load" ? "Carico" : "Volume"} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {loadData.length >= 2 && (
              <div className="flex gap-16 mt-12">
                <div className="stat" style={{ flex: 1 }}>
                  <div className="stat-value">{loadData[0].load} kg</div>
                  <div className="stat-label">Inizio</div>
                </div>
                <div className="stat" style={{ flex: 1 }}>
                  <div className="stat-value">{loadData[loadData.length - 1].load} kg</div>
                  <div className="stat-label">Attuale</div>
                </div>
                <div className="stat" style={{ flex: 1 }}>
                  <div className={`stat-value ${loadData[loadData.length - 1].load >= loadData[0].load ? "text-green" : "text-red"}`}>
                    {loadData[loadData.length - 1].load >= loadData[0].load ? "+" : ""}
                    {(loadData[loadData.length - 1].load - loadData[0].load).toFixed(1)} kg
                  </div>
                  <div className="stat-label">Progresso</div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📉</div>
          <div className="text-muted">Nessun dato storico disponibile.</div>
        </div>
      )}
    </div>
  );
}

// ── TRAINER: ALL CLIENTS ──────────────────────────────────────────────────────
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
        <div className="flex-between mb-12">
          <div className="card-title" style={{ margin: 0 }}>Tutti i Clienti</div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Atleta</th><th>Obiettivo</th><th>Schede</th><th></th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => onSelect(c)}>
                <td>
                  <div className="flex-center gap-8">
                    <div className={`avatar sm ${["accent2", "accent3", "gold"][c.id % 3]}`}>{c.avatar}</div>
                    <div>
                      <div className="font-bold">{c.name}</div>
                      <div className="text-xs text-muted">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-accent">{c.goal || "–"}</span></td>
                <td><span className="text-muted">Gestisci →</span></td>
                <td><button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); onSelect(c); }}>Apri</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── TRAINER: MANAGE CLIENT ────────────────────────────────────────────────────
function TrainerManageClient({ client, workouts, schedule, setWorkouts, setSchedule }) {
  const [tab, setTab] = useState("schede");
  const myWorkouts = workouts[client.id] || [];
  const mySchedule = schedule[client.id] || {};
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [editWorkout, setEditWorkout] = useState(null); // workout being edited
  const [showExForm, setShowExForm] = useState(false);
  const [newWName, setNewWName] = useState("");

  // New exercise form
  const emptyEx = () => ({ id: genId(), name: EXERCISE_LIBRARY[0], sets: 3, reps: "10", load: 0, rest: 60, notes: "" });
  const [exForm, setExForm] = useState(emptyEx());

  const createWorkout = () => {
    if (!newWName.trim()) return;
    const w = { id: genId(), name: newWName.trim(), clientId: client.id, exercises: [], history: [] };
    setWorkouts(prev => ({ ...prev, [client.id]: [...(prev[client.id] || []), w] }));
    setNewWName("");
    setShowAddWorkout(false);
    setEditWorkout(w.id);
  };

  const deleteWorkout = (wId) => {
    setWorkouts(prev => ({ ...prev, [client.id]: (prev[client.id] || []).filter(w => w.id !== wId) }));
    setSchedule(prev => {
      const s = { ...(prev[client.id] || {}) };
      Object.keys(s).forEach(k => { if (s[k] === wId) delete s[k]; });
      return { ...prev, [client.id]: s };
    });
    if (editWorkout === wId) setEditWorkout(null);
  };

  const addExercise = (wId) => {
    setWorkouts(prev => ({
      ...prev,
      [client.id]: (prev[client.id] || []).map(w =>
        w.id === wId ? { ...w, exercises: [...w.exercises, { ...exForm, id: genId() }] } : w
      )
    }));
    setExForm(emptyEx());
    setShowExForm(false);
  };

  const removeExercise = (wId, exId) => {
    setWorkouts(prev => ({
      ...prev,
      [client.id]: (prev[client.id] || []).map(w =>
        w.id === wId ? { ...w, exercises: w.exercises.filter(e => e.id !== exId) } : w
      )
    }));
  };

  const toggleSchedule = (dayIdx, wId) => {
    setSchedule(prev => {
      const s = { ...(prev[client.id] || {}) };
      if (s[dayIdx] === wId) delete s[dayIdx];
      else s[dayIdx] = wId;
      return { ...prev, [client.id]: s };
    });
  };

  const ew = myWorkouts.find(w => w.id === editWorkout);

  return (
    <div>
      <div className="flex-center gap-12 mb-16">
        <div className={`avatar lg ${["accent2", "accent3", "gold"][client.id % 3]}`}>{client.avatar}</div>
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
        <div className={`tab ${tab === "progressioni" ? "active" : ""}`} onClick={() => setTab("progressioni")}>📈 Progressioni</div>
      </div>

      {/* SCHEDE TAB */}
      {tab === "schede" && (
        <div className="grid-2" style={{ alignItems: "start" }}>
          <div>
            <div className="flex-between mb-12">
              <div className="card-title" style={{ margin: 0 }}>Schede di {client.name.split(" ")[0]}</div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddWorkout(true)}>+ Nuova</button>
            </div>
            {showAddWorkout && (
              <div className="card mb-12">
                <div className="form-group mb-8">
                  <label className="form-label">Nome Scheda</label>
                  <input className="input" value={newWName} onChange={e => setNewWName(e.target.value)}
                    placeholder="es. Push A, Full Body..." onKeyDown={e => e.key === "Enter" && createWorkout()} />
                </div>
                <div className="flex gap-8">
                  <button className="btn btn-primary btn-sm" onClick={createWorkout}>Crea</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowAddWorkout(false)}>Annulla</button>
                </div>
              </div>
            )}
            {myWorkouts.length === 0 && <div className="text-muted text-sm">Nessuna scheda. Creane una!</div>}
            {myWorkouts.map(w => (
              <div key={w.id} className="client-card"
                style={{ borderColor: editWorkout === w.id ? "var(--accent)" : undefined, background: editWorkout === w.id ? "rgba(108,99,255,0.08)" : undefined }}
                onClick={() => { setEditWorkout(w.id); setShowExForm(false); }}>
                <div className="avatar">{w.name.slice(0, 2)}</div>
                <div style={{ flex: 1 }}>
                  <div className="font-bold">{w.name}</div>
                  <div className="text-xs text-muted">{w.exercises.length} esercizi</div>
                </div>
                <button className="btn btn-danger btn-xs" onClick={e => { e.stopPropagation(); deleteWorkout(w.id); }}>🗑</button>
              </div>
            ))}
          </div>

          {ew && (
            <div className="card">
              <div className="flex-between mb-16">
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1 }}>{ew.name}</div>
                <button className="btn btn-success btn-sm" onClick={() => { setShowExForm(true); setExForm(emptyEx()); }}>+ Esercizio</button>
              </div>

              {showExForm && (
                <div className="card mb-16" style={{ background: "var(--surface3)" }}>
                  <div className="card-title">Nuovo Esercizio</div>
                  <div className="form-group mb-8">
                    <label className="form-label">Esercizio</label>
                    <select className="select" value={exForm.name} onChange={e => setExForm(p => ({ ...p, name: e.target.value }))}>
                      {EXERCISE_LIBRARY.map(ex => <option key={ex}>{ex}</option>)}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Serie</label>
                      <input className="input" type="number" min={1} value={exForm.sets} onChange={e => setExForm(p => ({ ...p, sets: +e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Reps</label>
                      <input className="input" value={exForm.reps} onChange={e => setExForm(p => ({ ...p, reps: e.target.value }))} placeholder="10 o 8-12" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Carico (kg)</label>
                      <input className="input" type="number" min={0} value={exForm.load} onChange={e => setExForm(p => ({ ...p, load: +e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Recupero (s)</label>
                      <input className="input" type="number" min={0} step={15} value={exForm.rest} onChange={e => setExForm(p => ({ ...p, rest: +e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group mb-12">
                    <label className="form-label">Note / Indicazioni</label>
                    <textarea className="textarea" value={exForm.notes} onChange={e => setExForm(p => ({ ...p, notes: e.target.value }))} placeholder="Tecnica, avvertenze..." />
                  </div>
                  <div className="flex gap-8">
                    <button className="btn btn-primary btn-sm" onClick={() => addExercise(ew.id)}>Aggiungi</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowExForm(false)}>Annulla</button>
                  </div>
                </div>
              )}

              {ew.exercises.length === 0 && <div className="text-muted text-sm">Aggiungi il primo esercizio.</div>}
              {ew.exercises.map((ex, i) => (
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

      {/* PIANIFICAZIONE TAB */}
      {tab === "pianificazione" && (
        <div className="card">
          <div className="card-title">Piano Settimanale</div>
          {myWorkouts.length === 0 ? (
            <div className="text-muted text-sm">Prima crea almeno una scheda.</div>
          ) : (
            <>
              <div className="text-xs text-muted mb-16">Clicca su un giorno per assegnare/rimuovere una scheda.</div>
              <div className="week-grid">
                {DAYS_IT.map((day, i) => {
                  const wId = mySchedule[i];
                  const w = myWorkouts.find(x => x.id === wId);
                  return (
                    <div key={i} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, minHeight: 120 }}>
                      <div className="day-name mb-8">{day}</div>
                      {myWorkouts.map(wk => (
                        <div key={wk.id}
                          onClick={() => toggleSchedule(i, wk.id)}
                          style={{
                            padding: "4px 8px", borderRadius: 4, marginBottom: 4, cursor: "pointer", fontSize: 11, fontWeight: 600,
                            background: mySchedule[i] === wk.id ? "var(--accent)" : "var(--surface3)",
                            color: mySchedule[i] === wk.id ? "#fff" : "var(--text2)",
                            transition: "all 0.15s"
                          }}>
                          {wk.name}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* PROGRESSIONI TAB */}
      {tab === "progressioni" && (
        <ProgressionView user={client} workouts={workouts} />
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [workouts, setWorkouts] = useState(INITIAL_WORKOUTS);
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [selectedClient, setSelectedClient] = useState(null);
  const [allUsers, setAllUsers] = useState(INITIAL_USERS);

  const handleRegister = (newUser) => {
    setAllUsers(prev => [...prev, newUser]);
    setWorkouts(prev => ({ ...prev, [newUser.id]: [] }));
    setSchedule(prev => ({ ...prev, [newUser.id]: {} }));
  };

  const clients = allUsers.filter(u => u.role === "client");
  const isTrainer = user?.role === "trainer";

  const navItems = isTrainer ? [
    { id: "dashboard", icon: "⚡", label: "Dashboard" },
    { id: "clients", icon: "👥", label: "Clienti" },
    { id: "manage", icon: "📝", label: "Gestisci", hidden: !selectedClient },
  ] : [
    { id: "dashboard", icon: "⚡", label: "Dashboard" },
    { id: "workouts", icon: "🏋️", label: "Le Mie Schede" },
    { id: "progression", icon: "📈", label: "Progressioni" },
  ];

  const pageTitles = {
    dashboard: "Dashboard",
    clients: "I Miei Clienti",
    manage: selectedClient ? `${selectedClient.name}` : "Gestisci",
    workouts: "Le Mie Schede",
    progression: "Progressioni",
  };

  if (!user) return (
    <>
      <style>{css}</style>
      <LoginScreen onLogin={(u) => { setUser(u); setPage("dashboard"); }} users={allUsers} onRegister={handleRegister} />
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-logo">FIT<span>PRO</span></div>
          <div className="sidebar-section">Menu</div>
          {navItems.filter(n => !n.hidden).map(n => (
            <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </div>
          ))}

          <div className="sidebar-user">
            <div className={`avatar sm ${isTrainer ? "gold" : "accent2"}`}>{user.avatar}</div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontSize: 10, color: "var(--text2)" }}>{isTrainer ? "Trainer" : "Atleta"}</div>
            </div>
            <button className="btn btn-ghost btn-xs" onClick={() => { setUser(null); setSelectedClient(null); }}>↩</button>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          <div className="topbar">
            <div className="page-title">{pageTitles[page]}</div>
            {isTrainer && page === "manage" && selectedClient && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setPage("clients"); setSelectedClient(null); }}>
                ← Tutti i clienti
              </button>
            )}
          </div>
          <div className="content">
            {/* TRAINER PAGES */}
            {isTrainer && page === "dashboard" && (
              <div>
                <div className="grid-4 mb-16">
                  <div className="stat"><div className="stat-value">{clients.length}</div><div className="stat-label">Clienti Attivi</div></div>
                  <div className="stat"><div className="stat-value">{Object.values(workouts).flat().length}</div><div className="stat-label">Schede Totali</div></div>
                  <div className="stat"><div className="stat-value">{Object.values(workouts).flat().reduce((s, w) => s + w.exercises.length, 0)}</div><div className="stat-label">Esercizi</div></div>
                  <div className="stat"><div className="stat-value">12</div><div className="stat-label">Sessioni Questa Sett.</div></div>
                </div>
                <div className="card">
                  <div className="card-title">Accesso Rapido Clienti</div>
                  {clients.map(c => (
                    <div key={c.id} className="client-card" onClick={() => { setSelectedClient(c); setPage("manage"); }}>
                      <div className={`avatar sm ${["accent2", "accent3", "gold"][c.id % 3]}`}>{c.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div className="font-bold">{c.name}</div>
                        <div className="text-xs text-muted">{(workouts[c.id] || []).length} schede — {c.goal}</div>
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
              <TrainerManageClient
                client={selectedClient}
                workouts={workouts}
                schedule={schedule}
                setWorkouts={setWorkouts}
                setSchedule={setSchedule}
              />
            )}

            {/* CLIENT PAGES */}
            {!isTrainer && page === "dashboard" && (
              <ClientDashboard user={user} workouts={workouts} schedule={schedule} />
            )}
            {!isTrainer && page === "workouts" && (
              <MyWorkouts user={user} workouts={workouts} />
            )}
            {!isTrainer && page === "progression" && (
              <ProgressionView user={user} workouts={workouts} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
