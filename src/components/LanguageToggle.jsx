import React from 'react';
import { useLanguage } from '../context/LanguageContext';

// Toggle Bahasa Indonesia / English — pill 2 segmen "ID"/"EN", dipasang
// berdampingan dengan ThemeToggle (Landing navbar & Login). Segmen aktif
// dapat accent-gradient yang sama dengan tombol CTA utama, biar konsisten
// dengan design tokens var(--lp-*) yang sudah ada (otomatis ikut tema
// light/dark tanpa logic tambahan).

const LanguageToggle = ({ className = '', size = 38 }) => {
  const { language, setLanguage } = useLanguage();
  const height = size >= 46 ? 40 : 34;
  const fontSize = size >= 46 ? '0.78rem' : '0.72rem';

  const segmentStyle = (lang) => ({
    padding: size >= 46 ? '0 13px' : '0 10px',
    fontSize,
    fontWeight: 700,
    letterSpacing: '0.02em',
    border: 0,
    cursor: 'pointer',
    height: '100%',
    borderRadius: 999,
    transition: 'background 0.2s ease, color 0.2s ease',
    ...(language === lang
      ? { backgroundImage: 'var(--lp-accent-gradient)', color: '#04060c' }
      : { background: 'transparent', color: 'var(--lp-text-secondary)' }),
  });

  return (
    <div
      role="group"
      aria-label="Pilih bahasa / Select language"
      className={`inline-flex items-center rounded-full border shrink-0 ${className}`}
      style={{
        height,
        padding: 3,
        background: 'var(--lp-ghost-btn-bg)',
        borderColor: 'var(--lp-ghost-btn-border)',
      }}
    >
      <button type="button" onClick={() => setLanguage('id')} style={segmentStyle('id')} title="Bahasa Indonesia">
        ID
      </button>
      <button type="button" onClick={() => setLanguage('en')} style={segmentStyle('en')} title="English">
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
