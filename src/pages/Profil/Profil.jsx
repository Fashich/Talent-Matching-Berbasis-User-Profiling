import React, { useState } from 'react';
import { Plus, Trash2, Save, UserRound } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { findById } from '../../utils/scope';

// User Profiling — siswa melengkapi profil terstruktur (pendidikan, pengalaman,
// minat, preferensi, portofolio) sesuai Dokumen Analisis Sistem (FR-03) dan
// Dokumen Perancangan Sistem (2.4). Profil ini menjadi input Matching Engine.

const Profil = () => {
  const { siswa, updateItem } = useData();
  const { user } = useAuth();
  const data = findById(siswa, user.linkedId);

  const [form, setForm] = useState({
    pendidikan: data?.pendidikan || '',
    preferensi: data?.preferensi || '',
    portofolio: data?.portofolio || '',
    pengalaman: data?.pengalaman?.length ? data.pengalaman : [],
    minat: data?.minat?.length ? data.minat : [],
  });
  const [minatBaru, setMinatBaru] = useState('');
  const [saved, setSaved] = useState(false);

  if (!data) {
    return <div className="max-w-3xl mx-auto text-sm text-gray-500 dark:text-slate-400">Data siswa tidak ditemukan.</div>;
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addPengalaman = () => setForm((f) => ({ ...f, pengalaman: [...f.pengalaman, { judul: '', deskripsi: '' }] }));
  const updatePengalaman = (idx, key, value) =>
    setForm((f) => ({ ...f, pengalaman: f.pengalaman.map((p, i) => (i === idx ? { ...p, [key]: value } : p)) }));
  const removePengalaman = (idx) => setForm((f) => ({ ...f, pengalaman: f.pengalaman.filter((_, i) => i !== idx) }));

  const addMinat = () => {
    const v = minatBaru.trim();
    if (!v) return;
    setForm((f) => ({ ...f, minat: [...f.minat, v] }));
    setMinatBaru('');
  };
  const removeMinat = (idx) => setForm((f) => ({ ...f, minat: f.minat.filter((_, i) => i !== idx) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    updateItem('siswa', data.id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 text-gray-900 dark:text-slate-100">
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">Profil Saya</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Lengkapi profil ini supaya rekomendasi perusahaan lebih akurat.</p>
      </div>

      {/* Data dasar — dikelola Administrator/Petugas, ditampilkan read-only */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 flex items-center justify-center">
            <UserRound size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-slate-100">{data.nama}</h3>
            <p className="text-xs text-gray-400 dark:text-slate-500">NISN {data.nisn} · {data.kelas} · Jurusan {data.jurusan}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500">
          Data dasar (nama, kelas, jurusan, kontak) dikelola oleh Administrator/Petugas. Hubungi mereka bila ada perubahan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Pendidikan</label>
            <input value={form.pendidikan} onChange={set('pendidikan')} placeholder="mis. SMK Kelas XI — Rekayasa Perangkat Lunak" className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Preferensi (lokasi, jenis pekerjaan, dsb.)</label>
            <input value={form.preferensi} onChange={set('preferensi')} placeholder="mis. Lokasi Surabaya, jenis pekerjaan Web Developer" className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Portofolio (opsional, tautan)</label>
            <input value={form.portofolio} onChange={set('portofolio')} placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Minat</label>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.minat.map((m, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20 px-3 py-1 rounded-full text-xs font-medium">
                {m}
                <button type="button" onClick={() => removeMinat(i)} className="text-blue-400 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-300">
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
            {form.minat.length === 0 && <p className="text-xs text-gray-400 dark:text-slate-500">Belum ada minat ditambahkan.</p>}
          </div>
          <div className="flex gap-2">
            <input
              value={minatBaru}
              onChange={(e) => setMinatBaru(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMinat(); } }}
              placeholder="mis. Pemrograman Web"
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" onClick={addMinat} className="px-3 py-2 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition">
              Tambah
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Pengalaman</label>
            <button type="button" onClick={addPengalaman} className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-500/20 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition">
              <Plus size={12} />
              Tambah Pengalaman
            </button>
          </div>
          {form.pengalaman.length === 0 && <p className="text-xs text-gray-400 dark:text-slate-500">Belum ada pengalaman ditambahkan.</p>}
          <div className="space-y-3">
            {form.pengalaman.map((p, i) => (
              <div key={i} className="border border-gray-100 dark:border-slate-800 rounded-lg p-3 relative">
                <button type="button" onClick={() => removePengalaman(i)} className="absolute top-2 right-2 text-gray-300 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-400">
                  <Trash2 size={14} />
                </button>
                <input
                  value={p.judul}
                  onChange={(e) => updatePengalaman(i, 'judul', e.target.value)}
                  placeholder="Judul pengalaman"
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm font-medium mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={p.deskripsi}
                  onChange={(e) => updatePengalaman(i, 'deskripsi', e.target.value)}
                  placeholder="Deskripsi singkat"
                  rows={2}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            <Save size={16} />
            Simpan Profil
          </button>
          {saved && <span className="text-sm text-green-600 dark:text-green-400 font-medium">Tersimpan.</span>}
        </div>
      </form>
    </div>
  );
};

export default Profil;
