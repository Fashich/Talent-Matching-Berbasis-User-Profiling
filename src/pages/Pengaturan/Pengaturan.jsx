import React, { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { useData } from '../../context/DataContext';

const Pengaturan = () => {
  const { settings, updateSettings, resetToSeed } = useData();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    resetToSeed();
    setConfirmReset(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 text-gray-900 dark:text-slate-100">
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">Pengaturan</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Informasi sekolah & periode PKL yang dipakai di seluruh sistem (termasuk sertifikat).</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nama Sekolah</label>
          <input value={form.namaSekolah} onChange={set('namaSekolah')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">NPSN</label>
            <input value={form.npsn} onChange={set('npsn')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tahun Ajaran</label>
            <input value={form.tahunAjaran} onChange={set('tahunAjaran')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Alamat Sekolah</label>
          <input value={form.alamatSekolah} onChange={set('alamatSekolah')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Kepala Sekolah</label>
          <input value={form.kepalaSekolah} onChange={set('kepalaSekolah')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Periode PKL Mulai</label>
            <input type="date" value={form.periodePklMulai} onChange={set('periodePklMulai')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Periode PKL Selesai</label>
            <input type="date" value={form.periodePklSelesai} onChange={set('periodePklSelesai')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            <Save size={16} />
            Simpan Pengaturan
          </button>
          {saved && <span className="text-sm text-green-600 dark:text-green-400 font-medium">Tersimpan.</span>}
        </div>
      </form>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Reset Pengaturan</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-3">
          Mengembalikan info sekolah & periode PKL di atas ke nilai default. Ini TIDAK menghapus data siswa/perusahaan/penempatan/dst. — data operasional itu sekarang tersimpan di database (bukan lagi contoh/demo), jadi tidak ikut ter-reset.
        </p>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition">
            <RotateCcw size={16} />
            Reset ke Data Awal
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-slate-400">Yakin? Data yang sudah diubah akan hilang.</span>
            <button onClick={handleReset} className="text-sm font-medium text-white bg-red-600 px-3 py-1.5 rounded-lg hover:bg-red-700 transition">Ya, Reset</button>
            <button onClick={() => setConfirmReset(false)} className="text-sm font-medium text-gray-600 dark:text-slate-400 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition">Batal</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pengaturan;
