// ─── Serverless transform endpoint (Vercel function) ────────────────────────
// Holds the Anthropic key SERVER-SIDE. The browser POSTs { text, personaId };
// we look up the bounded system prompt by id (never trust a client-sent prompt)
// and return the rewritten text. If no key is configured — or anything fails —
// we respond { sandbox: true } so the client falls back to offline templates.

import Anthropic from '@anthropic-ai/sdk';
import { PERSONA_PROMPTS } from './_prompts.js';
import {
  checkRateLimit,
  getClientIp,
  RATE_WINDOW_SECONDS,
  RATE_MAX_REQUESTS,
} from './_ratelimit.js';

// Model: claude-haiku-4-5 — fast + cheap ($1/$5 per 1M tokens), ideal for a
// high-volume viral app doing short rewrites. Bump to 'claude-opus-4-8' for
// max quality if you ever want it.
const MODEL = 'claude-haiku-4-5';
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
  const systemPrompt = PERSONA_PROMPTS[personaId];

  if (!text || !systemPrompt) {
    res.status(400).json({ error: 'Missing text or invalid persona' });
    return;
  }
  if (text.length > MAX_INPUT) {
    res.status(413).json({ error: 'Text too long' });
    return;
  }

  // Rate limit by IP before spending any tokens. Over-limit requests get a 429;
  // the client treats that as a non-OK response and falls back to the free
  // offline templates, so the app keeps working without costing you money.
  const ip = getClientIp(req);
  const rl = await checkRateLimit(ip);
  res.setHeader('X-RateLimit-Limit', RATE_MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', rl.remaining);
  if (!rl.allowed) {
    res.setHeader('Retry-After', RATE_WINDOW_SECONDS);
    res.status(429).json({ error: 'Too many requests. Please slow down.' });
    return;
  }

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: `${systemPrompt}\n\nRewrite the user's message in this voice. Output ONLY the transformed text — no preamble, no quotation marks, no commentary.`,
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
