// Lightweight status endpoint so the client knows whether live AI is available
// (key configured server-side) vs. running in Sandbox Demo Mode.
export default function handler(req, res) {
  res.status(200).json({ live: !!process.env.ANTHROPIC_API_KEY });
}
