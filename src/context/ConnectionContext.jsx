import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { setConnectionHandlers, pingBackend } from '../config/api';

// Melacak status koneksi ke backend secara global — dipakai buat nampilin
// state "No Connection / Lost Signal" (task #18) di atas seluruh aplikasi,
// bukan cuma satu halaman. Setiap panggilan apiFetch() yang gagal karena
// jaringan (server tak terjangkau, BUKAN error 401/422/dst.) otomatis
// menandai offline lewat pub-sub di src/config/api.js.

const ConnectionContext = createContext(null);

export function ConnectionProvider({ children }) {
  const [online, setOnline] = useState(true);
  const [checking, setChecking] = useState(false);

  const markOffline = useCallback(() => setOnline(false), []);
  const markOnline = useCallback(() => setOnline(true), []);

  useEffect(() => {
    setConnectionHandlers({ onOffline: markOffline, onOnline: markOnline });
  }, [markOffline, markOnline]);

  const retry = useCallback(async () => {
    setChecking(true);
    const ok = await pingBackend();
    setChecking(false);
    if (ok) setOnline(true);
    return ok;
  }, []);

  return (
    <ConnectionContext.Provider value={{ online, checking, retry }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useConnection harus dipakai di dalam <ConnectionProvider>');
  return ctx;
}
