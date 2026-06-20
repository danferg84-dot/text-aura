// ─── Sharing helpers ─────────────────────────────────────────────────────────
// The Web Share API is the seamless "switch to chat" path on mobile — it opens
// the native share sheet so the user can drop the text/image into ANY app
// (iMessage, WhatsApp, Instagram, TikTok, …), not just SMS. We always fall back
// gracefully on desktop where the share sheet doesn't exist.

/** Share plain text. Returns 'shared' | 'cancelled' | 'copied' | 'failed'. */
export async function shareText(text) {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
      // fall through to clipboard
    }
  }
  try {
    await navigator.clipboard?.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}

/**
 * Share an image blob (the Aura Card). On mobile this opens the share sheet with
 * the PNG attached; on desktop (or where file-sharing is unsupported) it
 * downloads the file instead. Returns 'shared' | 'cancelled' | 'downloaded'.
 */
export async function shareImage(blob, filename, text) {
  const file = new File([blob], filename, { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
      // fall through to download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return 'downloaded';
}

/** Copy text to clipboard. Returns boolean success. */
export async function copyText(text) {
  try {
    await navigator.clipboard?.writeText(text);
    return true;
  } catch {
    return false;
  }
}
