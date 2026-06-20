import { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';

import Header from './components/Header';
import Footer from './components/Footer';
import InputArea from './components/InputArea';
import PersonaGrid from './components/PersonaGrid';
import ChatPreview from './components/ChatPreview';
import ActionDashboard from './components/ActionDashboard';
import PaywallModal from './components/PaywallModal';
import TrophiesModal from './components/TrophiesModal';
import InviteModal from './components/InviteModal';

import { transformText, getLiveStatus } from './services/api';
import {
  loadDB,
  saveDB,
  rollDailyUsage,
  remainingFreeShifts,
  recordShift,
  activateAdmin,
  redeemReferral,
  isFirstShiftToday,
  DAILY_BONUS_AURA,
} from './services/storage';
import {
  rollAuraScore,
  karmaForPersona,
  activeBadgeTitle,
  rankUpHint,
} from './services/gamification';
import { PERSONA_MAP, PERSONAS, isPersonaUnlocked } from './services/personas';
import { shareText, shareImage } from './services/share';
import { HANDLE, REFERRAL_BONUS } from './config';

export default function App() {
  const [db, setDb] = useState(() => rollDailyUsage(loadDB()));
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activePersona, setActivePersona] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sharingCard, setSharingCard] = useState(false);
  const [auraPing, setAuraPing] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showTrophies, setShowTrophies] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [liveMode, setLiveMode] = useState(false);

  const previewRef = useRef(null);
  const redeemHandled = useRef(false);

  // Persist the DB whenever it changes.
  useEffect(() => {
    saveDB(db);
  }, [db]);

  // Detect whether live AI is available (key configured server-side).
  useEffect(() => {
    getLiveStatus().then(setLiveMode);
  }, []);

  // Redeem an incoming referral (?ref=CODE) once, on first mount.
  useEffect(() => {
    if (redeemHandled.current) return;
    redeemHandled.current = true;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (!ref) return;

    const { db: next, redeemed } = redeemReferral(db, ref);
    if (redeemed) {
      setDb(next);
      setTimeout(
        () =>
          // eslint-disable-next-line no-alert
          alert(`🎁 You scored ${REFERRAL_BONUS} bonus shifts from a friend! Welcome to Text Aura ⚡`),
        150
      );
    }
    params.delete('ref');
    const qs = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remaining = remainingFreeShifts(db);
  const badge = output && activePersona ? activeBadgeTitle(db, activePersona) : null;

  // Lock state + near-miss hints for every persona button.
  const personaMeta = useMemo(() => {
    const map = {};
    for (const p of PERSONAS) {
      const unlocked = isPersonaUnlocked(db, p);
      map[p.id] = {
        unlocked,
        locked: !unlocked,
        unlocksAt: p.unlocksAt,
        hint: unlocked ? rankUpHint(db, p.id) : null,
      };
    }
    return map;
  }, [db]);

  // ── Core: run a transformation ─────────────────────────────────────────────
  async function handleSelectPersona(personaId) {
    if (loading) return;

    const persona = PERSONA_MAP[personaId];
    if (!isPersonaUnlocked(db, persona)) {
      // Locked persona → nudge toward Pro (which unlocks all personas).
      setShowPaywall(true);
      return;
    }
    if (!input.trim()) return;

    // Paywall gate: block when out of free + bonus shifts.
    if (remainingFreeShifts(db) <= 0) {
      setActivePersona(personaId);
      setShowPaywall(true);
      return;
    }

    setActivePersona(personaId);
    setLoading(true);
    setOutput('');
    setAuraPing(null);

    try {
      const { output: result } = await transformText(input, personaId);
      setOutput(result);

      // Rewards: variable-ratio aura + crit jackpot + first-of-day bonus.
      const { amount: baseAura, crit } = rollAuraScore(db);
      const daily = isFirstShiftToday(db);
      const auraGained = baseAura + (daily ? DAILY_BONUS_AURA : 0);
      const karmaGained = karmaForPersona(personaId);

      setDb((prev) => recordShift(prev, personaId, { auraGained, karmaGained }));
      setAuraPing({ id: Date.now(), amount: auraGained, crit, daily });
    } catch (err) {
      setOutput('');
      // eslint-disable-next-line no-alert
      alert(err?.message || 'Something went wrong transforming your text.');
    } finally {
      setLoading(false);
    }
  }

  // ── Send to Chat (Web Share → native share sheet / clipboard fallback) ─────
  async function handleCopySwitch() {
    if (!output) return 'failed';
    return shareText(output);
  }

  // ── Share / Download the branded Aura Card ─────────────────────────────────
  async function handleShareCard() {
    if (!previewRef.current || !output) return;
    setSharingCard(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#0b0b1a',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Failed to render image');
      const caption = `My text, re-auraed ⚡ Try it: ${HANDLE} · ${window.location.origin}`;
      await shareImage(blob, `aura-card-${activePersona || 'text-aura'}.png`, caption);
    } catch (err) {
      console.error('[Text Aura] Aura Card export failed:', err);
      // eslint-disable-next-line no-alert
      alert('Could not generate the Aura Card. Please try again.');
    } finally {
      setSharingCard(false);
    }
  }

  // ── Admin backdoor / "Pro" ─────────────────────────────────────────────────
  function handleAdminUnlock() {
    setDb((prev) => activateAdmin(prev));
    setShowPaywall(false);
    // eslint-disable-next-line no-alert
    alert('Admin Mode Activated — unlimited shifts + all personas unlocked! ⚡');
  }

  function handleSubscribe(planId) {
    setDb((prev) => activateAdmin(prev)); // simulate a successful purchase → Pro
    setShowPaywall(false);
    // eslint-disable-next-line no-alert
    alert(
      `🎉 Welcome to Text Aura ${planId === 'annual' ? 'Legend' : 'Pro'}! Unlimited shifts + every persona unlocked.`
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <Header
        streak={db.streak}
        remaining={remaining}
        aura={db.auraScore}
        onOpenTrophies={() => setShowTrophies(true)}
        onOpenInvite={() => setShowInvite(true)}
      />

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-5">
        <InputArea value={input} onChange={setInput} />

        <ChatPreview
          ref={previewRef}
          original={input}
          output={output}
          personaId={activePersona}
          loading={loading}
          badge={badge}
          auraPing={auraPing}
        />

        <ActionDashboard
          output={output}
          onCopySwitch={handleCopySwitch}
          onShareCard={handleShareCard}
          sharingCard={sharingCard}
        />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-200">Pick your aura</h2>
            {!input.trim() && (
              <span className="text-xs text-amber-300/80">↑ type a message first</span>
            )}
          </div>
          <PersonaGrid
            activeId={activePersona}
            onSelect={handleSelectPersona}
            disabled={!input.trim() || loading}
            meta={personaMeta}
          />
        </div>
      </main>

      <Footer sandbox={!liveMode} onAdminUnlock={handleAdminUnlock} />

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={handleSubscribe}
        onAdminUnlock={handleAdminUnlock}
        onInvite={() => {
          setShowPaywall(false);
          setShowInvite(true);
        }}
      />
      <TrophiesModal open={showTrophies} onClose={() => setShowTrophies(false)} db={db} />
      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} db={db} />
    </div>
  );
}
