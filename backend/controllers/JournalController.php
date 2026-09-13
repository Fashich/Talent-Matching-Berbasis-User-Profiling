<?php
// controllers/JournalController.php
// Modul Journal Management (kontrak CD-4 §4.2: Create/Read jurnal harian).
// Siswa menulis jurnal miliknya sendiri; Guru/Petugas/Administrator me-review
// (approve/revisi + catatan_pembimbing). Guru discope ke penempatan yang dia bimbing.

class JournalController
{
    private const VALID_STATUS = ['Menunggu', 'Disetujui', 'Revisi'];

    public static function index(): void
    {
        $user = Auth::requireLogin();

        $db = Database::getConnection();
        $where = [];
        $params = [];

        if ($user['role'] === 'Siswa') {
            $studentId = Auth::studentIdFor((int) $user['id']);
            $where[] = 'j.student_id = :student_id';
            $params['student_id'] = $studentId ?? 0;
        } elseif ($user['role'] === 'Guru') {
            $where[] = 'p.guru_pembimbing_id = :guru_id';
            $params['guru_id'] = $user['id'];
        }

        if ($placementId = Request::query('placement_id')) {
            $where[] = 'j.placement_id = :placement_id';
            $params['placement_id'] = $placementId;
        }
        if ($status = Request::query('status')) {
            $where[] = 'j.status = :status';
            $params['status'] = $status;
        }

        $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';
        $stmt = $db->prepare(
            "SELECT j.* FROM journals j
             JOIN placements p ON p.id = j.placement_id
             {$whereSql}
             ORDER BY j.tanggal DESC"
        );
        $stmt->execute($params);
        Response::success($stmt->fetchAll(), 'Daftar jurnal.');
    }

    public static function show(string $id): void
    {
        $user = Auth::requireLogin();
        $journal = self::findOrFail((int) $id);
        self::assertCanView($user, $journal);
        Response::success($journal, 'Detail jurnal.');
    }

    public static function store(): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Siswa']);

        $studentId = Auth::studentIdFor((int) $user['id']);
        if (!$studentId) {
            Response::error('Akun kamu belum ditautkan ke profil siswa manapun.', 403);
        }

        $data = Request::body();
        $errors = self::validate($data, true);
        if ($errors) {
            Response::error('Data jurnal tidak valid.', 422, $errors);
        }

        $placement = self::findPlacement((int) $data['placement_id']);
        if ((int) $placement['student_id'] !== $studentId) {
            Response::error('Penempatan ini bukan milik kamu.', 403);
        }

        $db = Database::getConnection();
        try {
            $stmt = $db->prepare(
                'INSERT INTO journals (placement_id, student_id, tanggal, kegiatan, kendala, status)
                 VALUES (:placement_id, :student_id, :tanggal, :kegiatan, :kendala, :status)'
            );
            $stmt->execute([
                'placement_id' => $placement['id'],
                'student_id'   => $studentId,
                'tanggal'      => $data['tanggal'],
                'kegiatan'     => $data['kegiatan'],
                'kendala'      => $data['kendala'] ?? null,
                'status'       => 'Menunggu',
            ]);
        } catch (PDOException $e) {
            $message = (int) $e->getCode() === 23000
                ? 'Jurnal untuk tanggal ini sudah pernah diisi.'
                : $e->getMessage();
            Response::error('Gagal menyimpan jurnal: ' . $message, 422);
        }

        Response::success(self::findOrFail((int) $db->lastInsertId()), 'Jurnal berhasil disimpan.', 201);
    }

    public static function update(string $id): void
    {
        $user = Auth::requireLogin();
        $journal = self::findOrFail((int) $id);
        $data = Request::body();

        $fields = [];
        $params = ['id' => $journal['id']];

        if ($user['role'] === 'Siswa') {
            $studentId = Auth::studentIdFor((int) $user['id']);
            if ((int) $journal['student_id'] !== $studentId) {
                Response::error('Jurnal ini bukan milik kamu.', 403);
            }
            if (!in_array($journal['status'], ['Menunggu', 'Revisi'], true)) {
                Response::error('Jurnal yang sudah disetujui tidak bisa diubah lagi.', 409);
            }
            foreach (['kegiatan', 'kendala'] as $field) {
                if (array_key_exists($field, $data)) {
                    $fields[] = "{$field} = :{$field}";
                    $params[$field] = $data[$field];
                }
            }
            if ($fields) {
                $fields[] = 'status = :status';
                $params['status'] = 'Menunggu';
            }
        } else {
            Auth::requireRole($user, ['Administrator', 'Petugas', 'Guru']);
            if (isset($data['status'])) {
                if (!in_array($data['status'], self::VALID_STATUS, true)) {
                    Response::error('status tidak valid.', 422);
                }
                $fields[] = 'status = :status';
                $params['status'] = $data['status'];
            }
            if (array_key_exists('catatan_pembimbing', $data)) {
                $fields[] = 'catatan_pembimbing = :catatan_pembimbing';
                $params['catatan_pembimbing'] = $data['catatan_pembimbing'];
            }
        }

        if ($fields) {
            $db = Database::getConnection();
            $sql = 'UPDATE journals SET ' . implode(', ', $fields) . ' WHERE id = :id';
            $db->prepare($sql)->execute($params);
        }

        Response::success(self::findOrFail((int) $journal['id']), 'Jurnal berhasil diperbarui.');
    }

    public static function destroy(string $id): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator']);
        $journal = self::findOrFail((int) $id);

        $db = Database::getConnection();
        $db->prepare('DELETE FROM journals WHERE id = :id')->execute(['id' => $journal['id']]);

        Response::success(null, 'Jurnal berhasil dihapus.');
    }

    // ---- Helpers ----

    private static function findOrFail(int $id): array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM journals WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $journal = $stmt->fetch();

        if (!$journal) {
            Response::error('Jurnal tidak ditemukan.', 404);
        }

        return $journal;
    }

    private static function findPlacement(int $id): array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM placements WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $placement = $stmt->fetch();

        if (!$placement) {
            Response::error('Penempatan tidak ditemukan.', 404);
        }

        return $placement;
    }

    private static function assertCanView(array $user, array $journal): void
    {
        if (in_array($user['role'], ['Administrator', 'Petugas'], true)) {
            return;
        }
        if ($user['role'] === 'Siswa' && (int) $journal['student_id'] === Auth::studentIdFor((int) $user['id'])) {
            return;
        }
        if ($user['role'] === 'Guru') {
            $placement = self::findPlacement((int) $journal['placement_id']);
            if ((int) $placement['guru_pembimbing_id'] === (int) $user['id']) {
                return;
            }
        }
        Response::error('Kamu tidak punya akses ke jurnal ini.', 403);
    }

    private static function validate(array $data, bool $isCreate): ?array
    {
        $errors = [];
        if ($isCreate) {
            foreach (['placement_id', 'tanggal', 'kegiatan'] as $field) {
                if (empty($data[$field])) {
                    $errors[$field] = "{$field} wajib diisi.";
                }
            }
        }
        return $errors ?: null;
    }
}
