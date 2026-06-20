// ─── Supabase server-side client + metering constants ───────────────────────
// Uses the SERVICE ROLE key — server-only, full DB access, NEVER expose to the
// browser (no VITE_ prefix). If the env vars aren't set, hasDb is false and the
// app falls back to client-side limits (unmetered) so local dev still works.

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasDb = !!(url && serviceKey);
export const db = hasDb ? createClient(url, serviceKey, { auth: { persistSession: false } }) : null;

// Free-tier limits (server-enforced, source of truth).
export const FREE_BASE = 3; // free generations per day
export const FREE_CAP = 6; // hard ceiling after ad bonuses (base + bonus)
export const AD_BONUS = 3; // shifts granted per rewarded ad

// Comma-separated device IDs that bypass metering (for your own testing).
// Set UNLIMITED_DEVICE_IDS in Vercel; find your id via the app (logged to console).
const unlimited = (process.env.UNLIMITED_DEVICE_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export function isUnlimitedDevice(id) {
  return !!id && unlimited.includes(id);
}
