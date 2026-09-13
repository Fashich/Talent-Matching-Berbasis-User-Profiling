<?php
// controllers/CompetencyController.php
// Modul Competency Profiling — master daftar kompetensi (kontrak CD-4 §4.2,
// bagian dari "Administration: manage data/config, master"). Semua role login
// boleh baca (buat dropdown input profil siswa/lowongan), Administrator saja
// yang boleh tambah/ubah/hapus master ini.

class CompetencyController
{
    public static function index(): void
    {
        Auth::requireLogin();

        $db = Database::getConnection();
        $where = '';
        $params = [];
        if ($kategori = Request::query('kategori')) {
            $where = 'WHERE kategori = :kategori';
            $params['kategori'] = $kategori;
        }

        $stmt = $db->prepare("SELECT * FROM competencies {$where} ORDER BY nama ASC");
        $stmt->execute($params);
        Response::success($stmt->fetchAll(), 'Daftar kompetensi.');
    }

    public static function show(string $id): void
    {
        Auth::requireLogin();
        Response::success(self::findOrFail((int) $id), 'Detail kompetensi.');
    }

    public static function store(): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator']);

        $data = Request::body();
        if (empty($data['nama'])) {
            Response::error('Data kompetensi tidak valid.', 422, ['nama' => 'nama wajib diisi.']);
        }

        $db = Database::getConnection();
        try {
            $stmt = $db->prepare('INSERT INTO competencies (nama, kategori, deskripsi) VALUES (:nama, :kategori, :deskripsi)');
            $stmt->execute([
                'nama'      => trim((string) $data['nama']),
                'kategori'  => $data['kategori'] ?? null,
                'deskripsi' => $data['deskripsi'] ?? null,
            ]);
        } catch (PDOException $e) {
            $message = (int) $e->getCode() === 23000 ? 'Nama kompetensi sudah ada.' : $e->getMessage();
            Response::error('Gagal menyimpan kompetensi: ' . $message, 422);
        }

        Response::success(self::findOrFail((int) $db->lastInsertId()), 'Kompetensi berhasil ditambahkan.', 201);
    }

    public static function update(string $id): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator']);
        $competency = self::findOrFail((int) $id);

        $data = Request::body();
        $fields = [];
        $params = ['id' => $competency['id']];
        foreach (['nama', 'kategori', 'deskripsi'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = :{$field}";
                $params[$field] = $data[$field];
            }
        }

        if ($fields) {
            $db = Database::getConnection();
            try {
                $sql = 'UPDATE competencies SET ' . implode(', ', $fields) . ' WHERE id = :id';
                $db->prepare($sql)->execute($params);
            } catch (PDOException $e) {
                $message = (int) $e->getCode() === 23000 ? 'Nama kompetensi sudah ada.' : $e->getMessage();
                Response::error('Gagal memperbarui kompetensi: ' . $message, 422);
            }
        }

        Response::success(self::findOrFail((int) $competency['id']), 'Kompetensi berhasil diperbarui.');
    }

    public static function destroy(string $id): void
    {
        $user = Auth::requireLogin();
        Auth::requireRole($user, ['Administrator']);
        $competency = self::findOrFail((int) $id);

        $db = Database::getConnection();
        try {
            $db->prepare('DELETE FROM competencies WHERE id = :id')->execute(['id' => $competency['id']]);
        } catch (PDOException $e) {
            Response::error('Kompetensi tidak bisa dihapus, masih dipakai di profil siswa: ' . $e->getMessage(), 409);
        }

        Response::success(null, 'Kompetensi berhasil dihapus.');
    }

    private static function findOrFail(int $id): array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM competencies WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $competency = $stmt->fetch();

        if (!$competency) {
            Response::error('Kompetensi tidak ditemukan.', 404);
        }

        return $competency;
    }
}
