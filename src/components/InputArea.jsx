import { useState } from 'react';
import { ClipboardPaste, X } from 'lucide-react';

export default function InputArea({ value, onChange }) {
  const [pasteState, setPasteState] = useState('idle'); // idle | ok | error

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard?.readText) throw new Error('Clipboard API unavailable');
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
        setPasteState('ok');
      } else {
        setPasteState('error');
      }
    } catch {
      setPasteState('error');
    }
    setTimeout(() => setPasteState('idle'), 1800);
  };

  return (
    <section className="animate-fade-in">
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="aura-input" className="text-sm font-semibold text-slate-300">
          Your message
        </label>
        <button
          onClick={handlePaste}
          className="chip glass-hover border-aura-neon/30 bg-aura-neon/10 text-sky-100"
        >
          <ClipboardPaste className="h-3.5 w-3.5" strokeWidth={2.3} />
          {pasteState === 'ok' ? 'Pasted!' : pasteState === 'error' ? 'No access' : '📋 Paste from Clipboard'}
        </button>
      </div>

      <div className="relative">
        <textarea
          id="aura-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="Type or paste anything… then pick a persona below to shift its aura."
          className="w-full resize-y rounded-2xl border border-white/10 bg-white/5 p-4 pr-10 text-[15px] leading-relaxed text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-aura-neon/50 focus:shadow-neon-soft"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
            title="Clear"
            aria-label="Clear input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="mt-1 text-right text-xs text-slate-500 tabular-nums">{value.length} chars</div>
    </section>
  );
}
