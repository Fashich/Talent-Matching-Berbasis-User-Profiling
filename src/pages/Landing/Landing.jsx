import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Sparkles, FileText, ArrowRight, Menu } from 'lucide-react';
import SchoolScene from '../../components/SchoolScene/SchoolScene';
import ThemeToggle from '../../components/ThemeToggle';
import { API_BASE_URL } from '../../config/api';

// Landing Page — redesign hifi (lihat design_handoff_landing_login/README.md).
// Angka statistik WAJIB dari database (fetch langsung, bukan apiFetch()
// supaya kegagalan jaringan tidak memicu overlay LostSignal global — untuk
// pengunjung publik yang belum login, halaman ini harus tetap bisa dilihat
// walau backend sedang mati; kalau fetch gagal, section angka disembunyikan
// saja, TIDAK fallback ke angka fabrikasi).

const FEATURES = [
  {
    icon: Users,
    iconBox: 'blue',
    title: 'User & Competency Profiling',
    desc: 'Siswa melengkapi profil, pengalaman, minat, dan kompetensi sebagai dasar pencocokan.',
  },
  {
    icon: Building2,
    iconBox: 'cyan',
    title: 'Company Requirement',
    desc: 'Perusahaan mitra mendaftarkan lowongan beserta kompetensi & jurusan yang dibutuhkan.',
  },
  {
    icon: Sparkles,
    iconBox: 'blue',
    title: 'Talent Matching & Rekomendasi',
    desc: 'Match Score dihitung otomatis dari profil siswa vs kebutuhan perusahaan — rekomendasi terurut secara real-time.',
  },
  {
    icon: FileText,
    iconBox: 'cyan',
    title: 'Jurnal & Pemantauan PKL',
    desc: 'Jurnal harian, kelompok magang, dan status penempatan terpantau dalam satu sistem.',
  },
];

const STEPS = [
  { title: 'Lengkapi Profil', desc: 'Siswa mengisi data kompetensi, minat, dan pengalaman.' },
  { title: 'Perusahaan Daftar Kebutuhan', desc: 'Mitra mengajukan kebutuhan kompetensi & jurusan.' },
  { title: 'Sistem Menghitung Match Score', desc: 'Rekomendasi terurut otomatis dari skor tertinggi.' },
  { title: 'Penempatan & Pemantauan', desc: 'Jurnal harian & status PKL terpantau sampai selesai.' },
];

function scrollToId(id) {
  return (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

// Breakpoint sama persis dengan yang dipakai layout nav (min-[860px]) di
// bawah — di bawah ini dianggap "mobile".
const MOBILE_QUERY = '(max-width: 859px)';

const Landing = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  // Scene 3D (SchoolScene) sengaja TIDAK di-render sama sekali di mobile
  // (bukan cuma disembunyikan via CSS) — scene-nya berat (generate tekstur
  // prosedural + animasi WebGL terus-menerus), jadi di mobile mending nggak
  // usah dipasang ke DOM biar nggak boros baterai/CPU HP pengunjung.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );
  const startedRef = useRef(false);
  const statsSectionRef = useRef(null);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const handleChange = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/stats/public`);
        if (!res.ok) throw new Error('stats fetch failed');
        const json = await res.json();
        if (!cancelled && json?.success && json.data) {
          setStats({
            siswa: Number(json.data.siswa) || 0,
            perusahaan: Number(json.data.perusahaan) || 0,
            programKeahlian: Number(json.data.program_keahlian) || 0,
          });
        }
      } catch {
        // Backend tidak terjangkau atau gagal — section statistik disembunyikan.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!stats || startedRef.current) return undefined;
    const el = statsSectionRef.current;
    if (!el) return undefined;

    const targets = [stats.siswa, stats.perusahaan, stats.programKeahlian, 1];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const duration = 1400;
            const start = performance.now();
            const step = (now) => {
              const p = Math.min((now - start) / duration, 1);
              const eased = 1 - (1 - p) ** 3;
              setCounts(targets.map((v) => Math.round(v * eased)));
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stats]);

  return (
    <div
      className="min-h-screen font-[Plus_Jakarta_Sans,system-ui,sans-serif] relative overflow-x-hidden transition-[background,color] duration-[0.4s]"
      style={{ background: 'var(--lp-page-bg)', color: 'var(--lp-text-primary)' }}
    >
      <nav
        className="sticky top-0 z-50 backdrop-blur-[14px] border-b transition-[background,border-color] duration-[0.4s]"
        style={{ background: 'var(--lp-nav-bg)', borderColor: 'var(--lp-nav-border)' }}
      >
        <div className="max-w-[1180px] mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo-rajasa-192.png" alt="Logo SMKS Rajasa Surabaya" className="w-9 h-9 shrink-0" />
            <span className="font-[Sora,sans-serif] font-bold text-[1.15rem] tracking-[-0.01em]">EduPKL</span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="hidden min-[860px]:flex items-center gap-7">
              <a
                href="#fitur"
                onClick={scrollToId('fitur')}
                className="text-[0.9rem] font-medium whitespace-nowrap"
                style={{ color: 'var(--lp-text-secondary)' }}
              >
                Fitur
              </a>
              <a
                href="#cara-kerja"
                onClick={scrollToId('cara-kerja')}
                className="text-[0.9rem] font-medium whitespace-nowrap"
                style={{ color: 'var(--lp-text-secondary)' }}
              >
                Cara Kerja
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-[10px] text-[0.88rem] font-bold whitespace-nowrap text-[#04060c]"
                style={{ backgroundImage: 'var(--lp-accent-gradient)' }}
              >
                Masuk
                <ArrowRight size={15} strokeWidth={2.4} />
              </Link>
            </div>

            <ThemeToggle size={38} />

            <button
              type="button"
              onClick={() => setNavOpen((v) => !v)}
              aria-label="Menu"
              className="min-[860px]:hidden inline-flex items-center justify-center w-[38px] h-[38px] rounded-[9px] border shrink-0"
              style={{ background: 'var(--lp-ghost-btn-bg)', borderColor: 'var(--lp-ghost-btn-border)', color: 'var(--lp-text-primary)' }}
            >
              <Menu size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {navOpen && (
          <div
            className="min-[860px]:hidden border-t px-6 py-4 flex flex-col gap-3.5"
            style={{ borderColor: 'var(--lp-nav-border)', background: 'var(--lp-mobile-panel-bg)' }}
          >
            <a
              href="#fitur"
              onClick={(e) => {
                scrollToId('fitur')(e);
                setNavOpen(false);
              }}
              className="text-[0.95rem] font-medium"
              style={{ color: 'var(--lp-text-secondary)' }}
            >
              Fitur
            </a>
            <a
              href="#cara-kerja"
              onClick={(e) => {
                scrollToId('cara-kerja')(e);
                setNavOpen(false);
              }}
              className="text-[0.95rem] font-medium"
              style={{ color: 'var(--lp-text-secondary)' }}
            >
              Cara Kerja
            </a>
            <Link
              to="/login"
              className="text-center px-[18px] py-2.5 rounded-[10px] text-[0.9rem] font-bold text-[#04060c]"
              style={{ backgroundImage: 'var(--lp-accent-gradient)' }}
            >
              Masuk ke Sistem
            </Link>
          </div>
        )}
      </nav>

      <div
        className="lp-orb absolute w-[340px] h-[340px] rounded-full pointer-events-none z-0"
        style={{
          top: 60,
          left: '8%',
          background: 'radial-gradient(circle, rgba(91,141,239,0.22), transparent 70%)',
          filter: 'blur(10px)',
          animation: 'lp-float-orb 9s ease-in-out infinite',
        }}
      />
      <div
        className="lp-orb absolute w-[260px] h-[260px] rounded-full pointer-events-none z-0"
        style={{
          top: 280,
          right: '5%',
          background: 'radial-gradient(circle, rgba(53,196,201,0.18), transparent 70%)',
          filter: 'blur(10px)',
          animation: 'lp-float-orb-2 11s ease-in-out infinite',
        }}
      />

      <main className="max-w-[1180px] mx-auto px-6 pt-[72px] pb-10 relative z-[1] grid grid-cols-1 min-[860px]:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] min-[860px]:items-center gap-9">
        <div className="max-w-[640px]">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[0.76rem] font-bold tracking-[0.03em] mb-5 border"
            style={{ background: 'var(--lp-pill-bg)', borderColor: 'var(--lp-pill-border)', color: 'var(--lp-pill-text)' }}
          >
            <span
              className="lp-pulse-dot w-1.5 h-1.5 rounded-full"
              style={{ background: '#35C4C9', animation: 'lp-pulse-dot 1.8s ease-in-out infinite' }}
            />
            SMKS RAJASA SURABAYA &middot; CAPSTONE PROJECT
          </div>
          <h1 className="font-[Sora,sans-serif] font-extrabold leading-[1.08] tracking-[-0.02em] mb-[22px] text-[clamp(2.2rem,5vw,3.6rem)]">
            Talent Matching berbasis{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--lp-accent-gradient)' }}
            >
              User Profiling
            </span>
          </h1>
          <p className="text-[1.05rem] leading-[1.7] mb-[34px] max-w-[520px]" style={{ color: 'var(--lp-text-muted)' }}>
            Mencocokkan profil &amp; kompetensi siswa PKL dengan kebutuhan perusahaan mitra secara
            otomatis — Match Score real-time, jurnal harian, dan rekomendasi penempatan dalam satu
            sistem terpadu.
          </p>
          <div className="flex gap-3.5 flex-wrap">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-[26px] py-3.5 rounded-xl text-[0.95rem] font-bold text-[#04060c]"
              style={{ backgroundImage: 'var(--lp-accent-gradient)', boxShadow: '0 12px 30px -8px rgba(91,141,239,0.55)' }}
            >
              Masuk ke Sistem
              <ArrowRight size={17} strokeWidth={2.4} />
            </Link>
            <a
              href="#cara-kerja"
              onClick={scrollToId('cara-kerja')}
              className="inline-flex items-center gap-2 px-[26px] py-3.5 rounded-xl text-[0.95rem] font-semibold border"
              style={{ background: 'var(--lp-ghost-btn-bg)', borderColor: 'var(--lp-ghost-btn-border)', color: 'var(--lp-text-primary)' }}
            >
              Cara Kerja
            </a>
          </div>
        </div>

        {!isMobile && (
          <div className="relative w-full h-[480px]">
            <SchoolScene />
          </div>
        )}
      </main>

      <section id="stats-section" ref={statsSectionRef} className="max-w-[1180px] mx-auto px-6 pt-5 pb-[60px] relative z-[1]">
        {stats && (
          <>
            <div
              className="grid gap-[18px] py-8 border-t border-b"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', borderColor: 'var(--lp-stats-divider)' }}
            >
              {[
                [counts[0], 'Siswa Terdaftar', '+'],
                [counts[1], 'Perusahaan Mitra', '+'],
                [counts[2], 'Program Keahlian', ''],
                [counts[3], 'Sistem Terpadu', ''],
              ].map(([value, label, suffix]) => (
                <div key={label} className="text-center">
                  <div
                    className="font-[Sora,sans-serif] font-extrabold text-[2.1rem] bg-clip-text text-transparent"
                    style={{ backgroundImage: 'var(--lp-accent-gradient)' }}
                  >
                    {value}
                    {suffix}
                  </div>
                  <div className="text-[0.8rem] mt-1" style={{ color: 'var(--lp-text-muted)' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section id="fitur" className="max-w-[1180px] mx-auto px-6 pt-5 pb-[76px] relative z-[1]">
        <div className="text-center max-w-[560px] mx-auto mb-11">
          <div className="text-[0.76rem] font-bold tracking-[0.08em] mb-2.5" style={{ color: '#35C4C9' }}>
            FITUR UTAMA
          </div>
          <h2 className="font-[Sora,sans-serif] font-extrabold tracking-[-0.01em] text-[clamp(1.6rem,3vw,2.2rem)]">
            Satu sistem, seluruh siklus PKL
          </h2>
        </div>
        <div className="grid gap-[18px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-[26px] border transition-transform duration-200 hover:-translate-y-1.5 hover:border-[rgba(91,141,239,0.4)]"
              style={{ background: 'var(--lp-surface-bg)', borderColor: 'var(--lp-surface-border)' }}
            >
              <div
                className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center mb-4"
                style={{
                  background: f.iconBox === 'blue' ? 'var(--lp-icon-box-blue)' : 'var(--lp-icon-box-cyan)',
                  color: f.iconBox === 'blue' ? '#5B8DEF' : '#1fa7ae',
                }}
              >
                <f.icon size={21} strokeWidth={2} />
              </div>
              <h3 className="text-[1.02rem] font-bold mb-2">{f.title}</h3>
              <p className="text-[0.87rem] leading-[1.6]" style={{ color: 'var(--lp-text-muted)' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="cara-kerja" className="max-w-[1180px] mx-auto px-6 pt-5 pb-[90px] relative z-[1]">
        <div className="text-center max-w-[560px] mx-auto mb-12">
          <div className="text-[0.76rem] font-bold tracking-[0.08em] mb-2.5" style={{ color: '#35C4C9' }}>
            CARA KERJA
          </div>
          <h2 className="font-[Sora,sans-serif] font-extrabold tracking-[-0.01em] text-[clamp(1.6rem,3vw,2.2rem)]">
            Dari profil siswa ke penempatan, dalam 4 langkah
          </h2>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {STEPS.map((s, i) => (
            <div key={s.title} className="px-[18px] pb-[18px]">
              <div
                className="w-[38px] h-[38px] rounded-[11px] font-extrabold flex items-center justify-center mb-4 text-[#04060c] font-[Sora,sans-serif]"
                style={{ backgroundImage: 'var(--lp-accent-gradient)' }}
              >
                {i + 1}
              </div>
              <h4 className="text-[0.95rem] font-bold mb-1.5">{s.title}</h4>
              <p className="text-[0.83rem] leading-[1.6]" style={{ color: 'var(--lp-text-muted)' }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="studi-kasus" className="max-w-[1180px] mx-auto px-6 pt-5 pb-[90px] relative z-[1]">
        <div
          className="rounded-2xl border p-9 flex flex-col min-[720px]:flex-row items-center gap-8 text-center min-[720px]:text-left"
          style={{ background: 'var(--lp-surface-bg)', borderColor: 'var(--lp-surface-border)' }}
        >
          <a
            href="https://smkrajasa.sch.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
            aria-label="Kunjungi website resmi SMKS Rajasa Surabaya"
          >
            <img
              src="/logo-rajasa-192.png"
              alt="Logo SMKS Rajasa Surabaya"
              className="w-[84px] h-[84px]"
            />
          </a>
          <div>
            <div className="text-[0.76rem] font-bold tracking-[0.08em] mb-2.5" style={{ color: '#35C4C9' }}>
              STUDI KASUS
            </div>
            <h2 className="font-[Sora,sans-serif] font-extrabold tracking-[-0.01em] text-[clamp(1.4rem,2.6vw,1.9rem)] mb-3">
              Dikembangkan sebagai Studi Kasus untuk{' '}
              <a
                href="https://smkrajasa.sch.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                SMKS Rajasa Surabaya
              </a>
            </h2>
            <p className="text-[0.9rem] leading-[1.7] max-w-[680px]" style={{ color: 'var(--lp-text-muted)' }}>
              EduPKL dirancang dan dikembangkan oleh Kelompok 1 Capstone Program Studi S1 Sistem Informasi
              Unesa, menjadikan alur penempatan PKL di SMKS Rajasa Surabaya sebagai studi kasus penelitian.
              Sistem dikembangkan secara independen melalui observasi dan wawancara langsung dengan pihak
              sekolah, atas izin SMKS Rajasa Surabaya.
            </p>
            <a
              href="https://smkrajasa.sch.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-[0.85rem] font-bold underline-offset-2 hover:underline"
              style={{ color: '#35C4C9' }}
            >
              Kunjungi Website Resmi SMKS Rajasa Surabaya
              <ArrowRight size={14} strokeWidth={2.4} />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t relative z-[1]" style={{ borderColor: 'var(--lp-footer-border)' }}>
        <div className="max-w-[1180px] mx-auto px-6 py-7 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-rajasa-192.png" alt="Logo SMKS Rajasa Surabaya" className="w-[26px] h-[26px]" />
            <span className="font-[Sora,sans-serif] font-bold text-[0.9rem]">EduPKL</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              to="/terms"
              className="text-[0.78rem] font-medium underline-offset-2 hover:underline"
              style={{ color: 'var(--lp-text-muted)' }}
            >
              Syarat & Ketentuan
            </Link>
            <Link
              to="/privacy"
              className="text-[0.78rem] font-medium underline-offset-2 hover:underline"
              style={{ color: 'var(--lp-text-muted)' }}
            >
              Kebijakan Privasi
            </Link>
            <p className="text-[0.78rem]" style={{ color: 'var(--lp-text-muted)' }}>
              © {new Date().getFullYear()} EduPKL — Capstone Project, Prodi Sistem Informasi, Unesa.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
