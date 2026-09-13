# EduPKL

Sistem manajemen Praktik Kerja Lapangan (PKL) untuk siswa SMK — mengelola siswa,
perusahaan/DU-DI, penempatan, jurnal harian, absensi, penilaian, hingga laporan
& sertifikat, dalam satu aplikasi web.

Status: **prototipe frontend** (belum terhubung ke backend/database sungguhan).
Semua data disimpan di `localStorage` browser dan diisi awal dari data contoh
di `src/data/seed.js`.

## Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router v7
- lucide-react (ikon)

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`, lalu login memakai salah satu **akun demo** yang
tersedia di halaman login (satu akun per peran): Admin, Pembimbing Sekolah,
Pembimbing DU/DI, dan Siswa.

## Struktur peran

| Peran | Bisa mengakses |
|---|---|
| Admin | Semua modul: siswa, perusahaan, penempatan, jurnal, absensi, penilaian, laporan, pengguna, pengaturan |
| Pembimbing Sekolah | Siswa, perusahaan (lihat), penempatan (siswa bimbingannya), jurnal & absensi (tinjau), penilaian, laporan |
| Pembimbing DU/DI | Perusahaan miliknya, penempatan & siswa PKL di perusahaannya, jurnal & absensi (tinjau), penilaian, laporan |
| Siswa | Dashboard pribadi, isi jurnal harian, absensi (masuk/keluar), lihat nilai & sertifikat sendiri |

## Struktur folder penting

```
src/
  data/seed.js              # data contoh awal (siswa, perusahaan, penempatan, dst.)
  context/DataContext.jsx   # state + CRUD, persist ke localStorage
  context/AuthContext.jsx   # login/logout mock + daftar akun demo
  config/menu.js            # menu sidebar per peran
  utils/scope.js            # pembatasan data sesuai peran yang login
  layouts/DashboardLayout.jsx
  pages/
    Login/  Dashboard/  Siswa/  Perusahaan/  Penempatan/
    Jurnal/  Absensi/  Penilaian/  Laporan/  Pengguna/  Pengaturan/
```

## Rencana lanjutan (belum dikerjakan)

- Backend & database sungguhan (mis. Node.js/Express + PostgreSQL) menggantikan
  `localStorage`, termasuk autentikasi & hashing password yang sebenarnya.
- Import data siswa dari Excel.
- Notifikasi (jurnal baru masuk, penilaian selesai, dsb).
- Export laporan ke PDF/Excel.
