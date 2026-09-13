// Matching Engine — implementasi Talent Matching Berbasis User Profiling.
// Mengikuti Dokumen Perancangan Sistem (5.12–5.14) & Dokumen Analisis Sistem (2.11–2.13):
//
//   User Profiling → Competency Profiling → Company Requirement → Matching → Match Score → Recommendation
//
// Model pembobotan (MVP, rule-based — tanpa AI/ML sesuai Spesifikasi Realistic):
//   Kompetensi 40% · Pengalaman 20% · Pendidikan/Jurusan 15% · Bidang/Minat 15% · Preferensi lainnya 10%
//
// Kategori hasil (2.13 Dokumen Analisis Sistem):
//   80–100% Sangat Sesuai · 65–79% Sesuai · 50–64% Cukup Sesuai · <50% Kurang Sesuai

import { keywordJurusan, bidangJurusanMap } from '../data/seed';

export const BOBOT = {
  kompetensi: 0.4,
  pengalaman: 0.2,
  pendidikan: 0.15,
  bidangMinat: 0.15,
  preferensi: 0.1,
};

export function kategoriFromScore(score) {
  if (score >= 80) return 'Sangat Sesuai';
  if (score >= 65) return 'Sesuai';
  if (score >= 50) return 'Cukup Sesuai';
  return 'Kurang Sesuai';
}

function normalize(text) {
  return (text || '').toString().toLowerCase();
}

// Skor Kompetensi (40%): overlap antara kompetensi siswa (+ kamus keyword jurusan)
// dengan daftar kompetensi yang dibutuhkan perusahaan.
function skorKompetensi(siswa, kompetensiSiswa, perusahaan) {
  const namaKompetensi = kompetensiSiswa.filter((k) => k.siswaId === siswa.id).map((k) => normalize(k.nama));
  const kamusJurusan = (keywordJurusan[siswa.jurusan] || []).map(normalize);
  const poolSiswa = [...namaKompetensi, ...kamusJurusan].join(' | ');

  const dibutuhkan = perusahaan.kompetensiDibutuhkan || [];
  if (dibutuhkan.length === 0) return { skor: 70, cocok: [], total: 0 };

  const cocok = dibutuhkan.filter((req) => poolSiswa.includes(normalize(req)));
  return { skor: Math.round((cocok.length / dibutuhkan.length) * 100), cocok, total: dibutuhkan.length };
}

// Skor Pengalaman (20%): heuristik jumlah pengalaman siswa vs. tingkat pengalaman
// yang disyaratkan perusahaan.
function skorPengalaman(siswa, perusahaan) {
  const jumlah = (siswa.pengalaman || []).length;
  switch (perusahaan.tingkatPengalaman) {
    case 'Tidak Diperlukan':
      return 100;
    case 'Pemula':
      return jumlah >= 1 ? 100 : 60;
    case 'Menengah':
      return jumlah >= 2 ? 100 : jumlah === 1 ? 55 : 20;
    default:
      return jumlah >= 1 ? 80 : 40;
  }
}

// Skor Pendidikan/Jurusan (15%): match langsung ke jurusanRelevan perusahaan,
// atau match parsial lewat Mapping Bidang Usaha–Jurusan (Lampiran 8.10).
function skorPendidikan(siswa, perusahaan) {
  const relevan = perusahaan.jurusanRelevan || [];
  if (relevan.includes(siswa.jurusan)) return 100;
  const viaBidang = bidangJurusanMap[perusahaan.bidang] || [];
  if (viaBidang.includes(siswa.jurusan)) return 70;
  return 20;
}

// Skor Bidang/Minat (15%): overlap antar-kata antara minat siswa dengan
// bidang/posisi/kompetensi perusahaan (per-kata, bukan frasa utuh, supaya
// "Jaringan Komputer" tetap cocok dengan "Teknisi Jaringan").
function skorBidangMinat(siswa, perusahaan) {
  const minat = siswa.minat || [];
  if (minat.length === 0) return 30;
  const target = normalize(`${perusahaan.bidang} ${perusahaan.posisi} ${(perusahaan.kompetensiDibutuhkan || []).join(' ')}`);
  const cocok = minat.filter((m) => {
    const kata = normalize(m).split(/\s+/).filter((w) => w.length > 2);
    return kata.some((w) => target.includes(w));
  }).length;
  return Math.round((cocok / minat.length) * 100);
}

// Skor Preferensi lainnya (10%): overlap kata kunci sederhana antara preferensi
// siswa dengan kriteria/posisi perusahaan.
function skorPreferensi(siswa, perusahaan) {
  const pref = normalize(siswa.preferensi);
  if (!pref) return 50;
  const kriteria = normalize(`${perusahaan.kriteriaLain || ''} ${perusahaan.posisi || ''}`);
  const overlap = pref.split(/[\s,]+/).filter(Boolean).some((word) => word.length > 2 && kriteria.includes(word));
  return overlap ? 90 : 40;
}

/**
 * Menghitung Match Score antara satu siswa dan satu perusahaan.
 * Mengembalikan skor total (0–100), kategori, dan rincian per-komponen
 * untuk ditampilkan di halaman Recommendation.
 */
export function computeMatchScore(siswa, kompetensiSiswa, perusahaan) {
  const kompetensi = skorKompetensi(siswa, kompetensiSiswa, perusahaan);
  const pengalaman = skorPengalaman(siswa, perusahaan);
  const pendidikan = skorPendidikan(siswa, perusahaan);
  const bidangMinat = skorBidangMinat(siswa, perusahaan);
  const preferensi = skorPreferensi(siswa, perusahaan);

  const total = Math.round(
    kompetensi.skor * BOBOT.kompetensi +
      pengalaman * BOBOT.pengalaman +
      pendidikan * BOBOT.pendidikan +
      bidangMinat * BOBOT.bidangMinat +
      preferensi * BOBOT.preferensi
  );

  return {
    total,
    kategori: kategoriFromScore(total),
    breakdown: [
      { label: 'Kompetensi', bobot: 40, skor: kompetensi.skor, detail: kompetensi.total ? `${kompetensi.cocok.length}/${kompetensi.total} keyword cocok` : 'Perusahaan tidak menetapkan kompetensi spesifik' },
      { label: 'Pengalaman', bobot: 20, skor: pengalaman, detail: `${(siswa.pengalaman || []).length} pengalaman tercatat` },
      { label: 'Pendidikan/Jurusan', bobot: 15, skor: pendidikan, detail: `Jurusan siswa: ${siswa.jurusan || '-'}` },
      { label: 'Bidang/Minat', bobot: 15, skor: bidangMinat, detail: (siswa.minat || []).join(', ') || 'Minat belum diisi' },
      { label: 'Preferensi Lainnya', bobot: 10, skor: preferensi, detail: siswa.preferensi || 'Preferensi belum diisi' },
    ],
  };
}

/**
 * Menghasilkan daftar rekomendasi perusahaan untuk satu siswa, diurutkan dari
 * Match Score tertinggi. Hanya mempertimbangkan perusahaan berstatus Aktif.
 */
export function rankRecommendations(siswa, kompetensiSiswa, daftarPerusahaan) {
  return daftarPerusahaan
    .filter((p) => p.status === 'Aktif')
    .map((perusahaan) => ({ perusahaan, ...computeMatchScore(siswa, kompetensiSiswa, perusahaan) }))
    .sort((a, b) => b.total - a.total);
}
