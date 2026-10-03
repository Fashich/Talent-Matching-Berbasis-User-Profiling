import React, { useMemo, useState } from 'react';
import { Search, Plus, Edit, Trash2, Building2, Phone, Mail, MapPin, ListChecks } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { daftarBidangUsaha, daftarJurusan } from '../../data/seed';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const emptyForm = {
  nama: '', bidang: daftarBidangUsaha[0], alamat: '', telepon: '', email: '', penanggungJawab: '', kuota: 1, status: 'Aktif',
  posisi: '', kompetensiDibutuhkan: '', jurusanRelevan: [], tingkatPengalaman: 'Tidak Diperlukan', pendidikanDibutuhkan: '', kriteriaLain: '',
};

const Perusahaan = () => {
  const { perusahaan, kelompokMagang, addItem, updateItem, removeItem } = useData();
  const { user } = useAuth();
  const { t } = useLanguage();
  const canManage = user?.role === 'Administrator' || user?.role === 'Petugas';
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const list = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return perusahaan.filter((p) => p.nama.toLowerCase().includes(q) || p.bidang.toLowerCase().includes(q) || (p.posisi || '').toLowerCase().includes(q));
  }, [perusahaan, searchTerm]);

  // Kuota terisi dihitung dari Penempatan berstatus Diterima/Berlangsung —
  // BUKAN dari jumlah anggota Kelompok Magang. Sebelumnya ini bikin bingung
  // (dilaporkan sbg bug 17 Sept 2026: "buat kelompok magang, kuota tetap 0")
  // karena kelompok magang cuma pengelompokan siswa+guru+perusahaan, belum
  // tentu berarti siswanya sudah resmi "diterima PKL". Alur yang benar:
  // Kelompok Magang dibuat -> buat Penempatan utk tiap anggotanya (form
  // Penempatan sekarang otomatis mempersempit siswa & isi guru/perusahaan
  // dari kelompok yang dipilih) -> set status Diterima/Berlangsung -> kuota
  // baru naik. kelompokCount() di bawah cuma info tambahan biar jelas.
  //
  // Bug 3 Okt 2026 (laporan Rizky): JANGAN hitung ulang dari array
  // `penempatan` di FE ini — array itu discope per role oleh backend
  // (PlacementController::index(): Siswa cuma dapat placement miliknya
  // sendiri, Guru cuma yang dia bimbing), jadi kuota selalu tampil 0/
  // undercounted utk role Siswa & Guru. `p.kuotaTerisi` sekarang dihitung
  // di server lintas-role (lihat CompanyController::withRequirements) dan
  // sudah ikut terbawa di tiap objek perusahaan — pakai field itu langsung,
  // bukan filter array `penempatan` lagi.
  const kelompokCount = (perusahaanId) => kelompokMagang.filter((k) => k.perusahaanId === perusahaanId && k.status === 'Aktif').length;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      nama: p.nama, bidang: p.bidang, alamat: p.alamat, telepon: p.telepon, email: p.email, penanggungJawab: p.penanggungJawab, kuota: p.kuota, status: p.status,
      posisi: p.posisi || '', kompetensiDibutuhkan: (p.kompetensiDibutuhkan || []).join(', '), jurusanRelevan: p.jurusanRelevan || [],
      tingkatPengalaman: p.tingkatPengalaman || 'Tidak Diperlukan', pendidikanDibutuhkan: p.pendidikanDibutuhkan || '', kriteriaLain: p.kriteriaLain || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      kuota: Number(form.kuota) || 0,
      kompetensiDibutuhkan: form.kompetensiDibutuhkan.split(',').map((s) => s.trim()).filter(Boolean),
    };
    if (editingId) updateItem('perusahaan', editingId, payload);
    else addItem('perusahaan', payload);
    setModalOpen(false);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  // Fix bug 20 Sept 2026 (laporan Rizky via WA): email instansi pemerintah/
  // sekolah (@go.id, @sch.id) sempat gagal masuk krn keyboard mobile
  // (autocorrect/auto-space) suka nyisipin spasi tak sengaja setelah titik
  // domain (mis. "go. id"), bikin format email jadi invalid. Strip semua
  // whitespace dari input email biar tahan terhadap gangguan itu.
  const setEmail = (e) => setForm((f) => ({ ...f, email: e.target.value.replace(/\s+/g, '') }));

  const toggleJurusan = (j) => {
    setForm((f) => ({
      ...f,
      jurusanRelevan: f.jurusanRelevan.includes(j) ? f.jurusanRelevan.filter((x) => x !== j) : [...f.jurusanRelevan, j],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 text-gray-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{t('perusahaan', 'pageTitle')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{t('perusahaan', 'pageDesc')}</p>
        </div>
        <div className="flex items-center gap-3">
          {canManage && (
            <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              <Plus size={16} />
              {t('perusahaan', 'btnTambah')}
            </button>
          )}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder={t('perusahaan', 'searchPlaceholder')}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
          <EmptyState icon={<Building2 size={28} />} title={t('perusahaan', 'emptyTitle')} description={t('perusahaan', 'emptyDesc')} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {list.map((p) => (
            <div key={p.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Building2 size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-slate-100 leading-tight">{p.nama}</h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{p.bidang} · {p.posisi || t('perusahaan', 'posisiBelumDiisi')}</p>
                  </div>
                </div>
                <Badge status={p.status} />
              </div>

              <div className="mt-4 space-y-1.5 text-sm text-gray-500 dark:text-slate-400">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span className="truncate">{p.alamat}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="shrink-0" />
                  <span>{p.telepon}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="shrink-0" />
                  <span className="truncate">{p.email}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <ListChecks size={13} />
                  {t('perusahaan', 'kebutuhanKompetensi')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(p.kompetensiDibutuhkan || []).map((k) => (
                    <span key={k} className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs">{k}</span>
                  ))}
                  {(p.kompetensiDibutuhkan || []).length === 0 && <span className="text-xs text-gray-400 dark:text-slate-500">{t('perusahaan', 'belumDitentukan')}</span>}
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{t('perusahaan', 'jurusanRelevanLabel')} {(p.jurusanRelevan || []).join(', ') || '-'} · {t('perusahaan', 'pengalamanLabel')} {p.tingkatPengalaman}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">{t('perusahaan', 'pjLabel')} <span className="text-gray-700 dark:text-slate-300 font-medium">{p.penanggungJawab}</span></span>
                <span className="text-gray-500 dark:text-slate-400" title={t('perusahaan', 'kuotaTooltip')}>{t('perusahaan', 'kuotaLabel')} <span className="text-gray-800 dark:text-slate-100 font-semibold">{p.kuotaTerisi ?? 0}/{p.kuota}</span></span>
              </div>
              {kelompokCount(p.id) > 0 && (
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{kelompokCount(p.id)} {t('perusahaan', 'kelompokAktifSuffix')}</p>
              )}

              {canManage && (
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition">
                    <Edit size={14} />
                    {t('common', 'edit')}
                  </button>
                  <button onClick={() => setDeleteTarget(p)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 transition">
                    <Trash2 size={14} />
                    {t('common', 'delete')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? t('perusahaan', 'modalTitleEdit') : t('perusahaan', 'modalTitleAdd')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('perusahaan', 'labelNamaPerusahaan')}</label>
              <input required value={form.nama} onChange={set('nama')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('perusahaan', 'labelBidangUsaha')}</label>
              <select value={form.bidang} onChange={set('bidang')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {daftarBidangUsaha.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('perusahaan', 'labelAlamat')}</label>
            <input value={form.alamat} onChange={set('alamat')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('perusahaan', 'labelTelepon')}</label>
              <input value={form.telepon} onChange={set('telepon')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('perusahaan', 'labelEmail')}</label>
              <input type="email" value={form.email} onChange={setEmail} autoCapitalize="none" autoCorrect="off" spellCheck="false" className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('perusahaan', 'labelPenanggungJawab')}</label>
              <input value={form.penanggungJawab} onChange={set('penanggungJawab')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('perusahaan', 'labelKuotaSiswa')}</label>
              <input type="number" min="0" value={form.kuota} onChange={set('kuota')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('perusahaan', 'labelStatus')}</label>
            <select value={form.status} onChange={set('status')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Aktif">{t('perusahaan', 'optionAktif')}</option>
              <option value="Tidak Aktif">{t('perusahaan', 'optionTidakAktif')}</option>
            </select>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3 mt-3">{t('perusahaan', 'companyRequirementTitle')}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('perusahaan', 'labelPosisi')}</label>
                <input placeholder={t('perusahaan', 'placeholderPosisi')} value={form.posisi} onChange={set('posisi')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('perusahaan', 'labelKompetensiDibutuhkan')}</label>
                <input placeholder={t('perusahaan', 'placeholderKompetensiDibutuhkan')} value={form.kompetensiDibutuhkan} onChange={set('kompetensiDibutuhkan')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('perusahaan', 'labelJurusanRelevan')}</label>
                <div className="flex flex-wrap gap-2">
                  {daftarJurusan.map((j) => (
                    <button
                      type="button"
                      key={j}
                      onClick={() => toggleJurusan(j)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                        form.jurusanRelevan.includes(j) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {j}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('perusahaan', 'labelTingkatPengalaman')}</label>
                  <select value={form.tingkatPengalaman} onChange={set('tingkatPengalaman')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Tidak Diperlukan">{t('perusahaan', 'optionTidakDiperlukan')}</option>
                    <option value="Pemula">{t('perusahaan', 'optionPemula')}</option>
                    <option value="Menengah">{t('perusahaan', 'optionMenengah')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('perusahaan', 'labelPendidikanDibutuhkan')}</label>
                  <input placeholder={t('perusahaan', 'placeholderPendidikanDibutuhkan')} value={form.pendidikanDibutuhkan} onChange={set('pendidikanDibutuhkan')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('perusahaan', 'labelKriteriaLain')}</label>
                <input value={form.kriteriaLain} onChange={set('kriteriaLain')} className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
              {t('common', 'cancel')}
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
              {editingId ? t('common', 'saveChanges') : t('perusahaan', 'btnTambah')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeItem('perusahaan', deleteTarget.id)}
        title={t('perusahaan', 'deleteTitle')}
        message={t('perusahaan', 'deleteMessage')(deleteTarget?.nama)}
      />
    </div>
  );
};

export default Perusahaan;
