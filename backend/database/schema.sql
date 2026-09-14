-- =====================================================================
-- EduPKL — Sistem Talent Matching Berbasis User Profiling
-- Studi Kasus: EduPKL SMKS Rajasa Surabaya
-- Skema Database (MySQL 8 / MariaDB — kompatibel phpMyAdmin & XAMPP)
--
-- Sumber acuan struktur: Dokumen Perancangan Sistem (CD-3) §5.7 Class
-- Diagram & §5.8 ERD, Dokumen Implementasi Sistem (CD-4) §5.2 Kamus
-- Keyword Jurusan, §5.3 Mapping Bidang Usaha–Jurusan, §4.3 Dokumentasi
-- Database (placeholder konseptual — skema ini adalah realisasinya).
--
-- CATATAN PENTING (baca sebelum import):
-- Skema ini adalah SUPERSET dari ERD resmi CD-3 §5.8 (13 tabel inti).
-- ERD resmi itu sendiri menyatakan: "struktur tabel di atas adalah
-- rancangan desain... jika database aktual tersedia, bagian ERD
-- sebaiknya disesuaikan" — skema di bawah ini ADALAH penyesuaian itu.
-- 6 tabel tambahan di luar 13 tabel ERD resmi (auth_tokens,
-- bidang_jurusan_map, student_interests, student_experiences,
-- requirement_majors, requirement_competencies) adalah keputusan
-- desain tambahan untuk membuat sistem benar-benar berfungsi sebagai
-- REST API (bukan lagi localStorage) — lihat CATATAN_PERUBAHAN_SKEMA.md
-- untuk daftar lengkap & alasan tiap perubahan (dipakai nanti untuk
-- revisi minor CD-3/CD-4).
--
-- TIDAK ADA data siswa/perusahaan contoh (fiktif maupun asli) yang
-- di-seed di file ini — tabel `students` & `companies` sengaja
-- dikosongkan, diisi nanti lewat aplikasi dengan data sungguhan.
-- Data referensi (keywords, bidang_jurusan_map, competencies) DIISI
-- PENUH karena itu memang konten resmi dari dokumen CD-4 §5.2/§5.3,
-- bukan data pribadi siapa pun.
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS EDUPKL_CapstoneProject CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE EDUPKL_CapstoneProject;

-- =====================================================================
-- 1. USERS — Authentication & Role-Based Access
-- Role resmi (CD-2 §2.8, CD-3 §5.10): Administrator, Petugas, Guru, Siswa
-- =====================================================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL COMMENT 'bcrypt hash via password_hash()',
  nama          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NULL UNIQUE,
  role          ENUM('Administrator','Petugas','Guru','Siswa') NOT NULL,
  status        ENUM('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- =====================================================================
-- 2. AUTH_TOKENS — [TAMBAHAN] token API sederhana, ganti mekanisme
-- login mock (tanpa password) di frontend lama. Dikirim frontend
-- sebagai header: Authorization: Bearer <token>
-- =====================================================================
DROP TABLE IF EXISTS auth_tokens;
CREATE TABLE auth_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token       CHAR(64) NOT NULL UNIQUE COMMENT 'bin2hex(random_bytes(32))',
  expires_at  DATETIME NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_auth_tokens_user (user_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 3. KEYWORDS — Kamus Keyword Jurusan (CD-4 §5.2, Lampiran resmi)
-- Dipakai Matching Engine untuk overlap kompetensi siswa vs kebutuhan
-- perusahaan. Data referensi resmi — bukan data pribadi, aman diisi
-- penuh. 17 jurusan (frontend lama baru implementasi 4 dari 17 ini).
-- =====================================================================
DROP TABLE IF EXISTS keywords;
CREATE TABLE keywords (
  id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  jurusan  VARCHAR(20)  NOT NULL,
  keyword  VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_keywords (jurusan, keyword),
  INDEX idx_keywords_jurusan (jurusan)
) ENGINE=InnoDB;

INSERT INTO keywords (jurusan, keyword) VALUES
('RPL','programming'),('RPL','coding'),('RPL','software'),('RPL','database'),('RPL','web'),
('RPL','mobile'),('RPL','API'),('RPL','frontend'),('RPL','backend'),('RPL','python'),
('RPL','java'),('RPL','php'),('RPL','javascript'),('RPL','html'),('RPL','css'),
('TKJ','jaringan'),('TKJ','router'),('TKJ','switch'),('TKJ','server'),('TKJ','LAN'),
('TKJ','WAN'),('TKJ','mikrotik'),('TKJ','cisco'),('TKJ','subnet'),('TKJ','firewall'),
('TKJ','DNS'),('TKJ','DHCP'),('TKJ','proxy'),('TKJ','CCTV'),('TKJ','service komputer'),('TKJ','input data'),
('MM','multimedia'),('MM','grafis'),('MM','video'),('MM','editing'),('MM','animasi'),
('MM','fotografi'),('MM','desain'),('MM','coreldraw'),('MM','photoshop'),('MM','premiere'),('MM','aftereffects'),
('MP','administrasi'),('MP','perkantoran'),('MP','dokumen'),('MP','arsip'),('MP','surat'),
('MP','kearsipan'),('MP','layanan'),('MP','komunikasi'),('MP','agenda'),
('AKL','akuntansi'),('AKL','keuangan'),('AKL','jurnal'),('AKL','pembukuan'),('AKL','neraca'),
('AKL','pajak'),('AKL','audit'),('AKL','SAP'),('AKL','excel'),
('BDP','bisnis'),('BDP','marketing'),('BDP','penjualan'),('BDP','iklan'),('BDP','produk'),
('BDP','branding'),('BDP','negosiasi'),('BDP','digital marketing'),
('TBSM','sepeda motor'),('TBSM','otomotif'),('TBSM','servis'),('TBSM','mesin'),('TBSM','injeksi'),
('TBSM','mekanik'),('TBSM','tune up'),
('TPM','pemesinan'),('TPM','bubut'),('TPM','frais'),('TPM','las'),('TPM','cnc'),
('TPM','produksi'),('TPM','teknik mesin'),
('TITL','instalasi listrik'),('TITL','tenaga listrik'),('TITL','panel'),('TITL','arus'),
('TITL','kontrol'),('TITL','rangkaian'),('TITL','kelistrikan'),
('DKV','desain'),('DKV','komunikasi visual'),('DKV','branding'),('DKV','poster'),('DKV','logo'),
('DKV','tipografi'),('DKV','layout'),('DKV','grafis'),
('Perhotelan','front office'),('Perhotelan','housekeeping'),('Perhotelan','reservasi'),
('Perhotelan','tamu'),('Perhotelan','pelayanan'),('Perhotelan','hospitality'),
('Tata Boga','memasak'),('Tata Boga','resep'),('Tata Boga','hidangan'),('Tata Boga','restoran'),
('Tata Boga','katering'),('Tata Boga','kuliner'),('Tata Boga','makanan'),
('Tata Busana','menjahit'),('Tata Busana','pola'),('Tata Busana','desain busana'),('Tata Busana','fashion'),
('Tata Busana','kain'),('Tata Busana','model'),('Tata Busana','tata busana'),
('Farmasi','obat'),('Farmasi','apotek'),('Farmasi','resep'),('Farmasi','dosis'),
('Farmasi','farmakologi'),('Farmasi','kesehatan'),
('Keperawatan','perawatan'),('Keperawatan','pasien'),('Keperawatan','kesehatan'),
('Keperawatan','rumah sakit'),('Keperawatan','p3k'),('Keperawatan','vital sign'),
('Animasi','animasi 2D'),('Animasi','animasi 3D'),('Animasi','rigging'),('Animasi','rendering'),
('Animasi','motion graphic'),('Animasi','storyboard'),
('Broadcasting','video'),('Broadcasting','siaran'),('Broadcasting','radio'),('Broadcasting','televisi'),
('Broadcasting','kamera'),('Broadcasting','editing'),('Broadcasting','sutradara');

-- =====================================================================
-- 4. BIDANG_JURUSAN_MAP — Mapping Bidang Usaha–Jurusan (CD-4 §5.3)
-- Skor cadangan/parsial komponen Pendidikan/Jurusan jika jurusan siswa
-- tidak match langsung ke jurusanRelevan perusahaan.
-- =====================================================================
DROP TABLE IF EXISTS bidang_jurusan_map;
CREATE TABLE bidang_jurusan_map (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bidang_usaha  VARCHAR(60) NOT NULL,
  jurusan       VARCHAR(20) NOT NULL,
  UNIQUE KEY uq_bidang_jurusan (bidang_usaha, jurusan)
) ENGINE=InnoDB;

INSERT INTO bidang_jurusan_map (bidang_usaha, jurusan) VALUES
('Teknologi Informasi dan Komunikasi (TIK)','RPL'),
('Teknologi Informasi dan Komunikasi (TIK)','TKJ'),
('Teknologi Informasi dan Komunikasi (TIK)','MM'),
('Teknologi Informasi dan Komunikasi (TIK)','Animasi'),
('Teknologi Informasi dan Komunikasi (TIK)','Broadcasting'),
('Service Komputer','TKJ'),
('Pemasangan CCTV','TKJ'),
('Penarikan Kabel Jaringan dan Fiber optic','TKJ'),
('Bisnis dan Manajemen','BDP'),
('Bisnis dan Manajemen','MP'),
('Bisnis dan Manajemen','AKL'),
('Otomotif','TBSM'),
('Otomotif','TPM'),
('Ketenagalistrikan','TITL'),
('Seni dan Desain','DKV'),
('Seni dan Desain','Tata Busana'),
('Pariwisata dan Kuliner','Perhotelan'),
('Pariwisata dan Kuliner','Tata Boga'),
('Kesehatan','Farmasi'),
('Kesehatan','Keperawatan'),
('Industri Kreatif','MM'),
('Industri Kreatif','Animasi'),
('Industri Kreatif','Broadcasting'),
('Industri Kreatif','DKV');

-- =====================================================================
-- 5. STUDENTS (siswa) — User Profiling
-- Superset field ERD resmi (student_id, user_id, nis, name, major,
-- education, experience, interest, preference) + field yang sudah
-- dipakai frontend aktual (jenis_kelamin, kelas, alamat, no_hp, email,
-- status, portofolio). `experience` & `interest` dinormalisasi jadi
-- tabel terpisah (lihat #6, #7) — bukan TEXT/JSON blob.
-- =====================================================================
DROP TABLE IF EXISTS students;
CREATE TABLE students (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NULL UNIQUE COMMENT 'NULL = profil dibuat petugas, belum ada akun login',
  nisn          VARCHAR(20)  NOT NULL UNIQUE,
  nama          VARCHAR(150) NOT NULL,
  jenis_kelamin ENUM('L','P') NOT NULL,
  kelas         VARCHAR(20)  NOT NULL,
  jurusan       VARCHAR(20)  NOT NULL,
  alamat        VARCHAR(255) NULL,
  no_hp         VARCHAR(20)  NULL,
  email         VARCHAR(150) NULL,
  pendidikan    VARCHAR(150) NULL,
  preferensi    VARCHAR(255) NULL,
  portofolio    VARCHAR(255) NULL,
  status        ENUM('Belum PKL','Diajukan','Berlangsung','Selesai') NOT NULL DEFAULT 'Belum PKL',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_students_jurusan (jurusan),
  INDEX idx_students_status (status)
) ENGINE=InnoDB;
-- SENGAJA KOSONG (0 baris). Diisi lewat aplikasi dengan data siswa
-- sungguhan setelah sekolah menyetujui akses data — lihat catatan PII
-- di project_capstone_status.md sebelum mengisi data apa pun di sini.

-- =====================================================================
-- 6. STUDENT_INTERESTS — [TAMBAHAN] normalisasi field `minat[]`
-- =====================================================================
DROP TABLE IF EXISTS student_interests;
CREATE TABLE student_interests (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id  INT UNSIGNED NOT NULL,
  minat       VARCHAR(100) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_interests_student (student_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 7. STUDENT_EXPERIENCES — [TAMBAHAN] normalisasi field `pengalaman[]`
-- =====================================================================
DROP TABLE IF EXISTS student_experiences;
CREATE TABLE student_experiences (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id  INT UNSIGNED NOT NULL,
  judul       VARCHAR(150) NOT NULL,
  deskripsi   TEXT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_experiences_student (student_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 8. COMPETENCIES — Competency Profiling (master kompetensi)
-- Dikurasi dari Kamus Keyword Jurusan + kompetensi umum PKL, supaya
-- input kompetensi siswa konsisten (bukan free-text tanpa standar).
-- =====================================================================
DROP TABLE IF EXISTS competencies;
CREATE TABLE competencies (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama       VARCHAR(150) NOT NULL UNIQUE,
  kategori   VARCHAR(50)  NULL COMMENT 'mis. Teknis, Non-Teknis/Soft Skill',
  deskripsi  TEXT NULL
) ENGINE=InnoDB;

INSERT INTO competencies (nama, kategori) VALUES
('Konfigurasi Jaringan (Router/Switch)','Teknis'),
('Troubleshooting Jaringan','Teknis'),
('Instalasi & Perawatan Hardware Komputer','Teknis'),
('Pemrograman Web (HTML/CSS/JavaScript)','Teknis'),
('Basis Data (SQL)','Teknis'),
('Pemrograman Backend (PHP/Python/Java)','Teknis'),
('Desain Grafis','Teknis'),
('Editing Video','Teknis'),
('Administrasi Perkantoran','Teknis'),
('Akuntansi & Pembukuan','Teknis'),
('Pemasaran Digital','Teknis'),
('Perbaikan Mesin Otomotif','Teknis'),
('Instalasi Kelistrikan','Teknis'),
('Komunikasi & Kerja Tim','Non-Teknis'),
('Manajemen Waktu','Non-Teknis');
-- Daftar awal ini BOLEH ditambah lewat aplikasi (bukan daftar tertutup);
-- tidak mengklaim final/lengkap, hanya starting point yang wajar.

-- =====================================================================
-- 9. STUDENT_COMPETENCIES
-- =====================================================================
DROP TABLE IF EXISTS student_competencies;
CREATE TABLE student_competencies (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id          INT UNSIGNED NOT NULL,
  competency_id       INT UNSIGNED NOT NULL,
  tingkat             ENUM('Pemula','Menengah','Mahir') NOT NULL DEFAULT 'Pemula',
  pengalaman_terkait  TEXT NULL,
  sertifikasi         VARCHAR(150) NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (competency_id) REFERENCES competencies(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_student_competency (student_id, competency_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 10. COMPANIES (perusahaan) — Company Profiling
-- =====================================================================
DROP TABLE IF EXISTS companies;
CREATE TABLE companies (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama               VARCHAR(150) NOT NULL,
  bidang_usaha       VARCHAR(60)  NOT NULL,
  alamat             VARCHAR(255) NULL,
  telepon            VARCHAR(20)  NULL,
  email              VARCHAR(150) NULL,
  penanggung_jawab   VARCHAR(150) NULL,
  kuota              INT UNSIGNED NOT NULL DEFAULT 0,
  status             ENUM('Aktif','Tidak Aktif') NOT NULL DEFAULT 'Aktif',
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_companies_bidang (bidang_usaha),
  INDEX idx_companies_status (status)
) ENGINE=InnoDB;
-- SENGAJA KOSONG. Diisi data perusahaan mitra PKL sungguhan lewat aplikasi.

-- =====================================================================
-- 11. COMPANY_REQUIREMENTS — Company Requirement
-- BEDA dari frontend lama: di sini 1 perusahaan BISA punya lebih dari 1
-- lowongan/posisi (1:N), bukan 1:1 seperti field inline di seed.js lama
-- — lebih sesuai kebutuhan nyata (1 perusahaan sering buka >1 posisi).
-- =====================================================================
DROP TABLE IF EXISTS company_requirements;
CREATE TABLE company_requirements (
  id                     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id             INT UNSIGNED NOT NULL,
  posisi                 VARCHAR(150) NOT NULL,
  pendidikan_dibutuhkan  VARCHAR(150) NULL,
  tingkat_pengalaman     ENUM('Tidak Diperlukan','Pemula','Menengah','Mahir') NOT NULL DEFAULT 'Tidak Diperlukan',
  kriteria_lain          TEXT NULL,
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 12. REQUIREMENT_MAJORS — [TAMBAHAN] normalisasi `jurusanRelevan[]`
-- =====================================================================
DROP TABLE IF EXISTS requirement_majors;
CREATE TABLE requirement_majors (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  requirement_id INT UNSIGNED NOT NULL,
  jurusan        VARCHAR(20) NOT NULL,
  FOREIGN KEY (requirement_id) REFERENCES company_requirements(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 13. REQUIREMENT_COMPETENCIES — [TAMBAHAN] normalisasi `kompetensiDibutuhkan[]`
-- Tetap free-text (bukan FK ke competencies) karena Matching Engine
-- CD-4 memang cocokkan lewat overlap keyword, bukan strict ID match.
-- =====================================================================
DROP TABLE IF EXISTS requirement_competencies;
CREATE TABLE requirement_competencies (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  requirement_id INT UNSIGNED NOT NULL,
  kompetensi     VARCHAR(100) NOT NULL,
  FOREIGN KEY (requirement_id) REFERENCES company_requirements(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 14. INTERNSHIP_GROUPS (kelompok magang)
-- =====================================================================
DROP TABLE IF EXISTS internship_groups;
CREATE TABLE internship_groups (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama                VARCHAR(150) NOT NULL,
  company_id          INT UNSIGNED NOT NULL,
  guru_pembimbing_id  INT UNSIGNED NULL COMMENT 'FK ke users, role=Guru',
  periode_mulai       DATE NOT NULL,
  periode_selesai     DATE NOT NULL,
  status              ENUM('Aktif','Selesai') NOT NULL DEFAULT 'Aktif',
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
  FOREIGN KEY (guru_pembimbing_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 15. GROUP_MEMBERS
-- =====================================================================
DROP TABLE IF EXISTS group_members;
CREATE TABLE group_members (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_id    INT UNSIGNED NOT NULL,
  student_id  INT UNSIGNED NOT NULL,
  FOREIGN KEY (group_id) REFERENCES internship_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY uq_group_member (group_id, student_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 16. PLACEMENTS (penempatan & penerimaan)
-- =====================================================================
DROP TABLE IF EXISTS placements;
CREATE TABLE placements (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id          INT UNSIGNED NOT NULL,
  company_id          INT UNSIGNED NOT NULL,
  group_id            INT UNSIGNED NULL,
  guru_pembimbing_id  INT UNSIGNED NULL,
  tanggal_mulai       DATE NOT NULL,
  tanggal_selesai     DATE NOT NULL,
  status              ENUM('Diajukan','Diterima','Ditolak','Berlangsung','Selesai') NOT NULL DEFAULT 'Diajukan',
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
  FOREIGN KEY (group_id) REFERENCES internship_groups(id) ON DELETE SET NULL,
  FOREIGN KEY (guru_pembimbing_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_placements_status (status)
) ENGINE=InnoDB;

-- =====================================================================
-- 17. JOURNALS (jurnal harian)
-- =====================================================================
DROP TABLE IF EXISTS journals;
CREATE TABLE journals (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  placement_id        INT UNSIGNED NOT NULL,
  student_id          INT UNSIGNED NOT NULL,
  tanggal             DATE NOT NULL,
  kegiatan            TEXT NOT NULL,
  kendala             TEXT NULL,
  status              ENUM('Menunggu','Disetujui','Revisi') NOT NULL DEFAULT 'Menunggu',
  catatan_pembimbing  TEXT NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (placement_id) REFERENCES placements(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY uq_journal_per_day (placement_id, tanggal)
) ENGINE=InnoDB;

-- =====================================================================
-- 18. MATCHING_RESULTS — Talent Matching & Match Score
-- Bobot resmi (CD-2/3/4): Kompetensi 40% · Pengalaman 20% ·
-- Pendidikan/Jurusan 15% · Bidang/Minat 15% · Preferensi 10%.
-- Kategori: 80-100 Sangat Sesuai · 65-79 Sesuai · 50-64 Cukup Sesuai ·
-- <50 Kurang Sesuai. TIDAK ada UNIQUE constraint di sini SENGAJA —
-- setiap kali matching dihitung ulang, disimpan sebagai baris baru
-- (riwayat/audit trail skor dari waktu ke waktu, bukan overwrite).
-- =====================================================================
DROP TABLE IF EXISTS matching_results;
CREATE TABLE matching_results (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id         INT UNSIGNED NOT NULL,
  company_id         INT UNSIGNED NOT NULL,
  requirement_id     INT UNSIGNED NULL,
  competency_score   DECIMAL(5,2) NOT NULL,
  experience_score   DECIMAL(5,2) NOT NULL,
  education_score    DECIMAL(5,2) NOT NULL,
  interest_score     DECIMAL(5,2) NOT NULL,
  preference_score   DECIMAL(5,2) NOT NULL,
  total_score        DECIMAL(5,2) NOT NULL,
  category           ENUM('Sangat Sesuai','Sesuai','Cukup Sesuai','Kurang Sesuai') NOT NULL,
  calculated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (requirement_id) REFERENCES company_requirements(id) ON DELETE SET NULL,
  INDEX idx_matching_student (student_id),
  INDEX idx_matching_company (company_id),
  INDEX idx_matching_score (total_score)
) ENGINE=InnoDB;

-- =====================================================================
-- 19. RECOMMENDATIONS
-- =====================================================================
DROP TABLE IF EXISTS recommendations;
CREATE TABLE recommendations (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  matching_id          INT UNSIGNED NOT NULL,
  `rank`               INT UNSIGNED NOT NULL,
  recommendation_date  DATE NOT NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (matching_id) REFERENCES matching_results(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- SEED: 4 akun demo, 1 per role (WAJIB ada supaya bisa login pertama
-- kali & demo tiap role: Administrator, Petugas, Guru, Siswa).
-- Kredensial awal ADA di dokumen internal project (tidak dituliskan di
-- sini karena file ini publik di GitHub) — WAJIB login & ganti password
-- lewat aplikasi SEBELUM hosting publik/demo ke pihak luar.
-- GANTI PASSWORD INI SEGERA setelah deploy pertama kali — jangan
-- pernah dipakai di lingkungan produksi/live domain tanpa diganti.
-- Nama dibuat GENERIK, BUKAN nama orang asli — lihat catatan
-- project_capstone_status.md soal isu ini di demo lama.
-- =====================================================================
INSERT INTO users (username, password, nama, email, role, status) VALUES
('admin', '$2b$10$i2PrzJjQfRbDIaYKkKksy.YMeIwInHNDypOWqxvk2l4OdvjHou1yy', 'Administrator Sistem', 'admin@edupkl.sch.id', 'Administrator', 'Aktif'),
('petugas1', '$2y$10$oAF0CJgNqZQLx8eRCnFPrOdai8n2z79hZOvTEfVD3DQDoF9ZW2tQe', 'Petugas Demo', 'petugas1@edupkl.sch.id', 'Petugas', 'Aktif'),
('guru1', '$2y$10$rdJYYmBWVlX/gl1AmZME/uFzUivww2wOsd9Y8KDf6kG2ruibIWfP2', 'Guru Demo', 'guru1@edupkl.sch.id', 'Guru', 'Aktif'),
('siswa1', '$2y$10$qeEDu9L8b0V6P0GaNjQhVexjOx7NsY4oSJ0E8ERQ/wQFkdgNNjDka', 'Siswa Demo', 'siswa1@edupkl.sch.id', 'Siswa', 'Aktif');

SET FOREIGN_KEY_CHECKS = 1;
