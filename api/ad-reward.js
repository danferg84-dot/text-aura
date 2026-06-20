// POST /api/ad-reward  { device }  — grant ad-reward bonus shifts.
//
// ⚠️ STUB VERIFICATION: this currently trusts the client. Before launch, gate it
// behind real rewarded-ad server-side verification (the ad network's SSV callback
// — e.g. AdMob SSV) so users can't just call this endpoint to mint free shifts.
import { db, hasDb, FREE_BASE, FREE_CAP, AD_BONUS, isUnlimitedDevice } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!hasDb) {
    res.status(200).json({ managed: false });
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
  const device = body?.device;
  if (!device) {
    res.status(400).json({ error: 'Missing device' });
    return;
  }
  if (isUnlimitedDevice(device)) {
    res.status(200).json({ managed: true, unlimited: true, remaining: Infinity });
    return;
  }

  const { data, error } = await db.rpc('grant_ad_bonus', {
    p_device: device,
    p_inc: AD_BONUS,
    p_base: FREE_BASE,
    p_cap: FREE_CAP,
  });
  if (error) {
    console.error('[ad-reward] error:', error.message);
    res.status(500).json({ error: 'Could not grant reward' });
    return;
  }

  const row = Array.isArray(data) ? data[0] : data;
  const remaining = Math.max(0, row.allowance - row.used);
  res.status(200).json({
    managed: true,
    used: row.used,
    allowance: row.allowance,
    remaining,
    adBonus: row.ad_bonus,
    adAvailable: FREE_BASE + row.ad_bonus < FREE_CAP,
  });
}
