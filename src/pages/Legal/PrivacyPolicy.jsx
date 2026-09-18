import React from 'react';
import LegalPageLayout, { LegalSection } from '../../components/LegalPageLayout';
import { buildWhatsAppLink } from '../../config/contact';

// Kebijakan Privasi EduPKL.
// Konten ini adalah implementasi dari draft
// "KEBIJAKAN_PRIVASI_EDUPKL_DRAFT.md" (folder documents capstone) — kalau
// draft itu direvisi, sinkronkan juga isi di sini secara manual.
//
// CATATAN PENTING: Pasal 6 (data anak/di bawah umur) mengasumsikan sekolah
// punya mekanisme persetujuan wali — INI BELUM DIVERIFIKASI. Jangan anggap
// kepatuhan Pasal 25 UU PDP otomatis terpenuhi hanya karena kalimat ini ada
// di halaman.
//
// Kontak resmi tim juga BELUM final — sementara (atas persetujuan eksplisit
// Fashich) pakai nomor WA pribadinya (src/config/contact.js, awalnya cuma
// buat tombol demo "Hubungi Admin"). GANTI ke kontak resmi tim/kelompok
// begitu sudah diputuskan — lihat catatan sama di TermsOfService.jsx.
const KONTAK_RESMI_LABEL = '0881-0365-01919 (sementara)';
const KONTAK_RESMI_HREF = buildWhatsAppLink(
  undefined,
  'Halo, saya ada pertanyaan terkait Kebijakan Privasi / Syarat & Ketentuan EduPKL.'
);

const PrivacyPolicy = () => {
  return (
    <LegalPageLayout title="Kebijakan Privasi" updatedLabel="Draf v0.1 — dokumen ini dapat diperbarui sewaktu-waktu">
      <LegalSection heading="1. Pendahuluan">
        <p>
          Kebijakan Privasi ini menjelaskan bagaimana <strong>EduPKL</strong> — dikembangkan oleh Kelompok 1
          Capstone S1 Sistem Informasi Unesa sebagai studi kasus untuk SMKS Rajasa Surabaya — mengumpulkan,
          menggunakan, menyimpan, dan melindungi data pribadi Pengguna, sesuai dengan{' '}
          <strong>Undang-Undang Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi (&quot;UU PDP&quot;)</strong>.
        </p>
      </LegalSection>

      <LegalSection heading="2. Pengendali Data">
        <p>
          Pengendali data untuk Layanan ini adalah <strong>Kelompok 1 Capstone S1 Sistem Informasi Unesa</strong>.
          Kontak: WhatsApp{' '}
          <a href={KONTAK_RESMI_HREF} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
            {KONTAK_RESMI_LABEL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="3. Data yang Dikumpulkan">
        <p>Layanan mengumpulkan data berikut, tergantung peran Pengguna:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[0.85rem] border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--lp-surface-border)' }}>
                <th className="py-2 pr-4 font-bold">Kategori</th>
                <th className="py-2 pr-4 font-bold">Contoh Data</th>
                <th className="py-2 font-bold">Dikumpulkan dari</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Data akun', 'Nama pengguna, kata sandi (tersimpan dalam bentuk hash, bukan teks polos), peran (role)', 'Semua pengguna'],
                ['Data identitas siswa', 'Nama, kelas, jurusan/kompetensi keahlian', 'Siswa, diinput Petugas/Guru'],
                ['Data akademik & minat', 'Kompetensi, bidang minat, preferensi penempatan, pengalaman', 'Siswa'],
                ['Data magang/PKL', 'Perusahaan tempat magang, kelompok magang, penempatan, jurnal kegiatan harian', 'Siswa, Guru, Petugas'],
                ['Data perusahaan mitra', 'Nama perusahaan, bidang usaha, kebutuhan kompetensi, kontak instansi', 'Petugas/Administrator'],
                ['Data teknis', 'Log aktivitas sistem, token otentikasi (auth token)', 'Otomatis oleh sistem'],
                ['Preferensi tampilan', 'Pilihan mode terang/gelap (local storage)', 'Otomatis oleh peramban Pengguna'],
              ].map((row) => (
                <tr key={row[0]} style={{ borderBottom: '1px solid var(--lp-surface-border)' }}>
                  {row.map((cell, i) => (
                    <td key={i} className="py-2 pr-4 align-top" style={{ color: 'var(--lp-text-secondary)' }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Layanan <strong>tidak mengumpulkan</strong> data pembayaran/finansial, karena Layanan tidak
          memproses transaksi apa pun.
        </p>
      </LegalSection>

      <LegalSection heading="4. Dasar Hukum Pemrosesan">
        <p>Sesuai Pasal 20 UU PDP, pemrosesan data pribadi dalam Layanan ini didasarkan pada:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Persetujuan eksplisit</strong> dari subjek data (Pengguna) atau wali yang sah, pada saat pembuatan akun/pengisian data.</li>
          <li><strong>Kepentingan sah</strong> Pengelola untuk tujuan penyelenggaraan pendidikan, administrasi PKL/magang, dan penelitian akademik (capstone), yang tidak melebihi kepentingan dan hak subjek data.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Tujuan Pemrosesan Data">
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Menyelenggarakan proses administrasi penempatan PKL/magang siswa.</li>
          <li>Menghitung Match Score (skor kesesuaian siswa-perusahaan) sebagai alat bantu rekomendasi — lihat Syarat &amp; Ketentuan Pasal 8 untuk sifatnya sebagai rekomendasi, bukan keputusan final.</li>
          <li>Pemantauan jurnal kegiatan magang siswa oleh Guru/Petugas.</li>
          <li>Keperluan penelitian dan pengujian akademik dalam rangka penyusunan dokumen capstone.</li>
        </ol>
      </LegalSection>

      <LegalSection heading="6. Data Anak & Pengguna di Bawah Umur">
        <p>
          Sebagian besar siswa pengguna Layanan berstatus <strong>anak di bawah umur (di bawah 18 tahun)</strong>.
          Sesuai <strong>Pasal 25 UU PDP</strong>, pemrosesan data pribadi anak wajib memperoleh persetujuan
          dari orang tua/wali yang sah.
        </p>
        <p>
          Persetujuan tersebut diperoleh melalui mekanisme institusional sekolah (SMKS Rajasa Surabaya)
          sebagai bagian dari proses pendaftaran/administrasi siswa, dan/atau melalui form persetujuan
          terpisah yang disediakan pihak sekolah.
        </p>
        <p>
          Orang tua/wali berhak mengajukan permintaan akses, koreksi, atau penghapusan data anaknya melalui
          kontak pada Pasal 10 di bawah.
        </p>
      </LegalSection>

      <LegalSection heading="7. Penyimpanan & Keamanan Data">
        <p>Data disimpan pada basis data TiDB Cloud dengan koneksi terenkripsi (SSL/TLS).</p>
        <p>
          Kata sandi Pengguna disimpan dalam bentuk hash (tidak dapat dibaca ulang menjadi teks asli), dan
          otentikasi sesi menggunakan token akses (Bearer token) yang memiliki masa berlaku terbatas.
        </p>
        <p>Akses ke berkas konfigurasi, skema basis data, dan dokumentasi backend dibatasi (tidak dapat diakses publik).</p>
        <p>
          Meskipun demikian, tidak ada sistem yang sepenuhnya bebas risiko keamanan. Sebagai proyek akademik
          yang dihosting pada layanan tingkat gratis (free-tier), Pengelola tidak dapat menjamin keamanan
          absolut dan menyarankan Pengguna untuk tidak memasukkan data sensitif di luar yang diperlukan
          Layanan.
        </p>
      </LegalSection>

      <LegalSection heading="8. Retensi Data">
        <p>
          Data disimpan selama akun Pengguna aktif dan selama diperlukan untuk tujuan pada Pasal 5. Untuk
          keperluan penilaian/sidang akademik capstone, data uji dapat disimpan hingga proses evaluasi
          capstone selesai. Pengguna dapat mengajukan permintaan penghapusan data sewaktu-waktu melalui
          kontak pada Pasal 10.
        </p>
      </LegalSection>

      <LegalSection heading="9. Berbagi Data kepada Pihak Ketiga">
        <p>Pengelola tidak menjual, menyewakan, atau membagikan data pribadi Pengguna kepada pihak ketiga untuk tujuan komersial.</p>
        <p>
          Data dapat diproses oleh penyedia infrastruktur teknis yang digunakan Layanan (hosting: Vercel,
          Render; basis data: TiDB Cloud; pemantauan: UptimeRobot) semata-mata untuk keperluan operasional
          teknis Layanan, dan bukan untuk tujuan lain.
        </p>
        <p>Data dapat diungkapkan apabila diwajibkan oleh hukum yang berlaku atau perintah instansi yang berwenang.</p>
      </LegalSection>

      <LegalSection heading="10. Hak Subjek Data">
        <p>Sesuai UU PDP, Pengguna (atau wali yang sah untuk Pengguna di bawah umur) berhak untuk:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Mengakses dan memperoleh salinan data pribadinya.</li>
          <li>Meminta koreksi atas data yang tidak akurat.</li>
          <li>Meminta penghapusan data pribadinya (dengan mempertimbangkan kewajiban penyimpanan untuk keperluan akademik yang sedang berjalan).</li>
          <li>Menarik persetujuan yang telah diberikan.</li>
          <li>Mengajukan keberatan atas pemrosesan tertentu.</li>
        </ul>
        <p>
          Permintaan dapat diajukan melalui WhatsApp{' '}
          <a href={KONTAK_RESMI_HREF} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
            {KONTAK_RESMI_LABEL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="11. Cookie & Penyimpanan Lokal">
        <p>
          Layanan menggunakan local storage peramban (bukan cookie pelacakan pihak ketiga) untuk menyimpan
          preferensi tampilan (mode terang/gelap) dan token otentikasi sesi. Data ini tersimpan di perangkat
          Pengguna sendiri dan dapat dihapus kapan saja melalui pengaturan peramban.
        </p>
      </LegalSection>

      <LegalSection heading="12. Perubahan Kebijakan">
        <p>
          Kebijakan Privasi ini dapat diperbarui sewaktu-waktu. Perubahan material akan diinformasikan
          melalui halaman Layanan sebelum berlaku efektif.
        </p>
      </LegalSection>

      <LegalSection heading="13. Kontak">
        <p>
          Pertanyaan, keberatan, atau permintaan terkait data pribadi dapat disampaikan melalui WhatsApp{' '}
          <a href={KONTAK_RESMI_HREF} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
            {KONTAK_RESMI_LABEL}
          </a>
          . Lihat juga{' '}
          <a href="#/terms" className="underline font-semibold">Syarat &amp; Ketentuan Penggunaan</a>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
