<?php
// controllers/StudentController.php
// Modul Student Management (kontrak CD-4 §4.2: List/Create/Update siswa).
// Administrator & Petugas kelola semua data siswa; Guru monitoring (read-only);
// Siswa hanya kelola profilnya sendiri (ditautkan lewat students.user_id).

class StudentController
{
    private const UPDATABLE_FIELDS = [
        'nisn', 'nama', 'jenis_kelamin', 'kelas', 'jurusan', 'alamat',
        'no_hp', 'email', 'pendidikan', 'preferensi', 'portofolio', 'status',
    ];

    public static function index(): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator', 'Petugas', 'Guru']);

        $db = Database::getConnection();
        $where = [];
        $params = [];

        if ($jurusan = Request::query('jurusan')) {
            $where[] = 'jurusan = :jurusan';
            $params['jurusan'] = $jurusan;
        }
        if ($status = Request::query('status')) {
            $where[] = 'status = :status';
            $params['status'] = $status;
        }
        $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

        $stmt = $db->prepare("SELECT * FROM students {$whereSql} ORDER BY nama ASC");
        $stmt->execute($params);
        Response::success($stmt->fetchAll(), 'Daftar siswa.');
    }

    public static function show(string $id): void
    {
        $user = Auth::requireLogin();
        $student = self::findOrFail((int) $id);

        if ($user['role'] === 'Siswa' && (int) $student['id'] !== Auth::studentIdFor((int) $user['id'])) {
            Response::error('Kamu tidak punya akses ke profil siswa ini.', 403);
        }

        Response::success(self::withRelations($student), 'Detail siswa.');
    }

    public static function store(): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator', 'Petugas']);

        $data = Request::body();
        $errors = self::validate($data, true);
        if ($errors) {
            Response::error('Data siswa tidak valid.', 422, $errors);
        }

        $db = Database::getConnection();
        try {
            $db->beginTransaction();

            $stmt = $db->prepare(
                'INSERT INTO students
                    (user_id, nisn, nama, jenis_kelamin, kelas, jurusan, alamat, no_hp, email, pendidikan, preferensi, portofolio, status)
                 VALUES
                    (:user_id, :nisn, :nama, :jenis_kelamin, :kelas, :jurusan, :alamat, :no_hp, :email, :pendidikan, :preferensi, :portofolio, :status)'
            );
            $stmt->execute([
                'user_id'       => $data['user_id'] ?? null,
                'nisn'          => trim((string) $data['nisn']),
                'nama'          => trim((string) $data['nama']),
                'jenis_kelamin' => $data['jenis_kelamin'],
                'kelas'         => trim((string) $data['kelas']),
                'jurusan'       => $data['jurusan'],
                'alamat'        => $data['alamat'] ?? null,
                'no_hp'         => $data['no_hp'] ?? null,
                'email'         => $data['email'] ?? null,
                'pendidikan'    => $data['pendidikan'] ?? null,
                'preferensi'    => $data['preferensi'] ?? null,
                'portofolio'    => $data['portofolio'] ?? null,
                'status'        => $data['status'] ?? 'Belum PKL',
            ]);
            $studentId = (int) $db->lastInsertId();

            self::syncInterests($db, $studentId, $data['minat'] ?? null);
            self::syncExperiences($db, $studentId, $data['pengalaman'] ?? null);
            self::syncCompetencies($db, $studentId, $data['kompetensi'] ?? null);

            $db->commit();
        } catch (PDOException $e) {
            $db->rollBack();
            Response::error('Gagal menyimpan data siswa: ' . self::friendlyDbError($e), 422);
        }

        $student = self::findOrFail($studentId);
        Response::success(self::withRelations($student), 'Siswa berhasil ditambahkan.', 201);
    }

    public static function update(string $id): void
    {
        $user = Auth::requireLogin();
        $student = self::findOrFail((int) $id);

        $isOwner = $user['role'] === 'Siswa' && (int) $student['id'] === Auth::studentIdFor((int) $user['id']);
        if (!$isOwner) {
            Auth::requireRole($user, ['Administrator', 'Petugas']);
        }

        $data = Request::body();
        $errors = self::validate($data, false);
        if ($errors) {
            Response::error('Data siswa tidak valid.', 422, $errors);
        }

        $fields = [];
        $params = ['id' => $student['id']];
        foreach (self::UPDATABLE_FIELDS as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = :{$field}";
                $params[$field] = $data[$field];
            }
        }

        $db = Database::getConnection();
        try {
            $db->beginTransaction();

            if ($fields) {
                $sql = 'UPDATE students SET ' . implode(', ', $fields) . ' WHERE id = :id';
                $db->prepare($sql)->execute($params);
            }

            if (array_key_exists('minat', $data)) {
                self::syncInterests($db, (int) $student['id'], $data['minat']);
            }
            if (array_key_exists('pengalaman', $data)) {
                self::syncExperiences($db, (int) $student['id'], $data['pengalaman']);
            }
            if (array_key_exists('kompetensi', $data)) {
                self::syncCompetencies($db, (int) $student['id'], $data['kompetensi']);
            }

            $db->commit();
        } catch (PDOException $e) {
            $db->rollBack();
            Response::error('Gagal memperbarui data siswa: ' . self::friendlyDbError($e), 422);
        }

        Response::success(self::withRelations(self::findOrFail((int) $student['id'])), 'Data siswa berhasil diperbarui.');
    }

    public static function destroy(string $id): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator']);
        $student = self::findOrFail((int) $id);

        $db = Database::getConnection();
        try {
            $db->prepare('DELETE FROM students WHERE id = :id')->execute(['id' => $student['id']]);
        } catch (PDOException $e) {
            Response::error('Siswa tidak bisa dihapus: ' . self::friendlyDbError($e), 409);
        }

        Response::success(null, 'Siswa berhasil dihapus.');
    }

    // ---- Helpers ----

    private static function findOrFail(int $id): array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM students WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $student = $stmt->fetch();

        if (!$student) {
            Response::error('Siswa tidak ditemukan.', 404);
        }

        return $student;
    }

    private static function withRelations(array $student): array
    {
        $db = Database::getConnection();

        $interests = $db->prepare('SELECT id, minat FROM student_interests WHERE student_id = :id');
        $interests->execute(['id' => $student['id']]);

        $experiences = $db->prepare('SELECT id, judul, deskripsi FROM student_experiences WHERE student_id = :id');
        $experiences->execute(['id' => $student['id']]);

        $competencies = $db->prepare(
            'SELECT sc.id, sc.competency_id, c.nama AS competency_nama, c.kategori AS competency_kategori, sc.tingkat, sc.pengalaman_terkait, sc.sertifikasi
             FROM student_competencies sc
             JOIN competencies c ON c.id = sc.competency_id
             WHERE sc.student_id = :id'
        );
        $competencies->execute(['id' => $student['id']]);

        $student['minat']      = $interests->fetchAll();
        $student['pengalaman'] = $experiences->fetchAll();
        $student['kompetensi'] = $competencies->fetchAll();

        return $student;
    }

    private static function syncInterests(PDO $db, int $studentId, ?array $minat): void
    {
        if ($minat === null) {
            return;
        }
        $db->prepare('DELETE FROM student_interests WHERE student_id = :id')->execute(['id' => $studentId]);
        $stmt = $db->prepare('INSERT INTO student_interests (student_id, minat) VALUES (:student_id, :minat)');
        foreach ($minat as $item) {
            $stmt->execute(['student_id' => $studentId, 'minat' => (string) $item]);
        }
    }

    private static function syncExperiences(PDO $db, int $studentId, ?array $pengalaman): void
    {
        if ($pengalaman === null) {
            return;
        }
        $db->prepare('DELETE FROM student_experiences WHERE student_id = :id')->execute(['id' => $studentId]);
        $stmt = $db->prepare('INSERT INTO student_experiences (student_id, judul, deskripsi) VALUES (:student_id, :judul, :deskripsi)');
        foreach ($pengalaman as $item) {
            $stmt->execute([
                'student_id' => $studentId,
                'judul'      => (string) ($item['judul'] ?? ''),
                'deskripsi'  => $item['deskripsi'] ?? null,
            ]);
        }
    }

    private static function syncCompetencies(PDO $db, int $studentId, ?array $kompetensi): void
    {
        if ($kompetensi === null) {
            return;
        }
        $db->prepare('DELETE FROM student_competencies WHERE student_id = :id')->execute(['id' => $studentId]);
        $stmt = $db->prepare(
            'INSERT INTO student_competencies (student_id, competency_id, tingkat, pengalaman_terkait, sertifikasi)
             VALUES (:student_id, :competency_id, :tingkat, :pengalaman_terkait, :sertifikasi)'
        );
        foreach ($kompetensi as $item) {
            $stmt->execute([
                'student_id'         => $studentId,
                'competency_id'      => $item['competency_id'],
                'tingkat'            => $item['tingkat'] ?? 'Pemula',
                'pengalaman_terkait' => $item['pengalaman_terkait'] ?? null,
                'sertifikasi'        => $item['sertifikasi'] ?? null,
            ]);
        }
    }

    private static function validate(array $data, bool $isCreate): ?array
    {
        $errors = [];
        $required = ['nisn', 'nama', 'jenis_kelamin', 'kelas', 'jurusan'];

        if ($isCreate) {
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    $errors[$field] = "{$field} wajib diisi.";
                }
            }
        }
        if (isset($data['jenis_kelamin']) && !in_array($data['jenis_kelamin'], ['L', 'P'], true)) {
            $errors['jenis_kelamin'] = 'jenis_kelamin harus L atau P.';
        }
        $validStatus = ['Belum PKL', 'Diajukan', 'Berlangsung', 'Selesai'];
        if (isset($data['status']) && !in_array($data['status'], $validStatus, true)) {
            $errors['status'] = 'status tidak valid.';
        }

        return $errors ?: null;
    }

    private static function friendlyDbError(PDOException $e): string
    {
        if ((int) $e->getCode() === 23000) {
            return 'NISN atau data unik lain sudah dipakai siswa lain.';
        }
        return $e->getMessage();
    }
}
