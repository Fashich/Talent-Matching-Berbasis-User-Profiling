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
        Auth::requireLogin();

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

        $fields = [];
        $params = ['id' => $group['id']];
        foreach (self::UPDATABLE_FIELDS as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = :{$field}";
                $params[$field] = $data[$field];
            }
        }

        $db = Database::getConnection();
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
