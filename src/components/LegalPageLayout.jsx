import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

// Layout bersama untuk halaman legal (Syarat & Ketentuan, Kebijakan Privasi).
// Sengaja dipisah dari Landing/Login supaya kontennya bisa panjang & di-scroll
// natural, tapi tetap konsisten visual (pakai token CSS --lp-* yang sama,
// lihat src/index.css) dan tetap punya ThemeToggle + jalan balik ke Beranda.
const LegalPageLayout = ({ title, updatedLabel, children }) => {
  return (
    <div
      className="min-h-screen font-[Plus_Jakarta_Sans,system-ui,sans-serif] transition-[background,color] duration-[0.4s]"
      style={{ background: 'var(--lp-page-bg)', color: 'var(--lp-text-primary)' }}
    >
      <nav
        className="sticky top-0 z-50 backdrop-blur-[14px] border-b transition-[background,border-color] duration-[0.4s]"
        style={{ background: 'var(--lp-nav-bg)', borderColor: 'var(--lp-nav-border)' }}
      >
        <div className="max-w-[880px] mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo-rajasa-192.png" alt="Logo SMKS Rajasa Surabaya" className="w-9 h-9 shrink-0" />
            <span className="font-[Sora,sans-serif] font-bold text-[1.15rem] tracking-[-0.01em]">EduPKL</span>
          </Link>
          <div className="flex items-center gap-3.5">
            <Link
              to="/"
              className="hidden min-[560px]:inline-flex items-center gap-1.5 text-[0.86rem] font-semibold"
              style={{ color: 'var(--lp-text-secondary)' }}
            >
              <ArrowLeft size={15} strokeWidth={2.4} />
              Kembali ke Beranda
            </Link>
            <ThemeToggle size={38} />
          </div>
        </div>
      </nav>

      <main className="max-w-[880px] mx-auto px-6 py-14">
        <Link
          to="/"
          className="min-[560px]:hidden inline-flex items-center gap-1.5 text-[0.86rem] font-semibold mb-6"
          style={{ color: 'var(--lp-text-secondary)' }}
        >
          <ArrowLeft size={15} strokeWidth={2.4} />
          Kembali ke Beranda
        </Link>

        <h1 className="font-[Sora,sans-serif] font-extrabold tracking-[-0.01em] text-[clamp(1.7rem,4vw,2.4rem)] mb-2">
          {title}
        </h1>
        <p className="text-[0.84rem] mb-10" style={{ color: 'var(--lp-text-muted)' }}>
          {updatedLabel}
        </p>

        <div className="legal-doc space-y-8">{children}</div>
      </main>

      <footer className="border-t" style={{ borderColor: 'var(--lp-footer-border)' }}>
        <div className="max-w-[880px] mx-auto px-6 py-7 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-rajasa-192.png" alt="Logo SMKS Rajasa Surabaya" className="w-[26px] h-[26px]" />
            <span className="font-[Sora,sans-serif] font-bold text-[0.9rem]">EduPKL</span>
          </div>
          <p className="text-[0.78rem]" style={{ color: 'var(--lp-text-muted)' }}>
            © {new Date().getFullYear()} EduPKL — Capstone Project, Prodi Sistem Informasi, Unesa.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Sub-komponen kecil biar isi Bab/Pasal di kedua halaman legal konsisten
// (heading + body), tanpa perlu styling manual berulang di tiap halaman.
export const LegalSection = ({ heading, children }) => (
  <section>
    {heading && (
      <h2 className="font-[Sora,sans-serif] font-bold text-[1.15rem] mb-3">{heading}</h2>
    )}
    <div
      className="text-[0.92rem] leading-[1.75] space-y-3"
      style={{ color: 'var(--lp-text-secondary)' }}
    >
      {children}
    </div>
  </section>
);

export default LegalPageLayout;
