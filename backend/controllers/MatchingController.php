<?php
// controllers/MatchingController.php
// Modul Talent Matching & Recommendation (kontrak CD-4 §4.2: Matching/Calculate
// dan Recommendation/Rank). Porting 1:1 dari algoritma yang sudah tervalidasi di
// frontend (src/utils/matching.js) — bobot & threshold IDENTIK, jangan diubah
// tanpa alasan kuat (lihat CLAUDE.md).
//
// Alur: Calculate menghitung Match Score siswa vs SEMUA lowongan aktif (company
// berstatus Aktif) dan menyimpannya sebagai baris baru di matching_results (audit
// trail, sengaja tanpa unique constraint — lihat schema.sql). Recommendation
// menghitung ulang lalu mengurutkan hasilnya, disimpan sebagai snapshot rank di
// tabel recommendations.

class MatchingController
{
    private const BOBOT = [
        'kompetensi'  => 0.40,
        'pengalaman'  => 0.20,
        'pendidikan'  => 0.15,
        'bidang_minat'=> 0.15,
        'preferensi'  => 0.10,
    ];

    public static function calculate(): void
    {
        $user = Auth::requireLogin();
        $studentId = self::resolveStudentId($user, Request::input('student_id'));

        $results = self::runForStudent($studentId);
        Response::success($results, count($results) . ' hasil matching dihitung.');
    }

    public static function recommendation(string $studentId): void
    {
        $user = Auth::requireLogin();
        $studentId = self::resolveStudentId($user, $studentId);

        $results = self::runForStudent($studentId);
        usort($results, fn ($a, $b) => $b['total_score'] <=> $a['total_score']);

        $db = Database::getConnection();
        $insert = $db->prepare(
            'INSERT INTO recommendations (matching_id, `rank`, recommendation_date) VALUES (:matching_id, :rank, CURDATE())'
        );
        foreach ($results as $rank => &$row) {
            $row['rank'] = $rank + 1;
            $insert->execute(['matching_id' => $row['matching_id'], 'rank' => $row['rank']]);
        }
        unset($row);

        Response::success($results, 'Rekomendasi berhasil diurutkan.');
    }

    // ---- Helpers ----

    private static function resolveStudentId(array $user, $requestedId): int
    {
        if ($user['role'] === 'Siswa') {
            $ownId = Auth::studentIdFor((int) $user['id']);
            if (!$ownId) {
                Response::error('Akun kamu belum ditautkan ke profil siswa manapun.', 403);
            }
            return $ownId;
        }

        Auth::requireRole($user, ['Administrator', 'Petugas', 'Guru']);
        if (empty($requestedId)) {
            Response::error('student_id wajib diisi.', 422);
        }
        return (int) $requestedId;
    }

    /**
     * Hitung Match Score siswa terhadap semua lowongan (company_requirements)
     * milik perusahaan berstatus Aktif, simpan tiap hasil sebagai baris baru
     * di matching_results, kembalikan array hasil (termasuk breakdown per
     * komponen untuk ditampilkan di UI — breakdown TIDAK disimpan ke DB,
     * cuma 5 skor komponen + total + kategori yang persist sesuai schema).
     */
    private static function runForStudent(int $studentId): array
    {
        $db = Database::getConnection();

        $studentStmt = $db->prepare('SELECT * FROM students WHERE id = :id LIMIT 1');
        $studentStmt->execute(['id' => $studentId]);
        $student = $studentStmt->fetch();
        if (!$student) {
            Response::error('Siswa tidak ditemukan.', 404);
        }

        $interestsStmt = $db->prepare('SELECT minat FROM student_interests WHERE student_id = :id');
        $interestsStmt->execute(['id' => $studentId]);
        $minat = array_column($interestsStmt->fetchAll(), 'minat');

        $experienceCountStmt = $db->prepare('SELECT COUNT(*) AS n FROM student_experiences WHERE student_id = :id');
        $experienceCountStmt->execute(['id' => $studentId]);
        $jumlahPengalaman = (int) $experienceCountStmt->fetch()['n'];

        $competencyStmt = $db->prepare(
            'SELECT c.nama FROM student_competencies sc JOIN competencies c ON c.id = sc.competency_id WHERE sc.student_id = :id'
        );
        $competencyStmt->execute(['id' => $studentId]);
        $namaKompetensiSiswa = array_map([self::class, 'normalize'], array_column($competencyStmt->fetchAll(), 'nama'));

        $keywordStmt = $db->prepare('SELECT keyword FROM keywords WHERE jurusan = :jurusan');
        $keywordStmt->execute(['jurusan' => $student['jurusan']]);
        $kamusJurusan = array_map([self::class, 'normalize'], array_column($keywordStmt->fetchAll(), 'keyword'));

        $poolKompetensiSiswa = implode(' | ', array_merge($namaKompetensiSiswa, $kamusJurusan));

        $requirementStmt = $db->prepare(
            "SELECT cr.*, c.nama AS company_nama, c.bidang_usaha
             FROM company_requirements cr
             JOIN companies c ON c.id = cr.company_id
             WHERE c.status = 'Aktif'"
        );
        $requirementStmt->execute();
        $requirements = $requirementStmt->fetchAll();

        $insertStmt = $db->prepare(
            'INSERT INTO matching_results
                (student_id, company_id, requirement_id, competency_score, experience_score, education_score, interest_score, preference_score, total_score, category)
             VALUES
                (:student_id, :company_id, :requirement_id, :competency_score, :experience_score, :education_score, :interest_score, :preference_score, :total_score, :category)'
        );

        $results = [];
        foreach ($requirements as $requirement) {
            $majorsStmt = $db->prepare('SELECT jurusan FROM requirement_majors WHERE requirement_id = :id');
            $majorsStmt->execute(['id' => $requirement['id']]);
            $jurusanRelevan = array_column($majorsStmt->fetchAll(), 'jurusan');

            $compReqStmt = $db->prepare('SELECT kompetensi FROM requirement_competencies WHERE requirement_id = :id');
            $compReqStmt->execute(['id' => $requirement['id']]);
            $kompetensiDibutuhkan = array_column($compReqStmt->fetchAll(), 'kompetensi');

            $kompetensi = self::skorKompetensi($poolKompetensiSiswa, $kompetensiDibutuhkan);
            $pengalaman = self::skorPengalaman($jumlahPengalaman, $requirement['tingkat_pengalaman']);
            $pendidikan = self::skorPendidikan($db, $student['jurusan'], $jurusanRelevan, $requirement['bidang_usaha']);
            $bidangMinat = self::skorBidangMinat($minat, $requirement['bidang_usaha'], $requirement['posisi'], $kompetensiDibutuhkan);
            $preferensi = self::skorPreferensi($student['preferensi'], $requirement['kriteria_lain'], $requirement['posisi']);

            $total = (int) round(
                $kompetensi['skor'] * self::BOBOT['kompetensi']
                + $pengalaman * self::BOBOT['pengalaman']
                + $pendidikan * self::BOBOT['pendidikan']
                + $bidangMinat * self::BOBOT['bidang_minat']
                + $preferensi * self::BOBOT['preferensi']
            );
            $category = self::kategoriFromScore($total);

            $insertStmt->execute([
                'student_id'       => $studentId,
                'company_id'       => $requirement['company_id'],
                'requirement_id'   => $requirement['id'],
                'competency_score' => $kompetensi['skor'],
                'experience_score' => $pengalaman,
                'education_score'  => $pendidikan,
                'interest_score'   => $bidangMinat,
                'preference_score' => $preferensi,
                'total_score'      => $total,
                'category'         => $category,
            ]);

            $results[] = [
                'matching_id'    => (int) $db->lastInsertId(),
                'student_id'     => $studentId,
                'company_id'     => (int) $requirement['company_id'],
                'company_nama'   => $requirement['company_nama'],
                'requirement_id' => (int) $requirement['id'],
                'posisi'         => $requirement['posisi'],
                'total_score'    => $total,
                'category'       => $category,
                'breakdown'      => [
                    ['label' => 'Kompetensi', 'bobot' => 40, 'skor' => $kompetensi['skor'], 'detail' => $kompetensi['total'] > 0 ? "{$kompetensi['cocok']}/{$kompetensi['total']} keyword cocok" : 'Perusahaan tidak menetapkan kompetensi spesifik'],
                    ['label' => 'Pengalaman', 'bobot' => 20, 'skor' => $pengalaman, 'detail' => "{$jumlahPengalaman} pengalaman tercatat"],
                    ['label' => 'Pendidikan/Jurusan', 'bobot' => 15, 'skor' => $pendidikan, 'detail' => 'Jurusan siswa: ' . ($student['jurusan'] ?: '-')],
                    ['label' => 'Bidang/Minat', 'bobot' => 15, 'skor' => $bidangMinat, 'detail' => $minat ? implode(', ', $minat) : 'Minat belum diisi'],
                    ['label' => 'Preferensi Lainnya', 'bobot' => 10, 'skor' => $preferensi, 'detail' => $student['preferensi'] ?: 'Preferensi belum diisi'],
                ],
            ];
        }

        return $results;
    }

    private static function normalize(?string $text): string
    {
        return mb_strtolower(trim((string) $text));
    }

    private static function kategoriFromScore(int $score): string
    {
        if ($score >= 80) return 'Sangat Sesuai';
        if ($score >= 65) return 'Sesuai';
        if ($score >= 50) return 'Cukup Sesuai';
        return 'Kurang Sesuai';
    }

    /** Skor Kompetensi (40%): overlap keyword kompetensi siswa vs kebutuhan perusahaan. */
    private static function skorKompetensi(string $poolKompetensiSiswa, array $dibutuhkan): array
    {
        if (count($dibutuhkan) === 0) {
            return ['skor' => 70, 'cocok' => 0, 'total' => 0];
        }
        $cocok = 0;
        foreach ($dibutuhkan as $req) {
            if (str_contains($poolKompetensiSiswa, self::normalize($req))) {
                $cocok++;
            }
        }
        return ['skor' => (int) round(($cocok / count($dibutuhkan)) * 100), 'cocok' => $cocok, 'total' => count($dibutuhkan)];
    }

    /** Skor Pengalaman (20%): jumlah pengalaman siswa vs tingkat yang disyaratkan. */
    private static function skorPengalaman(int $jumlah, string $tingkatPengalaman): int
    {
        switch ($tingkatPengalaman) {
            case 'Tidak Diperlukan':
                return 100;
            case 'Pemula':
                return $jumlah >= 1 ? 100 : 60;
            case 'Menengah':
                return $jumlah >= 2 ? 100 : ($jumlah === 1 ? 55 : 20);
            default: // Mahir
                return $jumlah >= 1 ? 80 : 40;
        }
    }

    /** Skor Pendidikan/Jurusan (15%): match langsung jurusanRelevan, atau parsial via bidang_jurusan_map. */
    private static function skorPendidikan(PDO $db, string $jurusanSiswa, array $jurusanRelevan, string $bidangUsaha): int
    {
        if (in_array($jurusanSiswa, $jurusanRelevan, true)) {
            return 100;
        }
        $stmt = $db->prepare('SELECT jurusan FROM bidang_jurusan_map WHERE bidang_usaha = :bidang');
        $stmt->execute(['bidang' => $bidangUsaha]);
        $viaBidang = array_column($stmt->fetchAll(), 'jurusan');
        return in_array($jurusanSiswa, $viaBidang, true) ? 70 : 20;
    }

    /** Skor Bidang/Minat (15%): overlap per-kata antara minat siswa dan bidang/posisi/kompetensi perusahaan. */
    private static function skorBidangMinat(array $minat, string $bidangUsaha, string $posisi, array $kompetensiDibutuhkan): int
    {
        if (count($minat) === 0) {
            return 30;
        }
        $target = self::normalize($bidangUsaha . ' ' . $posisi . ' ' . implode(' ', $kompetensiDibutuhkan));
        $cocok = 0;
        foreach ($minat as $m) {
            $kata = array_filter(preg_split('/\s+/', self::normalize($m)), fn ($w) => strlen($w) > 2);
            foreach ($kata as $w) {
                if (str_contains($target, $w)) {
                    $cocok++;
                    break;
                }
            }
        }
        return (int) round(($cocok / count($minat)) * 100);
    }

    /** Skor Preferensi lainnya (10%): overlap kata kunci sederhana. */
    private static function skorPreferensi(?string $preferensi, ?string $kriteriaLain, string $posisi): int
    {
        $pref = self::normalize($preferensi);
        if ($pref === '') {
            return 50;
        }
        $kriteria = self::normalize(($kriteriaLain ?? '') . ' ' . $posisi);
        $kataPref = array_filter(preg_split('/[\s,]+/', $pref), fn ($w) => strlen($w) > 2);
        foreach ($kataPref as $w) {
            if (str_contains($kriteria, $w)) {
                return 90;
            }
        }
        return 40;
    }
}
