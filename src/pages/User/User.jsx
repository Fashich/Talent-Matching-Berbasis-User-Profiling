import React, { useState } from 'react';
import { Plus, Edit, Trash2, UserCog, KeyRound } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const ROLES = ['Administrator', 'Petugas', 'Guru', 'Siswa'];
const emptyForm = { nama: '', username: '', email: '', role: 'Siswa', status: 'Aktif', password: '' };

const User = () => {
  const { users, siswa, addItem, updateItem, removeItem, resetUserPassword } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditingId(u.id);
    setForm({ nama: u.nama, username: u.username, email: u.email, role: u.role, status: u.status, password: '' });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) updateItem('users', editingId, form);
    else addItem('users', form);
    setModalOpen(false);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const linkedLabel = (u) => {
    if (u.role === 'Siswa' && u.linkedId) return siswa.find((s) => s.id === u.linkedId)?.nama;
    return '—';
  };

  const openReset = (u) => {
    setResetTarget(u);
    setNewPassword('');
  };

  const submitReset = (e) => {
    e.preventDefault();
    if (!resetTarget) return;
    resetUserPassword(resetTarget.id, newPassword).then(() => setResetTarget(null));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 text-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">User</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola akun Administrator, Petugas, Guru, dan Siswa.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition w-fit">
          <Plus size={16} />
          Tambah User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {users.length === 0 ? (
          <EmptyState icon={<UserCog size={28} />} title="Belum ada pengguna" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="py-3 px-6">NAMA</th>
                  <th className="py-3 px-6">USERNAME</th>
                  <th className="py-3 px-6">PERAN</th>
                  <th className="py-3 px-6">TERKAIT</th>
                  <th className="py-3 px-6">STATUS</th>
                  <th className="py-3 px-6 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-6 text-gray-800 font-medium">{u.nama}</td>
                    <td className="py-3 px-6 text-gray-500">{u.username}</td>
                    <td className="py-3 px-6 text-gray-600">{u.role}</td>
                    <td className="py-3 px-6 text-gray-500">{linkedLabel(u)}</td>
                    <td className="py-3 px-6"><Badge status={u.status} /></td>
                    <td className="py-3 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(u)} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition">
                          <Edit size={14} />
                          Edit
                        </button>
                        <button onClick={() => openReset(u)} className="flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-amber-600 transition">
                          <KeyRound size={14} />
                          Reset Password
                        </button>
                        <button onClick={() => setDeleteTarget(u)} className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 transition">
                          <Trash2 size={14} />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit User' : 'Tambah User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input required value={form.nama} onChange={set('nama')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input required value={form.username} onChange={set('username')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {!editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Awal</label>
              <input required type="password" minLength={6} value={form.password} onChange={set('password')} placeholder="Minimal 6 karakter" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peran</label>
              <select value={form.role} onChange={set('role')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={set('status')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
          {editingId && <p className="text-xs text-gray-400">Ganti password lewat tombol "Reset Password" di tabel, bukan form ini.</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
              {editingId ? 'Simpan Perubahan' : 'Tambah User'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title="Reset Password">
        {resetTarget && (
          <form onSubmit={submitReset} className="space-y-4">
            <p className="text-sm text-gray-600">
              Setel password baru untuk akun <span className="font-semibold text-gray-800">{resetTarget.nama}</span> ({resetTarget.username}).
              Semua sesi login akun ini akan otomatis logout.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <input required type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setResetTarget(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition">
                Batal
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 transition">
                Reset Password
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeItem('users', deleteTarget.id)}
        title="Hapus User"
        message={`Yakin ingin menghapus akun "${deleteTarget?.nama}"?`}
      />
    </div>
  );
};

export default User;
