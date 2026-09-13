import React from 'react';

// Peta warna untuk status-status yang umum dipakai di seluruh EduPKL.
const STATUS_STYLES = {
  // Status siswa
  Berlangsung: 'bg-blue-50 text-blue-700 border-blue-100',
  'Belum PKL': 'bg-gray-100 text-gray-600 border-gray-200',
  Selesai: 'bg-green-50 text-green-700 border-green-100',
  // Status penempatan
  Draft: 'bg-amber-50 text-amber-700 border-amber-100',
  Diajukan: 'bg-blue-50 text-blue-700 border-blue-100',
  Diterima: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Ditolak: 'bg-red-50 text-red-700 border-red-100',
  // Status jurnal
  Menunggu: 'bg-amber-50 text-amber-700 border-amber-100',
  Disetujui: 'bg-green-50 text-green-700 border-green-100',
  Revisi: 'bg-red-50 text-red-700 border-red-100',
  // Status umum
  Aktif: 'bg-green-50 text-green-700 border-green-100',
  'Tidak Aktif': 'bg-gray-100 text-gray-600 border-gray-200',
  NonAktif: 'bg-gray-100 text-gray-600 border-gray-200',
  // Kategori Match Score (Recommendation)
  'Sangat Sesuai': 'bg-green-50 text-green-700 border-green-100',
  Sesuai: 'bg-blue-50 text-blue-700 border-blue-100',
  'Cukup Sesuai': 'bg-amber-50 text-amber-700 border-amber-100',
  'Kurang Sesuai': 'bg-gray-100 text-gray-600 border-gray-200',
};

const Badge = ({ status, children }) => {
  const cls = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {children || status}
    </span>
  );
};

export default Badge;
