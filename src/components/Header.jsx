import { Flame, Zap, Trophy, Infinity as InfinityIcon } from 'lucide-react';
import { DAILY_FREE_LIMIT } from '../services/storage';

export default function Header({ streak, remaining, onOpenTrophies }) {
  const unlimited = remaining === Infinity;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-aura-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        {/* Title */}
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-aura-neon to-aura-violet shadow-neon">
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <h1 className="font-display text-lg font-bold tracking-tight sm:text-xl">
            <span className="neon-text">TEXT AURA</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          {/* Streak */}
          <div
            className="chip border-orange-400/30 bg-orange-400/10 text-orange-200"
            title={`${streak}-day streak`}
          >
            <Flame className="h-3.5 w-3.5 text-orange-400" strokeWidth={2.5} />
            <span className="tabular-nums font-semibold">{streak}</span>
          </div>

          {/* Aura tokens / free shifts */}
          <div
            className="chip border-aura-violet/40 bg-aura-violet/10 text-violet-100"
            title="Free aura shifts remaining today"
          >
            {unlimited ? (
              <>
                <InfinityIcon className="h-3.5 w-3.5 text-aura-violet" strokeWidth={2.5} />
                <span className="hidden font-semibold sm:inline">Unlimited Shifts</span>
                <span className="font-semibold sm:hidden">∞</span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 text-aura-violet" strokeWidth={2.5} />
                <span className="tabular-nums font-semibold">
                  {remaining}/{DAILY_FREE_LIMIT}
                </span>
                <span className="hidden text-violet-300/80 sm:inline">Free Shifts Today</span>
              </>
            )}
          </div>

          {/* Trophies */}
          <button
            onClick={onOpenTrophies}
            className="grid h-8 w-8 place-items-center rounded-full border border-aura-gold/40 bg-aura-gold/10 text-aura-gold transition hover:bg-aura-gold/20 active:scale-95"
            title="Aura Trophies"
            aria-label="Open Aura Trophies"
          >
            <Trophy className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </header>
  );
}
