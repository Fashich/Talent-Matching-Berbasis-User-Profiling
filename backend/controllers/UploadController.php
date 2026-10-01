<?php
// controllers/UploadController.php
// Upload file bukti sertifikasi kompetensi siswa (PDF/JPG/PNG, maks 5MB).
// Satu-satunya endpoint di aplikasi ini yang baca request multipart/form-data
// ($_FILES) — semua controller lain murni JSON lewat Request::body(), jadi
// sengaja dipisah ke controller sendiri biar jelas bedanya.
//
// Field `student_competencies.sertifikasi` di schema.sql TETAP VARCHAR(150)
// tanpa migrasi — isinya sekarang path relatif file (mis.
// "uploads/sertifikasi/1696100000_a1b2c3d4_sertifikat-react.pdf"), bukan lagi
// teks bebas. ERD/Class Diagram (backend/docs/*.mmd) tidak perlu berubah krn
// tipe datanya tetap string.

class UploadController
{
    private const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
    private const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
    private const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

    public static function sertifikasi(): void
    {
        Auth::requireLogin();

        if (!isset($_FILES['file']) || $_FILES['file']['error'] === UPLOAD_ERR_NO_FILE) {
            Response::error('Tidak ada file yang diunggah.', 422, ['file' => 'File wajib dipilih.']);
        }

        $file = $_FILES['file'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            Response::error('Gagal mengunggah file (kode error upload: ' . $file['error'] . ').', 422);
        }

        if ($file['size'] > self::MAX_BYTES) {
            Response::error('Ukuran file maksimal 5MB.', 422, ['file' => 'Ukuran file melebihi 5MB.']);
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $mime = @mime_content_type($file['tmp_name']) ?: '';
        if (!in_array($ext, self::ALLOWED_EXTENSIONS, true) || !in_array($mime, self::ALLOWED_MIME_TYPES, true)) {
            Response::error('Tipe file tidak diizinkan. Gunakan PDF, JPG, atau PNG.', 422, ['file' => 'Tipe file tidak didukung.']);
        }

        $uploadDir = __DIR__ . '/../uploads/sertifikasi/';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
            Response::error('Gagal menyiapkan folder penyimpanan di server.', 500);
        }

        // Nama file dibuat ulang (bukan nama asli apa adanya) biar aman dari
        // path traversal & karakter aneh. Potongan nama asli yg sudah
        // disanitasi cuma disisipkan buat memudahkan identifikasi manual oleh
        // admin kalau perlu lihat folder uploads/ langsung.
        $safeBase = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
        $filename = sprintf('%d_%s_%s.%s', time(), bin2hex(random_bytes(4)), substr($safeBase, 0, 50), $ext);
        $destination = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            Response::error('Gagal menyimpan file di server.', 500);
        }

        Response::success(['path' => 'uploads/sertifikasi/' . $filename], 'File berhasil diunggah.', 201);
    }
}
