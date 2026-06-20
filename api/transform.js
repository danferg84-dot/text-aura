// ─── Serverless transform endpoint (Vercel function) ────────────────────────
// Holds the Anthropic key SERVER-SIDE. The browser POSTs { text, personaId };
// we look up the bounded system prompt by id (never trust a client-sent prompt)
// and return the rewritten text. If no key is configured — or anything fails —
// we respond { sandbox: true } so the client falls back to offline templates.

import Anthropic from '@anthropic-ai/sdk';
import { PERSONA_MAP } from '../src/services/personas.js';

// Model: claude-opus-4-8 is top quality. For a high-volume viral app, switching
// this to 'claude-haiku-4-5' is ~5× cheaper and faster — plenty for one-line
// rewrites. Your call (see the note in chat).
const MODEL = 'claude-opus-4-8';
const MAX_INPUT = 2000; // basic abuse guard — cap input length

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    // No key configured → tell the client to use Sandbox Demo Mode.
    res.status(200).json({ sandbox: true });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const { text, personaId } = body || {};
  const persona = PERSONA_MAP[personaId];

  if (!text || !persona) {
    res.status(400).json({ error: 'Missing text or invalid persona' });
    return;
  }
  if (text.length > MAX_INPUT) {
    res.status(413).json({ error: 'Text too long' });
    return;
  }

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: `${persona.systemPrompt}\n\nRewrite the user's message in this voice. Output ONLY the transformed text — no preamble, no quotation marks, no commentary.`,
      messages: [{ role: 'user', content: text.slice(0, MAX_INPUT) }],
    });
    const block = msg.content.find((b) => b.type === 'text');
    const output = block?.text?.trim();
    if (!output) {
      res.status(200).json({ sandbox: true });
      return;
    }
    res.status(200).json({ output, mode: 'live' });
  } catch (err) {
    console.error('[transform] error:', err?.message || err);
    // Resilient fallback — never leave the user stranded.
    res.status(200).json({ sandbox: true });
  }
}
