import React, { useState } from 'react';
import { Plus, Edit, Trash2, UserCog, KeyRound } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const ROLES = ['Administrator', 'Petugas', 'Guru', 'Siswa'];
const emptyForm = { nama: '', username: '', email: '', role: 'Siswa', status: 'Aktif', password: '', studentId: '' };

const User = () => {
  const { users, siswa, addItem, updateItem, removeItem, resetUserPassword } = useData();
  const { t } = useLanguage();
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
    setForm({ nama: u.nama, username: u.username, email: u.email, role: u.role, status: u.status, password: '', studentId: u.linkedId || '' });
    setModalOpen(true);
  };

  // Bug 23 Sept 2026 (laporan Hadiid): akun Siswa yang dibuat lewat form ini
  // sebelumnya TIDAK PERNAH tertaut ke profil siswa manapun (field ini belum
  // ada) -> linked_id selalu null -> Profil/Kompetensi/Jurnal/Recommendation
  // kosong utk role Siswa manapun, walau data perusahaan/siswa lain sudah
  // ada. Opsi dropdown: siswa yang belum tertaut, DITAMBAH siswa yang saat
  // ini tertaut ke akun yang sedang diedit (biar tetap kepilih di form).
  const availableSiswaForLink = siswa.filter((s) => !s.userId || (editingId && s.userId === editingId));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) updateItem('users', editingId, form);
    else addItem('users', form);
    setModalOpen(false);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  // Fix bug 20 Sept 2026 (laporan Rizky via WA, ditemukan di form Perusahaan
  // tapi pola inputnya identik di sini): email instansi (@go.id, @sch.id)
  // sempat gagal krn keyboard mobile nyisipin spasi tak sengaja setelah
  // titik domain (mis. "go. id"). Strip whitespace dari input email.
  const setEmail = (e) => setForm((f) => ({ ...f, email: e.target.value.replace(/\s+/g, '') }));

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
    <div className="max-w-6xl mx-auto space-y-4 text-gray-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{t('user', 'pageTitle')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{t('user', 'pageDesc')}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition w-fit">
          <Plus size={16} />
          {t('user', 'btnTambah')}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        {users.length === 0 ? (
          <EmptyState icon={<UserCog size={28} />} title={t('user', 'emptyTitle')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 font-medium border-b border-gray-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-6">{t('user', 'colNama')}</th>
                  <th className="py-3 px-6">{t('user', 'colUsername')}</th>
                  <th className="py-3 px-6">{t('user', 'colPeran')}</th>
                  <th className="py-3 px-6">{t('user', 'colTerkait')}</th>
                  <th className="py-3 px-6">{t('common', 'colStatus')}</th>
                  <th className="py-3 px-6 text-center">{t('common', 'colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-6 text-gray-800 dark:text-slate-100 font-medium">{u.nama}</td>
                    <td className="py-3 px-6 text-gray-500 dark:text-slate-400">{u.username}</td>
                    <td className="py-3 px-6 text-gray-600 dark:text-slate-400">{u.role}</td>
                    <td className="py-3 px-6 text-gray-500 dark:text-slate-400">{linkedLabel(u)}</td>
                    <td className="py-3 px-6"><Badge status={u.status} /></td>
                    <td className="py-3 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(u)} className="flex items-center gap-1.5 whitespace-nowrap bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition">
                          <Edit size={14} />
                          {t('common', 'edit')}
                        </button>
                        <button onClick={() => openReset(u)} title={t('user', 'tooltipReset')} className="flex items-center gap-1.5 whitespace-nowrap bg-amber-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-amber-600 transition">
                          <KeyRound size={14} />
                          {t('user', 'btnReset')}
                        </button>
                        <button onClick={() => setDeleteTarget(u)} className="flex items-center gap-1.5 whitespace-nowrap bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 transition">
                          <Trash2 size={14} />
                          {t('common', 'delete')}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? t('user', 'modalTitleEdit') : t('user', 'modalTitleAdd')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('user', 'labelNamaLengkap')}</label>
            <input required value={form.nama} onChange={set('nama')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('user', 'labelUsername')}</label>
              <input required value={form.username} onChange={set('username')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('user', 'labelEmail')}</label>
              <input type="email" value={form.email} onChange={setEmail} autoCapitalize="none" autoCorrect="off" spellCheck="false" className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {!editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('user', 'labelPasswordAwal')}</label>
              <input required type="password" minLength={6} value={form.password} onChange={set('password')} placeholder={t('user', 'placeholderPassword')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('user', 'labelPeran')}</label>
              <select value={form.role} onChange={set('role')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('user', 'labelStatus')}</label>
              <select value={form.status} onChange={set('status')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Aktif">{t('user', 'optionAktif')}</option>
                <option value="Nonaktif">{t('user', 'optionNonaktif')}</option>
              </select>
            </div>
          </div>
          {form.role === 'Siswa' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('user', 'labelSiswaTerkait')}</label>
              <select value={form.studentId} onChange={set('studentId')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{t('user', 'optionBelumDitautkan')}</option>
                {availableSiswaForLink.map((s) => <option key={s.id} value={s.id}>{s.nama} ({s.nisn})</option>)}
              </select>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                {t('user', 'hintSiswaTerkait')}
              </p>
            </div>
          )}
          {editingId && <p className="text-xs text-gray-400 dark:text-slate-500">{t('user', 'hintGantiPassword')}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
              {t('common', 'cancel')}
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
              {editingId ? t('common', 'saveChanges') : t('user', 'btnTambah')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title={t('user', 'modalResetTitle')}>
        {resetTarget && (
          <form onSubmit={submitReset} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {t('user', 'resetInfoPrefix')} <span className="font-semibold text-gray-800 dark:text-slate-100">{resetTarget.nama}</span> ({resetTarget.username}).
              {' '}{t('user', 'resetInfoSuffix')}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('user', 'labelPasswordBaru')}</label>
              <input required type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t('user', 'placeholderPassword')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setResetTarget(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                {t('common', 'cancel')}
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 transition">
                {t('user', 'btnResetPassword')}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeItem('users', deleteTarget.id)}
        title={t('user', 'deleteTitle')}
        message={t('user', 'deleteMessage')(deleteTarget?.nama)}
      />
    </div>
  );
};

export default User;
