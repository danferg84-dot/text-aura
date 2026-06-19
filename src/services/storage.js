// ─── Local user database (localStorage) ─────────────────────────────────────
// Single source of truth for gamification + paywall state.

const KEY = 'text-aura:db:v1';
export const DAILY_FREE_LIMIT = 5;

const todayStr = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

function defaultDB() {
  return {
    totalShifts: 0,
    personaStats: {}, // { [personaId]: count }
    karmaPoints: 0, // total karma (De-Claw + Corporate Polish uses)
    auraScore: 0, // cumulative "+Aura" points
    // streak
    streak: 0,
    lastActiveDate: null,
    // paywall
    usage: { date: todayStr(), count: 0 },
    adminUnlimited: false,
  };
}

export function loadDB() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultDB();
    const parsed = JSON.parse(raw);
    return { ...defaultDB(), ...parsed, usage: { ...defaultDB().usage, ...parsed.usage } };
  } catch {
    return defaultDB();
  }
}

export function saveDB(db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* storage may be unavailable (private mode) — fail silently */
  }
}

/** Roll the daily usage counter over if the date changed. Returns a fresh db. */
export function rollDailyUsage(db) {
  const today = todayStr();
  if (db.usage.date !== today) {
    return { ...db, usage: { date: today, count: 0 } };
  }
  return db;
}

/** How many free shifts remain today (Infinity if admin-unlimited). */
export function remainingFreeShifts(db) {
  if (db.adminUnlimited) return Infinity;
  const rolled = rollDailyUsage(db);
  return Math.max(0, DAILY_FREE_LIMIT - rolled.usage.count);
}

/** Update the consecutive-day streak based on last activity. */
export function bumpStreak(db) {
  const today = todayStr();
  if (db.lastActiveDate === today) return db; // already counted today

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let streak;
  if (db.lastActiveDate === yesterday) streak = (db.streak || 0) + 1;
  else streak = 1; // missed a day (or first ever) → reset to 1

  return { ...db, streak, lastActiveDate: today };
}

/**
 * Record a completed shift. Mutates a copy and returns it.
 * `auraGained` is the +Aura points awarded for the animation.
 */
export function recordShift(db, personaId, { auraGained, karmaGained }) {
  let next = rollDailyUsage(db);
  next = bumpStreak(next);

  next = {
    ...next,
    totalShifts: next.totalShifts + 1,
    personaStats: {
      ...next.personaStats,
      [personaId]: (next.personaStats[personaId] || 0) + 1,
    },
    karmaPoints: next.karmaPoints + (karmaGained || 0),
    auraScore: next.auraScore + (auraGained || 0),
    usage: { ...next.usage, count: next.usage.count + 1 },
  };
  return next;
}

/** Admin backdoor: grant unlimited free shifts forever. */
export function activateAdmin(db) {
  return { ...db, adminUnlimited: true };
}

export function resetDB() {
  const fresh = defaultDB();
  saveDB(fresh);
  return fresh;
}
