import React, { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { scopedPenempatan, findById } from '../../utils/scope';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const emptyForm = { siswaId: '', perusahaanId: '', kelompokMagangId: '', guruPembimbing: '', tanggalMulai: '', tanggalSelesai: '', status: 'Diajukan' };
const STATUS_OPTIONS = ['Diajukan', 'Diterima', 'Berlangsung', 'Selesai', 'Ditolak'];

const Penempatan = () => {
  const { siswa, perusahaan, kelompokMagang, penempatan, addItem, updateItem, removeItem } = useData();
  const { user } = useAuth();
  const canManage = user?.role === 'Administrator' || user?.role === 'Petugas';
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Semua');

  const list = useMemo(() => {
    const scoped = scopedPenempatan(user, penempatan);
    return statusFilter === 'Semua' ? scoped : scoped.filter((p) => p.status === statusFilter);
  }, [penempatan, user, statusFilter]);

  const guruList = useMemo(
    () => Array.from(new Set(penempatan.map((p) => p.guruPembimbing))).filter(Boolean),
    [penempatan]
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({ siswaId: p.siswaId, perusahaanId: p.perusahaanId, kelompokMagangId: p.kelompokMagangId || '', guruPembimbing: p.guruPembimbing, tanggalMulai: p.tanggalMulai, tanggalSelesai: p.tanggalSelesai, status: p.status });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, kelompokMagangId: form.kelompokMagangId || null };
    if (editingId) updateItem('penempatan', editingId, payload);
    else addItem('penempatan', payload);
    setModalOpen(false);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Penempatan & Penerimaan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pencocokan siswa dengan perusahaan beserta status penempatan dan penerimaannya.</p>
        </div>
        <div className="flex items-center gap-3">
          {canManage && (
            <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              <Plus size={16} />
              Tambah Penempatan
            </button>
          )}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="Semua">Semua Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {list.length === 0 ? (
          <EmptyState icon={<Briefcase size={28} />} title="Belum ada penempatan" description="Tambahkan penempatan untuk mencocokkan siswa dengan perusahaan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="py-3 px-6">SISWA</th>
                  <th className="py-3 px-6">PERUSAHAAN</th>
                  <th className="py-3 px-6">GURU PEMBIMBING</th>
                  <th className="py-3 px-6">PERIODE</th>
                  <th className="py-3 px-6">STATUS</th>
                  {canManage && <th className="py-3 px-6 text-center">AKSI</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((p) => {
                  const s = findById(siswa, p.siswaId);
                  const c = findById(perusahaan, p.perusahaanId);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3 px-6">
                        <p className="text-gray-800 font-medium">{s?.nama || '—'}</p>
                        <p className="text-xs text-gray-400">{s?.kelas}</p>
                      </td>
                      <td className="py-3 px-6 text-gray-600">{c?.nama || '—'}</td>
                      <td className="py-3 px-6 text-gray-600">{p.guruPembimbing}</td>
                      <td className="py-3 px-6 text-gray-500 whitespace-nowrap">{p.tanggalMulai} s/d {p.tanggalSelesai}</td>
                      <td className="py-3 px-6"><Badge status={p.status} /></td>
                      {canManage && (
                        <td className="py-3 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEdit(p)} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition">
                              <Edit size={14} />
                              Edit
                            </button>
                            <button onClick={() => setDeleteTarget(p)} className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 transition">
                              <Trash2 size={14} />
                              Hapus
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Penempatan' : 'Tambah Penempatan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Siswa</label>
            <select required value={form.siswaId} onChange={set('siswaId')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Pilih siswa</option>
              {siswa.map((s) => <option key={s.id} value={s.id}>{s.nama} — {s.kelas}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perusahaan</label>
            <select required value={form.perusahaanId} onChange={set('perusahaanId')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Pilih perusahaan</option>
              {perusahaan.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kelompok Magang (opsional)</label>
            <select value={form.kelompokMagangId} onChange={set('kelompokMagangId')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tidak terkait kelompok</option>
              {kelompokMagang.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guru Pembimbing</label>
            <input required list="guru-pembimbing-list" value={form.guruPembimbing} onChange={set('guruPembimbing')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <datalist id="guru-pembimbing-list">
              {guruList.map((n) => <option key={n} value={n} />)}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input required type="date" value={form.tanggalMulai} onChange={set('tanggalMulai')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
              <input required type="date" value={form.tanggalSelesai} onChange={set('tanggalSelesai')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={set('status')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
              {editingId ? 'Simpan Perubahan' : 'Tambah Penempatan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeItem('penempatan', deleteTarget.id)}
        title="Hapus Penempatan"
        message="Yakin ingin menghapus data penempatan ini?"
      />
    </div>
  );
};

export default Penempatan;
