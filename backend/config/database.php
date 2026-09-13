<?php
// config/database.php
// Koneksi database PDO — EduPKL Talent Matching Backend.
// Default di bawah cocok buat XAMPP standar (localhost, user root, tanpa
// password). Ganti kalau environment MySQL kamu beda.

class Database
{
    private static ?PDO $connection = null;

    private const HOST     = '127.0.0.1';
    private const PORT     = '3306';
    private const DB_NAME  = 'EDUPKL_CapstoneProject';
    private const USER     = 'root';
    private const PASSWORD = '';
    private const CHARSET  = 'utf8mb4';

    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                self::HOST,
                self::PORT,
                self::DB_NAME,
                self::CHARSET
            );

            try {
                self::$connection = new PDO($dsn, self::USER, self::PASSWORD, [
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
