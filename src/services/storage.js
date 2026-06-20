// ─── Local user database (localStorage) ─────────────────────────────────────
// Single source of truth for gamification + paywall + referral state.
//
// NOTE: This is a client-side prototype. For real monetization, usage limits,
// subscriptions, and referral crediting must be enforced server-side (a user
// can otherwise clear localStorage to reset). See README "Productionizing".

import { REFERRAL_BONUS } from '../config';

const KEY = 'text-aura:db:v1';
export const DAILY_FREE_LIMIT = 5;
export const DAILY_BONUS_AURA = 1000; // first shift each day

const todayStr = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const genReferralCode = () =>
  (Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6))
    .toUpperCase()
    .slice(0, 6);

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
    bonusShifts: 0, // extra shifts beyond the daily free tier (from referrals)
    // referral
    referralCode: genReferralCode(),
    referredBy: null,
    invitesSent: 0, // optimistic local counter (true crediting needs a backend)
  };
}

export function loadDB() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultDB();
    const parsed = JSON.parse(raw);
    const base = defaultDB();
    return {
      ...base,
      ...parsed,
      usage: { ...base.usage, ...parsed.usage },
      referralCode: parsed.referralCode || base.referralCode,
    };
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

/** How many shifts remain today: daily free tier + persistent bonus pool. */
export function remainingFreeShifts(db) {
  if (db.adminUnlimited) return Infinity;
  const rolled = rollDailyUsage(db);
  const free = Math.max(0, DAILY_FREE_LIMIT - rolled.usage.count);
  return free + (rolled.bonusShifts || 0);
}

/** True if the user hasn't completed a shift yet today (→ eligible for daily bonus). */
export function isFirstShiftToday(db) {
  return db.lastActiveDate !== todayStr();
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
 * Record a completed shift. Returns an updated copy.
 * `auraGained` is the +Aura points awarded (incl. crit / daily bonus).
 */
export function recordShift(db, personaId, { auraGained, karmaGained }) {
  let next = rollDailyUsage(db);

  // Consume a bonus shift only once the daily free tier is exhausted.
  const freeRemaining = Math.max(0, DAILY_FREE_LIMIT - next.usage.count);
  let bonusShifts = next.bonusShifts || 0;
  if (!next.adminUnlimited && freeRemaining <= 0 && bonusShifts > 0) {
    bonusShifts -= 1;
  }

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
    bonusShifts,
  };
  return next;
}

/**
 * Record an "Aura-fy all" carousel run. Counts as a single shift for the
 * paywall/streak/aura (even though it transforms across many personas), and
 * does not touch per-persona stats or karma.
 */
export function recordBatchShift(db, { auraGained }) {
  let next = rollDailyUsage(db);

  const freeRemaining = Math.max(0, DAILY_FREE_LIMIT - next.usage.count);
  let bonusShifts = next.bonusShifts || 0;
  if (!next.adminUnlimited && freeRemaining <= 0 && bonusShifts > 0) {
    bonusShifts -= 1;
  }

  next = bumpStreak(next);

  next = {
    ...next,
    totalShifts: next.totalShifts + 1,
    auraScore: next.auraScore + (auraGained || 0),
    usage: { ...next.usage, count: next.usage.count + 1 },
    bonusShifts,
  };
  return next;
}

/** Admin backdoor / "Pro": grant unlimited shifts. */
export function activateAdmin(db) {
  return { ...db, adminUnlimited: true };
}

/** Add bonus shifts to the persistent pool. */
export function grantBonusShifts(db, n) {
  return { ...db, bonusShifts: (db.bonusShifts || 0) + n };
}

/**
 * Redeem an incoming referral code (from a ?ref= link). Grants the new user
 * bonus shifts. Returns { db, redeemed } — `redeemed` is true only when the
 * bonus was actually applied (ignores self-referrals and repeat redemptions).
 */
export function redeemReferral(db, code) {
  if (!code) return { db, redeemed: false };
  if (db.referredBy) return { db, redeemed: false }; // already redeemed once
  if (code === db.referralCode) return { db, redeemed: false }; // no self-referrals
  const next = { ...grantBonusShifts(db, REFERRAL_BONUS), referredBy: code };
  return { db: next, redeemed: true };
}

export function resetDB() {
  const fresh = defaultDB();
  saveDB(fresh);
  return fresh;
}
