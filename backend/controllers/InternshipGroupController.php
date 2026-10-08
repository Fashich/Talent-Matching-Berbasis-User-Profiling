<?php
// controllers/InternshipGroupController.php
// Modul Internship Management (kontrak CD-4 §4.2: Manage group kelompok magang).
// Administrator & Petugas kelola kelompok magang; Guru & Siswa baca saja
// (Guru monitoring kelompok yang dia bimbing, Siswa lihat kelompok tempatnya tergabung).

class InternshipGroupController
{
    private const UPDATABLE_FIELDS = [
        'nama', 'company_id', 'guru_pembimbing_id', 'periode_mulai', 'periode_selesai', 'status',
    ];

    public static function index(): void
    {
        $user = Auth::requireLogin();

        $db = Database::getConnection();
        $where = [];
        $params = [];

        if ($companyId = Request::query('company_id')) {
            $where[] = 'company_id = :company_id';
            $params['company_id'] = $companyId;
        }
        if ($status = Request::query('status')) {
            $where[] = 'status = :status';
            $params['status'] = $status;
        }

        // Scoping per-role (bug ditemukan audit CD-5 BAB 6 8 Okt 2026: endpoint
        // ini TIDAK menyaring apa pun, Guru/Siswa manapun melihat SEMUA
        // kelompok magang). Disamakan dengan pola yang sudah benar di
        // PlacementController::index() — Guru hanya lihat kelompok yang dia
        // bimbing, Siswa hanya lihat kelompok tempatnya tergabung.
        if ($user['role'] === 'Guru') {
            $where[] = 'guru_pembimbing_id = :guru_id';
            $params['guru_id'] = $user['id'];
        } elseif ($user['role'] === 'Siswa') {
            $studentId = Auth::studentIdFor((int) $user['id']);
            // FIX bug 500 (ditemukan 8 Okt 2026, laporan Rizky — Profil Siswa
            // tampil "Data siswa tidak ditemukan"): kolom `id` di sini WAJIB
            // di-qualify `ig.id` krn query ini JOIN ke tabel `users` yang
            // JUGA punya kolom `id` -> tanpa prefix, MySQL/TiDB anggap `id`
            // ambigu [error 1052] -> PDOException TIDAK ketangkep -> 500.
            // Promise.all() di DataContext.jsx frontend bikin SATU endpoint
            // gagal menggagalkan SEMUA data [termasuk /api/siswa/{id} yang
            // sebenarnya sukses sendiri], makanya Profil.jsx ikut kosong.
            $where[] = 'ig.id IN (SELECT group_id FROM group_members WHERE student_id = :student_id)';
            $params['student_id'] = $studentId ?? 0;
        }
        $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

        $stmt = $db->prepare(
            "SELECT ig.*, u.nama AS guru_pembimbing_nama
             FROM internship_groups ig
             LEFT JOIN users u ON u.id = ig.guru_pembimbing_id
             {$whereSql}
             ORDER BY ig.periode_mulai DESC"
        );
        $stmt->execute($params);
        $groups = array_map([self::class, 'withMembers'], $stmt->fetchAll());
        Response::success($groups, 'Daftar kelompok magang.');
    }

    public static function show(string $id): void
    {
        Auth::requireLogin();
        $group = self::findOrFail((int) $id);
        Response::success(self::withMembers($group), 'Detail kelompok magang.');
    }

    public static function store(): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator', 'Petugas']);

        $data = Request::body();
        $errors = self::validate($data, true);
        if ($errors) {
            Response::error('Data kelompok magang tidak valid.', 422, $errors);
        }

        $db = Database::getConnection();

        if (!empty($data['anggota'])) {
            self::rejectIfMembersAlreadyActive($db, $data['anggota'], 0);
        }

        try {
            $db->beginTransaction();

            $stmt = $db->prepare(
                'INSERT INTO internship_groups (nama, company_id, guru_pembimbing_id, periode_mulai, periode_selesai, status)
                 VALUES (:nama, :company_id, :guru_pembimbing_id, :periode_mulai, :periode_selesai, :status)'
            );
            $stmt->execute([
                'nama'               => trim((string) $data['nama']),
                'company_id'         => $data['company_id'],
                'guru_pembimbing_id' => $data['guru_pembimbing_id'] ?? null,
                'periode_mulai'      => $data['periode_mulai'],
                'periode_selesai'    => $data['periode_selesai'],
                'status'             => $data['status'] ?? 'Aktif',
            ]);
            $groupId = (int) $db->lastInsertId();

            self::syncMembers($db, $groupId, $data['anggota'] ?? null);

            $db->commit();
        } catch (PDOException $e) {
            $db->rollBack();
            Response::error('Gagal menyimpan kelompok magang: ' . $e->getMessage(), 422);
        }

        Response::success(self::withMembers(self::findOrFail($groupId)), 'Kelompok magang berhasil ditambahkan.', 201);
    }

    public static function update(string $id): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator', 'Petugas']);
        $group = self::findOrFail((int) $id);

        $data = Request::body();
        $errors = self::validate($data, false);
        if ($errors) {
            Response::error('Data kelompok magang tidak valid.', 422, $errors);
        }

        $db = Database::getConnection();

        if (array_key_exists('anggota', $data) && !empty($data['anggota'])) {
            self::rejectIfMembersAlreadyActive($db, $data['anggota'], (int) $group['id']);
        }

        $fields = [];
        $params = ['id' => $group['id']];
        foreach (self::UPDATABLE_FIELDS as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = :{$field}";
                $params[$field] = $data[$field];
            }
        }

        try {
            $db->beginTransaction();

            if ($fields) {
                $sql = 'UPDATE internship_groups SET ' . implode(', ', $fields) . ' WHERE id = :id';
                $db->prepare($sql)->execute($params);
            }

            if (array_key_exists('anggota', $data)) {
                self::syncMembers($db, (int) $group['id'], $data['anggota']);
            }

            $db->commit();
        } catch (PDOException $e) {
            $db->rollBack();
            Response::error('Gagal memperbarui kelompok magang: ' . $e->getMessage(), 422);
        }

        Response::success(self::withMembers(self::findOrFail((int) $group['id'])), 'Kelompok magang berhasil diperbarui.');
    }

    public static function destroy(string $id): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator', 'Petugas']);
        $group = self::findOrFail((int) $id);

        $db = Database::getConnection();
        try {
            $db->prepare('DELETE FROM internship_groups WHERE id = :id')->execute(['id' => $group['id']]);
        } catch (PDOException $e) {
            Response::error('Kelompok magang tidak bisa dihapus: ' . $e->getMessage(), 409);
        }

        Response::success(null, 'Kelompok magang berhasil dihapus.');
    }

    // ---- Helpers ----

    private static function findOrFail(int $id): array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare(
            'SELECT ig.*, u.nama AS guru_pembimbing_nama
             FROM internship_groups ig
             LEFT JOIN users u ON u.id = ig.guru_pembimbing_id
             WHERE ig.id = :id LIMIT 1'
        );
        $stmt->execute(['id' => $id]);
        $group = $stmt->fetch();

        if (!$group) {
            Response::error('Kelompok magang tidak ditemukan.', 404);
        }

        return $group;
    }

    private static function withMembers(array $group): array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare(
            'SELECT s.id, s.nisn, s.nama, s.jurusan, s.kelas
             FROM group_members gm
             JOIN students s ON s.id = gm.student_id
             WHERE gm.group_id = :id'
        );
        $stmt->execute(['id' => $group['id']]);
        $group['anggota'] = $stmt->fetchAll();
        return $group;
    }

    private static function syncMembers(PDO $db, int $groupId, ?array $studentIds): void
    {
        if ($studentIds === null) {
            return;
        }
        $db->prepare('DELETE FROM group_members WHERE group_id = :id')->execute(['id' => $groupId]);
        $stmt = $db->prepare('INSERT INTO group_members (group_id, student_id) VALUES (:group_id, :student_id)');
        foreach ($studentIds as $studentId) {
            $stmt->execute(['group_id' => $groupId, 'student_id' => $studentId]);
        }
    }

    /**
     * Cegah 1 siswa jadi anggota kelompok magang lain yang masih berstatus
     * Aktif di saat bersamaan (bug lapor Rizky, 3 Okt 2026: siswa yang
     * sudah tergabung di kelompok magang lain tetap bisa ditambahkan ke
     * kelompok magang baru tanpa ditolak sistem). $excludeGroupId = 0 saat
     * store() (kelompok baru belum punya id), diisi id kelompok yang
     * sedang diedit saat update() (biar anggota lama yang disimpan ulang
     * di kelompok yang sama tidak dianggap konflik dgn dirinya sendiri).
     * Siswa dari kelompok yang sudah berstatus Selesai TIDAK dianggap
     * konflik — mereka boleh direkrut lagi ke kelompok/periode PKL baru.
     */
    private static function rejectIfMembersAlreadyActive(PDO $db, array $studentIds, int $excludeGroupId): void
    {
        $studentIds = array_values(array_unique(array_filter(
            $studentIds,
            static fn ($id) => $id !== null && $id !== ''
        )));
        if (!$studentIds) {
            return;
        }

        $placeholders = implode(',', array_fill(0, count($studentIds), '?'));
        $stmt = $db->prepare(
            "SELECT s.nama AS siswa_nama, ig.nama AS kelompok_nama
             FROM group_members gm
             JOIN internship_groups ig ON ig.id = gm.group_id
             JOIN students s ON s.id = gm.student_id
             WHERE gm.student_id IN ({$placeholders})
               AND gm.group_id <> ?
               AND ig.status = 'Aktif'"
        );
        $stmt->execute([...$studentIds, $excludeGroupId]);
        $conflicts = $stmt->fetchAll();

        if ($conflicts) {
            $detail = array_map(
                static fn ($row) => "{$row['siswa_nama']} sudah tergabung di kelompok magang \"{$row['kelompok_nama']}\" (status Aktif)",
                $conflicts
            );
            Response::error(
                'Tidak bisa menyimpan anggota: ' . implode('; ', $detail)
                    . '. Ubah status kelompok lama jadi "Selesai" dulu, atau keluarkan siswa tsb dari kelompok lama, sebelum menambahkannya ke kelompok ini.',
                422,
                ['anggota' => $detail]
            );
        }
    }

    private static function validate(array $data, bool $isCreate): ?array
    {
        $errors = [];
        if ($isCreate) {
            foreach (['nama', 'company_id', 'periode_mulai', 'periode_selesai'] as $field) {
                if (empty($data[$field])) {
                    $errors[$field] = "{$field} wajib diisi.";
                }
            }
        }
        $validStatus = ['Aktif', 'Selesai'];
        if (isset($data['status']) && !in_array($data['status'], $validStatus, true)) {
            $errors['status'] = 'status tidak valid.';
        }
        return $errors ?: null;
    }
}
