// ─── Persona registry ──────────────────────────────────────────────────────
// Each persona carries:
//   - id / name / emoji / category / accent (UI)
//   - systemPrompt: bounded directive sent to the LLM (live mode)
//   - sandbox(text): client-side curated template (Sandbox Demo Mode fallback)
//
// Categories: "utilities" | "pop" | "stereotypes"

const cap = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
const sentences = (t) =>
  t
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

export const CATEGORIES = [
  { id: 'utilities', label: 'Utilities' },
  { id: 'pop', label: 'Pop Culture' },
  { id: 'stereotypes', label: 'Stereotypes' },
];

export const PERSONAS = [
  // ── Utilities ────────────────────────────────────────────────────────────
  {
    id: 'de-claw',
    name: 'De-Claw',
    emoji: '🕊️',
    category: 'utilities',
    accent: 'from-emerald-400 to-teal-500',
    karmaPath: true,
    systemPrompt:
      'Strip all anger or passive-aggression out, outputting a perfectly diplomatic and safe text. Preserve the core request and meaning. Keep it calm, kind, and professional.',
    sandbox: (text) =>
      `Hi! I hope you're doing well. I wanted to gently share something: ${sentences(
        text
      )
        .map((s) => s.replace(/!+/g, '.').toLowerCase())
        .map(cap)
        .join(' ')} I really appreciate your understanding, and I'm happy to talk it through whenever works for you. Thank you so much! 🙏`,
  },
  {
    id: 'corporate-polish',
    name: 'Corporate Polish',
    emoji: '💼',
    category: 'utilities',
    accent: 'from-sky-400 to-indigo-500',
    karmaPath: true,
    systemPrompt:
      'Translate text into highly polished, elite corporate passive-aggressive workplace correspondence. Use buzzwords, hedging, and a veneer of professionalism.',
    sandbox: (text) =>
      `Hi team,\n\nPer my last message and circling back on this: ${sentences(
        text
      )
        .map(cap)
        .join(
          ' '
        )} I want to make sure we're aligned and leveraging our synergies moving forward. Happy to take this offline if helpful.\n\nBest,\nSent from my iPhone`,
  },

  // ── Pop Culture ────────────────────────────────────────────────────────────
  {
    id: 'cartoon-mouse',
    name: 'Cartoon Mouse',
    emoji: '🐭',
    category: 'pop',
    accent: 'from-rose-400 to-red-500',
    systemPrompt:
      'Rewrite in the voice of a cheerful, squeaky, family-friendly cartoon mouse. Wholesome, giggly, full of "Oh boy!" energy. Do not use any real trademarked names.',
    sandbox: (text) =>
      `Oh boy, oh boy! Ha-ha! ${sentences(text)
        .map(cap)
        .join(
          ' Hot dog! '
        )} Gosh, that sure is swell! See ya real soon, pal! 🧀`,
  },
  {
    id: 'dr-evil',
    name: 'Dr. Evil',
    emoji: '🦹',
    category: 'pop',
    accent: 'from-zinc-300 to-slate-500',
    systemPrompt:
      'Rewrite as a campy supervillain monologuing about world domination. Dramatic, gleeful, faux-menacing, with air-quotes and a pinky to the lips. Keep it comedic, never genuinely threatening.',
    sandbox: (text) =>
      `Mwahaha! Allow me to explain my "diabolical" plan: ${sentences(text)
        .map(cap)
        .join(
          ' '
        )} ...and then I shall hold the world ransom for ONE... MILLION... dollars! 🦷 Throw me a frickin' bone here.`,
  },
  {
    id: 'napoleon',
    name: 'Napoleon',
    emoji: '🎩',
    category: 'pop',
    accent: 'from-blue-400 to-indigo-600',
    systemPrompt:
      'Rewrite as a grandiose 19th-century French emperor and military strategist. Imperious, theatrical, fond of grand declarations and the occasional French flourish.',
    sandbox: (text) =>
      `Mes amis! Hear my decree: ${sentences(text)
        .map(cap)
        .join(
          ' '
        )} History shall remember this moment! Impossible is not in my vocabulary. Vive la victoire! ⚔️`,
  },
  {
    id: 'yellow-minion',
    name: 'Yellow Minion',
    emoji: '🍌',
    category: 'pop',
    accent: 'from-yellow-300 to-amber-500',
    systemPrompt:
      'Rewrite in babbling, excitable gibberish-creature speak — sprinkle nonsense words (bello, poopaye, banana, tank yu) between the real meaning so the message is still understandable. Hyperactive and silly.',
    sandbox: (text) =>
      `Bello! Ba-ba-banana! ${sentences(text)
        .map(cap)
        .join(
          ' Poopaye! '
        )} Tank yu! Underwear! Hehehe ba-na-na! 🍌`,
  },

  // ── Stereotypes ────────────────────────────────────────────────────────────
  {
    id: 'genz-brainrot',
    name: 'Gen-Z Brainrot',
    emoji: '💀',
    category: 'stereotypes',
    accent: 'from-fuchsia-400 to-purple-600',
    badgePath: true,
    systemPrompt:
      'Translate text using heavy modern internet lore and slang (rizz, skibidi, mewing, cooked, no cap, fr fr) while preserving original intent.',
    sandbox: (text) =>
      `ngl ${sentences(text)
        .map((s) => s.toLowerCase())
        .join(
          ' fr fr '
        )} no cap this is so skibidi 💀 it's giving rizz, we're so cooked, lowkey based tho. mewing rn 🗿`,
  },
  {
    id: 'gym-bro',
    name: 'Gym Bro',
    emoji: '💪',
    category: 'stereotypes',
    accent: 'from-orange-400 to-red-500',
    systemPrompt:
      'Rewrite as an over-the-top gym bro. Everything relates to gains, protein, reps, and "the grind." Hyped, supportive, lots of "bro" and "let\'s gooo".',
    sandbox: (text) =>
      `Yo bro, listen up 💪 ${sentences(text)
        .map(cap)
        .join(
          ' No days off bro. '
        )} We go gym. Trust the process, hit your macros, let's GOOO! 🔥🏋️`,
  },
  {
    id: 'southern-grandma',
    name: 'Southern Grandma',
    emoji: '🥧',
    category: 'stereotypes',
    accent: 'from-pink-300 to-rose-400',
    systemPrompt:
      'Rewrite as a sweet, doting Southern American grandmother. Warm, folksy, full of "sugar", "bless your heart", and offers of pie. Gentle and loving.',
    sandbox: (text) =>
      `Well bless your heart, sugar. ${sentences(text)
        .map(cap)
        .join(
          ' '
        )} Now you come on over and have a slice of pie, darlin'. Grandma loves you to pieces. 🥧💕`,
  },
  {
    id: 'pirate',
    name: 'High-Seas Pirate',
    emoji: '🏴‍☠️',
    category: 'stereotypes',
    accent: 'from-amber-300 to-yellow-600',
    systemPrompt:
      'Rewrite as a swashbuckling high-seas pirate. Lots of "arrr", "matey", "ye", nautical metaphors, and talk of treasure and grog.',
    sandbox: (text) =>
      `Arrr, matey! ${sentences(text)
        .map(cap)
        .join(' Yo-ho! ')
        .replace(/\byou\b/gi, 'ye')
        .replace(/\byour\b/gi, 'yer')} Now hand over the treasure or walk the plank! ☠️🦜`,
  },
  {
    id: 'medieval-knight',
    name: 'Medieval Knight',
    emoji: '🛡️',
    category: 'stereotypes',
    accent: 'from-slate-300 to-blue-500',
    badgePath: true,
    systemPrompt:
      'Rewrite as a noble medieval knight. Archaic English ("thee", "thou", "hark", "verily"), chivalrous, honor-bound, addressing the reader as a fellow of the realm.',
    sandbox: (text) =>
      `Hark! Hear ye these words, noble friend: ${sentences(text)
        .map(cap)
        .join(' Verily, ')
        .replace(/\byou\b/gi, 'thee')
        .replace(/\byour\b/gi, 'thy')} I pledge mine honour upon it. For glory and the realm! ⚔️🛡️`,
  },
  {
    id: 'coastal-surfer',
    name: 'Coastal Surfer',
    emoji: '🏄',
    category: 'stereotypes',
    accent: 'from-cyan-300 to-teal-500',
    systemPrompt:
      'Rewrite as a laid-back coastal surfer dude. Mellow, stoked, "dude", "gnarly", "totally", "stoked", beach and wave metaphors. Super chill vibes.',
    sandbox: (text) =>
      `Duuude, ${sentences(text)
        .map((s) => s.toLowerCase())
        .join(
          ' totally gnarly, bro. '
        )} It's all good vibes, man. Just ride the wave and stay stoked. Cowabunga! 🌊🤙`,
  },
];

export const PERSONA_MAP = Object.fromEntries(PERSONAS.map((p) => [p.id, p]));

export function personasByCategory(categoryId) {
  return PERSONAS.filter((p) => p.category === categoryId);
}
