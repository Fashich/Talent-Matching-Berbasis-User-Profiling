import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  const { online } = useConnection();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    try {
      const me = await apiFetch('/api/auth/me');
      setUser(toFrontendUser(me));
    } catch (err) {
      // Kalau gagalnya karena server tidak terjangkau (status 0 = network
      // error dari apiFetch), JANGAN hapus token/sesi — RootGate yang akan
      // menampilkan layar Lost Signal, dan efek di bawah otomatis nyoba
      // muat ulang profil begitu koneksi pulih. Token hanya dihapus kalau
      // server benar-benar bilang tokennya invalid/expired.
      if (!(err instanceof ApiError) || err.status !== 0) {
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Begitu koneksi balik dan ada token tersimpan tapi profil belum berhasil
  // dimuat (gagal sebelumnya karena network), coba muat ulang — ini yang
  // bikin sesi login "otomatis pulih" tanpa perlu login ulang.
  useEffect(() => {
    if (online && getToken() && !user) {
      fetchMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
