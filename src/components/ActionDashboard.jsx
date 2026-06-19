import { useState } from 'react';
import { Copy, Check, Camera, Loader2, MessageSquareShare } from 'lucide-react';

export default function ActionDashboard({ output, onDownloadCard, downloading }) {
  const [copied, setCopied] = useState(false);
  const disabled = !output;

  // Copy output, then fire an sms: link so the user can paste into Messages.
  const handleCopySwitch = async () => {
    if (!output) return;
    try {
      await navigator.clipboard?.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked — still open the SMS composer */
    }
    // sms: wrapper — opens the native Messages app with the text prefilled
    // where supported (mobile). The body is also already on the clipboard.
    const body = encodeURIComponent(output);
    window.location.href = `sms:?&body=${body}`;
  };

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button onClick={handleCopySwitch} disabled={disabled} className="btn-neon">
        {copied ? <Check className="h-5 w-5" /> : <MessageSquareShare className="h-5 w-5" />}
        {copied ? 'Copied — opening chat…' : '⚡ Copy & Switch to Chat'}
      </button>

      <button onClick={onDownloadCard} disabled={disabled || downloading} className="btn-ghost">
        {downloading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Camera className="h-5 w-5" />
        )}
        {downloading ? 'Rendering…' : '📸 Download Aura Card'}
      </button>
    </section>
  );
}
