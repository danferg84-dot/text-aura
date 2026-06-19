// ─── Gamification engine: ranks, badges & karma ─────────────────────────────
// Pure functions over the DB shape from storage.js.

// Each rank path is an ordered list of { title, min } thresholds (ascending).
// `value` is matched against the highest `min` it meets.

const COUNT_TIERS = [
  { level: 1, min: 1 },
  { level: 2, min: 6 },
  { level: 3, min: 16 },
  { level: 4, min: 50 },
];

const KARMA_TIERS = [
  { level: 1, min: 1 },
  { level: 2, min: 11 },
  { level: 3, min: 31 },
  { level: 4, min: 51 },
];

function tierTitles(titles, tiers) {
  return tiers.map((t, i) => ({ ...t, title: titles[i] }));
}

// Badge path definitions. `metric` says what `value` to feed in:
//   "count" → personaStats[personaId]
//   "karma" → per-persona karma (== use count for the two karma personas)
export const BADGE_PATHS = [
  {
    id: 'genz-brainrot',
    personaId: 'genz-brainrot',
    label: 'Gen-Z Brainrot',
    emoji: '💀',
    metric: 'count',
    tiers: tierTitles(
      ['No Cap Cadet', 'Rizz Apprentice', 'Skibidi Ohio Sigma', 'Flawless Rizz'],
      COUNT_TIERS
    ),
  },
  {
    id: 'medieval-knight',
    personaId: 'medieval-knight',
    label: 'Medieval Knight',
    emoji: '🛡️',
    metric: 'count',
    tiers: tierTitles(
      ['Humble Squire', 'Iron Vanguard', 'Paladin of Aura', 'Medieval Warlord'],
      COUNT_TIERS
    ),
  },
  {
    id: 'de-claw',
    personaId: 'de-claw',
    label: 'De-Claw · Peacekeeper Path',
    emoji: '🕊️',
    metric: 'karma',
    tiers: tierTitles(
      ['Tiff Diffuser', 'De-Escalation Expert', 'Zen Master', 'Global Diplomat'],
      KARMA_TIERS
    ),
  },
  {
    id: 'corporate-polish',
    personaId: 'corporate-polish',
    label: 'Corporate Polish · Executive Path',
    emoji: '💼',
    metric: 'karma',
    tiers: tierTitles(
      ['Intern', 'Middle Manager', 'Vice President', 'Chief Aura Officer (CEO)'],
      KARMA_TIERS
    ),
  },
];

export const BADGE_PATH_MAP = Object.fromEntries(BADGE_PATHS.map((p) => [p.personaId, p]));

/** Karma earned per peacekeeper/executive use (1 use == 1 karma point on its path). */
export const KARMA_PER_USE = 1;

/** The metric value for a given path from the DB. */
export function metricValue(db, path) {
  // For both "count" and "karma" metrics the per-persona use count is the driver,
  // since each De-Claw / Corporate Polish use grants exactly KARMA_PER_USE karma.
  return (db.personaStats?.[path.personaId] || 0) * (path.metric === 'karma' ? KARMA_PER_USE : 1);
}

/** Resolve the current tier (or null if not yet unlocked) for a value. */
export function resolveTier(tiers, value) {
  let current = null;
  for (const t of tiers) {
    if (value >= t.min) current = t;
    else break;
  }
  return current;
}

/** Full status for one badge path: value, current tier, next tier, progress. */
export function pathStatus(db, path) {
  const value = metricValue(db, path);
  const current = resolveTier(path.tiers, value);
  const next = path.tiers.find((t) => t.min > value) || null;

  const floor = current ? current.min : 0;
  const ceil = next ? next.min : floor;
  const progress = next ? Math.min(1, (value - floor) / (ceil - floor)) : 1;

  return {
    path,
    value,
    current, // null when locked (0 uses)
    next, // null when maxed
    progress,
    unlocked: !!current,
    maxed: !next && !!current,
  };
}

/** All badge statuses, for the Trophies modal. */
export function allBadgeStatuses(db) {
  return BADGE_PATHS.map((p) => pathStatus(db, p));
}

/**
 * The headline title to show under the preview bubbles for the active persona.
 * Returns null for personas that have no badge path.
 */
export function activeBadgeTitle(db, personaId) {
  const path = BADGE_PATH_MAP[personaId];
  if (!path) return null;
  const status = pathStatus(db, path);
  if (!status.current) return null;
  return {
    title: status.current.title,
    level: status.current.level,
    label: path.label,
    emoji: path.emoji,
  };
}

/** Whether a persona use grants karma. */
export function karmaForPersona(personaId) {
  return personaId === 'de-claw' || personaId === 'corporate-polish' ? KARMA_PER_USE : 0;
}

/**
 * A fun, semi-random "+Aura" score for the post-transform animation.
 * Scales gently with total experience so veterans see bigger numbers.
 */
export function rollAuraScore(db) {
  const base = 500 + Math.floor(Math.random() * 2500); // 500–3000
  const veteranBonus = Math.min(2000, (db.totalShifts || 0) * 25);
  return Math.round((base + veteranBonus) / 50) * 50; // round to nearest 50
}
