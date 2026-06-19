// ─── API layer with resilient fallback ──────────────────────────────────────
// Live mode: talk to Anthropic's Messages API using the official SDK.
// Sandbox Demo Mode: if no API key is configured, fall back to curated
// client-side templates so the app is interactive out of the box.

import Anthropic from '@anthropic-ai/sdk';
import { PERSONA_MAP } from './personas';

// Vite exposes env vars on import.meta.env (not process.env). The build-time
// key, if present, lights up live mode.
const API_KEY = import.meta.env.VITE_AI_API_KEY;

// Model: default to the latest, most capable Claude. Swap to "claude-haiku-4-5"
// for the snappiest/cheapest transformations if you prefer speed over polish.
const MODEL = 'claude-opus-4-8';

export const isSandboxMode = !API_KEY;

let client = null;
if (API_KEY) {
  client = new Anthropic({
    apiKey: API_KEY,
    // Required to call Anthropic directly from a browser. Only safe for
    // demos / local family testing — proxy through a backend for production.
    dangerouslyAllowBrowser: true,
  });
}

/** Small delay so Sandbox Mode still feels like a real round-trip. */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Transform `text` into the voice of `personaId`.
 * @returns {Promise<{ output: string, mode: 'live' | 'sandbox' }>}
 */
export async function transformText(text, personaId) {
  const persona = PERSONA_MAP[personaId];
  if (!persona) throw new Error(`Unknown persona: ${personaId}`);

  const clean = (text || '').trim();
  if (!clean) throw new Error('Please enter some text to transform.');

  // ── Sandbox Demo Mode ──────────────────────────────────────────────────
  if (!client) {
    await wait(450 + Math.random() * 400);
    return { output: persona.sandbox(clean), mode: 'sandbox' };
  }

  // ── Live mode ──────────────────────────────────────────────────────────
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: `${persona.systemPrompt}\n\nRewrite the user's message in this voice. Output ONLY the transformed text — no preamble, no quotation marks, no commentary.`,
      messages: [{ role: 'user', content: clean }],
    });
    const block = msg.content.find((b) => b.type === 'text');
    const output = block?.text?.trim();
    if (!output) throw new Error('Empty response');
    return { output, mode: 'live' };
  } catch (err) {
    // Resilient fallback: if the live call fails for any reason, don't leave
    // the user stranded — serve the curated sandbox template instead.
    console.warn('[Text Aura] Live transform failed, falling back to sandbox:', err);
    return { output: persona.sandbox(clean), mode: 'sandbox' };
  }
}
