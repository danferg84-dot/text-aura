/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aura: {
          bg: '#070711',
          panel: 'rgba(20, 20, 38, 0.55)',
          neon: '#5b8cff',
          violet: '#a855f7',
          pink: '#ec4899',
          mint: '#34f5c5',
          gold: '#fbbf24',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 18px rgba(91, 140, 255, 0.55), 0 0 4px rgba(168, 85, 247, 0.6)',
        'neon-soft': '0 0 26px rgba(91, 140, 255, 0.30)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(14px) scale(0.9)' },
          '40%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(-42px) scale(1.1)' },
        },
        pop: {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '60%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(91,140,255,0.4)' },
          '50%': { boxShadow: '0 0 26px rgba(168,85,247,0.7)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'float-up': 'floatUp 1.8s ease-out forwards',
        pop: 'pop 0.4s ease-out',
        shimmer: 'shimmer 2.5s linear infinite',
        'glow-pulse': 'glowPulse 2.4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.35s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
