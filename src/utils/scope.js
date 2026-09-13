// Helper untuk membatasi (scoping) data sesuai peran user yang sedang login —
// mengikuti Aktor & Hak Akses Sistem (2.8) pada Dokumen Perancangan Sistem:
//   Administrator — akses penuh ke seluruh data.
//   Petugas       — mengelola siswa, perusahaan, kelompok magang, penempatan (akses penuh, operasional).
//   Guru          — memantau siswa & kelompok magang yang menjadi bimbingannya saja.
//   Siswa         — hanya data miliknya sendiri.

export function scopedPenempatan(user, penempatan) {
  if (!user) return [];
  switch (user.role) {
    case 'Administrator':
    case 'Petugas':
      return penempatan;
    case 'Guru':
      return penempatan.filter((p) => p.guruPembimbing === user.nama);
    case 'Siswa':
      return penempatan.filter((p) => p.siswaId === user.linkedId);
    default:
      return [];
  }
}

export function scopedKelompokMagang(user, kelompokMagang) {
  if (!user) return [];
  switch (user.role) {
    case 'Administrator':
    case 'Petugas':
      return kelompokMagang;
    case 'Guru':
      return kelompokMagang.filter((k) => k.pembimbingGuru === user.nama);
    case 'Siswa':
      return kelompokMagang.filter((k) => (k.anggotaSiswaIds || []).includes(user.linkedId));
    default:
      return [];
  }
}

// Mengembalikan Set berisi siswaId yang boleh dilihat oleh user (dipakai
// untuk memfilter data yang berelasi ke siswa, mis. jurnal).
export function scopedSiswaIds(user, penempatan) {
  return new Set(scopedPenempatan(user, penempatan).map((p) => p.siswaId));
}

export function findById(list, id) {
  return list.find((item) => item.id === id) || null;
}
