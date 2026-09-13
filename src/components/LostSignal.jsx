import React from 'react';
import { WifiOff, RotateCw } from 'lucide-react';
import { useConnection } from '../context/ConnectionContext';

// Overlay full-screen "No Connection / Lost Signal" (task #18) — muncul di
// ATAS seluruh aplikasi (di luar <Routes>, lihat App.jsx) begitu apiFetch()
// mendeteksi backend tak terjangkau, di halaman manapun user sedang berada.

const LostSignal = () => {
  const { online, checking, retry } = useConnection();

  if (online) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-6">
          <WifiOff size={30} />
        </div>
        <h1 className="text-xl font-bold mb-2">Koneksi ke Server Terputus</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Sepertinya backend EduPKL tidak bisa dijangkau — periksa koneksi internetmu, atau
          pastikan server backend sedang menyala, lalu coba lagi.
        </p>
        <button
          onClick={retry}
          disabled={checking}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
        >
          <RotateCw size={16} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Menghubungkan...' : 'Coba Lagi'}
        </button>
      </div>
    </div>
  );
};

export default LostSignal;
