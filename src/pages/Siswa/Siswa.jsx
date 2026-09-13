import React, { useMemo, useState } from 'react';
import { Search, Plus, Edit, Trash2, Users as UsersIcon } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { daftarJurusan } from '../../data/seed';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const emptyForm = { nisn: '', nama: '', jenisKelamin: 'L', kelas: '', jurusan: daftarJurusan[0], alamat: '', hp: '', email: '', status: 'Belum PKL' };

const Siswa = () => {
  const { siswa, addItem, updateItem, removeItem } = useData();
  const { user } = useAuth();
  const canManage = user.role === 'Administrator' || user.role === 'Petugas';
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return siswa.filter(
      (s) => s.nama.toLowerCase().includes(q) || s.nisn.includes(q) || s.kelas.toLowerCase().includes(q) || s.hp.includes(q)
    );
  }, [siswa, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({ nisn: s.nisn, nama: s.nama, jenisKelamin: s.jenisKelamin, kelas: s.kelas, jurusan: s.jurusan || daftarJurusan[0], alamat: s.alamat, hp: s.hp, email: s.email, status: s.status });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateItem('siswa', editingId, form);
    } else {
      addItem('siswa', form);
    }
    setModalOpen(false);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Data Siswa</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola data siswa yang mengikuti Praktik Kerja Lapangan (PKL).</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Actions */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {canManage ? (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition w-fit"
            >
              <Plus size={16} />
              Tambah Siswa
            </button>
          ) : <div />}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari NISN/Nama/Kelas/HP"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState icon={<UsersIcon size={28} />} title="Belum ada data siswa" description="Tambahkan siswa untuk mulai mengelola PKL." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="py-3 px-6">NO.</th>
                  <th className="py-3 px-6">NISN</th>
                  <th className="py-3 px-6">NAMA</th>
                  <th className="py-3 px-6">JK</th>
                  <th className="py-3 px-6">KELAS</th>
                  <th className="py-3 px-6">JURUSAN</th>
                  <th className="py-3 px-6">HP</th>
                  <th className="py-3 px-6">STATUS PKL</th>
                  {canManage && <th className="py-3 px-6 text-center">AKSI</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.map((s, index) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-6 text-gray-500">{(page - 1) * pageSize + index + 1}</td>
                    <td className="py-3 px-6 text-gray-900 font-medium">{s.nisn}</td>
                    <td className="py-3 px-6 text-gray-800">{s.nama}</td>
                    <td className="py-3 px-6 text-gray-500">{s.jenisKelamin}</td>
                    <td className="py-3 px-6 text-gray-500">{s.kelas}</td>
                    <td className="py-3 px-6 text-gray-500">{s.jurusan}</td>
                    <td className="py-3 px-6 text-gray-500">{s.hp}</td>
                    <td className="py-3 px-6"><Badge status={s.status} /></td>
                    {canManage && (
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(s)}
                            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 transition"
                          >
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded border text-sm transition ${
                  p === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Data Siswa' : 'Tambah Siswa'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NISN</label>
              <input required value={form.nisn} onChange={set('nisn')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select value={form.jenisKelamin} onChange={set('jenisKelamin')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input required value={form.nama} onChange={set('nama')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
              <input required placeholder="mis. XI TKJ 1" value={form.kelas} onChange={set('kelas')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan</label>
              <select value={form.jurusan} onChange={set('jurusan')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {daftarJurusan.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
            <input required value={form.hp} onChange={set('hp')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <input value={form.alamat} onChange={set('alamat')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status PKL</label>
              <select value={form.status} onChange={set('status')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Belum PKL">Belum PKL</option>
                <option value="Berlangsung">Berlangsung</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
              {editingId ? 'Simpan Perubahan' : 'Tambah Siswa'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeItem('siswa', deleteTarget.id)}
        title="Hapus Data Siswa"
        message={`Yakin ingin menghapus data "${deleteTarget?.nama}"? Tindakan ini tidak bisa dibatalkan.`}
      />
    </div>
  );
};

export default Siswa;
