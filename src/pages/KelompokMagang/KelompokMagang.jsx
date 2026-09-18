import React, { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, UsersRound, Building2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { scopedKelompokMagang, findById } from '../../utils/scope';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

// Kelompok Magang — pengelompokan siswa yang ditempatkan bersama di satu
// perusahaan di bawah bimbingan satu Guru (5.10 Dokumen Perancangan Sistem).

const emptyForm = { nama: '', perusahaanId: '', pembimbingGuru: '', anggotaSiswaIds: [], periodeMulai: '', periodeSelesai: '', status: 'Aktif' };

const KelompokMagang = () => {
  const { siswa, perusahaan, kelompokMagang, users, addItem, updateItem, removeItem } = useData();
  const { user } = useAuth();
  const canManage = user.role === 'Administrator' || user.role === 'Petugas';

  const list = useMemo(() => scopedKelompokMagang(user, kelompokMagang), [user, kelompokMagang]);
  // FIX bug "tidak bisa memilih guru pembimbing" (17 Sept 2026): sebelumnya
  // datalist ini sumbernya dari nama guru yang PERNAH diketik di kelompok
  // magang lain (bukan dari akun Guru asli) — jadi kosong kalau belum pernah
  // ada kelompok magang sebelumnya, dan akun Guru baru tidak pernah muncul.
  // Sekarang sumbernya akun User asli ber-role Guru (DataContext.users, dari
  // /api/users?role=Guru), konsisten dengan resolveGuruId() di DataContext
  // yang memang mengharuskan pembimbingGuru cocok dengan akun Guru terdaftar.
  const guruList = useMemo(() => users.filter((u) => u.role === 'Guru'), [users]);

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
    setForm({ nama: k.nama, perusahaanId: k.perusahaanId, pembimbingGuru: k.pembimbingGuru, anggotaSiswaIds: k.anggotaSiswaIds || [], periodeMulai: k.periodeMulai, periodeSelesai: k.periodeSelesai, status: k.status });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) updateItem('kelompokMagang', editingId, form);
    else addItem('kelompokMagang', form);
    setModalOpen(false);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleAnggota = (siswaId) => {
    setForm((f) => ({
      ...f,
      anggotaSiswaIds: f.anggotaSiswaIds.includes(siswaId)
        ? f.anggotaSiswaIds.filter((id) => id !== siswaId)
        : [...f.anggotaSiswaIds, siswaId],
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 text-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Kelompok Magang</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pengelompokan siswa yang PKL bersama di satu perusahaan, di bawah satu guru pembimbing.</p>
        </div>
        {canManage && (
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition w-fit">
            <Plus size={16} />
            Tambah Kelompok
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <EmptyState icon={<UsersRound size={28} />} title="Belum ada kelompok magang" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {list.map((k) => {
            const c = findById(perusahaan, k.perusahaanId);
            const anggota = (k.anggotaSiswaIds || []).map((id) => findById(siswa, id)).filter(Boolean);
            return (
              <div key={k.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{k.nama}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Building2 size={12} />
                      {c?.nama || '—'}
                    </p>
                  </div>
                  <Badge status={k.status} />
                </div>
                <p className="text-xs text-gray-500 mt-3">Pembimbing: <span className="text-gray-700 font-medium">{k.pembimbingGuru}</span></p>
                <p className="text-xs text-gray-500">Periode: {k.periodeMulai} s/d {k.periodeSelesai}</p>

                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Anggota ({anggota.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {anggota.map((s) => (
                      <span key={s.id} className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs text-gray-600">
                        {s.nama}
                      </span>
                    ))}
                    {anggota.length === 0 && <span className="text-xs text-gray-400">Belum ada anggota.</span>}
                  </div>
                </div>

                {canManage && (
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
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Kelompok Magang' : 'Tambah Kelompok Magang'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelompok</label>
            <input required value={form.nama} onChange={set('nama')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perusahaan</label>
              <select required value={form.perusahaanId} onChange={set('perusahaanId')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih perusahaan</option>
                {perusahaan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pembimbing Guru</label>
              <select required value={form.pembimbingGuru} onChange={set('pembimbingGuru')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih guru pembimbing</option>
                {guruList.map((g) => <option key={g.id} value={g.nama}>{g.nama}</option>)}
              </select>
              {guruList.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Belum ada akun Guru terdaftar. Tambahkan dulu di menu User (peran Guru).</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periode Mulai</label>
              <input required type="date" value={form.periodeMulai} onChange={set('periodeMulai')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periode Selesai</label>
              <input required type="date" value={form.periodeSelesai} onChange={set('periodeSelesai')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={set('status')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Aktif">Aktif</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Anggota Siswa</label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {siswa.map((s) => (
                <label key={s.id} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={form.anggotaSiswaIds.includes(s.id)} onChange={() => toggleAnggota(s.id)} className="accent-blue-600" />
                  <span className="text-gray-700">{s.nama}</span>
                  <span className="text-xs text-gray-400">{s.kelas}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
              {editingId ? 'Simpan Perubahan' : 'Tambah Kelompok'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeItem('kelompokMagang', deleteTarget.id)}
        title="Hapus Kelompok Magang"
        message={`Yakin ingin menghapus "${deleteTarget?.nama}"?`}
      />
    </div>
  );
};

export default KelompokMagang;
