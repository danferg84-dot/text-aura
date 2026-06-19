import { CATEGORIES, personasByCategory } from '../services/personas';

function PersonaCard({ persona, active, disabled, onSelect }) {
  return (
    <button
      onClick={() => onSelect(persona.id)}
      disabled={disabled}
      className={[
        'group relative flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all duration-200',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active
          ? 'border-transparent bg-white/10 shadow-neon ring-1 ring-aura-neon/60'
          : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10 active:scale-[0.97]',
      ].join(' ')}
      title={persona.name}
    >
      <span
        className={[
          'grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-2xl transition-transform group-hover:scale-110',
          persona.accent,
        ].join(' ')}
      >
        {persona.emoji}
      </span>
      <span className="text-[11px] font-semibold leading-tight text-slate-200">{persona.name}</span>
      {active && (
        <span className="absolute -right-1 -top-1 h-3 w-3 animate-glow-pulse rounded-full bg-aura-mint" />
      )}
    </button>
  );
}

export default function PersonaGrid({ activeId, onSelect, disabled }) {
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
            {personasByCategory(cat.id).map((p) => (
              <PersonaCard
                key={p.id}
                persona={p}
                active={activeId === p.id}
                disabled={disabled}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
