<?php
// index.php — Front controller / entry point backend EduPKL.
declare(strict_types=1);

// ---- Config lokal server (TIDAK pernah di-commit isinya — lihat .gitignore) ----
// Kalau file ini ada (dibuat manual di server produksi via cPanel File Manager,
// isinya kredensial DB TiDB Cloud + FRONTEND_URL lewat putenv()), otomatis dimuat.
// Aman di-commit karena cuma cek file_exists() — di lokal/XAMPP file ini nggak ada,
// jadi behavior lokal TIDAK berubah sama sekali (tetap pakai .env/fallback biasa).
if (file_exists(__DIR__ . '/config/env-local.php')) {
    require_once __DIR__ . '/config/env-local.php';
}

// ---- CORS: frontend (Vite, port 5173) beda origin dari backend (XAMPP) ----
// SAAT HOSTING: set environment variable FRONTEND_URL ke domain frontend
// produksi (lewat panel hosting / .htaccess `SetEnv FRONTEND_URL ...`),
// atau ganti langsung nilai fallback di bawah. Default tetap localhost:5173
// buat dev lokal, jadi baris ini aman dibiarkan sampai siap hosting.
$frontendOrigin = getenv('FRONTEND_URL') ?: 'http://localhost:5173';
header('Access-Control-Allow-Origin: ' . $frontendOrigin);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Preflight request browser (OPTIONS) — jawab langsung tanpa proses lanjut.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/core/Request.php';
require_once __DIR__ . '/core/Router.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/core/Auth.php';

$router = new Router();
require_once __DIR__ . '/routes/api.php'; // mendaftarkan semua route ke $router

$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
