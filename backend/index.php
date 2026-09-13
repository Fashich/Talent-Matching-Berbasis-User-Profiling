<?php
// index.php — Front controller / entry point backend EduPKL.
declare(strict_types=1);

// ---- CORS: frontend (Vite, port 5173) beda origin dari backend (XAMPP) ----
header('Access-Control-Allow-Origin: http://localhost:5173');
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
