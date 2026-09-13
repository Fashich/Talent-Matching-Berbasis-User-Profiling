import React, { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Target, Award } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';

// Competency Profiling — siswa membangun profil kompetensinya sendiri sesuai
// Dokumen Analisis Sistem (FR-04) sebagai salah satu input utama Matching Engine.

const emptyForm = { nama: '', kategori: 'Teknis', tingkat: 'Pemula', pengalamanTerkait: '', sertifikasi: '' };

const Kompetensi = () => {
  const { kompetensi, addItem, updateItem, removeItem } = useData();
  const { user } = useAuth();

  const milikSaya = useMemo(() => kompetensi.filter((k) => k.siswaId === user.linkedId), [kompetensi, user.linkedId]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (k) => {
    setEditingId(k.id);
    setForm({ nama: k.nama, kategori: k.kategori, tingkat: k.tingkat, pengalamanTerkait: k.pengalamanTerkait, sertifikasi: k.sertifikasi });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) updateItem('kompetensi', editingId, form);
    else addItem('kompetensi', { ...form, siswaId: user.linkedId });
    setModalOpen(false);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Kompetensi Saya</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Isi kompetensi & keahlian yang kamu miliki — jadi salah satu dasar utama perhitungan Match Score (bobot 40%).
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition w-fit">
          <Plus size={16} />
          Tambah Kompetensi
        </button>
      </div>

      {milikSaya.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <EmptyState icon={<Target size={28} />} title="Belum ada kompetensi" description="Tambahkan kompetensi supaya sistem bisa menghitung rekomendasi perusahaan untukmu." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {milikSaya.map((k) => (
            <div key={k.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{k.nama}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{k.kategori}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                  {k.tingkat}
                </span>
              </div>
              {k.pengalamanTerkait && <p className="text-sm text-gray-600 mt-3">{k.pengalamanTerkait}</p>}
              {k.sertifikasi && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                  <Award size={13} className="text-amber-500" />
                  {k.sertifikasi}
                </p>
              )}
              <div className="mt-4 flex items-center gap-2">
                <button onClick={() => openEdit(k)} className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition">
                  <Edit size={12} />
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(k)} className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition">
                  <Trash2 size={12} />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Kompetensi' : 'Tambah Kompetensi'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kompetensi</label>
            <input required placeholder="mis. Konfigurasi Jaringan, Pemrograman Web" value={form.nama} onChange={set('nama')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select value={form.kategori} onChange={set('kategori')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Teknis">Teknis</option>
                <option value="Non-Teknis">Non-Teknis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Kemampuan</label>
              <select value={form.tingkat} onChange={set('tingkat')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Pemula">Pemula</option>
                <option value="Menengah">Menengah</option>
                <option value="Mahir">Mahir</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pengalaman Terkait (opsional)</label>
            <textarea rows={2} value={form.pengalamanTerkait} onChange={set('pengalamanTerkait')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sertifikasi (opsional)</label>
            <input value={form.sertifikasi} onChange={set('sertifikasi')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
              {editingId ? 'Simpan Perubahan' : 'Tambah'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeItem('kompetensi', deleteTarget.id)}
        title="Hapus Kompetensi"
        message={`Yakin ingin menghapus kompetensi "${deleteTarget?.nama}"?`}
      />
    </div>
  );
};

export default Kompetensi;
