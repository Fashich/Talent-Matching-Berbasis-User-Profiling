import React, { useEffect, useState } from 'react';
import { Award, Printer, FileBarChart } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { findById } from '../../utils/scope';
import { apiFetch } from '../../config/api';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

// Laporan — rekap penempatan & sertifikat. Skor yang ditampilkan memakai Match
// Score (kecocokan profil siswa terhadap perusahaan tempat ia ditempatkan),
// sesuai konsep Matching Engine pada Dokumen Perancangan/Analisis Sistem.
// Halaman ini hanya untuk Administrator (5.10 Dokumen Perancangan Sistem).
// Skor dihitung backend (Matching Engine PHP, task #16) per siswa unik yang
// muncul di daftar penempatan, lalu dicocokkan ke perusahaan tempat ia
// ditempatkan (bukan lagi dihitung client-side).

const Laporan = () => {
  const { siswa, perusahaan, penempatan, settings } = useData();
  const [certTarget, setCertTarget] = useState(null);
  const [matchByStudent, setMatchByStudent] = useState({}); // { [studentId]: [{company_id, total_score, category}] }

  useEffect(() => {
    const uniqueStudentIds = Array.from(new Set(penempatan.map((p) => p.siswaId)));
    uniqueStudentIds.forEach((studentId) => {
      if (matchByStudent[studentId]) return;
      apiFetch('/api/matching/calculate', { method: 'POST', body: { student_id: studentId } })
        .then((results) => setMatchByStudent((prev) => ({ ...prev, [studentId]: results })))
        .catch(() => setMatchByStudent((prev) => ({ ...prev, [studentId]: [] })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penempatan]);

  const matchFor = (studentId, companyId) => {
    const list = matchByStudent[studentId];
    if (!list) return null;
    const found = list.find((r) => r.company_id === companyId);
    return found ? { total: found.total_score, kategori: found.category } : null;
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Laporan & Sertifikat PKL</h1>
        <p className="text-sm text-gray-500 mt-0.5">Rekap seluruh penempatan siswa, Match Score, dan cetak sertifikat bagi yang telah menyelesaikan program.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {penempatan.length === 0 ? (
          <EmptyState icon={<FileBarChart size={28} />} title="Belum ada data untuk direkap" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="py-3 px-6">SISWA</th>
                  <th className="py-3 px-6">PERUSAHAAN</th>
                  <th className="py-3 px-6">PERIODE</th>
                  <th className="py-3 px-6">STATUS</th>
                  <th className="py-3 px-6">MATCH SCORE</th>
                  <th className="py-3 px-6 text-center">SERTIFIKAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {penempatan.map((p) => {
                  const s = findById(siswa, p.siswaId);
                  const c = findById(perusahaan, p.perusahaanId);
                  const match = matchFor(p.siswaId, p.perusahaanId);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3 px-6">
                        <p className="text-gray-800 font-medium">{s?.nama}</p>
                        <p className="text-xs text-gray-400">{s?.kelas}</p>
                      </td>
                      <td className="py-3 px-6 text-gray-600">{c?.nama}</td>
                      <td className="py-3 px-6 text-gray-500 whitespace-nowrap">{p.tanggalMulai} s/d {p.tanggalSelesai}</td>
                      <td className="py-3 px-6"><Badge status={p.status} /></td>
                      <td className="py-3 px-6">
                        {match ? (
                          <span className="text-gray-700 font-medium">{match.total}% <Badge status={match.kategori} /></span>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => setCertTarget({ p, s, c, match })}
                          disabled={p.status !== 'Selesai'}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          title={p.status !== 'Selesai' ? 'Sertifikat tersedia setelah PKL berstatus Selesai' : undefined}
                        >
                          <Award size={14} />
                          Lihat Sertifikat
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!certTarget} onClose={() => setCertTarget(null)} title="Sertifikat PKL" size="lg">
        {certTarget && (
          <div>
            <div id="certificate-print" className="border-4 border-double border-blue-200 rounded-xl p-10 text-center bg-gradient-to-b from-blue-50/40 to-white">
              <Award size={40} className="mx-auto text-blue-500" />
              <p className="text-xs tracking-[0.3em] text-gray-400 mt-4 uppercase">Sertifikat Praktik Kerja Lapangan</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-3">{certTarget.s?.nama}</h2>
              <p className="text-sm text-gray-500 mt-1">NISN {certTarget.s?.nisn} · {certTarget.s?.kelas}</p>
              <p className="text-sm text-gray-600 mt-6 leading-relaxed max-w-md mx-auto">
                Telah menyelesaikan Praktik Kerja Lapangan di{' '}
                <span className="font-semibold text-gray-800">{certTarget.c?.nama}</span> pada periode{' '}
                <span className="font-semibold text-gray-800">{certTarget.p.tanggalMulai}</span> s/d{' '}
                <span className="font-semibold text-gray-800">{certTarget.p.tanggalSelesai}</span> dengan tingkat kesesuaian{' '}
                <span className="font-semibold text-gray-800">
                  {certTarget.match ? `${certTarget.match.kategori} (${certTarget.match.total}%)` : '—'}
                </span>.
              </p>
              <div className="flex items-center justify-between mt-10 px-6 text-sm text-gray-600">
                <div>
                  <p>{settings.alamatSekolah?.split(',').slice(-1)[0]?.trim()}, {certTarget.p.tanggalSelesai}</p>
                  <p className="mt-8 font-semibold text-gray-800">{settings.kepalaSekolah}</p>
                  <p className="text-xs text-gray-400">Kepala {settings.namaSekolah}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setCertTarget(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition">
                Tutup
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
                <Printer size={16} />
                Cetak
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Laporan;
