# 🏋️ FitPro — Deploy su Vercel

App per la gestione delle schede di allenamento. PWA installabile su mobile e desktop.

---

## 🚀 Deploy in 5 minuti

### Metodo 1 — GitHub + Vercel (consigliato)

**Step 1 — Carica il progetto su GitHub**
1. Vai su [github.com](https://github.com) e crea un account (gratis)
2. Clicca **"New repository"**, chiamalo `fitpro`, lascialo Public
3. Clicca **"uploading an existing file"**
4. Trascina TUTTI i file di questa cartella (incluse sottocartelle `src/` e `public/`)
5. Clicca **"Commit changes"**

**Step 2 — Deploy su Vercel**
1. Vai su [vercel.com](https://vercel.com) e crea un account (gratis, accedi con GitHub)
2. Clicca **"Add New Project"**
3. Seleziona il repository `fitpro`
4. Vercel rileva automaticamente Vite → clicca **"Deploy"**
5. In ~1 minuto hai il link: `https://fitpro-xxx.vercel.app`

**Step 3 — Aggiungi la API key di Anthropic**
1. Nel dashboard Vercel → **Settings → Environment Variables**
2. Aggiungi: `VITE_ANTHROPIC_API_KEY` = la tua chiave da [console.anthropic.com](https://console.anthropic.com)
3. Clicca **Redeploy** per applicare

---

### Metodo 2 — Vercel CLI (se hai Node.js installato)

```bash
# Installa Vercel CLI
npm install -g vercel

# Entra nella cartella del progetto
cd fitpro

# Installa dipendenze
npm install

# Deploy
vercel

# Segui le istruzioni → in 1 minuto sei online
```

---

## 📱 Installare come app (PWA)

**Su iPhone/iPad:**
1. Apri il link Vercel in Safari
2. Tocca il tasto **Condividi** (quadrato con freccia)
3. Scorri e tocca **"Aggiungi a schermata Home"**
4. L'app appare come icona viola nella home

**Su Android:**
1. Apri il link in Chrome
2. Tocca i **3 puntini** in alto a destra
3. Tocca **"Aggiungi a schermata Home"** o **"Installa app"**

**Su PC (Chrome/Edge):**
1. Apri il link nel browser
2. Clicca l'icona 📥 nella barra degli indirizzi (angolo destro)
3. Clicca **"Installa"**
4. L'app si apre come finestra separata, senza barra del browser

---

## 🔧 Sviluppo locale

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## 📁 Struttura progetto

```
fitpro/
├── src/
│   ├── main.jsx        # Entry point React
│   └── App.jsx         # App completa
├── public/
│   ├── icon-192.png    # Icona PWA
│   ├── icon-512.png    # Icona PWA grande
│   ├── apple-touch-icon.png
│   └── favicon.ico
├── index.html
├── vite.config.js      # Config Vite + PWA
├── vercel.json         # Config routing Vercel
└── package.json
```

---

## 🔑 Credenziali demo

| Ruolo | Email | Password |
|-------|-------|----------|
| **Trainer** | coach@email.com | coach |
| Cliente | marco@email.com | 123 |
| Cliente | sara@email.com | 123 |
| Cliente | luca@email.com | 123 |
