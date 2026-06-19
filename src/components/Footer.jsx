import { useRef, useState } from 'react';

// Clicking the copyright text 5× consecutively unlocks Admin Mode.
const REQUIRED_CLICKS = 5;
const RESET_MS = 1500; // clicks must be reasonably consecutive

export default function Footer({ sandbox, onAdminUnlock }) {
  const [count, setCount] = useState(0);
  const timer = useRef(null);

  const handleClick = () => {
    const next = count + 1;
    clearTimeout(timer.current);

    if (next >= REQUIRED_CLICKS) {
      setCount(0);
      onAdminUnlock();
      return;
    }

    setCount(next);
    timer.current = setTimeout(() => setCount(0), RESET_MS);
  };

  return (
    <footer className="mx-auto max-w-2xl px-4 pb-10 pt-6 text-center">
      {sandbox && (
        <p className="mx-auto mb-3 max-w-md text-xs text-amber-200/80">
          🧪 Running in <span className="font-semibold">Sandbox Demo Mode</span> — using curated
          offline templates. Add a <code className="rounded bg-white/10 px-1">VITE_AI_API_KEY</code>{' '}
          to enable live AI transformations.
        </p>
      )}
      <button
        onClick={handleClick}
        className="select-none text-xs text-slate-500 transition hover:text-slate-400"
        title="Text Aura"
      >
        © {new Date().getFullYear()} Text Aura · Transform your vibe ✨
      </button>
    </footer>
  );
}
