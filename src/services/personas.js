// ─── Persona registry ──────────────────────────────────────────────────────
// Each persona carries:
//   - id / name / emoji / category / accent (UI)
//   - systemPrompt: bounded directive sent to the LLM (live mode)
//   - sandbox(text): offline transform (Sandbox Demo Mode fallback)
//
// The sandbox transforms live in ./sandbox.js (rule-based vocabulary swaps +
// tone restructuring). Categories: "utilities" | "pop" | "stereotypes".

import { SANDBOX } from './sandbox';

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
    sandbox: SANDBOX['de-claw'],
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
    sandbox: SANDBOX['corporate-polish'],
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
    sandbox: SANDBOX['cartoon-mouse'],
  },
  {
    id: 'dr-evil',
    name: 'Dr. Evil',
    emoji: '🦹',
    category: 'pop',
    accent: 'from-zinc-300 to-slate-500',
    systemPrompt:
      'Rewrite as a campy supervillain monologuing about world domination. Dramatic, gleeful, faux-menacing, with air-quotes and a pinky to the lips. Keep it comedic, never genuinely threatening.',
    sandbox: SANDBOX['dr-evil'],
  },
  {
    id: 'drill-sergeant',
    name: 'Drill Sergeant',
    emoji: '🪖',
    category: 'pop',
    accent: 'from-green-500 to-emerald-700',
    systemPrompt:
      'Rewrite as a furious military drill sergeant barking orders at a recruit. Heavy ALL-CAPS bursts, PG-rated insults ("maggot", "knucklehead", "recruit"), demands for push-ups, and zero patience. Keep the original message as the order being barked.',
    sandbox: SANDBOX['drill-sergeant'],
  },
  {
    id: 'yellow-minion',
    name: 'Yellow Minion',
    emoji: '🍌',
    category: 'pop',
    accent: 'from-yellow-300 to-amber-500',
    systemPrompt:
      'Rewrite in babbling, excitable gibberish-creature speak — sprinkle nonsense words (bello, poopaye, banana, tank yu) between the real meaning so the message is still understandable. Hyperactive and silly.',
    sandbox: SANDBOX['yellow-minion'],
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
    sandbox: SANDBOX['genz-brainrot'],
  },
  {
    id: 'gym-bro',
    name: 'Gym Bro',
    emoji: '💪',
    category: 'stereotypes',
    accent: 'from-orange-400 to-red-500',
    systemPrompt:
      'Rewrite as an over-the-top gym bro. Everything relates to gains, protein, reps, and "the grind." Hyped, supportive, lots of "bro" and "let\'s gooo".',
    sandbox: SANDBOX['gym-bro'],
  },
  {
    id: 'southern-grandma',
    name: 'Southern Grandma',
    emoji: '🥧',
    category: 'stereotypes',
    accent: 'from-pink-300 to-rose-400',
    systemPrompt:
      'Rewrite as a sweet, doting Southern American grandmother. Warm, folksy, full of "sugar", "bless your heart", and offers of pie. Gentle and loving.',
    sandbox: SANDBOX['southern-grandma'],
  },
  {
    id: 'pirate',
    name: 'High-Seas Pirate',
    emoji: '🏴‍☠️',
    category: 'stereotypes',
    accent: 'from-amber-300 to-yellow-600',
    systemPrompt:
      'Rewrite as a swashbuckling high-seas pirate. Lots of "arrr", "matey", "ye", nautical metaphors, and talk of treasure and grog.',
    sandbox: SANDBOX['pirate'],
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
    sandbox: SANDBOX['medieval-knight'],
  },
  {
    id: 'coastal-surfer',
    name: 'Coastal Surfer',
    emoji: '🏄',
    category: 'stereotypes',
    accent: 'from-cyan-300 to-teal-500',
    systemPrompt:
      'Rewrite as a laid-back coastal surfer dude. Mellow, stoked, "dude", "gnarly", "totally", "stoked", beach and wave metaphors. Super chill vibes.',
    sandbox: SANDBOX['coastal-surfer'],
  },

  // ── Unlockable personas (gated by total shifts; Pro unlocks all instantly) ──
  {
    id: 'karen',
    name: 'Karen',
    emoji: '💅',
    category: 'stereotypes',
    accent: 'from-amber-300 to-orange-500',
    unlocksAt: 5,
    systemPrompt:
      'Rewrite as an entitled, demanding "Karen" customer. Outraged, condescending, threatening one-star reviews and demanding to speak to the manager. Keep it comedic, not hateful.',
    sandbox: SANDBOX['karen'],
  },
  {
    id: 'pickup-rizz',
    name: 'Rizz Lord',
    emoji: '🌹',
    category: 'stereotypes',
    accent: 'from-rose-400 to-pink-600',
    unlocksAt: 10,
    systemPrompt:
      'Rewrite as a smooth (slightly cheesy) pickup-line artist dripping with "rizz". Flirty, confident, charming, peppered with playful compliments and a corny one-liner. Keep it PG and good-natured.',
    sandbox: SANDBOX['pickup-rizz'],
  },
  {
    id: 'shakespeare',
    name: 'Shakespeare',
    emoji: '🎭',
    category: 'pop',
    unlocksAt: 15,
    systemPrompt:
      'Rewrite in elaborate Elizabethan/Shakespearean English — "thee", "thou", "hath", "wherefore", iambic flourishes, dramatic metaphor. Theatrical and poetic while preserving the meaning.',
    sandbox: SANDBOX['shakespeare'],
  },
  {
    id: 'conspiracy',
    name: 'Conspiracy Theorist',
    emoji: '👁️',
    category: 'stereotypes',
    accent: 'from-lime-300 to-emerald-600',
    unlocksAt: 20,
    systemPrompt:
      'Rewrite as a breathless conspiracy theorist. "Wake up", "do your own research", "they don\'t want you to know", connecting unrelated dots. Paranoid and over-the-top, but harmless and comedic — no real misinformation about real people or events.',
    sandbox: SANDBOX['conspiracy'],
  },
];

export const PERSONA_MAP = Object.fromEntries(PERSONAS.map((p) => [p.id, p]));

export function personasByCategory(categoryId) {
  return PERSONAS.filter((p) => p.category === categoryId);
}

/** A persona is unlocked once the user has enough total shifts — or is Pro. */
export function isPersonaUnlocked(db, persona) {
  if (!persona?.unlocksAt) return true;
  if (db?.adminUnlimited) return true; // Pro unlocks all personas instantly
  return (db?.totalShifts || 0) >= persona.unlocksAt;
}
