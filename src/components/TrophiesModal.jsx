import { Trophy, Lock, Check } from 'lucide-react';
import Modal from './Modal';
import { allBadgeStatuses } from '../services/gamification';

function PathCard({ status }) {
  const { path, value, current, next, progress, unlocked, maxed } = status;

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">{path.emoji}</span>
        <div className="flex-1">
          <div className="text-sm font-bold text-slate-100">{path.label}</div>
          <div className="text-[11px] text-slate-400">
            {value} {path.metric === 'karma' ? 'karma' : 'uses'}
            {current && ` · now: ${current.title}`}
          </div>
        </div>
        {maxed && (
          <span className="chip border-aura-gold/40 bg-aura-gold/15 text-[10px] text-aura-gold">
            MAXED ⭐
          </span>
        )}
      </div>

      {/* Tier ladder */}
      <ol className="space-y-1.5">
        {path.tiers.map((tier) => {
          const reached = value >= tier.min;
          const isCurrent = current && current.level === tier.level;
          return (
            <li
              key={tier.level}
              className={[
                'flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition',
                isCurrent
                  ? 'bg-gradient-to-r from-aura-neon/20 to-aura-violet/20 ring-1 ring-aura-neon/50'
                  : reached
                    ? 'bg-white/5'
                    : 'bg-black/20 opacity-60',
              ].join(' ')}
            >
              <span
                className={[
                  'grid h-5 w-5 place-items-center rounded-full text-[10px]',
                  reached ? 'bg-aura-mint/20 text-aura-mint' : 'bg-white/5 text-slate-500',
                ].join(' ')}
              >
                {reached ? <Check className="h-3 w-3" /> : <Lock className="h-2.5 w-2.5" />}
              </span>
              <span className={reached ? 'font-semibold text-slate-100' : 'text-slate-400'}>
                {tier.title}
              </span>
              <span className="ml-auto tabular-nums text-[10px] text-slate-500">
                Lv {tier.level} · {tier.min}+
              </span>
            </li>
          );
        })}
      </ol>

      {/* Progress to next */}
      {!maxed && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[10px] text-slate-400">
            <span>{unlocked ? 'Progress to next rank' : 'Unlock the first rank'}</span>
            {next && (
              <span className="tabular-nums">
                {value}/{next.min}
              </span>
            )}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-aura-neon to-aura-violet transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrophiesModal({ open, onClose, db }) {
  const statuses = open ? allBadgeStatuses(db) : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Aura Trophies"
      icon={<Trophy className="h-5 w-5 text-aura-gold" />}
    >
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Total Shifts" value={db.totalShifts} />
        <Stat label="Karma" value={db.karmaPoints} />
        <Stat label="Total Aura" value={db.auraScore.toLocaleString()} />
      </div>

      <div className="space-y-3">
        {statuses.map((s) => (
          <PathCard key={s.path.id} status={s} />
        ))}
      </div>
    </Modal>
  );
}

function Stat({ label, value }) {
  return (
    <div className="glass rounded-2xl px-2 py-3">
      <div className="neon-text font-display text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}
