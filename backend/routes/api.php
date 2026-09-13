<?php
// routes/api.php
// Daftar semua route API. Ditambah bertahap seiring modul dikerjakan —
// urutan: Auth (selesai) -> Siswa/Perusahaan/KelompokMagang/Penempatan/
// Jurnal/Kompetensi/User (task #15) -> Matching/Recommendation (task #16).

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/StudentController.php';
require_once __DIR__ . '/../controllers/CompanyController.php';
require_once __DIR__ . '/../controllers/InternshipGroupController.php';
require_once __DIR__ . '/../controllers/PlacementController.php';
require_once __DIR__ . '/../controllers/JournalController.php';
require_once __DIR__ . '/../controllers/CompetencyController.php';
require_once __DIR__ . '/../controllers/UserController.php';

// ---- Health Check ----
// Dipakai fitur "No Connection/Lost Signal" (task #18) di frontend buat
// ngecek apakah backend nyala — publik, tanpa auth, tanpa sentuh DB.
$router->get('/api/health', function () {
    Response::success(['status' => 'ok', 'time' => date('c')], 'Server aktif.');
});

// ---- Authentication ----
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/logout', [AuthController::class, 'logout']);
$router->get('/api/auth/me', [AuthController::class, 'me']);

// ---- Student Management (Siswa) ----
$router->get('/api/siswa', [StudentController::class, 'index']);
$router->post('/api/siswa', [StudentController::class, 'store']);
$router->get('/api/siswa/{id}', [StudentController::class, 'show']);
$router->put('/api/siswa/{id}', [StudentController::class, 'update']);
$router->delete('/api/siswa/{id}', [StudentController::class, 'destroy']);

// ---- Company Management (Perusahaan) ----
$router->get('/api/perusahaan', [CompanyController::class, 'index']);
$router->post('/api/perusahaan', [CompanyController::class, 'store']);
$router->get('/api/perusahaan/{id}', [CompanyController::class, 'show']);
$router->put('/api/perusahaan/{id}', [CompanyController::class, 'update']);
$router->delete('/api/perusahaan/{id}', [CompanyController::class, 'destroy']);

// ---- Internship Management (Kelompok Magang) ----
$router->get('/api/kelompok-magang', [InternshipGroupController::class, 'index']);
$router->post('/api/kelompok-magang', [InternshipGroupController::class, 'store']);
$router->get('/api/kelompok-magang/{id}', [InternshipGroupController::class, 'show']);
$router->put('/api/kelompok-magang/{id}', [InternshipGroupController::class, 'update']);
$router->delete('/api/kelompok-magang/{id}', [InternshipGroupController::class, 'destroy']);

// ---- Placement Management (Penempatan & Penerimaan) ----
$router->get('/api/penempatan', [PlacementController::class, 'index']);
$router->post('/api/penempatan', [PlacementController::class, 'store']);
$router->get('/api/penempatan/{id}', [PlacementController::class, 'show']);
$router->put('/api/penempatan/{id}', [PlacementController::class, 'update']);
$router->delete('/api/penempatan/{id}', [PlacementController::class, 'destroy']);

// ---- Journal Management (Jurnal) ----
$router->get('/api/jurnal', [JournalController::class, 'index']);
$router->post('/api/jurnal', [JournalController::class, 'store']);
$router->get('/api/jurnal/{id}', [JournalController::class, 'show']);
$router->put('/api/jurnal/{id}', [JournalController::class, 'update']);
$router->delete('/api/jurnal/{id}', [JournalController::class, 'destroy']);

// ---- Competency Profiling (Kompetensi, master list) ----
$router->get('/api/kompetensi', [CompetencyController::class, 'index']);
$router->post('/api/kompetensi', [CompetencyController::class, 'store']);
$router->get('/api/kompetensi/{id}', [CompetencyController::class, 'show']);
$router->put('/api/kompetensi/{id}', [CompetencyController::class, 'update']);
$router->delete('/api/kompetensi/{id}', [CompetencyController::class, 'destroy']);

// ---- Administration (User) ----
$router->get('/api/users', [UserController::class, 'index']);
$router->post('/api/users', [UserController::class, 'store']);
$router->get('/api/users/{id}', [UserController::class, 'show']);
$router->put('/api/users/{id}', [UserController::class, 'update']);
$router->delete('/api/users/{id}', [UserController::class, 'destroy']);
$router->put('/api/users/{id}/reset-password', [UserController::class, 'resetPassword']);

// ---- Talent Matching & Recommendation ----
require_once __DIR__ . '/../controllers/MatchingController.php';
$router->post('/api/matching/calculate', [MatchingController::class, 'calculate']);
$router->get('/api/recommendation/{studentId}', [MatchingController::class, 'recommendation']);
