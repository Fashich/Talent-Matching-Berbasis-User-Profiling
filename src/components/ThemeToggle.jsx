import React, { useId } from 'react';
import { useTheme } from '../context/ThemeContext';

// Tombol toggle light/dark — ikon SVG kustom dibelah diagonal (malam kiri-atas,
// siang kanan-bawah), lihat design_handoff_landing_login/README.md bagian
// "Toggle tema". Satu desain ikon dipakai di semua tempat (Landing & Login)
// biar konsisten — cuma `size` yang beda per lokasi (38 di navbar Landing,
// 46 di Login), bukan kompleksitas ikonnya.

const STARS = [
  { cx: 3.4, cy: 2.6, r: 0.5 },
  { cx: 11, cy: 2.4, r: 0.38 },
  { cx: 9, cy: 5.6, r: 0.3 },
  { cx: 2, cy: 9, r: 0.28 },
];

const ThemeToggle = ({ className = '', size = 38 }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const uid = useId();
  const clipId = `tt-clip-${uid}`;
  const glowId = `tt-glow-${uid}`;
  const radius = size >= 46 ? 12 : 11;

  const moonCol = isDark ? '#E2E8F0' : '#ffffff';
  const sunCol = isDark ? '#94A3B8' : '#FBBF24';
  const moonBg = isDark ? '#0A0F1E' : '#1E3A5F';
  const sunBg = isDark ? '#1A2744' : '#7DD3FC';
  const moonOp = isDark ? 1 : 0.16;
  const sunOp = isDark ? 0.16 : 1;
  const glowColor = isDark ? 'rgba(226,232,240,0.55)' : 'rgba(251,191,36,0.65)';
  const glowCenter = isDark ? 8 : 16;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Ganti tema"
      title={isDark ? 'Mode Terang' : 'Mode Gelap'}
      className={`inline-flex shrink-0 border-0 bg-transparent p-0 cursor-pointer transition-transform duration-150 hover:scale-[1.08] active:scale-[0.94] ${className}`}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', borderRadius: radius }}>
        <defs>
          <clipPath id={clipId}>
            <rect width="24" height="24" rx="5.3" />
          </clipPath>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glowColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <path d="M0,0 L24,0 L0,24 Z" fill={moonBg} />
          <path d="M24,0 L24,24 L0,24 Z" fill={sunBg} />
          <circle
            cx={glowCenter}
            cy={glowCenter}
            r="9"
            fill={`url(#${glowId})`}
            style={{ transition: 'cx 0.4s ease, cy 0.4s ease' }}
          />
          <g fill="#ffffff">
            {STARS.map((s, i) => (
              <circle
                key={i}
                cx={s.cx}
                cy={s.cy}
                r={s.r}
                style={{
                  opacity: isDark ? undefined : 0,
                  transition: 'opacity 0.35s ease',
                }}
              />
            ))}
          </g>
          <g style={{ opacity: moonOp, transition: 'opacity 0.35s ease' }}>
            <g transform="scale(0.62) translate(1,1)">
              <path d="M3 12.79A9 9 0 1 0 12.79 3 7 7 0 0 1 3 12.79z" fill={moonCol} />
            </g>
          </g>
          <g style={{ opacity: sunOp, transition: 'opacity 0.35s ease' }}>
            <circle cx="16" cy="16" r="3.4" fill={sunCol} />
          </g>
          <line x1="0" y1="24" x2="24" y2="0" stroke="rgba(255,255,255,0.22)" strokeWidth="0.7" />
        </g>
      </svg>
    </button>
  );
};

export default ThemeToggle;
