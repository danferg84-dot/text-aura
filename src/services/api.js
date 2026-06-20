// ─── API layer with resilient fallback ──────────────────────────────────────
// The Anthropic key lives SERVER-SIDE in the /api/transform serverless function
// (see api/transform.js) — never in the browser bundle. This client just calls
// that endpoint. If the endpoint signals no-key, errors, or doesn't exist
// (e.g. plain `vite dev` with no functions), we fall back to the offline
// Sandbox Demo Mode templates so the app is always interactive.

import { PERSONA_MAP } from './personas';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Check whether live AI is available (key configured server-side). */
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

/**
 * Transform `text` into the voice of `personaId`.
 * @returns {Promise<{ output: string, mode: 'live' | 'sandbox' }>}
 */
export async function transformText(text, personaId) {
  const persona = PERSONA_MAP[personaId];
  if (!persona) throw new Error(`Unknown persona: ${personaId}`);

  const clean = (text || '').trim();
  if (!clean) throw new Error('Please enter some text to transform.');

  // ── Try live mode via the serverless proxy ──────────────────────────────
  try {
    const r = await fetch('/api/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, personaId }),
    });
    if (r.ok) {
      const d = await r.json();
      if (d.output) return { output: d.output, mode: 'live' };
      // d.sandbox === true (no key) → fall through to offline template
    }
  } catch {
    // No endpoint (local vite dev) or network error → fall through
  }

  // ── Sandbox Demo Mode (offline templates) ───────────────────────────────
  await wait(350 + Math.random() * 300);
  return { output: persona.sandbox(clean), mode: 'sandbox' };
}
