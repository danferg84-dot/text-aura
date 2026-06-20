import { useState } from 'react';
import { Check, Camera, Loader2, MessageSquareShare } from 'lucide-react';

export default function ActionDashboard({ output, onCopySwitch, onShareCard, sharingCard }) {
  const [copyLabel, setCopyLabel] = useState(null);
  const disabled = !output;

  const handleCopySwitch = async () => {
    if (!output) return;
    const result = await onCopySwitch(); // 'shared' | 'cancelled' | 'copied' | 'failed'
    if (result === 'cancelled') return;
    setCopyLabel(result === 'shared' ? 'Shared!' : result === 'copied' ? 'Copied!' : 'Done');
    setTimeout(() => setCopyLabel(null), 2000);
  };

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button onClick={handleCopySwitch} disabled={disabled} className="btn-neon">
        {copyLabel ? <Check className="h-5 w-5" /> : <MessageSquareShare className="h-5 w-5" />}
        {copyLabel || '⚡ Send to Chat'}
      </button>

      <button onClick={onShareCard} disabled={disabled || sharingCard} className="btn-ghost">
        {sharingCard ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
        {sharingCard ? 'Rendering…' : '📸 Share Aura Card'}
      </button>
    </section>
  );
}
