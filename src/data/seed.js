// Data awal (mock) untuk EduPKL — Sistem Talent Matching Berbasis User Profiling
// untuk Menyesuaikan Kebutuhan Perusahaan (Studi Kasus: EduPKL SMKS Rajasa Surabaya).
// Struktur data ini mengikuti Dokumen Perancangan Sistem & Dokumen Analisis Sistem
// (Capstone Project, Kelompok 1 — Prodi Sistem Informasi, Unesa).
//
// Semua data ini hanya seed awal; setelah pertama kali dimuat, data disimpan dan
// diubah lewat localStorage (lihat src/context/DataContext.jsx).

// --- Referensi statis (Lampiran 8.9 & 8.10 Dokumen Perancangan Sistem) -------------

// Kamus Keyword Jurusan: dipakai mesin matching untuk mencocokkan kompetensi siswa
// dengan kebutuhan kompetensi perusahaan berdasarkan jurusan.
export const keywordJurusan = {
  RPL: ["Programming", "Coding", "Database", "Web", "Frontend", "Backend", "API", "JavaScript", "PHP", "Python"],
  TKJ: ["Jaringan", "Networking", "Router", "Switch", "Troubleshooting", "Server", "Mikrotik", "Hardware", "Maintenance", "CCTV"],
  MM: ["Desain Grafis", "Multimedia", "Editing Video", "Animasi", "Adobe", "Fotografi", "Broadcasting"],
  TBSM: ["Sepeda Motor", "Kelistrikan Otomotif", "Perbaikan Mesin", "Perawatan Kendaraan"],
};

// Mapping Bidang Usaha → Jurusan Relevan (CD-4 §5.3, 11 bidang usaha resmi —
// dipakai sebagai skor cadangan/parsial pada komponen "Pendidikan/Jurusan"
// jika jurusan siswa tidak match langsung; sudah sinkron dengan tabel
// bidang_jurusan_map di backend/database/schema.sql).
export const bidangJurusanMap = {
  "Teknologi Informasi dan Komunikasi (TIK)": ["RPL", "TKJ", "MM", "Animasi", "Broadcasting"],
  "Service Komputer": ["TKJ"],
  "Pemasangan CCTV": ["TKJ"],
  "Penarikan Kabel Jaringan dan Fiber optic": ["TKJ"],
  "Bisnis dan Manajemen": ["BDP", "MP", "AKL"],
  Otomotif: ["TBSM", "TPM"],
  Ketenagalistrikan: ["TITL"],
  "Seni dan Desain": ["DKV", "Tata Busana"],
  "Pariwisata dan Kuliner": ["Perhotelan", "Tata Boga"],
  Kesehatan: ["Farmasi", "Keperawatan"],
  "Industri Kreatif": ["MM", "Animasi", "Broadcasting", "DKV"],
};

export const daftarBidangUsaha = Object.keys(bidangJurusanMap);

// 17 jurusan resmi (Kamus Keyword Jurusan, CD-4 §5.2) — sinkron dengan tabel
// keywords di backend.
export const daftarJurusan = [
  "RPL", "TKJ", "MM", "MP", "AKL", "BDP", "TBSM", "TPM", "TITL", "DKV",
  "Perhotelan", "Tata Boga", "Tata Busana", "Farmasi", "Keperawatan", "Animasi", "Broadcasting",
];

// --- Data siswa (User Profiling) ---------------------------------------------------

export const seedSiswa = [
  {
    id: "s1", nisn: "0082076075", nama: "Nabil Ahza Syawal", jenisKelamin: "L", kelas: "XII TKJ 2", jurusan: "TKJ",
    alamat: "Jl. Muteran 2/4a", hp: "081238382303", email: "nabil.ahza@smk.sch.id", status: "Berlangsung",
    pendidikan: "SMK Kelas XII — Teknik Komputer dan Jaringan",
    pengalaman: [
      { judul: "Praktik Maintenance Jaringan Lab Sekolah", deskripsi: "Membantu perawatan & troubleshooting jaringan LAN laboratorium komputer selama 2 bulan." },
    ],
    minat: ["Jaringan Komputer", "Troubleshooting Hardware"],
    preferensi: "Lokasi Surabaya, jenis pekerjaan Teknisi Jaringan",
    portofolio: "",
  },
  { id: "s2", nisn: "0098199053", nama: "Aahmes Raistino Prayogo", kelas: "XI TKJ 1", jurusan: "TKJ", jenisKelamin: "L", alamat: "Jl. Donowati GG.4 No.38", hp: "088989118985", email: "aahmes.raistino@smk.sch.id", status: "Belum PKL", pendidikan: "SMK Kelas XI — Teknik Komputer dan Jaringan", pengalaman: [], minat: [], preferensi: "", portofolio: "" },
  { id: "s3", nisn: "0101165855", nama: "Abdee Nugraha Pratama", kelas: "XI TKJ 1", jurusan: "TKJ", jenisKelamin: "L", alamat: "Jl. Kalijudan XI No.28, Surabaya", hp: "081234567890", email: "abdee.nugraha@smk.sch.id", status: "Berlangsung", pendidikan: "SMK Kelas XI — Teknik Komputer dan Jaringan", pengalaman: [{ judul: "Ekstrakurikuler Jaringan Komputer", deskripsi: "Aktif di ekskul konfigurasi jaringan sekolah." }], minat: ["Jaringan Komputer"], preferensi: "Jenis pekerjaan Teknisi Jaringan", portofolio: "" },
  { id: "s4", nisn: "0093452750", nama: "Ade Kurnia Putra", kelas: "XI TKJ 1", jurusan: "TKJ", jenisKelamin: "L", alamat: "Banyuurip Wetan Gg 4 No 36", hp: "085607875848", email: "ade.kurnia@smk.sch.id", status: "Belum PKL", pendidikan: "SMK Kelas XI — Teknik Komputer dan Jaringan", pengalaman: [], minat: [], preferensi: "", portofolio: "" },
  { id: "s5", nisn: "0093602684", nama: "Adi Sanjaya Putra", kelas: "XI TKJ 1", jurusan: "TKJ", jenisKelamin: "L", alamat: "Simo Kalangan No 232", hp: "081234567890", email: "adi.sanjaya@smk.sch.id", status: "Selesai", pendidikan: "SMK Kelas XI — Teknik Komputer dan Jaringan", pengalaman: [{ judul: "PKL di PT Kreasi Media Interaktif", deskripsi: "Membantu tim multimedia menyiapkan aset digital." }], minat: ["Multimedia"], preferensi: "", portofolio: "" },
  {
    id: "s6", nisn: "0087734521", nama: "Cindy Amelia Putri", kelas: "XI RPL 1", jurusan: "RPL", jenisKelamin: "P",
    alamat: "Jl. Kertajaya Indah No.12", hp: "082234455667", email: "cindy.amelia@smk.sch.id", status: "Berlangsung",
    pendidikan: "SMK Kelas XI — Rekayasa Perangkat Lunak",
    pengalaman: [{ judul: "Tugas Sekolah: Website Sederhana", deskripsi: "Membuat website portofolio kelas menggunakan HTML, CSS, dan JavaScript." }],
    minat: ["Pemrograman Web", "Basis Data"],
    preferensi: "Lokasi Surabaya, jenis pekerjaan Junior Web Developer",
    portofolio: "",
  },
  { id: "s7", nisn: "0091122334", nama: "Dewi Anggraini", kelas: "XI RPL 1", jurusan: "RPL", jenisKelamin: "P", alamat: "Jl. Manyar Sabrangan No.5", hp: "081345678990", email: "dewi.anggraini@smk.sch.id", status: "Selesai", pendidikan: "SMK Kelas XI — Rekayasa Perangkat Lunak", pengalaman: [{ judul: "PKL di PT Nusantara Digital Teknologi", deskripsi: "Membantu tim developer memperbaiki tampilan aplikasi internal." }], minat: ["Pemrograman Web"], preferensi: "", portofolio: "" },
  { id: "s8", nisn: "0095566778", nama: "Farrel Ramadhan", kelas: "XII TKJ 2", jurusan: "TKJ", jenisKelamin: "L", alamat: "Jl. Gubeng Kertajaya VII/2", hp: "085711223344", email: "farrel.ramadhan@smk.sch.id", status: "Belum PKL", pendidikan: "SMK Kelas XII — Teknik Komputer dan Jaringan", pengalaman: [], minat: [], preferensi: "", portofolio: "" },
];

// --- Competency Profiling -----------------------------------------------------------

export const seedKompetensi = [
  { id: "k1", siswaId: "s1", nama: "Konfigurasi Jaringan (Router/Switch)", kategori: "Teknis", tingkat: "Menengah", pengalamanTerkait: "Praktik konfigurasi Mikrotik di lab sekolah", sertifikasi: "" },
  { id: "k2", siswaId: "s1", nama: "Troubleshooting Jaringan", kategori: "Teknis", tingkat: "Menengah", pengalamanTerkait: "", sertifikasi: "" },
  { id: "k3", siswaId: "s1", nama: "Instalasi & Perawatan Hardware Komputer", kategori: "Teknis", tingkat: "Mahir", pengalamanTerkait: "", sertifikasi: "Sertifikat Rakit PC — Pelatihan Sekolah" },
  { id: "k4", siswaId: "s3", nama: "Konfigurasi Jaringan Dasar", kategori: "Teknis", tingkat: "Pemula", pengalamanTerkait: "Ekskul Jaringan Komputer", sertifikasi: "" },
  { id: "k5", siswaId: "s6", nama: "Pemrograman Web (HTML/CSS/JavaScript)", kategori: "Teknis", tingkat: "Menengah", pengalamanTerkait: "Tugas sekolah membuat website sederhana", sertifikasi: "" },
  { id: "k6", siswaId: "s6", nama: "Basis Data (SQL)", kategori: "Teknis", tingkat: "Pemula", pengalamanTerkait: "", sertifikasi: "" },
];

// --- Company Profiling & Company Requirement ----------------------------------------

export const seedPerusahaan = [
  {
    id: "p1", nama: "PT Nusantara Digital Teknologi", bidang: "TIK", alamat: "Jl. Raya Darmo No.45, Surabaya",
    telepon: "0315678901", email: "hrd@nusantaradigital.co.id", penanggungJawab: "Rudi Hartono", kuota: 4, status: "Aktif",
    posisi: "Web Developer", kompetensiDibutuhkan: ["Programming", "JavaScript", "Web", "Frontend"],
    jurusanRelevan: ["RPL"], tingkatPengalaman: "Pemula", pendidikanDibutuhkan: "SMK/Sederajat Jurusan RPL", kriteriaLain: "Mampu bekerja dalam tim",
  },
  {
    id: "p2", nama: "CV Jaringan Prima Solusi", bidang: "Service Komputer", alamat: "Jl. HR Muhammad No.12, Surabaya",
    telepon: "0317788990", email: "info@jaringanprima.co.id", penanggungJawab: "Siti Aminah", kuota: 3, status: "Aktif",
    posisi: "Teknisi Jaringan", kompetensiDibutuhkan: ["Jaringan", "Router", "Switch", "Troubleshooting"],
    jurusanRelevan: ["TKJ"], tingkatPengalaman: "Tidak Diperlukan", pendidikanDibutuhkan: "SMK/Sederajat Jurusan TKJ", kriteriaLain: "Teliti dan disiplin",
  },
  {
    id: "p3", nama: "PT Kreasi Media Interaktif", bidang: "TIK", alamat: "Jl. Ngagel Jaya No.88, Surabaya",
    telepon: "0315544332", email: "hr@kreasimedia.co.id", penanggungJawab: "Bagus Wicaksono", kuota: 2, status: "Aktif",
    posisi: "Desainer Multimedia", kompetensiDibutuhkan: ["Desain Grafis", "Multimedia", "Editing Video"],
    jurusanRelevan: ["MM"], tingkatPengalaman: "Pemula", pendidikanDibutuhkan: "SMK/Sederajat Jurusan Multimedia", kriteriaLain: "Kreatif",
  },
  {
    id: "p4", nama: "PT Teknologi Data Mandiri", bidang: "TIK", alamat: "Jl. Kenjeran No.200, Surabaya",
    telepon: "0316677889", email: "recruitment@tekdatamandiri.co.id", penanggungJawab: "Yuni Kartika", kuota: 3, status: "Aktif",
    posisi: "Junior Database Developer", kompetensiDibutuhkan: ["Database", "Programming", "Backend"],
    jurusanRelevan: ["RPL"], tingkatPengalaman: "Menengah", pendidikanDibutuhkan: "SMK/Sederajat Jurusan RPL", kriteriaLain: "Memahami dasar basis data",
  },
  {
    id: "p5", nama: "Bengkel Otomotif Mandiri Jaya", bidang: "Otomotif", alamat: "Jl. Kedung Cowek No.77, Surabaya",
    telepon: "0313344556", email: "kontak@otomotifmandiri.co.id", penanggungJawab: "Hendra Saputra", kuota: 2, status: "Tidak Aktif",
    posisi: "Teknisi Otomotif", kompetensiDibutuhkan: ["Perbaikan Mesin", "Kelistrikan Otomotif"],
    jurusanRelevan: ["TBSM"], tingkatPengalaman: "Tidak Diperlukan", pendidikanDibutuhkan: "SMK/Sederajat Jurusan TBSM", kriteriaLain: "",
  },
];

// --- Kelompok Magang ------------------------------------------------------------------

export const seedKelompokMagang = [
  { id: "km1", nama: "Kelompok Magang PT Nusantara Digital Teknologi", perusahaanId: "p1", pembimbingGuru: "Drs. Bambang Supriyadi", anggotaSiswaIds: ["s1"], periodeMulai: "2026-07-06", periodeSelesai: "2026-12-19", status: "Aktif" },
  { id: "km2", nama: "Kelompok Magang CV Jaringan Prima Solusi", perusahaanId: "p2", pembimbingGuru: "Dra. Yuliati Ningsih", anggotaSiswaIds: ["s3"], periodeMulai: "2026-07-06", periodeSelesai: "2026-12-19", status: "Aktif" },
  { id: "km3", nama: "Kelompok Magang PT Teknologi Data Mandiri", perusahaanId: "p4", pembimbingGuru: "Dra. Yuliati Ningsih", anggotaSiswaIds: ["s6"], periodeMulai: "2026-07-06", periodeSelesai: "2026-12-19", status: "Aktif" },
  { id: "km4", nama: "Kelompok Magang PT Kreasi Media Interaktif (Genap 2025/2026)", perusahaanId: "p3", pembimbingGuru: "Drs. Bambang Supriyadi", anggotaSiswaIds: ["s5"], periodeMulai: "2026-01-05", periodeSelesai: "2026-06-20", status: "Selesai" },
  { id: "km5", nama: "Kelompok Magang PT Nusantara Digital Teknologi (Genap 2025/2026)", perusahaanId: "p1", pembimbingGuru: "Drs. Bambang Supriyadi", anggotaSiswaIds: ["s7"], periodeMulai: "2026-01-05", periodeSelesai: "2026-06-20", status: "Selesai" },
];

// --- Penempatan & Penerimaan ----------------------------------------------------------

export const seedPenempatan = [
  { id: "pl1", siswaId: "s1", perusahaanId: "p1", kelompokMagangId: "km1", guruPembimbing: "Drs. Bambang Supriyadi", tanggalMulai: "2026-07-06", tanggalSelesai: "2026-12-19", status: "Berlangsung" },
  { id: "pl2", siswaId: "s3", perusahaanId: "p2", kelompokMagangId: "km2", guruPembimbing: "Dra. Yuliati Ningsih", tanggalMulai: "2026-07-06", tanggalSelesai: "2026-12-19", status: "Berlangsung" },
  { id: "pl3", siswaId: "s5", perusahaanId: "p3", kelompokMagangId: "km4", guruPembimbing: "Drs. Bambang Supriyadi", tanggalMulai: "2026-01-05", tanggalSelesai: "2026-06-20", status: "Selesai" },
  { id: "pl4", siswaId: "s6", perusahaanId: "p4", kelompokMagangId: "km3", guruPembimbing: "Dra. Yuliati Ningsih", tanggalMulai: "2026-07-06", tanggalSelesai: "2026-12-19", status: "Berlangsung" },
  { id: "pl5", siswaId: "s7", perusahaanId: "p1", kelompokMagangId: "km5", guruPembimbing: "Drs. Bambang Supriyadi", tanggalMulai: "2026-01-05", tanggalSelesai: "2026-06-20", status: "Selesai" },
  { id: "pl6", siswaId: "s2", perusahaanId: "p2", kelompokMagangId: null, guruPembimbing: "Dra. Yuliati Ningsih", tanggalMulai: "2026-09-15", tanggalSelesai: "2027-02-28", status: "Diajukan" },
];

// --- Journal Management ---------------------------------------------------------------

export const seedJurnal = [
  { id: "j1", penempatanId: "pl1", siswaId: "s1", tanggal: "2026-09-07", kegiatan: "Mempelajari struktur project React perusahaan dan setup environment development.", kendala: "Belum familiar dengan struktur folder yang dipakai.", status: "Disetujui", catatanPembimbing: "Bagus, terus semangat belajar." },
  { id: "j2", penempatanId: "pl1", siswaId: "s1", tanggal: "2026-09-08", kegiatan: "Membantu memperbaiki tampilan halaman login pada aplikasi internal.", kendala: "", status: "Disetujui", catatanPembimbing: "Kerja rapi." },
  { id: "j3", penempatanId: "pl1", siswaId: "s1", tanggal: "2026-09-09", kegiatan: "Ikut meeting daily standup tim dan mencatat task baru.", kendala: "", status: "Menunggu", catatanPembimbing: "" },
  { id: "j4", penempatanId: "pl2", siswaId: "s3", tanggal: "2026-09-08", kegiatan: "Konfigurasi router dan switch untuk jaringan kantor cabang baru.", kendala: "Kabel UTP terbatas, menunggu pengadaan.", status: "Disetujui", catatanPembimbing: "Catat kendala di laporan mingguan." },
  { id: "j5", penempatanId: "pl4", siswaId: "s6", tanggal: "2026-09-09", kegiatan: "Membuat query laporan penjualan bulanan menggunakan SQL.", kendala: "", status: "Menunggu", catatanPembimbing: "" },
];

// --- Users (Authentication & Role-Based Access) ----------------------------------------

export const seedUsers = [
  { id: "u1", nama: "Wahyu Firo", username: "admin", email: "admin@edupkl.sch.id", role: "Administrator", linkedId: null, status: "Aktif" },
  { id: "u2", nama: "Siti Rahmawati", username: "petugas.s", email: "siti.rahmawati@edupkl.sch.id", role: "Petugas", linkedId: null, status: "Aktif" },
  { id: "u3", nama: "Drs. Bambang Supriyadi", username: "guru.b", email: "bambang.supriyadi@edupkl.sch.id", role: "Guru", linkedId: null, status: "Aktif" },
  { id: "u4", nama: "Dra. Yuliati Ningsih", username: "guru.y", email: "yuliati.ningsih@edupkl.sch.id", role: "Guru", linkedId: null, status: "Aktif" },
  { id: "u5", nama: "Nabil Ahza Syawal", username: "nabil.ahza", email: "nabil.ahza@smk.sch.id", role: "Siswa", linkedId: "s1", status: "Aktif" },
];

export const seedSettings = {
  namaSekolah: "SMKS Rajasa Surabaya",
  npsn: "20531xxx",
  alamatSekolah: "Jl. Pendidikan No.1, Surabaya",
  kepalaSekolah: "Dr. Hariyanto, M.Pd.",
  tahunAjaran: "2026/2027",
  periodePklMulai: "2026-07-06",
  periodePklSelesai: "2026-12-19",
};

export function seedDatabase() {
  return {
    siswa: seedSiswa,
    kompetensi: seedKompetensi,
    perusahaan: seedPerusahaan,
    kelompokMagang: seedKelompokMagang,
    penempatan: seedPenempatan,
    jurnal: seedJurnal,
    users: seedUsers,
    settings: seedSettings,
  };
}
