import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

const Login = () => {
  const { user, loading, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Panel kiri: branding */}
        <div className="hidden md:flex flex-col justify-between bg-slate-900 text-white p-10">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <img src="/logo-rajasa-192.png" alt="Logo SMKS Rajasa Surabaya" className="w-10 h-10 rounded-lg bg-white p-1" />
              <span className="font-bold text-xl tracking-wide">EduPKL</span>
            </div>
            <h1 className="text-2xl font-bold leading-snug mb-3">
              Talent Matching berbasis User Profiling untuk PKL siswa SMK.
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Profil & kompetensi siswa dicocokkan otomatis dengan kebutuhan
              perusahaan — menghasilkan Match Score dan rekomendasi penempatan
              PKL yang paling sesuai.
            </p>
          </div>
          <p className="text-slate-500 text-xs">© {new Date().getFullYear()} EduPKL — Capstone Project</p>
        </div>

        {/* Panel kanan: form login */}
        <div className="p-8 sm:p-10">
          <div className="md:hidden flex items-center gap-2 mb-6">
            <img src="/logo-rajasa-192.png" alt="Logo SMKS Rajasa Surabaya" className="w-9 h-9 rounded-lg" />
            <span className="font-bold text-lg text-gray-800 dark:text-slate-100">EduPKL</span>
          </div>

          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-1">Masuk ke akun kamu</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Masukkan username dan password akunmu.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="contoh: admin"
                autoComplete="username"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              <LogIn size={16} />
              {submitting ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
