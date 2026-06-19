import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';

import Header from './components/Header';
import Footer from './components/Footer';
import InputArea from './components/InputArea';
import PersonaGrid from './components/PersonaGrid';
import ChatPreview from './components/ChatPreview';
import ActionDashboard from './components/ActionDashboard';
import PaywallModal from './components/PaywallModal';
import TrophiesModal from './components/TrophiesModal';

import { transformText, isSandboxMode } from './services/api';
import {
  loadDB,
  saveDB,
  rollDailyUsage,
  remainingFreeShifts,
  recordShift,
  activateAdmin,
} from './services/storage';
import {
  rollAuraScore,
  karmaForPersona,
  activeBadgeTitle,
} from './services/gamification';

export default function App() {
  const [db, setDb] = useState(() => rollDailyUsage(loadDB()));
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activePersona, setActivePersona] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [auraPing, setAuraPing] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showTrophies, setShowTrophies] = useState(false);

  const previewRef = useRef(null);

  // Persist the DB whenever it changes.
  useEffect(() => {
    saveDB(db);
  }, [db]);

  const remaining = remainingFreeShifts(db);
  const badge = output && activePersona ? activeBadgeTitle(db, activePersona) : null;

  // ── Core: run a transformation ─────────────────────────────────────────────
  async function handleSelectPersona(personaId) {
    if (loading) return;

    // Paywall gate: block on the 6th shift of the day.
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

      // Award gamification rewards and record the shift.
      const auraGained = rollAuraScore(db);
      const karmaGained = karmaForPersona(personaId);
      setDb((prev) => recordShift(prev, personaId, { auraGained, karmaGained }));
      setAuraPing({ id: Date.now(), amount: auraGained });
    } catch (err) {
      setOutput('');
      // Surface the (rare) hard failure without crashing the app.
      // eslint-disable-next-line no-alert
      alert(err?.message || 'Something went wrong transforming your text.');
    } finally {
      setLoading(false);
    }
  }

  // ── Download Aura Card (social-ready screenshot) ──────────────────────────
  async function handleDownloadCard() {
    if (!previewRef.current || !output) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#0b0b1a',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `aura-card-${activePersona || 'text-aura'}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('[Text Aura] Aura Card export failed:', err);
      // eslint-disable-next-line no-alert
      alert('Could not generate the Aura Card. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  // ── Admin backdoor ─────────────────────────────────────────────────────────
  function handleAdminUnlock() {
    setDb((prev) => activateAdmin(prev));
    setShowPaywall(false);
    // eslint-disable-next-line no-alert
    alert('Admin Mode Activated — unlimited free shifts unlocked! ⚡');
  }

  // ── "Subscribe" (simulated) ────────────────────────────────────────────────
  function handleSubscribe(planId) {
    setDb((prev) => activateAdmin(prev)); // simulate a successful purchase → unlimited
    setShowPaywall(false);
    // eslint-disable-next-line no-alert
    alert(`🎉 Welcome to Text Aura ${planId === 'annual' ? 'Legend' : 'Pro'}! Unlimited shifts unlocked.`);
  }

  return (
    <div className="flex min-h-full flex-col">
      <Header
        streak={db.streak}
        remaining={remaining}
        onOpenTrophies={() => setShowTrophies(true)}
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
          onDownloadCard={handleDownloadCard}
          downloading={downloading}
        />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-200">
              Pick your aura
            </h2>
            {!input.trim() && (
              <span className="text-xs text-amber-300/80">↑ type a message first</span>
            )}
          </div>
          <PersonaGrid
            activeId={activePersona}
            onSelect={handleSelectPersona}
            disabled={!input.trim() || loading}
          />
        </div>
      </main>

      <Footer sandbox={isSandboxMode} onAdminUnlock={handleAdminUnlock} />

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={handleSubscribe}
      />
      <TrophiesModal open={showTrophies} onClose={() => setShowTrophies(false)} db={db} />
    </div>
  );
}
