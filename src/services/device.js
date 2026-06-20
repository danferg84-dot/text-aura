// Stable anonymous device id for server-side free-tier metering. The id is just
// an identifier — the authoritative usage count lives server-side keyed by it
// (plus IP), so clearing it doesn't grant unlimited free AI the way the old
// client-side counter did.
const KEY = 'text-aura:device';

export function getDeviceId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto?.randomUUID?.() || `d-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return `anon-${Math.random().toString(36).slice(2)}`;
  }
}
