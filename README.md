# ⚡ Text Aura

A gamified text-transformation web app. Paste any message, pick one of **12 personas**, and watch it get re-cast — then earn streaks, karma, ranks, and shareable "Aura Cards."

Built with **Vite + React + Tailwind CSS + Lucide**, mobile-first, dark-mode by default, with a glassmorphism + neon aesthetic.

---

## ✨ Features

- **16 personas** across three categories (some level-locked):
  - **Utilities** — De-Claw, Corporate Polish
  - **Pop Culture** — Cartoon Mouse, Dr. Evil, Drill Sergeant, Yellow Minion, Shakespeare 🔒
  - **Stereotypes** — Gen-Z Brainrot, Gym Bro, Southern Grandma, High-Seas Pirate, Medieval Knight, Coastal Surfer, Karen 🔒, Rizz Lord 🔒, Conspiracy Theorist 🔒
  - 🔒 = unlocks after a number of total shifts (Karen 5, Rizz Lord 10, Shakespeare 15, Conspiracy 20). Pro unlocks all instantly.
- **Live chat preview** — a smartphone mockup with a grey incoming bubble (original) and a glowing neon outgoing bubble (transformed).
- **Gamification engine** — consecutive-day streaks, per-persona usage stats, karma points, an animated `+Aura` score with **3× CRITICAL HIT** jackpots and a **daily first-shift bonus**, rank/badge ladders, near-miss "N to rank up" nudges, and an **Aura Trophies** modal.
- **Action dashboard** — `⚡ Send to Chat` uses the **Web Share API** to open the native share sheet (iMessage, WhatsApp, Instagram, …) with clipboard fallback on desktop; `📸 Share Aura Card` renders a branded social-ready PNG via `html2canvas` and shares it through the same sheet.
- **Referral loop** — every user gets an invite link (`?ref=CODE`); friends who join with it receive bonus shifts. Surfaced in the header (🎁) and inside the paywall as the free path.
- **Micro-SaaS paywall** — 5 free shifts/day (+ referral bonus pool), then an animated subscription modal (Monthly $2.99 / Annual Legend $29) that also unlocks every persona.
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

---

## 🚧 Productionizing (before charging money)

This is a polished **front-end prototype**. All state lives in `localStorage`, which means:

- **Usage limits, subscriptions, and the admin backdoor are client-side only** — a user can clear storage (or open incognito) to reset their free shifts. Real enforcement needs server-side accounts + usage metering.
- **The API key ships to the browser** in live mode (`dangerouslyAllowBrowser`). Before launch, move the LLM call behind a **backend proxy** that holds the key server-side and rate-limits per account.
- **Payments are simulated** (the subscribe button just unlocks locally). Wire up **Stripe** (or similar) for real billing.
- **Referrals are one-sided** — the invited user gets the bonus client-side, but crediting the *referrer* requires the backend to verify a real signup.

Recommended path to monetization: **backend proxy → accounts/auth → server-side limits & referrals → Stripe.** This repo is the front-end those services plug into.

> Tip: keep the Aura Card watermark even on paid plans — every shared screenshot is free distribution. Set your real domain/handle in [`src/config.js`](src/config.js).
