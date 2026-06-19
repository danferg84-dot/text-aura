import { Crown, Check, Sparkles } from 'lucide-react';
import Modal from './Modal';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Pass',
    price: '$2.99',
    period: '/ mo',
    perks: ['Unlimited daily shifts', 'All 12 personas', 'Priority aura engine'],
    highlight: false,
  },
  {
    id: 'annual',
    name: 'Annual Legend Pass',
    price: '$29',
    period: '/ yr',
    perks: ['Everything in Monthly', 'Save 19% vs monthly', 'Legend badge frame', 'Early new personas'],
    highlight: true,
  },
];

export default function PaywallModal({ open, onClose, onSubscribe }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="You're out of free shifts!"
      icon={<Crown className="h-5 w-5 text-aura-gold" />}
    >
      <p className="mb-4 text-sm text-slate-300">
        You've used all <span className="font-semibold text-white">5 free shifts</span> today. Go
        Legend for unlimited aura transformations. ⚡
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={[
              'relative flex flex-col rounded-2xl border p-4 transition',
              plan.highlight
                ? 'animate-glow-pulse border-aura-violet/60 bg-gradient-to-b from-aura-violet/15 to-aura-neon/10'
                : 'border-white/10 bg-white/5',
            ].join(' ')}
          >
            {plan.highlight && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-aura-neon to-aura-violet px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-neon">
                Best Value
              </span>
            )}
            <div className="mb-1 flex items-baseline gap-1">
              <span className="font-display text-2xl font-bold text-white">{plan.price}</span>
              <span className="text-xs text-slate-400">{plan.period}</span>
            </div>
            <div className="mb-3 text-sm font-semibold text-slate-200">{plan.name}</div>
            <ul className="mb-4 flex-1 space-y-1.5">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-1.5 text-xs text-slate-300">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aura-mint" />
                  {perk}
                </li>
              ))}
            </ul>
            <button
              onClick={() => onSubscribe(plan.id)}
              className={plan.highlight ? 'btn-neon w-full' : 'btn-ghost w-full'}
            >
              <Sparkles className="h-4 w-4" />
              Choose {plan.name.split(' ')[0]}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        className="mt-4 w-full text-center text-xs text-slate-500 transition hover:text-slate-300"
      >
        Maybe later — I'll wait for tomorrow's free shifts
      </button>
    </Modal>
  );
}
