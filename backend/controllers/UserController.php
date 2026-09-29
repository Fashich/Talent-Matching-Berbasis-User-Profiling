<?php
// controllers/UserController.php
// Modul Administration — kelola akun user (kontrak CD-4 §4.2: "Administration:
// user, master, keyword, mapping"). Administrator-only untuk semua operasi.
// Juga menyediakan realisasi requirement "Reset Password" (CD-4 §2.9): admin
// reset kredensial akun user lain — BUKAN flow self-service lupa password.

class UserController
{
    private const VALID_ROLES = ['Administrator', 'Petugas', 'Guru', 'Siswa'];
    private const SAFE_COLUMNS = 'id, username, nama, email, role, status, created_at, updated_at';

    public static function index(): void
    {
        $user = Auth::requireLogin();
        // Petugas juga boleh baca daftar user (bukan cuma Administrator) —
        // dibutuhkan buat pilih akun Guru pembimbing saat kelola Kelompok
        // Magang/Penempatan. Create/update/delete/reset-password tetap
        // Administrator-only (lihat method lain di controller ini).
        Auth::requireRole($user, ['Administrator', 'Petugas']);

        $db = Database::getConnection();
        $where = [];
        $params = [];
        if ($role = Request::query('role')) {
            $where[] = 'role = :role';
            $params['role'] = $role;
        }
        $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

        $stmt = $db->prepare('SELECT ' . self::SAFE_COLUMNS . " FROM users {$whereSql} ORDER BY nama ASC");
        $stmt->execute($params);
        Response::success($stmt->fetchAll(), 'Daftar user.');
    }

    public static function show(string $id): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator']);
        Response::success(self::findOrFail((int) $id), 'Detail user.');
    }

    public static function store(): void
    {
        $admin = Auth::requireLogin();
        Auth::requireRole($admin, ['Administrator']);

        $data = Request::body();
        $errors = self::validate($data, true);
        if ($errors) {
            Response::error('Data user tidak valid.', 422, $errors);
        }

        $db = Database::getConnection();
        try {
            $db->beginTransaction();

            $stmt = $db->prepare(
                'INSERT INTO users (username, password, nama, email, role, status)
                 VALUES (:username, :password, :nama, :email, :role, :status)'
            );
            $stmt->execute([
                'username' => trim((string) $data['username']),
                'password' => password_hash((string) $data['password'], PASSWORD_BCRYPT),
                'nama'     => trim((string) $data['nama']),
                'email'    => $data['email'] ?? null,
                'role'     => $data['role'],
                'status'   => $data['status'] ?? 'Aktif',
            ]);
            $userId = (int) $db->lastInsertId();

            // Kalau role Siswa dan ditautkan ke profil siswa yang sudah ada
            // (dibuat Petugas sebelumnya tanpa akun login), tautkan di sini.
            if ($data['role'] === 'Siswa' && !empty($data['student_id'])) {
                $link = $db->prepare('UPDATE students SET user_id = :user_id WHERE id = :student_id AND user_id IS NULL');
                $link->execute(['user_id' => $userId, 'student_id' => $data['student_id']]);
                if ($link->rowCount() === 0) {
                    throw new PDOException('Profil siswa tidak ditemukan atau sudah ditautkan ke akun lain.');
                }
            }

            $db->commit();
        } catch (PDOException $e) {
            $db->rollBack();
            $message = (int) $e->getCode() === 23000 ? 'Username atau email sudah dipakai.' : $e->getMessage();
            Response::error('Gagal menyimpan user: ' . $message, 422);
        }

        Response::success(self::findOrFail($userId), 'User berhasil ditambahkan.', 201);
    }

    public static function update(string $id): void
    {
        $admin = Auth::requireLogin();
        Auth::requireRole($admin, ['Administrator']);
        $target = self::findOrFail((int) $id);

        $data = Request::body();
        $errors = self::validate($data, false);
        if ($errors) {
            Response::error('Data user tidak valid.', 422, $errors);
        }

        $fields = [];
        $params = ['id' => $target['id']];
        foreach (['username', 'nama', 'email', 'role', 'status'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = :{$field}";
                $params[$field] = $data[$field];
            }
        }

        $db = Database::getConnection();
        try {
            $db->beginTransaction();

            if ($fields) {
                $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = :id';
                $db->prepare($sql)->execute($params);
            }

            // Tautkan/lepas-tautkan akun ke profil siswa — kontrak sama seperti
            // store(), tapi juga bisa dipakai buat akun Siswa yang dibuat
            // SEBELUM field penautan ini ada di form (mis. akun demo siswa1),
            // atau utk mengganti tautan ke siswa lain. Bug 23 Sept 2026
            // (laporan Hadiid): akun Siswa yang dibuat via form User TIDAK
            // PERNAH tertaut ke profil siswa manapun karena store() cuma
            // menautkan kalau student_id dikirim, dan form lama tidak pernah
            // mengirimnya sama sekali -> linked_id selalu null -> Profil,
            // Kompetensi, Jurnal, dan Recommendation semua kosong utk role
            // Siswa manapun. student_id null/kosong = lepas tautan.
            if (array_key_exists('student_id', $data)) {
                $db->prepare('UPDATE students SET user_id = NULL WHERE user_id = :user_id')
                    ->execute(['user_id' => $target['id']]);

                if (!empty($data['student_id'])) {
                    $link = $db->prepare('UPDATE students SET user_id = :user_id WHERE id = :student_id AND user_id IS NULL');
                    $link->execute(['user_id' => $target['id'], 'student_id' => $data['student_id']]);
                    if ($link->rowCount() === 0) {
                        throw new PDOException('Profil siswa tidak ditemukan atau sudah ditautkan ke akun lain.');
                    }
                }
            }

            $db->commit();
        } catch (PDOException $e) {
            $db->rollBack();
            $message = (int) $e->getCode() === 23000 ? 'Username atau email sudah dipakai.' : $e->getMessage();
            Response::error('Gagal memperbarui user: ' . $message, 422);
        }

        Response::success(self::findOrFail((int) $target['id']), 'User berhasil diperbarui.');
    }

    public static function destroy(string $id): void
    {
        $admin = Auth::requireLogin();
        Auth::requireRole($admin, ['Administrator']);
        $target = self::findOrFail((int) $id);

        if ((int) $target['id'] === (int) $admin['id']) {
            Response::error('Kamu tidak bisa menghapus akunmu sendiri.', 409);
        }

        $db = Database::getConnection();
        $db->prepare('DELETE FROM users WHERE id = :id')->execute(['id' => $target['id']]);

        Response::success(null, 'User berhasil dihapus.');
    }

    /**
     * PUT /api/users/{id}/reset-password — realisasi CD-4 §2.9. Administrator
     * set password baru untuk akun user lain (mis. siswa lupa password).
     * Semua token aktif user itu ikut direvoke supaya wajib login ulang.
     */
    public static function resetPassword(string $id): void
    {
        $admin = Auth::requireLogin();
        Auth::requireRole($admin, ['Administrator']);
        $target = self::findOrFail((int) $id);

        $data = Request::body();
        $newPassword = (string) ($data['new_password'] ?? '');
        if (strlen($newPassword) < 6) {
            Response::error('Password baru minimal 6 karakter.', 422, ['new_password' => 'minimal 6 karakter.']);
        }

        $db = Database::getConnection();
        $db->beginTransaction();
        $db->prepare('UPDATE users SET password = :password WHERE id = :id')->execute([
            'password' => password_hash($newPassword, PASSWORD_BCRYPT),
            'id'       => $target['id'],
        ]);
        $db->prepare('DELETE FROM auth_tokens WHERE user_id = :id')->execute(['id' => $target['id']]);
        $db->commit();

        Response::success(null, 'Password user berhasil direset. Semua sesi login user ini sudah otomatis logout.');
    }

    private static function findOrFail(int $id): array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT ' . self::SAFE_COLUMNS . ' FROM users WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('User tidak ditemukan.', 404);
        }

        return $user;
    }

    private static function validate(array $data, bool $isCreate): ?array
    {
        $errors = [];
        if ($isCreate) {
            foreach (['username', 'password', 'nama', 'role'] as $field) {
                if (empty($data[$field])) {
                    $errors[$field] = "{$field} wajib diisi.";
                }
            }
            if (isset($data['password']) && strlen((string) $data['password']) < 6) {
                $errors['password'] = 'password minimal 6 karakter.';
            }
        }
        if (isset($data['role']) && !in_array($data['role'], self::VALID_ROLES, true)) {
            $errors['role'] = 'role tidak valid.';
        }
        if (isset($data['status']) && !in_array($data['status'], ['Aktif', 'Nonaktif'], true)) {
            $errors['status'] = 'status tidak valid.';
        }
        return $errors ?: null;
    }
}
