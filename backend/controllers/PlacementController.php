<?php
// controllers/PlacementController.php
// Modul Placement Management (kontrak CD-4 §4.2: Manage placement — siswa,
// perusahaan, status -> data penempatan). Administrator & Petugas kelola
// penuh; Guru & Siswa hanya baca, discope ke penempatan yang relevan buat
// mereka (Guru = yang dia bimbing, Siswa = miliknya sendiri).

class PlacementController
{
    private const UPDATABLE_FIELDS = [
        'student_id', 'company_id', 'group_id', 'guru_pembimbing_id',
        'tanggal_mulai', 'tanggal_selesai', 'status',
    ];

    private const VALID_STATUS = ['Diajukan', 'Diterima', 'Ditolak', 'Berlangsung', 'Selesai'];

    public static function index(): void
    {
        $user = Auth::requireLogin();

        $db = Database::getConnection();
        $where = [];
        $params = [];

        if ($user['role'] === 'Siswa') {
            $studentId = Auth::studentIdFor((int) $user['id']);
            $where[] = 'student_id = :student_id';
            $params['student_id'] = $studentId ?? 0;
        } elseif ($user['role'] === 'Guru') {
            $where[] = 'guru_pembimbing_id = :guru_id';
            $params['guru_id'] = $user['id'];
        }

        if ($status = Request::query('status')) {
            $where[] = 'status = :status';
            $params['status'] = $status;
        }
        if ($companyId = Request::query('company_id')) {
            $where[] = 'company_id = :company_id';
            $params['company_id'] = $companyId;
        }

        $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';
        $stmt = $db->prepare(
            "SELECT pl.*, u.nama AS guru_pembimbing_nama
             FROM placements pl
             LEFT JOIN users u ON u.id = pl.guru_pembimbing_id
             {$whereSql}
             ORDER BY pl.tanggal_mulai DESC"
        );
        $stmt->execute($params);
        Response::success($stmt->fetchAll(), 'Daftar penempatan.');
    }

    public static function show(string $id): void
    {
        $user = Auth::requireLogin();
        $placement = self::findOrFail((int) $id);
        self::assertCanView($user, $placement);
        Response::success($placement, 'Detail penempatan.');
    }

    public static function store(): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator', 'Petugas']);

        $data = Request::body();
        $errors = self::validate($data, true);
        if ($errors) {
            Response::error('Data penempatan tidak valid.', 422, $errors);
        }

        $db = Database::getConnection();
        try {
            $stmt = $db->prepare(
                'INSERT INTO placements (student_id, company_id, group_id, guru_pembimbing_id, tanggal_mulai, tanggal_selesai, status)
                 VALUES (:student_id, :company_id, :group_id, :guru_pembimbing_id, :tanggal_mulai, :tanggal_selesai, :status)'
            );
            $stmt->execute([
                'student_id'         => $data['student_id'],
                'company_id'         => $data['company_id'],
                'group_id'           => $data['group_id'] ?? null,
                'guru_pembimbing_id' => $data['guru_pembimbing_id'] ?? null,
                'tanggal_mulai'      => $data['tanggal_mulai'],
                'tanggal_selesai'    => $data['tanggal_selesai'],
                'status'             => $data['status'] ?? 'Diajukan',
            ]);
        } catch (PDOException $e) {
            Response::error('Gagal menyimpan penempatan: ' . $e->getMessage(), 422);
        }

        $placement = self::findOrFail((int) $db->lastInsertId());
        Response::success($placement, 'Penempatan berhasil ditambahkan.', 201);
    }

    public static function update(string $id): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator', 'Petugas']);
        $placement = self::findOrFail((int) $id);

        $data = Request::body();
        $errors = self::validate($data, false);
        if ($errors) {
            Response::error('Data penempatan tidak valid.', 422, $errors);
        }

        $fields = [];
        $params = ['id' => $placement['id']];
        foreach (self::UPDATABLE_FIELDS as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = :{$field}";
                $params[$field] = $data[$field];
            }
        }

        if (!$fields) {
            Response::success($placement, 'Tidak ada perubahan.');
        }

        $db = Database::getConnection();
        try {
            $sql = 'UPDATE placements SET ' . implode(', ', $fields) . ' WHERE id = :id';
            $db->prepare($sql)->execute($params);
        } catch (PDOException $e) {
            Response::error('Gagal memperbarui penempatan: ' . $e->getMessage(), 422);
        }

        Response::success(self::findOrFail((int) $placement['id']), 'Penempatan berhasil diperbarui.');
    }

    public static function destroy(string $id): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator']);
        $placement = self::findOrFail((int) $id);

        $db = Database::getConnection();
        try {
            $db->prepare('DELETE FROM placements WHERE id = :id')->execute(['id' => $placement['id']]);
        } catch (PDOException $e) {
            Response::error('Penempatan tidak bisa dihapus (kemungkinan masih punya jurnal terkait): ' . $e->getMessage(), 409);
        }

        Response::success(null, 'Penempatan berhasil dihapus.');
    }

    // ---- Helpers ----

    private static function findOrFail(int $id): array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare(
            'SELECT pl.*, u.nama AS guru_pembimbing_nama
             FROM placements pl
             LEFT JOIN users u ON u.id = pl.guru_pembimbing_id
             WHERE pl.id = :id LIMIT 1'
        );
        $stmt->execute(['id' => $id]);
        $placement = $stmt->fetch();

        if (!$placement) {
            Response::error('Penempatan tidak ditemukan.', 404);
        }

        return $placement;
    }

    private static function assertCanView(array $user, array $placement): void
    {
        if ($user['role'] === 'Administrator' || $user['role'] === 'Petugas') {
            return;
        }
        if ($user['role'] === 'Guru' && (int) $placement['guru_pembimbing_id'] === (int) $user['id']) {
            return;
        }
        if ($user['role'] === 'Siswa' && (int) $placement['student_id'] === Auth::studentIdFor((int) $user['id'])) {
            return;
        }
        Response::error('Kamu tidak punya akses ke penempatan ini.', 403);
    }

    private static function validate(array $data, bool $isCreate): ?array
    {
        $errors = [];
        if ($isCreate) {
            foreach (['student_id', 'company_id', 'tanggal_mulai', 'tanggal_selesai'] as $field) {
                if (empty($data[$field])) {
                    $errors[$field] = "{$field} wajib diisi.";
                }
            }
        }
        if (isset($data['status']) && !in_array($data['status'], self::VALID_STATUS, true)) {
            $errors['status'] = 'status tidak valid.';
        }
        return $errors ?: null;
    }
}
