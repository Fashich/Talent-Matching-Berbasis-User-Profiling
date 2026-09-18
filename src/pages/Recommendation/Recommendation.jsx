import React, { useEffect, useState } from 'react';
import { Sparkles, ChevronDown, Building2, MapPin } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { findById } from '../../utils/scope';
import { apiFetch, ApiError } from '../../config/api';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

// Recommendation — hasil akhir alur Talent Matching:
//   User Profiling → Competency Profiling → Company Requirement → Matching → Match Score → Recommendation
// (2.7 & 8 Dokumen Perancangan Sistem, 2.11–2.13 Dokumen Analisis Sistem)
// Perhitungan skor SEKARANG dihitung backend (Matching Engine PHP, task #16),
// bukan lagi client-side — hasil di-refresh tiap halaman ini dibuka.

const Recommendation = () => {
  const { siswa, kompetensi } = useData();
  const { user } = useAuth();
  const data = findById(siswa, user.linkedId);
  const [expanded, setExpanded] = useState(null);
  const [hasil, setHasil] = useState([]);
  const [loadingHasil, setLoadingHasil] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user.linkedId) {
      setLoadingHasil(false);
      return;
    }
    setLoadingHasil(true);
    apiFetch(`/api/recommendation/${user.linkedId}`)
      .then((data2) => setHasil(data2))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Gagal memuat rekomendasi.'))
      .finally(() => setLoadingHasil(false));
  }, [user.linkedId]);

  const profilKurangLengkap = data && (!data.jurusan || (data.minat || []).length === 0 || kompetensi.filter((k) => k.siswaId === data.id).length === 0);

  if (!data) {
    return <div className="max-w-4xl mx-auto text-sm text-gray-500">Data siswa tidak ditemukan.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 text-gray-900">
      <div>
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles size={20} className="text-blue-600" />
          Rekomendasi Perusahaan
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Diurutkan berdasarkan Match Score — hasil pencocokan profil, kompetensi, jurusan, minat, dan preferensimu dengan kebutuhan tiap perusahaan.
        </p>
      </div>

      {profilKurangLengkap && (
        <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm rounded-lg px-4 py-3">
          Profil & kompetensimu belum lengkap sepenuhnya — lengkapi di halaman <span className="font-semibold">Profil</span> dan{' '}
          <span className="font-semibold">Kompetensi</span> supaya Match Score lebih akurat.
        </div>
      )}

      {loadingHasil ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-sm text-gray-400">Menghitung rekomendasi...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      ) : hasil.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <EmptyState icon={<Building2 size={28} />} title="Belum ada perusahaan aktif untuk dicocokkan" />
        </div>
      ) : (
        <div className="space-y-3">
          {hasil.map((r, idx) => (
            <div key={r.matching_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === r.matching_id ? null : r.matching_id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50/50 transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{r.company_nama}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} />
                      {r.posisi}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800 leading-none">{r.total_score}%</p>
                    <Badge status={r.category} />
                  </div>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${expanded === r.matching_id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {expanded === r.matching_id && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
                  {r.breakdown.map((b) => (
                    <div key={b.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">{b.label} <span className="text-gray-400">({b.bobot}%)</span></span>
                        <span className="text-xs font-semibold text-gray-700">{b.skor}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${b.skor}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{b.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendation;
