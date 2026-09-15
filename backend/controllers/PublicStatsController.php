<?php
// controllers/PublicStatsController.php
// Statistik publik untuk Landing Page (tanpa auth) — lihat
// design_handoff_landing_login/README.md bagian "Data & Backend".
// Sengaja tidak fallback ke angka fabrikasi kalau query gagal; frontend
// yang memutuskan menyembunyikan angka kalau fetch gagal.

class PublicStatsController
{
    public static function index(): void
    {
        $db = Database::getConnection();

        $siswa = (int) $db->query('SELECT COUNT(*) FROM students')->fetchColumn();
        $perusahaan = (int) $db->query('SELECT COUNT(*) FROM companies')->fetchColumn();
        $programKeahlian = (int) $db->query('SELECT COUNT(DISTINCT jurusan) FROM students')->fetchColumn();

        Response::success([
            'siswa' => $siswa,
            'perusahaan' => $perusahaan,
            'program_keahlian' => $programKeahlian,
        ], 'Statistik publik.');
    }
}
