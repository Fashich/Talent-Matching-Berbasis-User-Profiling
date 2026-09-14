<?php
// config/database.php
// Koneksi database PDO — EduPKL Talent Matching Backend.
// Default di bawah cocok buat XAMPP standar (localhost, user root, tanpa
// password). SAAT HOSTING: set environment variable DB_HOST/DB_PORT/
// DB_NAME/DB_USER/DB_PASSWORD lewat panel hosting (jangan hardcode
// kredensial produksi di file ini karena repo-nya public) — kalau env
// var tidak di-set, fallback ke default lokal di bawah seperti biasa.

class Database
{
    private static ?PDO $connection = null;

    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            $host     = getenv('DB_HOST') ?: '127.0.0.1';
            $port     = getenv('DB_PORT') ?: '3306';
            $dbName   = getenv('DB_NAME') ?: 'EDUPKL_CapstoneProject';
            $user     = getenv('DB_USER') ?: 'root';
            $password = getenv('DB_PASSWORD') ?: '';
            $charset  = 'utf8mb4';

            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                $host,
                $port,
                $dbName,
                $charset
            );

            try {
                self::$connection = new PDO($dsn, $user, $password, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'success' => false,
                    'message' => 'Koneksi database gagal: ' . $e->getMessage(),
                ]);
                exit;
            }
        }

        return self::$connection;
    }
}
