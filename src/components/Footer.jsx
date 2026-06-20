import useSecretTaps from '../hooks/useSecretTaps';

export default function Footer({ sandbox, onAdminUnlock }) {
  // Tapping the copyright text 5× consecutively unlocks Admin Mode.
  const { count, required, onTap } = useSecretTaps(onAdminUnlock);

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
        onClick={onTap}
        className="select-none text-xs text-slate-500 transition hover:text-slate-400"
        title="Text Aura"
      >
        © {new Date().getFullYear()} Text Aura · Transform your vibe ✨
      </button>
      {count > 0 && (
        <div className="mt-1 text-[10px] text-aura-violet/80">
          🔓 Admin unlock: {count}/{required} taps…
        </div>
      )}
    </footer>
  );
}
