import { useEffect, useState } from 'react';
import { Gift, Play, Loader2, Crown } from 'lucide-react';
import Modal from './Modal';

const AD_SECONDS = 5; // placeholder duration

// STUB rewarded-ad flow. Replace the countdown with a real rewarded-ad SDK
// (e.g. AdMob/AdSense rewarded) whose verified completion calls onReward.
export default function AdRewardModal({ open, onClose, onReward, onUpgrade, bonus = 3 }) {
  const [phase, setPhase] = useState('offer'); // offer | playing | claiming
  const [left, setLeft] = useState(AD_SECONDS);

  useEffect(() => {
    if (!open) {
      setPhase('offer');
      setLeft(AD_SECONDS);
    }
  }, [open]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (left <= 0) {
      setPhase('claiming');
      Promise.resolve(onReward()).finally(() => onClose());
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, left, onReward, onClose]);

  return (
    <Modal
      open={open}
      onClose={phase === 'offer' ? onClose : undefined}
      title="Out of free shifts"
      icon={<Gift className="h-5 w-5 text-aura-mint" />}
    >
      {phase === 'offer' && (
        <>
          <p className="mb-4 text-sm text-slate-300">
            You've used today's free shifts. Watch a short ad to unlock{' '}
            <span className="font-semibold text-white">+{bonus} more</span> — or go unlimited.
          </p>
          <button onClick={() => setPhase('playing')} className="btn-neon w-full">
            <Play className="h-5 w-5" />
            Watch ad for +{bonus} shifts
          </button>
          <button
            onClick={onUpgrade}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-aura-gold/40 bg-aura-gold/10 py-2.5 text-sm font-semibold text-aura-gold transition hover:bg-aura-gold/20"
          >
            <Crown className="h-4 w-4" />
            Go unlimited instead →
          </button>
          <button
            onClick={onClose}
            className="mt-3 w-full text-center text-xs text-slate-500 transition hover:text-slate-300"
          >
            Maybe later
          </button>
        </>
      )}

      {phase === 'playing' && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-aura-neon to-aura-violet text-2xl font-bold text-white shadow-neon">
            {left}
          </div>
          <p className="text-sm text-slate-400">Ad playing… (placeholder)</p>
        </div>
      )}

      {phase === 'claiming' && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-aura-mint" />
          <p className="text-sm text-slate-300">Granting your shifts…</p>
        </div>
      )}
    </Modal>
  );
}
