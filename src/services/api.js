// ─── API layer with resilient fallback ──────────────────────────────────────
// The Anthropic key + usage metering live SERVER-SIDE (api/transform.js,
// api/usage.js, api/ad-reward.js). This client calls those endpoints, passing an
// anonymous device id. If an endpoint is missing/errors (e.g. plain `vite dev`
// with no functions, or no key configured), we fall back to the offline Sandbox
// Demo Mode templates so the app is always interactive.

import { PERSONA_MAP } from './personas';
import { getDeviceId } from './device';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Whether live AI is available (key configured server-side). */
export async function getLiveStatus() {
  try {
    const r = await fetch('/api/status');
    if (!r.ok) return false;
    const d = await r.json();
    return !!d.live;
  } catch {
    return false;
  }
}

/** Current server-side usage for this device. { managed:false } if unmetered. */
export async function fetchUsage() {
  try {
    const r = await fetch(`/api/usage?device=${encodeURIComponent(getDeviceId())}`);
    if (!r.ok) return { managed: false };
    return await r.json();
  } catch {
    return { managed: false };
  }
}

/** Grant ad-reward bonus shifts. Returns updated usage (or { managed:false }). */
export async function grantAdReward() {
  try {
    const r = await fetch('/api/ad-reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device: getDeviceId() }),
    });
    if (!r.ok) return { managed: false };
    return await r.json();
  } catch {
    return { managed: false };
  }
}

/**
 * Transform `text` into the voice of `personaId`.
 * @returns {Promise<
 *   | { output: string, mode: 'live'|'sandbox', usage?: object }
 *   | { limited: true, adAvailable: boolean, usage?: object }
 * >}
 */
export async function transformText(text, personaId) {
  const persona = PERSONA_MAP[personaId];
  if (!persona) throw new Error(`Unknown persona: ${personaId}`);

  const clean = (text || '').trim();
  if (!clean) throw new Error('Please enter some text to transform.');

  try {
    const r = await fetch('/api/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, personaId, deviceId: getDeviceId() }),
    });
    if (r.ok) {
      const d = await r.json();
      if (d.output) return { output: d.output, mode: 'live', usage: d.usage };
      if (d.limit) return { limited: true, adAvailable: !!d.adAvailable, usage: d.usage };
      // d.sandbox === true (no key) → fall through to offline template
    }
  } catch {
    // No endpoint (local vite dev) or network error → fall through
  }

  // ── Sandbox Demo Mode (offline templates) ───────────────────────────────
  await wait(350 + Math.random() * 300);
  return { output: persona.sandbox(clean), mode: 'sandbox' };
}

/**
 * Transform one text across several personas at once (the "Aura-fy all"
 * carousel — a future Pro feature). Runs in parallel; drops failures/limits.
 */
export async function transformMany(text, personaIds) {
  const results = await Promise.all(
    personaIds.map(async (id) => {
      try {
        const r = await transformText(text, id);
        return r.output ? { personaId: id, output: r.output, mode: r.mode } : null;
      } catch {
        return null;
      }
    })
  );
  return results.filter(Boolean);
}
