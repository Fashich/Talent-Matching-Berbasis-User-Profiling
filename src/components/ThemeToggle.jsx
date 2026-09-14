import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Tombol toggle light/dark. `className` opsional buat sesuaikan posisi
// tiap dipakai di layout yang beda (header dashboard, halaman login, dst).
const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      title={isDark ? 'Mode Terang' : 'Mode Gelap'}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${className}`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
