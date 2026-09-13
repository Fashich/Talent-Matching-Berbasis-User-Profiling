<?php
// controllers/AuthController.php
// Modul Authentication (kontrak CD-4 §4.2: Login → email/username+password
// → session/role). Login pakai username+password, hasilnya token Bearer
// (bukan session/cookie, karena frontend SPA cross-origin dari backend XAMPP).

class AuthController
{
    public static function login(): void
    {
        $username = trim((string) Request::input('username', ''));
        $password = (string) Request::input('password', '');

        if ($username === '' || $password === '') {
            Response::error('Username dan password wajib diisi.', 422);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM users WHERE username = :username LIMIT 1');
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            Response::error('Username atau password salah.', 401);
        }

        if ($user['status'] !== 'Aktif') {
            Response::error('Akun kamu nonaktif, hubungi Administrator.', 403);
        }

        $tokenData = Auth::generateToken((int) $user['id']);

        Response::success([
            'token'      => $tokenData['token'],
            'expires_at' => $tokenData['expires_at'],
            'user'       => [
                'id'        => $user['id'],
                'username'  => $user['username'],
                'nama'      => $user['nama'],
                'email'     => $user['email'],
                'role'      => $user['role'],
                'linked_id' => $user['role'] === 'Siswa' ? Auth::studentIdFor((int) $user['id']) : null,
            ],
        ], 'Login berhasil.');
    }

    public static function logout(): void
    {
        Auth::requireLogin();
        $token = Request::bearerToken();

        $db = Database::getConnection();
        $stmt = $db->prepare('DELETE FROM auth_tokens WHERE token = :token');
        $stmt->execute(['token' => $token]);

        Response::success(null, 'Logout berhasil.');
    }

    public static function me(): void
    {
        $user = Auth::requireLogin();
        $user['linked_id'] = $user['role'] === 'Siswa' ? Auth::studentIdFor((int) $user['id']) : null;
        Response::success($user, 'Data user saat ini.');
    }
}
