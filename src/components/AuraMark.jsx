// Text Aura brand mark: a stylized "A" wrapped in an aura halo (an open orbit
// ring with a spark). Used in the header; the same artwork lives in
// public/aura.svg as the favicon (with a dark tile behind it).
export default function AuraMark({ className = '', tile = false }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Text Aura"
    >
      <defs>
        <linearGradient id="auraGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5b8cff" />
          <stop offset="0.5" stopColor="#a855f7" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      {tile && <rect width="64" height="64" rx="16" fill="#070711" />}

      {/* Aura halo — an open orbit ring */}
      <circle
        cx="32"
        cy="32"
        r="25"
        stroke="url(#auraGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="120 38"
        transform="rotate(-58 32 32)"
        opacity="0.9"
      />
      {/* Halo worn over the A — a tilted perspective ellipse */}
      <ellipse
        cx="32"
        cy="12"
        rx="7.5"
        ry="2.6"
        fill="none"
        stroke="url(#auraGrad)"
        strokeWidth="1.8"
        transform="rotate(-12 32 12)"
      />

      {/* Monogram A */}
      <path
        d="M22 45 L32 17 L42 45"
        stroke="url(#auraGrad)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M26 36 H38" stroke="url(#auraGrad)" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}
