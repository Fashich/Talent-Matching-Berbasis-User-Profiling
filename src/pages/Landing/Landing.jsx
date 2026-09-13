import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Sparkles, NotebookPen, ArrowRight } from 'lucide-react';

// Landing Page — halaman publik sebelum login (task #18). Murni informatif,
// tidak menyentuh data/backend sama sekali.

const FEATURES = [
  {
    icon: Users,
    title: 'User & Competency Profiling',
    desc: 'Siswa melengkapi profil, pengalaman, minat, dan kompetensi sebagai dasar pencocokan.',
  },
  {
    icon: Building2,
    title: 'Company Requirement',
    desc: 'Perusahaan mitra mendaftarkan lowongan beserta kompetensi & jurusan yang dibutuhkan.',
  },
  {
    icon: Sparkles,
    title: 'Talent Matching & Rekomendasi',
    desc: 'Match Score dihitung otomatis dari profil siswa vs kebutuhan perusahaan — rekomendasi terurut, bukan sekadar pencatatan manual.',
  },
  {
    icon: NotebookPen,
    title: 'Jurnal & Pemantauan PKL',
    desc: 'Jurnal harian, kelompok magang, dan status penempatan terpantau dalam satu sistem.',
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo-rajasa-192.png" alt="Logo SMKS Rajasa Surabaya" className="w-10 h-10 rounded-lg bg-white p-1" />
          <span className="font-bold text-xl tracking-wide">EduPKL</span>
        </div>
        <Link
          to="/login"
          className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100 transition"
        >
          Masuk
          <ArrowRight size={16} />
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-300 mb-6">
          SMKS Rajasa Surabaya
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
          Talent Matching Berbasis <span className="text-blue-400">User Profiling</span>
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
          Mencocokkan profil & kompetensi siswa PKL dengan kebutuhan perusahaan mitra secara
          otomatis — dari penempatan, jurnal harian, hingga Match Score dan rekomendasi, dalam
          satu sistem yang rapi.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          Masuk ke Sistem
          <ArrowRight size={18} />
        </Link>
      </main>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center mb-4">
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} EduPKL — Capstone Project, Prodi Sistem Informasi, Unesa.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
