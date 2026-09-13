<?php
// controllers/CompanyController.php
// Modul Company Management (kontrak CD-4 §4.2: List/Create/Update perusahaan).
// Administrator & Petugas kelola data perusahaan + lowongan (company_requirements);
// Guru & Siswa hanya baca (lihat perusahaan mitra & lowongan yang dibuka).

class CompanyController
{
    private const UPDATABLE_FIELDS = [
        'nama', 'bidang_usaha', 'alamat', 'telepon', 'email', 'penanggung_jawab', 'kuota', 'status',
    ];

    public static function index(): void
    {
        Auth::requireLogin();

        $db = Database::getConnection();
        $where = [];
        $params = [];

        if ($bidang = Request::query('bidang_usaha')) {
            $where[] = 'bidang_usaha = :bidang_usaha';
            $params['bidang_usaha'] = $bidang;
        }
        if ($status = Request::query('status')) {
            $where[] = 'status = :status';
            $params['status'] = $status;
        }
        $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

        $stmt = $db->prepare("SELECT * FROM companies {$whereSql} ORDER BY nama ASC");
        $stmt->execute($params);
        $companies = array_map([self::class, 'withRequirements'], $stmt->fetchAll());
        Response::success($companies, 'Daftar perusahaan.');
    }

    public static function show(string $id): void
    {
        Auth::requireLogin();
        $company = self::findOrFail((int) $id);
        Response::success(self::withRequirements($company), 'Detail perusahaan.');
    }

    public static function store(): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator', 'Petugas']);

        $data = Request::body();
        $errors = self::validate($data, true);
        if ($errors) {
            Response::error('Data perusahaan tidak valid.', 422, $errors);
        }

        $db = Database::getConnection();
        try {
            $db->beginTransaction();

            $stmt = $db->prepare(
                'INSERT INTO companies (nama, bidang_usaha, alamat, telepon, email, penanggung_jawab, kuota, status)
                 VALUES (:nama, :bidang_usaha, :alamat, :telepon, :email, :penanggung_jawab, :kuota, :status)'
            );
            $stmt->execute([
                'nama'             => trim((string) $data['nama']),
                'bidang_usaha'     => trim((string) $data['bidang_usaha']),
                'alamat'           => $data['alamat'] ?? null,
                'telepon'          => $data['telepon'] ?? null,
                'email'            => $data['email'] ?? null,
                'penanggung_jawab' => $data['penanggung_jawab'] ?? null,
                'kuota'            => $data['kuota'] ?? 0,
                'status'           => $data['status'] ?? 'Aktif',
            ]);
            $companyId = (int) $db->lastInsertId();

            self::syncRequirements($db, $companyId, $data['requirements'] ?? null);

            $db->commit();
        } catch (PDOException $e) {
            $db->rollBack();
            Response::error('Gagal menyimpan data perusahaan: ' . $e->getMessage(), 422);
        }

        Response::success(self::withRequirements(self::findOrFail($companyId)), 'Perusahaan berhasil ditambahkan.', 201);
    }

    public static function update(string $id): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator', 'Petugas']);
        $company = self::findOrFail((int) $id);

        $data = Request::body();
        $errors = self::validate($data, false);
        if ($errors) {
            Response::error('Data perusahaan tidak valid.', 422, $errors);
        }

        $fields = [];
        $params = ['id' => $company['id']];
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
                $sql = 'UPDATE companies SET ' . implode(', ', $fields) . ' WHERE id = :id';
                $db->prepare($sql)->execute($params);
            }

            if (array_key_exists('requirements', $data)) {
                self::syncRequirements($db, (int) $company['id'], $data['requirements']);
            }

            $db->commit();
        } catch (PDOException $e) {
            $db->rollBack();
            Response::error('Gagal memperbarui data perusahaan: ' . $e->getMessage(), 422);
        }

        Response::success(self::withRequirements(self::findOrFail((int) $company['id'])), 'Data perusahaan berhasil diperbarui.');
    }

    public static function destroy(string $id): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator']);
        $company = self::findOrFail((int) $id);

        $db = Database::getConnection();
        try {
            $db->prepare('DELETE FROM companies WHERE id = :id')->execute(['id' => $company['id']]);
        } catch (PDOException $e) {
            Response::error('Perusahaan tidak bisa dihapus (kemungkinan masih punya kelompok magang/penempatan aktif): ' . $e->getMessage(), 409);
        }

        Response::success(null, 'Perusahaan berhasil dihapus.');
    }

    // ---- Helpers ----

    private static function findOrFail(int $id): array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM companies WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $company = $stmt->fetch();

        if (!$company) {
            Response::error('Perusahaan tidak ditemukan.', 404);
        }

        return $company;
    }

    private static function withRequirements(array $company): array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM company_requirements WHERE company_id = :id ORDER BY id ASC');
        $stmt->execute(['id' => $company['id']]);
        $requirements = $stmt->fetchAll();

        foreach ($requirements as &$req) {
            $majors = $db->prepare('SELECT jurusan FROM requirement_majors WHERE requirement_id = :id');
            $majors->execute(['id' => $req['id']]);
            $req['jurusan_relevan'] = array_column($majors->fetchAll(), 'jurusan');

            $comps = $db->prepare('SELECT kompetensi FROM requirement_competencies WHERE requirement_id = :id');
            $comps->execute(['id' => $req['id']]);
            $req['kompetensi_dibutuhkan'] = array_column($comps->fetchAll(), 'kompetensi');
        }
        unset($req);

        $company['requirements'] = $requirements;
        return $company;
    }

    private static function syncRequirements(PDO $db, int $companyId, ?array $requirements): void
    {
        if ($requirements === null) {
            return;
        }

        // Hapus requirement lama (requirement_majors & requirement_competencies ikut
        // terhapus lewat FOREIGN KEY ... ON DELETE CASCADE).
        $db->prepare('DELETE FROM company_requirements WHERE company_id = :id')->execute(['id' => $companyId]);

        $reqStmt = $db->prepare(
            'INSERT INTO company_requirements (company_id, posisi, pendidikan_dibutuhkan, tingkat_pengalaman, kriteria_lain)
             VALUES (:company_id, :posisi, :pendidikan_dibutuhkan, :tingkat_pengalaman, :kriteria_lain)'
        );
        $majorStmt = $db->prepare('INSERT INTO requirement_majors (requirement_id, jurusan) VALUES (:requirement_id, :jurusan)');
        $compStmt  = $db->prepare('INSERT INTO requirement_competencies (requirement_id, kompetensi) VALUES (:requirement_id, :kompetensi)');

        foreach ($requirements as $req) {
            $reqStmt->execute([
                'company_id'             => $companyId,
                'posisi'                 => (string) ($req['posisi'] ?? ''),
                'pendidikan_dibutuhkan'  => $req['pendidikan_dibutuhkan'] ?? null,
                'tingkat_pengalaman'     => $req['tingkat_pengalaman'] ?? 'Tidak Diperlukan',
                'kriteria_lain'          => $req['kriteria_lain'] ?? null,
            ]);
            $requirementId = (int) $db->lastInsertId();

            foreach ($req['jurusan_relevan'] ?? [] as $jurusan) {
                $majorStmt->execute(['requirement_id' => $requirementId, 'jurusan' => $jurusan]);
            }
            foreach ($req['kompetensi_dibutuhkan'] ?? [] as $kompetensi) {
                $compStmt->execute(['requirement_id' => $requirementId, 'kompetensi' => $kompetensi]);
            }
        }
    }

    private static function validate(array $data, bool $isCreate): ?array
    {
        $errors = [];
        if ($isCreate) {
            foreach (['nama', 'bidang_usaha'] as $field) {
                if (empty($data[$field])) {
                    $errors[$field] = "{$field} wajib diisi.";
                }
            }
        }
        $validStatus = ['Aktif', 'Tidak Aktif'];
        if (isset($data['status']) && !in_array($data['status'], $validStatus, true)) {
            $errors['status'] = 'status tidak valid.';
        }
        return $errors ?: null;
    }
}
