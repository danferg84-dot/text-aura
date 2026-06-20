import { Lock } from 'lucide-react';
import { CATEGORIES, personasByCategory } from '../services/personas';

function PersonaCard({ persona, active, disabled, locked, unlocksAt, hint, onSelect }) {
  return (
    <button
      onClick={() => onSelect(persona.id)}
      disabled={disabled || locked}
      className={[
        'group relative flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all duration-200',
        'disabled:cursor-not-allowed',
        locked
          ? 'border-white/5 bg-black/30 opacity-70'
          : active
            ? 'border-transparent bg-white/10 shadow-neon ring-1 ring-aura-neon/60'
            : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10 active:scale-[0.97] disabled:opacity-40',
      ].join(' ')}
      title={locked ? `Unlock at ${unlocksAt} shifts` : persona.name}
    >
      <span
        className={[
          'grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-2xl transition-transform',
          locked ? 'grayscale' : 'group-hover:scale-110',
          persona.accent,
        ].join(' ')}
      >
        {persona.emoji}
      </span>
      <span className="text-[11px] font-semibold leading-tight text-slate-200">{persona.name}</span>

      {locked && (
        <span className="absolute inset-0 grid place-items-center rounded-2xl bg-black/45">
          <span className="flex flex-col items-center gap-0.5">
            <Lock className="h-4 w-4 text-slate-300" />
            <span className="text-[9px] font-semibold text-slate-300">🔓 {unlocksAt} shifts</span>
          </span>
        </span>
      )}

      {!locked && hint && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-aura-gold/40 bg-aura-bg px-1.5 py-0.5 text-[8px] font-bold text-aura-gold shadow">
          {hint}
        </span>
      )}

      {!locked && active && (
        <span className="absolute -right-1 -top-1 h-3 w-3 animate-glow-pulse rounded-full bg-aura-mint" />
      )}
    </button>
  );
}

export default function PersonaGrid({ activeId, onSelect, disabled, meta = {} }) {
  return (
    <section className="space-y-4">
      {CATEGORIES.map((cat) => (
        <div key={cat.id}>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
            {cat.label}
            <span className="h-px flex-1 bg-gradient-to-l from-white/15 to-transparent" />
          </h3>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {personasByCategory(cat.id).map((p) => {
              const m = meta[p.id] || {};
              return (
                <PersonaCard
                  key={p.id}
                  persona={p}
                  active={activeId === p.id}
                  disabled={disabled}
                  locked={!!m.locked}
                  unlocksAt={m.unlocksAt}
                  hint={m.hint}
                  onSelect={onSelect}
                />
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
