import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

// Toggle Bahasa Indonesia (default) / English, persist ke localStorage —
// pola sama persis dengan ThemeContext.jsx (dark/light) biar konsisten.
// `t(namespace, key)` mengambil string dari src/i18n/translations.js sesuai
// bahasa aktif; kalau value berupa function (mis. copyright yang butuh
// tahun), panggil manual dari komponen — lihat contoh pemakaian di
// Landing.jsx/Login.jsx.

const STORAGE_KEY = 'edupkl-lang';
const LanguageContext = createContext(null);

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'id';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'id' || stored === 'en') return stored;
  return 'id'; // default Bahasa Indonesia, TIDAK ikut prefers-language browser
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const toggleLanguage = () => setLanguage((prev) => (prev === 'id' ? 'en' : 'id'));

  const t = useMemo(() => {
    return (namespace, key) => {
      const dict = translations[language]?.[namespace];
      if (!dict) return key;
      const value = dict[key];
      return value !== undefined ? value : key;
    };
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage harus dipakai di dalam <LanguageProvider>');
  return ctx;
}
