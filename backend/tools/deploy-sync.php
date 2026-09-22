<?php
/**
 * deploy-sync.php — "sync sederhana" auto-deploy backend EduPKL.
 *
 * MASALAH YANG DISELESAIKAN:
 * cPanel Git Version Control cuma bisa update folder clone-nya sendiri
 * (/home/edupklra/repositories/edupkl/), BUKAN folder yang benar-benar
 * dipakai domain api.edupkl-rajasa.com (/home/edupklra/api/) — dan
 * eksperimen mengarahkan Document Root langsung ke folder clone gagal
 * (404 tak terjelaskan, lihat CATATAN_PENGINGAT_CAPSTONE.txt LANJUTAN x56).
 *
 * SOLUSI SEMENTARA (masih dipicu manual, tapi jauh lebih cepat & lebih
 * kecil kemungkinan salah dibanding copy-paste file satu-satu lewat File
 * Manager tiap ada perubahan backend):
 *
 *   1. Push perubahan backend ke GitHub seperti biasa.
 *   2. Di cPanel > Git Version Control > Manage > "Update from Remote",
 *      lalu "Deploy HEAD" (ini cuma update folder
 *      /home/edupklra/repositories/edupkl/, BUKAN folder live).
 *   3. Buka URL ini di browser (ganti YOUR_SECRET_KEY dengan nilai
 *      SYNC_SECRET yang diisi di env-local.php server — lihat CATATAN di
 *      bawah):
 *      https://api.edupkl-rajasa.com/deploy-sync.php?key=YOUR_SECRET_KEY
 *   4. Script ini menyalin isi folder clone (hasil langkah 2) ke folder
 *      live ini, KECUALI file-file yang sengaja dikecualikan (lihat
 *      $excluded di bawah). Hasilnya ditampilkan sebagai laporan teks.
 *
 * CATATAN PENTING — WAJIB DIBACA SEBELUM PAKAI:
 *
 * - File INI harus ditaruh MANUAL di server, langsung di dalam folder
 *   LIVE /home/edupklra/api/ (sejajar dengan index.php-nya di sana),
 *   BUKAN dibiarkan di dalam folder git-clone. Copy-paste isi file ini
 *   ke file baru bernama sama di sana lewat cPanel File Manager, sama
 *   seperti cara config/env-local.php dulu dibuat.
 *   (Salinan di repo git ini, backend/tools/deploy-sync.php, HANYA
 *   dokumentasi/referensi — folder git-clone di server BUKAN document
 *   root domain manapun, jadi file ini di situ tidak pernah "aktif".)
 *
 * - WAJIB tambahkan SATU baris berikut ke config/env-local.php di server
 *   (folder LIVE: /home/edupklra/api/config/env-local.php) SEBELUM
 *   memakai script ini pertama kali:
 *
 *       putenv('SYNC_SECRET=isi-dengan-string-acak-rahasia-milikmu');
 *
 *   Tanpa baris ini, script akan SELALU menolak (403 Forbidden) — ini
 *   sengaja, supaya orang lain yang kebetulan tahu/nebak URL-nya tidak
 *   bisa memicu sync dari luar. Pilih string acak yang panjang & unik,
 *   JANGAN dipakai ulang dari password lain.
 *
 * - Setelah dipakai, boleh dibiarkan di server (kunci rahasianya yang
 *   jadi proteksi, bukan menghapus filenya) — tapi kalau mau ekstra
 *   hati-hati, boleh juga dihapus manual lewat File Manager setelah tiap
 *   sync dan dibuat ulang saat butuh lagi.
 */

declare(strict_types=1);

// Muat konfigurasi server (kalau ada) — pola sama seperti index.php utama,
// supaya getenv('SYNC_SECRET') di bawah bisa kebaca dari env-local.php.
if (file_exists(__DIR__ . '/config/env-local.php')) {
    require_once __DIR__ . '/config/env-local.php';
}

header('Content-Type: text/plain; charset=utf-8');

// ---- 1. Cek kunci rahasia (WAJIB cocok, lihat CATATAN di atas) ----
$expectedKey = getenv('SYNC_SECRET') ?: '';
$givenKey    = $_GET['key'] ?? '';

if ($expectedKey === '' || !hash_equals($expectedKey, $givenKey)) {
    http_response_code(403);
    echo "Forbidden.\n";
    exit;
}

// ---- 2. Konfigurasi path ----
$source = '/home/edupklra/repositories/edupkl/backend';
$dest   = __DIR__; // folder tempat file ini sendiri diletakkan (harus /home/edupklra/api)

// File/folder (path RELATIF dari $source) yang JANGAN PERNAH ditimpa di $dest,
// karena isinya khusus-lingkungan (kredensial) atau memang tidak relevan lagi
// di shared hosting (sisa percobaan deploy Render sebelumnya).
$excluded = [
    'config/env-local.php',
    'deploy-sync.php',
    '.htaccess',
    'Dockerfile',
    'nginx-render.conf',
    'supervisord.conf',
];

if (!is_dir($source)) {
    http_response_code(500);
    echo "Source tidak ditemukan: $source\n";
    echo "(Pastikan sudah klik 'Deploy HEAD' di cPanel Git Version Control dulu.)\n";
    exit;
}

// ---- 3. Salin rekursif ----
$copied  = [];
$skipped = [];

function syncCopy(string $srcDir, string $dstDir, string $relBase, array $excluded, array &$copied, array &$skipped): void
{
    foreach (scandir($srcDir) as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }

        $relPath = $relBase === '' ? $item : $relBase . '/' . $item;
        $srcPath = $srcDir . '/' . $item;
        $dstPath = $dstDir . '/' . $item;

        if (in_array($relPath, $excluded, true)) {
            $skipped[] = $relPath;
            continue;
        }

        if (is_dir($srcPath)) {
            if (!is_dir($dstPath)) {
                mkdir($dstPath, 0755, true);
            }
            syncCopy($srcPath, $dstPath, $relPath, $excluded, $copied, $skipped);
            continue;
        }

        copy($srcPath, $dstPath);
        $copied[] = $relPath;
    }
}

syncCopy($source, $dest, '', $excluded, $copied, $skipped);

// ---- 4. Laporan ----
echo "Sync selesai.\n\n";
echo "DISALIN (" . count($copied) . "):\n";
foreach ($copied as $f) {
    echo "  - $f\n";
}
echo "\nDILEWATI/dilindungi (" . count($skipped) . "):\n";
foreach ($skipped as $f) {
    echo "  - $f\n";
}
