# ⚡ Text Aura

A gamified text-transformation web app. Paste any message, pick one of **12 personas**, and watch it get re-cast — then earn streaks, karma, ranks, and shareable "Aura Cards."

Built with **Vite + React + Tailwind CSS + Lucide**, mobile-first, dark-mode by default, with a glassmorphism + neon aesthetic.

---

## ✨ Features

- **12 personas** across three categories:
  - **Utilities** — De-Claw, Corporate Polish
  - **Pop Culture** — Cartoon Mouse, Dr. Evil, Napoleon, Yellow Minion
  - **Stereotypes** — Gen-Z Brainrot, Gym Bro, Southern Grandma, High-Seas Pirate, Medieval Knight, Coastal Surfer
- **Live chat preview** — a smartphone mockup with a grey incoming bubble (original) and a glowing neon outgoing bubble (transformed).
- **Gamification engine** — consecutive-day streaks, per-persona usage stats, karma points, an animated `+Aura` score, rank/badge ladders, and an **Aura Trophies** modal.
- **Action dashboard** — `⚡ Copy & Switch to Chat` (copies the output and opens the native Messages composer via an `sms:` link) and `📸 Download Aura Card` (renders a social-ready PNG via `html2canvas`).
- **Micro-SaaS paywall** — 5 free shifts/day, then an animated subscription modal (Monthly $2.99 / Annual Legend $29).
- **Resilient API layer** — uses the Anthropic Messages API when a key is set; otherwise runs **Sandbox Demo Mode** with curated client-side templates so it's interactive out of the box. If a live call fails, it gracefully falls back to the sandbox template.

---

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (defaults to http://localhost:5173).

### Enable live AI (optional)

The app works immediately in **Sandbox Demo Mode**. To enable real LLM transformations:

```bash
cp .env.example .env
# then edit .env and set:
# VITE_AI_API_KEY=sk-ant-...
```

> ⚠️ A Vite SPA ships any key to the browser. `dangerouslyAllowBrowser` is enabled for local/demo use only. For production, proxy requests through a small backend that holds the key server-side.

The model defaults to `claude-opus-4-8` in [`src/services/api.js`](src/services/api.js); change `MODEL` to `claude-haiku-4-5` for faster/cheaper runs.

---

## 🎮 Gamification reference

| Path | Tracked by | Ranks |
| --- | --- | --- |
| **Gen-Z Brainrot** | uses | No Cap Cadet (1–5) → Rizz Apprentice (6–15) → Skibidi Ohio Sigma (16–49) → Flawless Rizz (50+) |
| **Medieval Knight** | uses | Humble Squire → Iron Vanguard → Paladin of Aura → Medieval Warlord (same thresholds) |
| **De-Claw** (Peacekeeper) | karma | Tiff Diffuser (1–10) → De-Escalation Expert (11–30) → Zen Master (31–50) → Global Diplomat (51+) |
| **Corporate Polish** (Executive) | karma | Intern → Middle Manager → Vice President → Chief Aura Officer (CEO) (same thresholds) |

Karma points are earned **only** from De-Claw and Corporate Polish shifts.

### 🔑 Admin backdoor (family testing)

Click the footer copyright text **5 times** in a row to activate **Admin Mode** — it grants unlimited free shifts.

---

## 🗂️ Project structure

```
text-aura/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx                 # state + wiring
    ├── index.css               # Tailwind + glass/neon theme
    ├── services/
    │   ├── api.js              # Anthropic SDK + sandbox fallback
    │   ├── personas.js         # 12 personas: prompts + sandbox templates
    │   ├── storage.js          # localStorage DB, streak, paywall counter
    │   └── gamification.js     # ranks, badges, karma, aura score
    └── components/
        ├── Header.jsx          # title, streak, aura-token badge, trophies
        ├── InputArea.jsx       # textarea + clipboard paste
        ├── PersonaGrid.jsx     # 12-persona categorized grid
        ├── ChatPreview.jsx     # smartphone mockup (screenshot target)
        ├── ActionDashboard.jsx # copy+sms, download card
        ├── PaywallModal.jsx
        ├── TrophiesModal.jsx
        ├── Modal.jsx
        └── Footer.jsx          # sandbox notice + admin backdoor
```

---

## 🛠️ Build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build
```
