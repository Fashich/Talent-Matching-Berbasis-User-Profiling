import React, { useMemo, useState } from 'react';
import { Search, Plus, Edit, Trash2, Users as UsersIcon } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { daftarJurusan } from '../../data/seed';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const emptyForm = { nisn: '', nama: '', jenisKelamin: 'L', kelas: '', jurusan: daftarJurusan[0], alamat: '', hp: '', email: '', status: 'Belum PKL' };

const Siswa = () => {
  const { siswa, addItem, updateItem, removeItem } = useData();
  const { user } = useAuth();
  const { t } = useLanguage();
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
  // Fix bug 20 Sept 2026 (laporan Rizky via WA, ditemukan di form Perusahaan
  // tapi pola inputnya identik di sini): email instansi (@go.id, @sch.id)
  // sempat gagal krn keyboard mobile nyisipin spasi tak sengaja setelah
  // titik domain (mis. "go. id"). Strip whitespace dari input email.
  const setEmail = (e) => setForm((f) => ({ ...f, email: e.target.value.replace(/\s+/g, '') }));

  return (
    <div className="max-w-7xl mx-auto space-y-4 text-gray-900 dark:text-slate-100">
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{t('siswa', 'pageTitle')}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{t('siswa', 'pageDesc')}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        {/* Header Actions */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {canManage ? (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition w-fit"
            >
              <Plus size={16} />
              {t('siswa', 'btnTambah')}
            </button>
          ) : <div />}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder={t('siswa', 'searchPlaceholder')}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
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
          <EmptyState icon={<UsersIcon size={28} />} title={t('siswa', 'emptyTitle')} description={t('siswa', 'emptyDesc')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 font-medium border-b border-gray-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-6">{t('common', 'colNo')}</th>
                  <th className="py-3 px-6">{t('siswa', 'colNisn')}</th>
                  <th className="py-3 px-6">{t('common', 'colName')}</th>
                  <th className="py-3 px-6">{t('siswa', 'colJk')}</th>
                  <th className="py-3 px-6">{t('siswa', 'colKelas')}</th>
                  <th className="py-3 px-6">{t('siswa', 'colJurusan')}</th>
                  <th className="py-3 px-6">{t('siswa', 'colHp')}</th>
                  <th className="py-3 px-6">{t('siswa', 'colStatusPkl')}</th>
                  {canManage && <th className="py-3 px-6 text-center">{t('common', 'colActions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {paged.map((s, index) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-6 text-gray-500 dark:text-slate-400">{(page - 1) * pageSize + index + 1}</td>
                    <td className="py-3 px-6 text-gray-900 dark:text-slate-100 font-medium">{s.nisn}</td>
                    <td className="py-3 px-6 text-gray-800 dark:text-slate-200">{s.nama}</td>
                    <td className="py-3 px-6 text-gray-500 dark:text-slate-400">{s.jenisKelamin}</td>
                    <td className="py-3 px-6 text-gray-500 dark:text-slate-400">{s.kelas}</td>
                    <td className="py-3 px-6 text-gray-500 dark:text-slate-400">{s.jurusan}</td>
                    <td className="py-3 px-6 text-gray-500 dark:text-slate-400">{s.hp}</td>
                    <td className="py-3 px-6"><Badge status={s.status} /></td>
                    {canManage && (
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(s)}
                            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition"
                          >
                            <Edit size={14} />
                            {t('common', 'edit')}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 transition"
                          >
                            <Trash2 size={14} />
                            {t('common', 'delete')}
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
          <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded border text-sm transition ${
                  p === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? t('siswa', 'modalTitleEdit') : t('siswa', 'modalTitleAdd')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('siswa', 'labelNisn')}</label>
              <input required value={form.nisn} onChange={set('nisn')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('siswa', 'labelJenisKelamin')}</label>
              <select value={form.jenisKelamin} onChange={set('jenisKelamin')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="L">{t('siswa', 'optionLakiLaki')}</option>
                <option value="P">{t('siswa', 'optionPerempuan')}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('siswa', 'labelNamaLengkap')}</label>
            <input required value={form.nama} onChange={set('nama')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('siswa', 'labelKelas')}</label>
              <input required placeholder={t('siswa', 'placeholderKelas')} value={form.kelas} onChange={set('kelas')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('siswa', 'labelJurusan')}</label>
              <select value={form.jurusan} onChange={set('jurusan')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {daftarJurusan.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('siswa', 'labelHp')}</label>
            <input required value={form.hp} onChange={set('hp')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('siswa', 'labelAlamat')}</label>
            <input value={form.alamat} onChange={set('alamat')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('siswa', 'labelEmail')}</label>
              <input type="email" value={form.email} onChange={setEmail} autoCapitalize="none" autoCorrect="off" spellCheck="false" className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('siswa', 'labelStatusPkl')}</label>
              <select value={form.status} onChange={set('status')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Belum PKL">{t('common', 'statusLabels')['Belum PKL']}</option>
                <option value="Berlangsung">{t('common', 'statusLabels').Berlangsung}</option>
                <option value="Selesai">{t('common', 'statusLabels').Selesai}</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
              {t('common', 'cancel')}
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
              {editingId ? t('common', 'saveChanges') : t('siswa', 'btnTambah')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeItem('siswa', deleteTarget.id)}
        title={t('siswa', 'deleteTitle')}
        message={t('siswa', 'deleteMessage')(deleteTarget?.nama)}
      />
    </div>
  );
};

export default Siswa;
