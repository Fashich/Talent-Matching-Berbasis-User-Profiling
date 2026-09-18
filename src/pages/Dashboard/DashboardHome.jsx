import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Briefcase, NotebookPen, UsersRound, Sparkles, Target, UserRound } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { scopedPenempatan, scopedKelompokMagang, findById } from '../../utils/scope';
import { apiFetch } from '../../config/api';
import Badge from '../../components/ui/Badge';

const SummaryCard = ({ title, value, icon, colorClass, to }) => {
  const content = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:border-blue-100 transition">
      <div className={`p-4 rounded-lg ${colorClass}`}>{icon}</div>
      <div className="ml-5">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
};

const AdminDashboard = () => {
  const { siswa, perusahaan, penempatan, kelompokMagang, jurnal } = useData();
  const statusCount = (status) => penempatan.filter((p) => p.status === status).length;
  const jurnalMenunggu = jurnal.filter((j) => j.status === 'Menunggu').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <SummaryCard title="Total Siswa" value={siswa.length} icon={<Users size={28} className="text-blue-600" />} colorClass="bg-blue-50" to="/siswa" />
      <SummaryCard title="Perusahaan Mitra" value={perusahaan.length} icon={<Building2 size={28} className="text-indigo-600" />} colorClass="bg-indigo-50" to="/perusahaan" />
      <SummaryCard title="Kelompok Magang" value={kelompokMagang.length} icon={<UsersRound size={28} className="text-purple-600" />} colorClass="bg-purple-50" to="/kelompok-magang" />
      <SummaryCard title="Jurnal Menunggu Tinjau" value={jurnalMenunggu} icon={<NotebookPen size={28} className="text-amber-600" />} colorClass="bg-amber-50" to="/jurnal" />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2 xl:col-span-4">
        <h3 className="text-gray-500 text-sm font-medium mb-4">Status Penempatan & Penerimaan</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {['Diajukan', 'Diterima', 'Berlangsung', 'Selesai', 'Ditolak'].map((st) => (
            <div key={st} className="text-center p-3 rounded-lg bg-gray-50">
              <span className="block text-xs text-gray-500 font-semibold">{st}</span>
              <span className="block text-xl font-bold text-gray-800 mt-1">{statusCount(st)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PetugasDashboard = () => {
  const { siswa, perusahaan, kelompokMagang, penempatan } = useData();
  const berlangsung = penempatan.filter((p) => p.status === 'Berlangsung').length;
  const diajukan = penempatan.filter((p) => p.status === 'Diajukan').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <SummaryCard title="Total Siswa" value={siswa.length} icon={<Users size={28} className="text-blue-600" />} colorClass="bg-blue-50" to="/siswa" />
      <SummaryCard title="Perusahaan Mitra" value={perusahaan.length} icon={<Building2 size={28} className="text-indigo-600" />} colorClass="bg-indigo-50" to="/perusahaan" />
      <SummaryCard title="Kelompok Magang" value={kelompokMagang.length} icon={<UsersRound size={28} className="text-purple-600" />} colorClass="bg-purple-50" to="/kelompok-magang" />
      <SummaryCard title="Penempatan Berlangsung" value={berlangsung} icon={<Briefcase size={28} className="text-green-600" />} colorClass="bg-green-50" to="/penempatan" />
      {diajukan > 0 && (
        <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm rounded-lg px-4 py-3 md:col-span-2 xl:col-span-4">
          Ada <span className="font-semibold">{diajukan}</span> pengajuan penempatan yang menunggu diproses.
        </div>
      )}
    </div>
  );
};

const GuruDashboard = () => {
  const { siswa, penempatan, kelompokMagang } = useData();
  const { user } = useAuth();
  const scopedP = scopedPenempatan(user, penempatan);
  const scopedK = scopedKelompokMagang(user, kelompokMagang);
  const siswaCount = new Set(scopedP.map((p) => p.siswaId)).size;
  const berlangsung = scopedP.filter((p) => p.status === 'Berlangsung').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Siswa Bimbingan" value={siswaCount} icon={<Users size={28} className="text-blue-600" />} colorClass="bg-blue-50" to="/siswa" />
        <SummaryCard title="Kelompok Magang Dibina" value={scopedK.length} icon={<UsersRound size={28} className="text-purple-600" />} colorClass="bg-purple-50" to="/kelompok-magang" />
        <SummaryCard title="PKL Berlangsung" value={berlangsung} icon={<Briefcase size={28} className="text-green-600" />} colorClass="bg-green-50" to="/perusahaan" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-gray-800 font-semibold mb-4">Siswa Bimbingan Kamu</h3>
        <div className="space-y-2">
          {scopedP.slice(0, 6).map((p) => {
            const s = findById(siswa, p.siswaId);
            return (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{s?.nama}</p>
                  <p className="text-xs text-gray-400">{s?.kelas}</p>
                </div>
                <Badge status={p.status} />
              </div>
            );
          })}
          {scopedP.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">Belum ada siswa bimbingan.</p>}
        </div>
      </div>
    </div>
  );
};

const SiswaDashboard = () => {
  const { siswa, perusahaan, kompetensi, jurnal, penempatan, kelompokMagang } = useData();
  const { user } = useAuth();
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 bg-gradient-to-r from-blue-50 to-white">
        <h1 className="text-xl font-bold text-gray-800">Halo, {user.nama.split(' ')[0]} 👋</h1>
        {active ? (
          <>
            <p className="text-gray-600 mt-2">
              Kamu sedang PKL di <span className="font-semibold text-gray-800">{c?.nama}</span>, periode{' '}
              {active.tanggalMulai} s/d {active.tanggalSelesai}
              {kelompok[0] ? <> — bergabung di <span className="font-semibold text-gray-800">{kelompok[0].nama}</span></> : null}.
            </p>
            <div className="mt-4"><Badge status={active.status} /></div>
          </>
        ) : (
          <p className="text-gray-600 mt-2">Kamu belum memiliki data penempatan PKL. Lengkapi Profil & Kompetensi supaya Petugas mudah menemukan perusahaan yang sesuai.</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/profil" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Lengkapi Profil</Link>
          <Link to="/kompetensi" className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Kompetensi</Link>
          <Link to="/recommendation" className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Lihat Rekomendasi</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SummaryCard title="Kompetensi Terdaftar" value={kompetensiCount} icon={<Target size={28} className="text-blue-600" />} colorClass="bg-blue-50" to="/kompetensi" />
        <SummaryCard title="Jurnal Ditulis" value={jurnalCount} icon={<NotebookPen size={28} className="text-green-600" />} colorClass="bg-green-50" to="/jurnal" />
        <SummaryCard title="Kelompok Magang" value={kelompok.length} icon={<UserRound size={28} className="text-purple-600" />} colorClass="bg-purple-50" to="/kelompok-magang" />
      </div>

      {topRekomendasi && (
        <Link to="/recommendation" className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-blue-100 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Sparkles size={22} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Rekomendasi teratas untukmu</p>
                <p className="font-semibold text-gray-800">{topRekomendasi.company_nama}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">{topRekomendasi.total_score}%</p>
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
      {user.role !== 'Siswa' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 bg-gradient-to-r from-blue-50 to-white">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Selamat datang, {user.nama}</h1>
          <p className="text-gray-600">
            EduPKL mencocokkan profil & kompetensi siswa dengan kebutuhan perusahaan secara otomatis —
            dari penempatan, jurnal, hingga Match Score dan rekomendasi — dalam satu sistem yang rapi.
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
