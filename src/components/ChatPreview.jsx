import { forwardRef } from 'react';
import { Loader2, Sparkles, Signal, Wifi, BatteryFull } from 'lucide-react';
import { PERSONA_MAP } from '../services/personas';

/**
 * High-end smartphone mockup.
 *  - original text → incoming grey bubble
 *  - transformed text → glowing neon outgoing bubble
 *  - badge title + animated "+Aura" score under the bubbles
 *
 * Ref is attached to the capture target (the screen) for the Aura Card export.
 */
const ChatPreview = forwardRef(function ChatPreview(
  { original, output, personaId, loading, badge, auraPing },
  ref
) {
  const persona = personaId ? PERSONA_MAP[personaId] : null;

  return (
    <section className="flex justify-center">
      {/* Phone frame */}
      <div className="relative w-full max-w-[330px] rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-slate-900 to-black p-2.5 shadow-glass">
        <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />

        {/* Capture target */}
        <div
          ref={ref}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#0b0b1a] via-[#0d0b1f] to-[#120a22]"
        >
          {/* Notch + status bar */}
          <div className="flex items-center justify-between px-5 pt-2.5 text-[10px] text-slate-300">
            <span className="font-semibold tabular-nums">9:41</span>
            <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
            <div className="flex items-center gap-1">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <BatteryFull className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Chat header */}
          <div className="mt-2 flex items-center gap-2 border-b border-white/5 px-4 pb-2.5">
            <div
              className={[
                'grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br text-lg',
                persona?.accent || 'from-slate-500 to-slate-700',
              ].join(' ')}
            >
              {persona?.emoji || '💬'}
            </div>
            <div className="leading-tight">
              <div className="text-xs font-semibold text-slate-100">
                {persona?.name || 'Text Aura'}
              </div>
              <div className="text-[10px] text-aura-mint">● online</div>
            </div>
            <Sparkles className="ml-auto h-4 w-4 text-aura-violet" />
          </div>

          {/* Messages */}
          <div className="min-h-[260px] space-y-3 px-3.5 py-4">
            {/* Incoming (original) */}
            {original ? (
              <div className="flex justify-start">
                <div className="max-w-[80%] animate-pop rounded-2xl rounded-tl-md bg-slate-700/80 px-3.5 py-2.5 text-[13px] leading-snug text-slate-100 shadow">
                  {original}
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-slate-700/40 px-3.5 py-2.5 text-[13px] italic leading-snug text-slate-400">
                  Your original message appears here…
                </div>
              </div>
            )}

            {/* Outgoing (transformed) */}
            {loading ? (
              <div className="flex justify-end">
                <div className="flex items-center gap-2 rounded-2xl rounded-br-md bg-gradient-to-br from-aura-neon to-aura-violet px-4 py-3 text-white shadow-neon">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Shifting aura…</span>
                </div>
              </div>
            ) : output ? (
              <div className="flex flex-col items-end gap-1">
                <div className="relative max-w-[80%] animate-pop rounded-2xl rounded-br-md bg-gradient-to-br from-aura-neon to-aura-violet px-3.5 py-2.5 text-[13px] font-medium leading-snug text-white shadow-neon">
                  {output}
                </div>

                {/* Badge title + Aura score */}
                {(badge || auraPing) && (
                  <div className="relative mt-0.5 flex items-center gap-2">
                    {badge && (
                      <span className="chip border-aura-gold/40 bg-aura-gold/15 text-[10px] text-aura-gold">
                        {badge.emoji} {badge.title}
                        <span className="opacity-70">· Lv {badge.level}</span>
                      </span>
                    )}
                    {auraPing && (
                      <span
                        key={auraPing.id}
                        className="animate-float-up bg-gradient-to-r from-aura-mint to-aura-neon bg-clip-text text-sm font-extrabold text-transparent drop-shadow"
                      >
                        +{auraPing.amount.toLocaleString()} Aura
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-white/5 px-3.5 py-2.5 text-[13px] italic leading-snug text-slate-500">
                  …transformed aura lands here ✨
                </div>
              </div>
            )}
          </div>

          {/* Watermark for exported cards */}
          <div className="flex items-center justify-center gap-1 border-t border-white/5 py-2 text-[10px] font-semibold tracking-wide text-slate-500">
            <Sparkles className="h-3 w-3 text-aura-violet" /> made with TEXT AURA
          </div>
        </div>
      </div>
    </section>
  );
});

export default ChatPreview;
