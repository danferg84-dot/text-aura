import { useState } from 'react';
import { Gift, Copy, Check, Share2 } from 'lucide-react';
import Modal from './Modal';
import { APP_URL, REFERRAL_BONUS } from '../config';
import { shareText, copyText } from '../services/share';

export default function InviteModal({ open, onClose, db }) {
  const [copied, setCopied] = useState(false);
  const link = `${APP_URL}/?ref=${db.referralCode}`;
  const message = `I've been transforming my texts with Text Aura ⚡ Grab ${REFERRAL_BONUS} free shifts with my link: ${link}`;

  const handleCopy = async () => {
    const ok = await copyText(link);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite friends, earn shifts"
      icon={<Gift className="h-5 w-5 text-aura-mint" />}
    >
      <p className="mb-4 text-sm text-slate-300">
        Share your link — friends who join get{' '}
        <span className="font-semibold text-white">{REFERRAL_BONUS} bonus shifts</span> to start.
        The more you share, the more aura flows. ✨
      </p>

      <div className="mb-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 pl-3">
        <span className="flex-1 truncate text-sm text-slate-300">{link}</span>
        <button
          onClick={handleCopy}
          className="chip glass-hover border-aura-neon/30 bg-aura-neon/10 text-sky-100"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <button onClick={() => shareText(message)} className="btn-neon w-full">
        <Share2 className="h-5 w-5" />
        Share my invite link
      </button>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="glass rounded-2xl px-2 py-3">
          <div className="neon-text font-display text-xl font-bold tabular-nums">
            {db.bonusShifts || 0}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">Bonus Shifts</div>
        </div>
        <div className="glass rounded-2xl px-2 py-3">
          <div className="neon-text font-display text-xl font-bold tabular-nums">
            {db.referralCode}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">Your Code</div>
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] text-slate-500">
        Two-way rewards (you + your friend) arrive with accounts. For now, your friends get the
        head start. 🙌
      </p>
    </Modal>
  );
}
