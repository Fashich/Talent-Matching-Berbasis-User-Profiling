import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Briefcase, NotebookPen, UsersRound, Sparkles, Target, UserRound } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { scopedPenempatan, scopedKelompokMagang, findById } from '../../utils/scope';
import { apiFetch } from '../../config/api';
import Badge from '../../components/ui/Badge';

const SummaryCard = ({ title, value, icon, colorClass, to }) => {
  const content = (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 flex items-center hover:border-blue-100 dark:hover:border-blue-900/50 transition">
      <div className={`p-4 rounded-lg ${colorClass}`}>{icon}</div>
      <div className="ml-5">
        <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-slate-100 mt-1">{value}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
};

const AdminDashboard = () => {
  const { siswa, perusahaan, penempatan, kelompokMagang, jurnal } = useData();
  const { t } = useLanguage();
  const statusLabels = t('common', 'statusLabels');
  const statusCount = (status) => penempatan.filter((p) => p.status === status).length;
  const jurnalMenunggu = jurnal.filter((j) => j.status === 'Menunggu').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <SummaryCard title={t('dashboardHome', 'totalSiswa')} value={siswa.length} icon={<Users size={28} className="text-blue-600 dark:text-blue-300" />} colorClass="bg-blue-50 dark:bg-blue-500/10" to="/siswa" />
      <SummaryCard title={t('dashboardHome', 'perusahaanMitra')} value={perusahaan.length} icon={<Building2 size={28} className="text-indigo-600 dark:text-indigo-300" />} colorClass="bg-indigo-50 dark:bg-indigo-500/10" to="/perusahaan" />
      <SummaryCard title={t('dashboardHome', 'kelompokMagang')} value={kelompokMagang.length} icon={<UsersRound size={28} className="text-purple-600 dark:text-purple-300" />} colorClass="bg-purple-50 dark:bg-purple-500/10" to="/kelompok-magang" />
      <SummaryCard title={t('dashboardHome', 'jurnalMenungguTinjau')} value={jurnalMenunggu} icon={<NotebookPen size={28} className="text-amber-600 dark:text-amber-300" />} colorClass="bg-amber-50 dark:bg-amber-500/10" to="/jurnal" />

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 md:col-span-2 xl:col-span-4">
        <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium mb-4">{t('dashboardHome', 'statusPenempatanTitle')}</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {['Diajukan', 'Diterima', 'Berlangsung', 'Selesai', 'Ditolak'].map((st) => (
            <div key={st} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
              <span className="block text-xs text-gray-500 dark:text-slate-400 font-semibold">{statusLabels[st] || st}</span>
              <span className="block text-xl font-bold text-gray-800 dark:text-slate-100 mt-1">{statusCount(st)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PetugasDashboard = () => {
  const { siswa, perusahaan, kelompokMagang, penempatan } = useData();
  const { t } = useLanguage();
  const berlangsung = penempatan.filter((p) => p.status === 'Berlangsung').length;
  const diajukan = penempatan.filter((p) => p.status === 'Diajukan').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <SummaryCard title={t('dashboardHome', 'totalSiswa')} value={siswa.length} icon={<Users size={28} className="text-blue-600 dark:text-blue-300" />} colorClass="bg-blue-50 dark:bg-blue-500/10" to="/siswa" />
      <SummaryCard title={t('dashboardHome', 'perusahaanMitra')} value={perusahaan.length} icon={<Building2 size={28} className="text-indigo-600 dark:text-indigo-300" />} colorClass="bg-indigo-50 dark:bg-indigo-500/10" to="/perusahaan" />
      <SummaryCard title={t('dashboardHome', 'kelompokMagang')} value={kelompokMagang.length} icon={<UsersRound size={28} className="text-purple-600 dark:text-purple-300" />} colorClass="bg-purple-50 dark:bg-purple-500/10" to="/kelompok-magang" />
      <SummaryCard title={t('dashboardHome', 'penempatanBerlangsung')} value={berlangsung} icon={<Briefcase size={28} className="text-green-600 dark:text-green-300" />} colorClass="bg-green-50 dark:bg-green-500/10" to="/penempatan" />
      {diajukan > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-sm rounded-lg px-4 py-3 md:col-span-2 xl:col-span-4">
          {t('dashboardHome', 'pendingNoticePrefix')} <span className="font-semibold">{diajukan}</span> {t('dashboardHome', 'pendingNoticeSuffix')}
        </div>
      )}
    </div>
  );
};

const GuruDashboard = () => {
  const { siswa, penempatan, kelompokMagang } = useData();
  const { user } = useAuth();
  const { t } = useLanguage();
  const scopedP = scopedPenempatan(user, penempatan);
  const scopedK = scopedKelompokMagang(user, kelompokMagang);
  const siswaCount = new Set(scopedP.map((p) => p.siswaId)).size;
  const berlangsung = scopedP.filter((p) => p.status === 'Berlangsung').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title={t('dashboardHome', 'siswaBimbingan')} value={siswaCount} icon={<Users size={28} className="text-blue-600 dark:text-blue-300" />} colorClass="bg-blue-50 dark:bg-blue-500/10" to="/siswa" />
        <SummaryCard title={t('dashboardHome', 'kelompokMagangDibina')} value={scopedK.length} icon={<UsersRound size={28} className="text-purple-600 dark:text-purple-300" />} colorClass="bg-purple-50 dark:bg-purple-500/10" to="/kelompok-magang" />
        <SummaryCard title={t('dashboardHome', 'pklBerlangsung')} value={berlangsung} icon={<Briefcase size={28} className="text-green-600 dark:text-green-300" />} colorClass="bg-green-50 dark:bg-green-500/10" to="/perusahaan" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
        <h3 className="text-gray-800 dark:text-slate-100 font-semibold mb-4">{t('dashboardHome', 'siswaBimbinganKamu')}</h3>
        <div className="space-y-2">
          {scopedP.slice(0, 6).map((p) => {
            const s = findById(siswa, p.siswaId);
            return (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-slate-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-100">{s?.nama}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{s?.kelas}</p>
                </div>
                <Badge status={p.status} />
              </div>
            );
          })}
          {scopedP.length === 0 && <p className="text-sm text-gray-400 dark:text-slate-500 py-4 text-center">{t('dashboardHome', 'belumAdaSiswaBimbingan')}</p>}
        </div>
      </div>
    </div>
  );
};

const SiswaDashboard = () => {
  const { siswa, perusahaan, kompetensi, jurnal, penempatan, kelompokMagang } = useData();
  const { user } = useAuth();
  const { t } = useLanguage();
  const myPenempatan = scopedPenempatan(user, penempatan);
  const active = myPenempatan.find((p) => p.status === 'Berlangsung') || myPenempatan[0];
  const c = active ? findById(perusahaan, active.perusahaanId) : null;
  const jurnalCount = jurnal.filter((j) => j.siswaId === user.linkedId).length;
  const kompetensiCount = kompetensi.filter((k) => k.siswaId === user.linkedId).length;
  const kelompok = scopedKelompokMagang(user, kelompokMagang);
  const [topRekomendasi, setTopRekomendasi] = useState(null);

  useEffect(() => {
    if (!user.linkedId) return;
    apiFetch(`/api/recommendation/${user.linkedId}`)
      .then((hasil) => setTopRekomendasi(hasil[0] || null))
      .catch(() => setTopRekomendasi(null));
  }, [user.linkedId]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900">
        <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{t('dashboardHome', 'greetingPrefix')} {user.nama.split(' ')[0]} 👋</h1>
        {active ? (
          <>
            <p className="text-gray-600 dark:text-slate-300 mt-2">
              {t('dashboardHome', 'pklInfoPrefix')} <span className="font-semibold text-gray-800 dark:text-slate-100">{c?.nama}</span>, {t('dashboardHome', 'pklInfoPeriodLabel')}{' '}
              {active.tanggalMulai} {t('common', 'sd')} {active.tanggalSelesai}
              {kelompok[0] ? <> {t('dashboardHome', 'pklInfoJoinedLabel')} <span className="font-semibold text-gray-800 dark:text-slate-100">{kelompok[0].nama}</span></> : null}.
            </p>
            <div className="mt-4"><Badge status={active.status} /></div>
          </>
        ) : (
          <p className="text-gray-600 dark:text-slate-300 mt-2">{t('dashboardHome', 'belumPenempatan')}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/profil" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">{t('dashboardHome', 'btnLengkapiProfil')}</Link>
          <Link to="/kompetensi" className="bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition">{t('dashboardHome', 'btnKompetensi')}</Link>
          <Link to="/recommendation" className="bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition">{t('dashboardHome', 'btnLihatRekomendasi')}</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SummaryCard title={t('dashboardHome', 'kompetensiTerdaftar')} value={kompetensiCount} icon={<Target size={28} className="text-blue-600 dark:text-blue-300" />} colorClass="bg-blue-50 dark:bg-blue-500/10" to="/kompetensi" />
        <SummaryCard title={t('dashboardHome', 'jurnalDitulis')} value={jurnalCount} icon={<NotebookPen size={28} className="text-green-600 dark:text-green-300" />} colorClass="bg-green-50 dark:bg-green-500/10" to="/jurnal" />
        <SummaryCard title={t('dashboardHome', 'kelompokMagang')} value={kelompok.length} icon={<UserRound size={28} className="text-purple-600 dark:text-purple-300" />} colorClass="bg-purple-50 dark:bg-purple-500/10" to="/kelompok-magang" />
      </div>

      {topRekomendasi && (
        <Link to="/recommendation" className="block bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 hover:border-blue-100 dark:hover:border-blue-900/50 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300">
                <Sparkles size={22} />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-slate-500">{t('dashboardHome', 'rekomendasiTeratas')}</p>
                <p className="font-semibold text-gray-800 dark:text-slate-100">{topRekomendasi.company_nama}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">{topRekomendasi.total_score}%</p>
              <Badge status={topRekomendasi.category} />
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

const DashboardHome = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900 dark:text-slate-100">
      {user.role !== 'Siswa' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-2">{t('dashboardHome', 'welcomePrefix')} {user.nama}</h1>
          <p className="text-gray-600 dark:text-slate-300">
            {t('dashboardHome', 'welcomeDesc')}
          </p>
        </div>
      )}

      {user.role === 'Administrator' && <AdminDashboard />}
      {user.role === 'Petugas' && <PetugasDashboard />}
      {user.role === 'Guru' && <GuruDashboard />}
      {user.role === 'Siswa' && <SiswaDashboard />}
    </div>
  );
};

export default DashboardHome;
