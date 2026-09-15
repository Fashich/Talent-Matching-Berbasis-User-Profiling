import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import { buildWhatsAppLink } from '../../config/contact';

// Login — redesign hifi (design_handoff_landing_login/README.md §Screen 2).
// Flow auth TIDAK berubah: tetap AuthContext (token Bearer, AuthController.php).

const DEMO_ACCOUNTS = [
  { label: 'Administrator', username: 'admin', password: 'Admin123!' },
  { label: 'Petugas', username: 'petugas1', password: 'Petugas123!' },
  { label: 'Guru', username: 'guru1', password: 'Guru123!' },
  { label: 'Siswa', username: 'siswa1', password: 'Siswa123!' },
];

const Login = () => {
  const { user, loading, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) return null;

  if (user) {
    const redirectTo = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi.');
      return;
    }
    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError('');
    navigate('/dashboard', { replace: true });
  };

  const fillDemo = (account) => {
    setUsername(account.username);
    setPassword(account.password);
    setError('');
  };

  const handleCardMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setCardTilt({ x: py * -10, y: px * 12 });
  };
  const handleCardLeave = () => setCardTilt({ x: 0, y: 0 });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 relative transition-[background] duration-[0.4s]"
      style={{ background: 'var(--lp-page-bg)' }}
    >
      <ThemeToggle size={46} className="fixed top-[18px] right-[18px] z-40" />

      <div
        className="w-full max-w-[920px] rounded-[22px] overflow-hidden grid grid-cols-1 min-[760px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] border"
        style={{ boxShadow: '0 40px 90px -30px rgba(0,0,0,0.45)', borderColor: 'var(--lp-card-border)' }}
      >
        {/* Panel brand — selalu gelap di kedua tema (keputusan desain). */}
        <div
          className="hidden min-[760px]:flex lp-grid-drift flex-col justify-between p-11 relative overflow-hidden"
          style={{
            backgroundColor: '#0a0e1c',
            color: '#f1f3f9',
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(155deg,#0a0e1c,#0d1326 55%,#0a0e1c)',
            backgroundSize: '26px 26px, auto',
            animation: 'lp-grid-drift 14s linear infinite',
          }}
        >
          <div
            className="lp-orb absolute -top-10 -left-10 w-[220px] h-[220px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(91,141,239,0.3), transparent 70%)',
              filter: 'blur(6px)',
              animation: 'lp-float-orb-l 8s ease-in-out infinite',
            }}
          />
          <div
            className="lp-orb absolute -bottom-8 -right-8 w-[180px] h-[180px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(53,196,201,0.24), transparent 70%)',
              filter: 'blur(6px)',
              animation: 'lp-float-orb-l2 10s ease-in-out infinite',
            }}
          />

          <div className="relative z-[1]">
            <div className="flex items-center gap-2.5 mb-[34px]">
              <img src="/logo-rajasa-192.png" alt="Logo SMKS Rajasa Surabaya" className="w-[38px] h-[38px]" />
              <span className="font-[Sora,sans-serif] font-bold text-[1.15rem]" style={{ color: '#f1f3f9' }}>
                EduPKL
              </span>
            </div>
            <h1 className="font-[Sora,sans-serif] text-[1.65rem] font-bold leading-[1.28] tracking-[-0.01em] mb-3.5" style={{ color: '#f1f3f9' }}>
              Talent Matching berbasis{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'var(--lp-accent-gradient)' }}
              >
                User Profiling
              </span>{' '}
              untuk PKL siswa SMK.
            </h1>
            <p className="text-[0.9rem] leading-[1.7] mb-[30px]" style={{ color: '#aeb7cf' }}>
              Profil &amp; kompetensi siswa dicocokkan otomatis dengan kebutuhan perusahaan —
              menghasilkan Match Score dan rekomendasi penempatan PKL yang paling sesuai.
            </p>

            <div style={{ perspective: '1200px' }} onMouseMove={handleCardMove} onMouseLeave={handleCardLeave}>
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 rounded-2xl p-4 no-underline group"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f1f3f9',
                  backdropFilter: 'blur(6px)',
                  transform: `perspective(1200px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
                  transition: 'transform 0.15s ease-out, border-color 0.2s ease, background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(37,211,102,0.45)';
                  e.currentTarget.style.background = 'rgba(37,211,102,0.08)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
              >
                <span
                  className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg,#25D366,#128C7E)',
                    boxShadow: '0 8px 20px -8px rgba(37,211,102,0.8)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#04060c" aria-hidden="true">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.02c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.03.24-3.47-.72-2.95-1.16-4.79-4.25-4.94-4.45-.14-.2-1.16-1.55-1.16-2.95s.73-2.08 1-2.37c.26-.29.58-.36.77-.36l.55.01c.18.01.42-.07.65.5.24.58.8 1.98.87 2.12.07.15.12.32.02.51-.1.19-.15.31-.29.48l-.44.51c-.14.15-.29.31-.13.6.17.29.74 1.22 1.58 1.97 1.09.97 2 1.28 2.29 1.42.29.15.46.12.63-.07l.9-1.05c.19-.24.39-.17.65-.07l1.84.87c.27.12.44.19.51.29.07.1.07.62-.17 1.3Z" />
                  </svg>
                </span>
                <span className="block">
                  <span className="flex items-center gap-1.5 font-bold text-[0.85rem] mb-0.5" style={{ color: '#f1f3f9' }}>
                    Hubungi Admin
                    <ArrowRight size={13} strokeWidth={2.6} color="#25D366" />
                  </span>
                  <span className="block text-[0.72rem] leading-[1.5]" style={{ color: '#a2acc4' }}>
                    Tidak bisa login? Chat admin lewat WhatsApp — pesannya sudah siap kirim.
                  </span>
                </span>
              </a>
            </div>
          </div>
          <p className="text-[0.75rem] relative z-[1] mt-6" style={{ color: '#7c87a6' }}>
            © {new Date().getFullYear()} EduPKL — Capstone Project
          </p>
        </div>

        {/* Panel form */}
        <div className="p-9 min-[760px]:p-10" style={{ background: 'var(--lp-panel-bg)', transition: 'background 0.4s ease' }}>
          <div className="min-[760px]:hidden flex items-center gap-2.5 mb-[22px]">
            <img src="/logo-rajasa-192.png" alt="Logo SMKS Rajasa Surabaya" className="w-8 h-8" />
            <span className="font-[Sora,sans-serif] font-bold text-[1.05rem]" style={{ color: 'var(--lp-text-primary)' }}>
              EduPKL
            </span>
          </div>

          <h2 className="font-[Sora,sans-serif] text-[1.3rem] font-bold mb-1" style={{ color: 'var(--lp-text-primary)' }}>
            Masuk ke akun kamu
          </h2>
          <p className="text-[0.85rem] mb-[26px]" style={{ color: 'var(--lp-text-muted)' }}>
            Masukkan username dan password akunmu.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.82rem] font-semibold mb-[7px]" style={{ color: 'var(--lp-text-secondary)' }}>
                Username
              </label>
              <div className="relative flex items-center">
                <User size={16} className="absolute left-[13px] pointer-events-none" style={{ color: 'var(--lp-text-muted)' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="contoh: admin"
                  autoComplete="username"
                  className="w-full box-border rounded-[11px] text-[0.9rem] outline-none focus:border-[#5B8DEF]"
                  style={{
                    padding: '11px 14px 11px 38px',
                    border: '1px solid var(--lp-input-border)',
                    background: 'var(--lp-input-bg)',
                    color: 'var(--lp-text-primary)',
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-[0.82rem] font-semibold mb-[7px]" style={{ color: 'var(--lp-text-secondary)' }}>
                Password
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-[13px] pointer-events-none" style={{ color: 'var(--lp-text-muted)' }} />
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full box-border rounded-[11px] text-[0.9rem] outline-none focus:border-[#5B8DEF]"
                  style={{
                    padding: '11px 40px 11px 38px',
                    border: '1px solid var(--lp-input-border)',
                    background: 'var(--lp-input-bg)',
                    color: 'var(--lp-text-primary)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((v) => !v)}
                  aria-label="Lihat password"
                  className="absolute right-[11px] bg-transparent border-0 p-0.5 cursor-pointer flex"
                  style={{ color: 'var(--lp-text-muted)' }}
                >
                  {passwordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[0.82rem] m-0 flex items-center gap-1.5" style={{ color: '#f87171' }}>
                <AlertCircle size={14} />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-[11px] text-[0.92rem] font-bold text-[#04060c] disabled:opacity-70 hover:-translate-y-px transition-transform"
              style={{
                padding: '12px',
                backgroundImage: 'var(--lp-accent-gradient)',
                boxShadow: '0 12px 26px -8px rgba(91,141,239,0.5)',
              }}
            >
              {submitting ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-[26px] pt-5 border-t" style={{ borderColor: 'var(--lp-card-border)' }}>
            <p className="text-[0.72rem] font-bold tracking-[0.05em] mb-2.5" style={{ color: 'var(--lp-text-muted)' }}>
              DEMO AKUN — KHUSUS REVIEW
            </p>
            <div className="flex gap-2 flex-wrap">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => fillDemo(account)}
                  className="text-[0.76rem] font-semibold px-3 py-1.5 rounded-full border cursor-pointer"
                  style={{ borderColor: 'var(--lp-chip-border)', background: 'var(--lp-chip-bg)', color: 'var(--lp-text-secondary)' }}
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
