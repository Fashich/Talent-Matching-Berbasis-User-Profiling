import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, ApiError, getToken, setToken } from '../config/api';
import { useConnection } from './ConnectionContext';

// v3: login sungguhan ke backend PHP (username + password), bukan lagi mock
// username-only. Token disimpan di localStorage (lihat src/config/api.js),
// data user di-refresh dari /api/auth/me tiap kali aplikasi dibuka supaya
// selalu sinkron kalau statusnya berubah di server (mis. di-nonaktifkan).

function toFrontendUser(apiUser) {
  if (!apiUser) return null;
  return {
    id: apiUser.id,
    nama: apiUser.nama,
    username: apiUser.username,
    email: apiUser.email,
    role: apiUser.role,
    status: apiUser.status,
    linkedId: apiUser.linked_id ?? null,
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { online } = useConnection();

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    // Belum ada koneksi ke backend — LostSignal overlay yang nangani UI-nya
    // (lihat App.jsx). Sengaja TIDAK menganggap ini "token invalid" (jangan
    // sampai user ke-logout paksa cuma gara-gara jaringan sempat putus) —
    // efek ini otomatis dicoba ulang begitu `online` balik jadi true.
    if (!online) return;

    let cancelled = false;
    (async () => {
      try {
        const me = await apiFetch('/api/auth/me');
        if (cancelled) return;
        setUser(toFrontendUser(me));
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 0) {
          return; // masalah koneksi, bukan token invalid — biarkan loading=true
        }
        setToken(null);
        setUser(null);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [online]);

  const login = async (username, password) => {
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { username, password },
        skipAuth: true,
      });
      setToken(data.token);
      setUser(toFrontendUser(data.user));
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err instanceof ApiError ? err.message : 'Login gagal, coba lagi.' };
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Token mungkin sudah invalid di server — tetap lanjutkan logout di sisi client.
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return ctx;
}
