<?php
// config/database.php
// Koneksi database PDO — EduPKL Talent Matching Backend.
// Default di bawah cocok buat XAMPP standar (localhost, user root, tanpa
// password). SAAT HOSTING: set environment variable DB_HOST/DB_PORT/
// DB_NAME/DB_USER/DB_PASSWORD lewat panel hosting (jangan hardcode
// kredensial produksi di file ini karena repo-nya public) — kalau env
// var tidak di-set, fallback ke default lokal di bawah seperti biasa.
//
// DB_SSL=true (dipakai pas connect ke TiDB Cloud, WAJIB SSL di port 4000)
// mengaktifkan opsi PDO::MYSQL_ATTR_SSL_CA memakai CA bundle sistem —
// TiDB Cloud pakai sertifikat Let's Encrypt yang sudah ada di root CA
// store default OS manapun (termasuk image php:8.2-fpm/Debian di Docker),
// jadi TIDAK perlu upload/download CA cert manual.

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
            $useSsl   = filter_var(getenv('DB_SSL') ?: 'false', FILTER_VALIDATE_BOOLEAN);

            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                $host,
                $port,
                $dbName,
                $charset
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            if ($useSsl) {
                $sslCaPath = getenv('DB_SSL_CA') ?: '/etc/ssl/certs/ca-certificates.crt';
                $options[PDO::MYSQL_ATTR_SSL_CA] = $sslCaPath;
                $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
            }

            try {
                self::$connection = new PDO($dsn, $user, $password, $options);
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
