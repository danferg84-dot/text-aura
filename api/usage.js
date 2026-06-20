// GET /api/usage?device=ID — current free-tier usage for an anonymous device.
// Returns { managed:false } when no DB is configured so the client falls back
// to its local limits (e.g. local dev).
import { db, hasDb, FREE_BASE, FREE_CAP, isUnlimitedDevice } from './_db.js';

export default async function handler(req, res) {
  if (!hasDb) {
    res.status(200).json({ managed: false });
    return;
  }
  const device = req.query.device;
  if (!device) {
    res.status(400).json({ error: 'Missing device' });
    return;
  }
  if (isUnlimitedDevice(device)) {
    res.status(200).json({ managed: true, unlimited: true, remaining: Infinity });
    return;
  }

  const { data, error } = await db
    .from('usage_counters')
    .select('day, count, ad_bonus')
    .eq('device_id', device)
    .maybeSingle();

  if (error) {
    res.status(200).json({ managed: false });
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  let used = 0;
  let adBonus = 0;
  if (data && data.day === today) {
    used = data.count;
    adBonus = data.ad_bonus;
  }
  const allowance = Math.min(FREE_BASE + adBonus, FREE_CAP);
  const remaining = Math.max(0, allowance - used);
  const adAvailable = FREE_BASE + adBonus < FREE_CAP;

  res.status(200).json({
    managed: true,
    plan: 'free',
    used,
    base: FREE_BASE,
    cap: FREE_CAP,
    allowance,
    remaining,
    adBonus,
    adAvailable,
  });
}
