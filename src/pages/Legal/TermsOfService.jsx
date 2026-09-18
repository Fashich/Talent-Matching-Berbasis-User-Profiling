import React from 'react';
import LegalPageLayout, { LegalSection } from '../../components/LegalPageLayout';
import { buildWhatsAppLink } from '../../config/contact';

// Syarat & Ketentuan Penggunaan EduPKL.
// Konten ini adalah implementasi dari draft
// "SYARAT_KETENTUAN_EDUPKL_DRAFT.md" (folder documents capstone) — kalau
// draft itu direvisi, sinkronkan juga isi di sini secara manual.
//
// CATATAN: kontak resmi tim BELUM final. Sementara (atas persetujuan
// eksplisit Fashich) pakai nomor WA pribadi Fashich di src/config/contact.js
// (yang tadinya cuma buat tombol demo "Hubungi Admin") sebagai kontak legal
// sementara. GANTI ke kontak resmi tim/kelompok begitu sudah diputuskan —
// jangan biarkan nomor pribadi ini permanen di dokumen legal publik.
const KONTAK_RESMI_LABEL = '0881-0365-01919 (sementara)';
const KONTAK_RESMI_HREF = buildWhatsAppLink(
  undefined,
  'Halo, saya ada pertanyaan terkait Syarat & Ketentuan / Kebijakan Privasi EduPKL.'
);

const TermsOfService = () => {
  return (
    <LegalPageLayout title="Syarat & Ketentuan Penggunaan" updatedLabel="Draf v0.1 — dokumen ini dapat diperbarui sewaktu-waktu">
      <LegalSection heading="1. Tentang Dokumen Ini">
        <p>
          Syarat &amp; Ketentuan (&quot;S&amp;K&quot;) ini mengatur penggunaan platform <strong>EduPKL</strong>{' '}
          (&quot;Layanan&quot;, &quot;Sistem&quot;) beserta API pendukungnya. Dengan mengakses atau menggunakan
          Layanan ini, Anda (&quot;Pengguna&quot;) setuju untuk terikat oleh S&amp;K ini.
        </p>
      </LegalSection>

      <LegalSection heading="2. Identitas Pengelola">
        <p>
          Layanan ini dikembangkan dan dikelola oleh <strong>Kelompok 1 Capstone Program Studi S1 Sistem
          Informasi, Universitas Negeri Surabaya (Unesa)</strong>, sebagai bagian dari proyek akademik capstone
          berjudul <em>&quot;Perancangan Sistem Talent Matching Berbasis User Profiling untuk Menyesuaikan
          Kebutuhan Perusahaan — Studi Kasus: EduPKL SMKS Rajasa Surabaya&quot;</em>, di bawah bimbingan Ibu
          Ardhini Warih Utami.
        </p>
      </LegalSection>

      <LegalSection heading="3. Sifat & Status Layanan">
        <p>
          EduPKL adalah <strong>proyek akademik (capstone/tugas akhir)</strong>, dikembangkan sebagai{' '}
          <strong>studi kasus untuk SMKS Rajasa Surabaya</strong>, bukan produk komersial. Layanan disediakan
          &quot;sebagaimana adanya&quot; (as-is) untuk keperluan pengujian, demonstrasi, dan penelitian akademik.
        </p>
        <p>
          EduPKL dikembangkan secara independen melalui observasi dan wawancara terhadap praktik penempatan
          PKL yang berjalan di SMKS Rajasa Surabaya. EduPKL tidak dibangun di atas kode sumber, basis data,
          atau aset milik sistem lain mana pun.
        </p>
        <p>
          Karena sifatnya sebagai proyek akademik, Pengelola tidak menjamin ketersediaan Layanan secara
          terus-menerus (tanpa jaminan SLA/uptime), dan berhak menghentikan, mengubah, atau membatasi akses ke
          Layanan sewaktu-waktu tanpa kewajiban ganti rugi dalam bentuk apa pun.
        </p>
      </LegalSection>

      <LegalSection heading="4. Peran Pengguna">
        <p>
          Layanan menyediakan 4 (empat) peran akses: <strong>Administrator, Petugas, Guru,</strong> dan{' '}
          <strong>Siswa</strong>. Setiap peran memiliki cakupan akses dan kewenangan berbeda sesuai fungsinya
          dalam alur penempatan PKL/magang.
        </p>
      </LegalSection>

      <LegalSection heading="5. Akun & Keamanan">
        <p>
          Pengguna bertanggung jawab menjaga kerahasiaan kredensial akun (nama pengguna &amp; kata sandi)
          miliknya, dan bertanggung jawab atas seluruh aktivitas yang terjadi melalui akunnya. Akun demo yang
          disediakan untuk keperluan pengujian wajib diganti kata sandinya sebelum Layanan digunakan di luar
          konteks pengujian/demonstrasi akademik. Pengelola berhak menangguhkan atau menghapus akun yang
          terindikasi disalahgunakan atau membahayakan keamanan/integritas Layanan.
        </p>
      </LegalSection>

      <LegalSection heading="6. Penggunaan yang Diperbolehkan">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Menggunakan Layanan hanya untuk tujuan sesuai fungsinya (administrasi PKL/magang, pencatatan kompetensi, pemantauan jurnal, dsb).</li>
          <li>Memberikan data yang akurat dan memperbaruinya bila terjadi perubahan.</li>
          <li>Tidak mencoba mengakses bagian Layanan di luar kewenangan peran akunnya.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="7. Penggunaan yang Dilarang">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Rekayasa balik (reverse engineering), scraping otomatis, atau eksploitasi celah keamanan Layanan.</li>
          <li>Mengunggah konten yang melanggar hukum, mencemarkan nama baik, atau melanggar hak pihak lain.</li>
          <li>Menggunakan Layanan di luar konteks akademik/operasional PKL yang dimaksud.</li>
          <li>Menyalahgunakan data pengguna lain yang diperoleh melalui Layanan.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="8. Sifat Sistem Rekomendasi (Match Score)">
        <p>
          EduPKL menghitung <strong>Match Score</strong> — skor kesesuaian antara profil siswa dan kebutuhan
          perusahaan — menggunakan formula berbasis aturan (<em>rule-based</em>), <strong>bukan kecerdasan
          buatan/machine learning</strong>:
        </p>
        <pre
          className="rounded-xl border p-4 text-[0.82rem] leading-relaxed whitespace-pre-wrap"
          style={{ background: 'var(--lp-surface-bg)', borderColor: 'var(--lp-surface-border)' }}
        >
{`Match Score = 0,40 × Kompetensi + 0,20 × Pengalaman + 0,15 × Pendidikan/Jurusan
            + 0,15 × Bidang/Minat + 0,10 × Preferensi lainnya`}
        </pre>
        <p>
          <strong>Match Score dan seluruh keluaran sistem bersifat rekomendasi/alat bantu keputusan (decision
          support), dan BUKAN keputusan akhir.</strong> Keputusan penerimaan, penempatan, atau penolakan siswa
          tetap sepenuhnya berada di tangan manusia (pihak sekolah, perusahaan, dan/atau siswa yang
          bersangkutan). Pengelola tidak bertanggung jawab atas keputusan penempatan yang diambil berdasarkan
          rekomendasi sistem.
        </p>
      </LegalSection>

      <LegalSection heading="9. Data Pengguna & Privasi">
        <p>
          Pengumpulan, penggunaan, dan perlindungan data pribadi Pengguna diatur secara terpisah dalam{' '}
          <a href="#/privacy" className="underline font-semibold">Kebijakan Privasi EduPKL</a>, yang merupakan
          bagian tidak terpisahkan dari S&amp;K ini.
        </p>
      </LegalSection>

      <LegalSection heading="10. Kekayaan Intelektual">
        <p>
          Desain sistem, kode program, dan dokumen perancangan EduPKL dalam proyek ini adalah hasil karya
          independen Kelompok 1 Capstone, dikembangkan sebagai studi kasus atas izin pihak SMKS Rajasa
          Surabaya.
        </p>
        <p>
          Nama &quot;SMKS Rajasa Surabaya&quot; dan referensi terkait digunakan dalam konteks studi kasus
          akademik dengan izin pihak sekolah, dan tidak dimaksudkan untuk menyiratkan hubungan kemitraan
          formal atau sponsorship kecuali dinyatakan secara eksplisit dan tertulis oleh kedua belah pihak.
        </p>
      </LegalSection>

      <LegalSection heading="11. Pembatasan Tanggung Jawab">
        <p>
          Sepanjang diizinkan oleh hukum yang berlaku, Pengelola tidak bertanggung jawab atas kerugian
          langsung maupun tidak langsung yang timbul dari penggunaan atau ketidakmampuan menggunakan Layanan,
          termasuk namun tidak terbatas pada kehilangan data, gangguan layanan (termasuk akibat sifat
          free-tier hosting yang digunakan), atau keputusan yang diambil berdasarkan keluaran sistem.
        </p>
      </LegalSection>

      <LegalSection heading="12. Perubahan Ketentuan">
        <p>
          Pengelola dapat mengubah S&amp;K ini sewaktu-waktu. Perubahan material akan diinformasikan melalui
          halaman Layanan. Penggunaan Layanan setelah perubahan berlaku dianggap sebagai persetujuan atas
          S&amp;K yang telah diperbarui.
        </p>
      </LegalSection>

      <LegalSection heading="13. Hukum yang Berlaku">
        <p>
          S&amp;K ini tunduk pada hukum Republik Indonesia, termasuk namun tidak terbatas pada Undang-Undang
          Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi.
        </p>
      </LegalSection>

      <LegalSection heading="14. Kontak">
        <p>
          Pertanyaan terkait S&amp;K ini dapat disampaikan melalui WhatsApp{' '}
          <a href={KONTAK_RESMI_HREF} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
            {KONTAK_RESMI_LABEL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default TermsOfService;
