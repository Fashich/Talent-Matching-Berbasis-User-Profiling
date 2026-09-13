<?php
// core/Auth.php
// Middleware autentikasi — verifikasi token Bearer terhadap tabel auth_tokens.
// Panggil Auth::requireLogin() sebagai baris pertama di controller yang butuh
// login (semua endpoint kecuali /api/auth/login).

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/Request.php';

class Auth
{
    public static function requireLogin(): array
    {
        $token = Request::bearerToken();

        if (!$token) {
            Response::error('Token tidak ditemukan. Sertakan header Authorization: Bearer <token>.', 401);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare(
            'SELECT u.id, u.username, u.nama, u.email, u.role, u.status,
                    at.expires_at
             FROM auth_tokens at
             JOIN users u ON u.id = at.user_id
             WHERE at.token = :token
             LIMIT 1'
        );
        $stmt->execute(['token' => $token]);
        $row = $stmt->fetch();

        if (!$row) {
            Response::error('Token tidak valid.', 401);
        }

        if (strtotime($row['expires_at']) < time()) {
            Response::error('Token sudah kedaluwarsa, silakan login ulang.', 401);
        }

        if ($row['status'] !== 'Aktif') {
            Response::error('Akun tidak aktif.', 403);
        }

        return $row;
    }

    /**
     * Panggil setelah requireLogin() kalau endpoint cuma boleh diakses role
     * tertentu. Contoh: Auth::requireRole($user, ['Administrator']);
     */
    public static function requireRole(array $user, array $allowedRoles): void
    {
        if (!in_array($user['role'], $allowedRoles, true)) {
            Response::error('Kamu tidak punya akses ke resource ini.', 403);
        }
    }

    /**
     * Resolve id baris `students` milik user yang login (dipakai untuk
     * scoping akses role Siswa ke data miliknya sendiri). Null kalau user
     * ini bukan siswa atau belum ada profil siswa yang ditautkan.
     */
    public static function studentIdFor(int $userId): ?int
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT id FROM students WHERE user_id = :user_id LIMIT 1');
        $stmt->execute(['user_id' => $userId]);
        $row = $stmt->fetch();
        return $row ? (int) $row['id'] : null;
    }

    public static function generateToken(int $userId, int $ttlHours = 24): array
    {
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + ($ttlHours * 3600));

        $db = Database::getConnection();
        $stmt = $db->prepare(
            'INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)'
        );
        $stmt->execute([
            'user_id'    => $userId,
            'token'      => $token,
            'expires_at' => $expiresAt,
        ]);

        return ['token' => $token, 'expires_at' => $expiresAt];
    }
}
