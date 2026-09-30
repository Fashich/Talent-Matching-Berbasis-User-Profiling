// Kamus terjemahan EduPKL — Bahasa Indonesia (default) & English.
//
// Struktur: translations[lang][namespace][key]. Namespace dipisah per
// halaman/komponen (mis. "landing", "login") supaya gampang diperluas
// Phase 2 (13 halaman dashboard modul) tanpa nyentuh LanguageContext.jsx —
// tinggal tambah namespace baru di objek `id` dan `en` di bawah.
//
// Istilah yang SENGAJA tidak diterjemahkan di kedua bahasa (konsisten
// dengan dokumen resmi CD-1..CD-4): "Talent Matching", "User Profiling",
// "Match Score", nama 4 role resmi (Administrator/Petugas/Guru/Siswa —
// role labels tetap sama persis di EN, jangan diterjemahkan ke
// "Staff"/"Teacher"/"Student", karena itu identifier resmi lintas dokumen
// & RBAC, bukan cuma label tampilan).

export const translations = {
  id: {
    landing: {
      navFitur: 'Fitur',
      navCaraKerja: 'Cara Kerja',
      navMasuk: 'Masuk',
      navMasukKeSistem: 'Masuk ke Sistem',
      menuAriaLabel: 'Menu',
      heroPill: 'SMKS RAJASA SURABAYA · CAPSTONE PROJECT',
      heroTitlePrefix: 'Talent Matching berbasis',
      heroTitleHighlight: 'User Profiling',
      heroDesc:
        'Mencocokkan profil & kompetensi siswa PKL dengan kebutuhan perusahaan mitra secara otomatis — Match Score real-time, jurnal harian, dan rekomendasi penempatan dalam satu sistem terpadu.',
      ctaMasukKeSistem: 'Masuk ke Sistem',
      ctaCaraKerja: 'Cara Kerja',
      statSiswa: 'Siswa Terdaftar',
      statPerusahaan: 'Perusahaan Mitra',
      statProgram: 'Program Keahlian',
      statSistem: 'Sistem Terpadu',
      fiturEyebrow: 'FITUR UTAMA',
      fiturTitle: 'Satu sistem, seluruh siklus PKL',
      features: [
        {
          title: 'User & Competency Profiling',
          desc: 'Siswa melengkapi profil, pengalaman, minat, dan kompetensi sebagai dasar pencocokan.',
        },
        {
          title: 'Company Requirement',
          desc: 'Perusahaan mitra mendaftarkan lowongan beserta kompetensi & jurusan yang dibutuhkan.',
        },
        {
          title: 'Talent Matching & Rekomendasi',
          desc: 'Match Score dihitung otomatis dari profil siswa vs kebutuhan perusahaan — rekomendasi terurut secara real-time.',
        },
        {
          title: 'Jurnal & Pemantauan PKL',
          desc: 'Jurnal harian, kelompok magang, dan status penempatan terpantau dalam satu sistem.',
        },
      ],
      caraKerjaEyebrow: 'CARA KERJA',
      caraKerjaTitle: 'Dari profil siswa ke penempatan, dalam 4 langkah',
      steps: [
        { title: 'Lengkapi Profil', desc: 'Siswa mengisi data kompetensi, minat, dan pengalaman.' },
        { title: 'Perusahaan Daftar Kebutuhan', desc: 'Mitra mengajukan kebutuhan kompetensi & jurusan.' },
        { title: 'Sistem Menghitung Match Score', desc: 'Rekomendasi terurut otomatis dari skor tertinggi.' },
        { title: 'Penempatan & Pemantauan', desc: 'Jurnal harian & status PKL terpantau sampai selesai.' },
      ],
      studiKasusEyebrow: 'STUDI KASUS',
      studiKasusTitlePrefix: 'Dikembangkan sebagai Studi Kasus untuk',
      studiKasusDesc:
        'EduPKL dirancang dan dikembangkan oleh Kelompok 1 Capstone Program Studi S1 Sistem Informasi Unesa, menjadikan alur penempatan PKL di SMKS Rajasa Surabaya sebagai studi kasus penelitian. Sistem dikembangkan secara independen melalui observasi dan wawancara langsung dengan pihak sekolah, atas izin SMKS Rajasa Surabaya.',
      studiKasusLink: 'Kunjungi Website Resmi SMKS Rajasa Surabaya',
      footerTerms: 'Syarat & Ketentuan',
      footerPrivacy: 'Kebijakan Privasi',
      footerCopyright: (year) => `© ${year} EduPKL — Capstone Project, Prodi Sistem Informasi, Unesa.`,
    },
    login: {
      errorRequired: 'Username dan password wajib diisi.',
      brandTitlePrefix: 'Talent Matching berbasis',
      brandTitleHighlight: 'User Profiling',
      brandTitleSuffix: 'untuk PKL siswa SMK.',
      brandDesc:
        'Profil & kompetensi siswa dicocokkan otomatis dengan kebutuhan perusahaan — menghasilkan Match Score dan rekomendasi penempatan PKL yang paling sesuai.',
      whatsappTitle: 'Hubungi Admin',
      whatsappDesc: 'Tidak bisa Login? Silakan hubungi Admin sekarang',
      brandCopyright: (year) => `© ${year} EduPKL — Capstone Project`,
      formTitle: 'Masuk ke akun kamu',
      formDesc: 'Masukkan username dan password akunmu.',
      labelUsername: 'Username',
      placeholderUsername: 'contoh: admin',
      labelPassword: 'Password',
      showPasswordAriaLabel: 'Lihat password',
      submitProcessing: 'Memproses...',
      submitMasuk: 'Masuk',
      demoLabel: 'DEMO AKUN — KHUSUS REVIEW',
    },
  },
  en: {
    landing: {
      navFitur: 'Features',
      navCaraKerja: 'How It Works',
      navMasuk: 'Sign In',
      navMasukKeSistem: 'Sign In to the System',
      menuAriaLabel: 'Menu',
      heroPill: 'SMKS RAJASA SURABAYA · CAPSTONE PROJECT',
      heroTitlePrefix: 'Talent Matching based on',
      heroTitleHighlight: 'User Profiling',
      heroDesc:
        'Automatically matching internship (PKL) students’ profiles & competencies with partner companies’ requirements — real-time Match Score, daily journals, and placement recommendations in one integrated system.',
      ctaMasukKeSistem: 'Sign In to the System',
      ctaCaraKerja: 'How It Works',
      statSiswa: 'Registered Students',
      statPerusahaan: 'Partner Companies',
      statProgram: 'Skill Programs',
      statSistem: 'Integrated System',
      fiturEyebrow: 'KEY FEATURES',
      fiturTitle: 'One system, the entire internship cycle',
      features: [
        {
          title: 'User & Competency Profiling',
          desc: 'Students complete their profile, experience, interests, and competencies as the basis for matching.',
        },
        {
          title: 'Company Requirement',
          desc: 'Partner companies post openings along with the competencies & majors required.',
        },
        {
          title: 'Talent Matching & Recommendations',
          desc: 'Match Score is calculated automatically from student profiles vs. company requirements — recommendations ranked in real time.',
        },
        {
          title: 'Journal & Internship Monitoring',
          desc: 'Daily journals, internship groups, and placement status are tracked in a single system.',
        },
      ],
      caraKerjaEyebrow: 'HOW IT WORKS',
      caraKerjaTitle: 'From student profile to placement, in 4 steps',
      steps: [
        { title: 'Complete Profile', desc: 'Students fill in competency, interest, and experience data.' },
        { title: 'Company Posts Requirement', desc: 'Partners submit the competency & major requirements they need.' },
        { title: 'System Calculates Match Score', desc: 'Recommendations are ranked automatically from the highest score.' },
        { title: 'Placement & Monitoring', desc: 'Daily journals & internship status are tracked through to completion.' },
      ],
      studiKasusEyebrow: 'CASE STUDY',
      studiKasusTitlePrefix: 'Developed as a Case Study for',
      studiKasusDesc:
        'EduPKL is designed and developed by Kelompok 1 Capstone, Information Systems Undergraduate Program at Unesa, using the internship (PKL) placement process at SMKS Rajasa Surabaya as its research case study. The system was developed independently through direct observation and interviews with the school, with permission from SMKS Rajasa Surabaya.',
      studiKasusLink: 'Visit the Official SMKS Rajasa Surabaya Website',
      footerTerms: 'Terms & Conditions',
      footerPrivacy: 'Privacy Policy',
      footerCopyright: (year) => `© ${year} EduPKL — Capstone Project, Information Systems Program, Unesa.`,
    },
    login: {
      errorRequired: 'Username and password are required.',
      brandTitlePrefix: 'Talent Matching based on',
      brandTitleHighlight: 'User Profiling',
      brandTitleSuffix: 'for vocational school (SMK) student internships.',
      brandDesc:
        'Student profiles & competencies are automatically matched with company requirements — producing a Match Score and the best-fit internship placement recommendations.',
      whatsappTitle: 'Contact Admin',
      whatsappDesc: 'Can’t sign in? Contact the Admin now',
      brandCopyright: (year) => `© ${year} EduPKL — Capstone Project`,
      formTitle: 'Sign in to your account',
      formDesc: 'Enter your username and password.',
      labelUsername: 'Username',
      placeholderUsername: 'e.g. admin',
      labelPassword: 'Password',
      showPasswordAriaLabel: 'Show password',
      submitProcessing: 'Processing...',
      submitMasuk: 'Sign In',
      demoLabel: 'DEMO ACCOUNTS — REVIEW ONLY',
    },
  },
};

export default translations;
