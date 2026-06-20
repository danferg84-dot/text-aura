// ─── IP rate limiting (best-effort, auto-upgrades to durable) ────────────────
// Protects your Anthropic bill from abuse of the public /api/transform endpoint.
//
//  • If a KV/Upstash Redis REST store is configured (env vars below), counts are
//    durable across all serverless instances — the real protection.
//  • Otherwise falls back to an in-memory counter: catches casual hammering from
//    a warm instance, but a determined attacker hitting cold/scaled instances can
//    slip past. Add Vercel KV (or Upstash) for production-grade limiting.
//
// Files prefixed with "_" are NOT exposed as public endpoints by Vercel.

export const RATE_WINDOW_SECONDS = 300; // 5-minute window
export const RATE_MAX_REQUESTS = 20; // per IP per window

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const memory = new Map(); // ip -> { count, resetAt }

export function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return req.headers['x-real-ip'] || 'unknown';
}

async function kvIncr(key) {
  const incr = await fetch(`${REST_URL}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REST_TOKEN}` },
  });
  const { result: count } = await incr.json();
  if (count === 1) {
    // First hit in this window → set the expiry.
    await fetch(`${REST_URL}/expire/${encodeURIComponent(key)}/${RATE_WINDOW_SECONDS}`, {
      headers: { Authorization: `Bearer ${REST_TOKEN}` },
    });
  }
  return count;
}

function memoryIncr(ip) {
  const now = Date.now();
  const entry = memory.get(ip);
  if (!entry || now > entry.resetAt) {
    memory.set(ip, { count: 1, resetAt: now + RATE_WINDOW_SECONDS * 1000 });
    return 1;
  }
  entry.count += 1;
  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (now > v.resetAt) memory.delete(k);
  }
  return entry.count;
}

/** @returns {Promise<{allowed: boolean, remaining: number, limit: number}>} */
export async function checkRateLimit(ip) {
  const key = `rl:${ip}`;
  if (REST_URL && REST_TOKEN) {
    try {
      const count = await kvIncr(key);
      return {
        allowed: count <= RATE_MAX_REQUESTS,
        remaining: Math.max(0, RATE_MAX_REQUESTS - count),
        limit: RATE_MAX_REQUESTS,
      };
    } catch {
      // KV unreachable → fall back to memory rather than failing open hard.
    }
  }
  const count = memoryIncr(ip);
  return {
    allowed: count <= RATE_MAX_REQUESTS,
    remaining: Math.max(0, RATE_MAX_REQUESTS - count),
    limit: RATE_MAX_REQUESTS,
  };
}
