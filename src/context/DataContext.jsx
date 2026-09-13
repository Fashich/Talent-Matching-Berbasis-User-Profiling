import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch, ApiError } from '../config/api';
import { useAuth } from './AuthContext';

// v3: data sungguhan dari backend PHP (bukan lagi localStorage). Context ini
// tetap mengekspos bentuk data & fungsi (addItem/updateItem/removeItem) yang
// sama seperti versi lama supaya halaman-halaman existing tidak perlu ditulis
// ulang total — translasi field camelCase lama <-> snake_case API dilakukan
// di sini ("adapter layer"). Beberapa penyesuaian bentuk data yang memang
// tidak bisa dihindari (mis. requirement perusahaan sekarang 1:N di backend,
// di sini tetap diperlakukan seperti 1:1 seperti UI lama) didokumentasikan di
// tiap fungsi *FromApi/*ToApi di bawah.

const SETTINGS_KEY = 'edupkl_settings_v1';
const defaultSettings = {
  namaSekolah: 'SMKS Rajasa Surabaya',
  npsn: '',
  alamatSekolah: '',
  kepalaSekolah: '',
  tahunAjaran: '',
  periodePklMulai: '',
  periodePklSelesai: '',
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    // localStorage tidak tersedia / rusak, pakai default.
  }
  return defaultSettings;
}

// ================= Translator: Siswa =================

function siswaFromApi(s) {
  return {
    id: s.id,
    userId: s.user_id ?? null,
    nisn: s.nisn,
    nama: s.nama,
    jenisKelamin: s.jenis_kelamin,
    kelas: s.kelas,
    jurusan: s.jurusan,
    alamat: s.alamat || '',
    hp: s.no_hp || '',
    email: s.email || '',
    pendidikan: s.pendidikan || '',
    preferensi: s.preferensi || '',
    portofolio: s.portofolio || '',
    status: s.status,
    minat: (s.minat || []).map((m) => m.minat),
    pengalaman: (s.pengalaman || []).map((p) => ({ judul: p.judul, deskripsi: p.deskripsi || '' })),
    kompetensiSiswa: (s.kompetensi || []).map((k) => ({
      id: k.id,
      siswaId: s.id,
      competencyId: k.competency_id,
      nama: k.competency_nama,
      kategori: k.competency_kategori,
      tingkat: k.tingkat,
      pengalamanTerkait: k.pengalaman_terkait || '',
      sertifikasi: k.sertifikasi || '',
    })),
  };
}

function siswaToApi(form) {
  const payload = {};
  const map = {
    nisn: 'nisn', nama: 'nama', kelas: 'kelas', jurusan: 'jurusan', alamat: 'alamat',
    email: 'email', status: 'status', pendidikan: 'pendidikan', preferensi: 'preferensi', portofolio: 'portofolio',
  };
  Object.entries(map).forEach(([from, to]) => {
    if (form[from] !== undefined) payload[to] = form[from];
  });
  if (form.jenisKelamin !== undefined) payload.jenis_kelamin = form.jenisKelamin;
  if (form.hp !== undefined) payload.no_hp = form.hp;
  if (form.minat !== undefined) payload.minat = form.minat;
  if (form.pengalaman !== undefined) payload.pengalaman = form.pengalaman.map((p) => ({ judul: p.judul, deskripsi: p.deskripsi }));
  return payload;
}

// ================= Translator: Perusahaan (+ Company Requirement 1:1) =================

function perusahaanFromApi(p) {
  const req = (p.requirements || [])[0] || null;
  return {
    id: p.id,
    nama: p.nama,
    bidang: p.bidang_usaha,
    alamat: p.alamat || '',
    telepon: p.telepon || '',
    email: p.email || '',
    penanggungJawab: p.penanggung_jawab || '',
    kuota: p.kuota,
    status: p.status,
    posisi: req?.posisi || '',
    kompetensiDibutuhkan: req?.kompetensi_dibutuhkan || [],
    jurusanRelevan: req?.jurusan_relevan || [],
    tingkatPengalaman: req?.tingkat_pengalaman || 'Tidak Diperlukan',
    pendidikanDibutuhkan: req?.pendidikan_dibutuhkan || '',
    kriteriaLain: req?.kriteria_lain || '',
  };
}

function perusahaanToApi(form) {
  return {
    nama: form.nama,
    bidang_usaha: form.bidang,
    alamat: form.alamat,
    telepon: form.telepon,
    email: form.email,
    penanggung_jawab: form.penanggungJawab,
    kuota: Number(form.kuota) || 0,
    status: form.status,
    requirements: [{
      posisi: form.posisi || '',
      pendidikan_dibutuhkan: form.pendidikanDibutuhkan || '',
      tingkat_pengalaman: form.tingkatPengalaman || 'Tidak Diperlukan',
      kriteria_lain: form.kriteriaLain || '',
      jurusan_relevan: form.jurusanRelevan || [],
      kompetensi_dibutuhkan: form.kompetensiDibutuhkan || [],
    }],
  };
}

// ================= Translator: Kelompok Magang & Penempatan =================
// Backend butuh guru_pembimbing_id (FK ke akun Guru asli), sedangkan UI lama
// pakai nama guru bebas (free-text + datalist). Nama guru DIBACA langsung
// dari backend (sudah di-JOIN), tapi untuk MENULIS nama perlu dicocokkan ke
// akun Guru yang benar-benar terdaftar — lihat resolveGuruId().

function resolveGuruId(namaGuru, guruList) {
  const nama = (namaGuru || '').trim();
  if (!nama) return null;
  const match = guruList.find((g) => g.nama.trim().toLowerCase() === nama.toLowerCase());
  if (!match) {
    throw new ApiError(
      `Guru pembimbing "${nama}" belum terdaftar sebagai akun Guru. Tambahkan dulu akunnya di halaman User (Administrator), baru pilih lagi di sini.`,
      422
    );
  }
  return match.id;
}

async function fetchGuruList() {
  const users = await apiFetch('/api/users?role=Guru');
  return users.map((u) => ({ id: u.id, nama: u.nama }));
}

function kelompokMagangFromApi(k) {
  return {
    id: k.id,
    nama: k.nama,
    perusahaanId: k.company_id,
    pembimbingGuru: k.guru_pembimbing_nama || '',
    anggotaSiswaIds: (k.anggota || []).map((a) => a.id),
    periodeMulai: k.periode_mulai,
    periodeSelesai: k.periode_selesai,
    status: k.status,
  };
}

async function kelompokMagangToApi(form) {
  const guruList = await fetchGuruList();
  return {
    nama: form.nama,
    company_id: Number(form.perusahaanId),
    guru_pembimbing_id: resolveGuruId(form.pembimbingGuru, guruList),
    periode_mulai: form.periodeMulai,
    periode_selesai: form.periodeSelesai,
    status: form.status,
    anggota: (form.anggotaSiswaIds || []).map(Number),
  };
}

function penempatanFromApi(p) {
  return {
    id: p.id,
    siswaId: p.student_id,
    perusahaanId: p.company_id,
    kelompokMagangId: p.group_id,
    guruPembimbing: p.guru_pembimbing_nama || '',
    tanggalMulai: p.tanggal_mulai,
    tanggalSelesai: p.tanggal_selesai,
    status: p.status,
  };
}

async function penempatanToApi(form) {
  const guruList = await fetchGuruList();
  return {
    student_id: Number(form.siswaId),
    company_id: Number(form.perusahaanId),
    group_id: form.kelompokMagangId ? Number(form.kelompokMagangId) : null,
    guru_pembimbing_id: resolveGuruId(form.guruPembimbing, guruList),
    tanggal_mulai: form.tanggalMulai,
    tanggal_selesai: form.tanggalSelesai,
    status: form.status,
  };
}

// ================= Translator: Jurnal =================

function jurnalFromApi(j) {
  return {
    id: j.id,
    penempatanId: j.placement_id,
    siswaId: j.student_id,
    tanggal: j.tanggal,
    kegiatan: j.kegiatan,
    kendala: j.kendala || '',
    status: j.status,
    catatanPembimbing: j.catatan_pembimbing || '',
  };
}

// ================= Translator: Users =================

function userFromApi(u, linkedId) {
  return {
    id: u.id,
    nama: u.nama,
    username: u.username,
    email: u.email || '',
    role: u.role,
    status: u.status,
    linkedId: linkedId ?? null,
  };
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [siswa, setSiswa] = useState([]);
  const [perusahaan, setPerusahaan] = useState([]);
  const [kelompokMagang, setKelompokMagang] = useState([]);
  const [penempatan, setPenempatan] = useState([]);
  const [jurnal, setJurnal] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettingsState] = useState(loadSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshAll = useCallback(async () => {
    if (!user) {
      setSiswa([]); setPerusahaan([]); setKelompokMagang([]); setPenempatan([]); setJurnal([]); setUsers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const canSeeAllSiswa = ['Administrator', 'Petugas', 'Guru'].includes(user.role);
      const canSeeUsers = ['Administrator', 'Petugas'].includes(user.role);

      const [perusahaanData, kelompokData, penempatanData, jurnalData, siswaData, usersData] = await Promise.all([
        apiFetch('/api/perusahaan'),
        apiFetch('/api/kelompok-magang'),
        apiFetch('/api/penempatan'),
        apiFetch('/api/jurnal'),
        canSeeAllSiswa
          ? apiFetch('/api/siswa')
          : user.role === 'Siswa' && user.linkedId
            ? apiFetch(`/api/siswa/${user.linkedId}`).then((s) => [s])
            : Promise.resolve([]),
        canSeeUsers ? apiFetch('/api/users') : Promise.resolve([]),
      ]);

      const siswaMapped = siswaData.map(siswaFromApi);
      const linkedIdByUserId = {};
      siswaMapped.forEach((s) => {
        if (s.userId) linkedIdByUserId[s.userId] = s.id;
      });

      setPerusahaan(perusahaanData.map(perusahaanFromApi));
      setKelompokMagang(kelompokData.map(kelompokMagangFromApi));
      setPenempatan(penempatanData.map(penempatanFromApi));
      setJurnal(jurnalData.map(jurnalFromApi));
      setSiswa(siswaMapped);
      setUsers(usersData.map((u) => userFromApi(u, linkedIdByUserId[u.id])));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat data dari server.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // abaikan kalau localStorage penuh/tidak tersedia
    }
  }, [settings]);

  const withErrorAlert = useCallback((fn) => async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Terjadi kesalahan tak terduga.';
      window.alert(message);
      throw err;
    }
  }, []);

  // ---- Kompetensi siswa: koleksi ini flat dengan siswaId (bukan nested di
  // siswa) supaya Kompetensi.jsx tidak perlu ditulis ulang. Nama kompetensi
  // bebas diketik siswa (free text) -> dicocokkan/dibuatkan ke master
  // /api/kompetensi kalau belum ada, baru ditautkan ke profil siswa lewat
  // PUT /api/siswa/{id} (array kompetensi di-replace penuh tiap kali).
  const kompetensi = siswa.flatMap((s) => s.kompetensiSiswa || []);

  const findOwnerStudent = (competencyRowId) => siswa.find((s) => (s.kompetensiSiswa || []).some((k) => k.id === competencyRowId));

  const resolveMasterCompetencyId = async (nama, kategori) => {
    const master = await apiFetch('/api/kompetensi');
    const match = master.find((m) => m.nama.trim().toLowerCase() === nama.trim().toLowerCase());
    if (match) return match.id;
    const created = await apiFetch('/api/kompetensi', { method: 'POST', body: { nama, kategori } });
    return created.id;
  };

  const syncStudentCompetencies = async (studentId, list) => {
    const updated = await apiFetch(`/api/siswa/${studentId}`, {
      method: 'PUT',
      body: {
        kompetensi: list.map((k) => ({
          competency_id: k.competencyId,
          tingkat: k.tingkat,
          pengalaman_terkait: k.pengalamanTerkait,
          sertifikasi: k.sertifikasi,
        })),
      },
    });
    const mapped = siswaFromApi(updated);
    setSiswa((prev) => prev.map((s) => (s.id === studentId ? mapped : s)));
    return mapped;
  };

  // ================= Dispatcher generik addItem/updateItem/removeItem =================
  // Mempertahankan API context lama (addItem(collection, item) dst.) supaya
  // halaman-halaman existing tidak perlu diubah pola pemanggilannya.

  const addItem = withErrorAlert(async (collection, item) => {
    switch (collection) {
      case 'siswa': {
        const created = await apiFetch('/api/siswa', { method: 'POST', body: siswaToApi(item) });
        const mapped = siswaFromApi(created);
        setSiswa((prev) => [...prev, mapped]);
        return mapped;
      }
      case 'perusahaan': {
        const created = await apiFetch('/api/perusahaan', { method: 'POST', body: perusahaanToApi(item) });
        const mapped = perusahaanFromApi(created);
        setPerusahaan((prev) => [...prev, mapped]);
        return mapped;
      }
      case 'kelompokMagang': {
        const body = await kelompokMagangToApi(item);
        const created = await apiFetch('/api/kelompok-magang', { method: 'POST', body });
        const mapped = kelompokMagangFromApi(created);
        setKelompokMagang((prev) => [...prev, mapped]);
        return mapped;
      }
      case 'penempatan': {
        const body = await penempatanToApi(item);
        const created = await apiFetch('/api/penempatan', { method: 'POST', body });
        const mapped = penempatanFromApi(created);
        setPenempatan((prev) => [...prev, mapped]);
        return mapped;
      }
      case 'jurnal': {
        const created = await apiFetch('/api/jurnal', {
          method: 'POST',
          body: { placement_id: Number(item.penempatanId), tanggal: item.tanggal, kegiatan: item.kegiatan, kendala: item.kendala || '' },
        });
        const mapped = jurnalFromApi(created);
        setJurnal((prev) => [...prev, mapped]);
        return mapped;
      }
      case 'kompetensi': {
        const student = siswa.find((s) => s.id === item.siswaId);
        if (!student) throw new ApiError('Profil siswa tidak ditemukan.', 404);
        const competencyId = await resolveMasterCompetencyId(item.nama, item.kategori);
        const nextList = [
          ...(student.kompetensiSiswa || []),
          { competencyId, tingkat: item.tingkat, pengalamanTerkait: item.pengalamanTerkait, sertifikasi: item.sertifikasi },
        ];
        await syncStudentCompetencies(student.id, nextList);
        return item;
      }
      case 'users': {
        const created = await apiFetch('/api/users', {
          method: 'POST',
          body: { username: item.username, password: item.password, nama: item.nama, email: item.email, role: item.role, status: item.status || 'Aktif' },
        });
        const mapped = userFromApi(created, null);
        setUsers((prev) => [...prev, mapped]);
        return mapped;
      }
      default:
        throw new Error(`Koleksi "${collection}" tidak dikenal.`);
    }
  });

  const updateItem = withErrorAlert(async (collection, id, patch) => {
    switch (collection) {
      case 'siswa': {
        const updated = await apiFetch(`/api/siswa/${id}`, { method: 'PUT', body: siswaToApi(patch) });
        const mapped = siswaFromApi(updated);
        setSiswa((prev) => prev.map((s) => (s.id === id ? mapped : s)));
        return mapped;
      }
      case 'perusahaan': {
        const updated = await apiFetch(`/api/perusahaan/${id}`, { method: 'PUT', body: perusahaanToApi(patch) });
        const mapped = perusahaanFromApi(updated);
        setPerusahaan((prev) => prev.map((p) => (p.id === id ? mapped : p)));
        return mapped;
      }
      case 'kelompokMagang': {
        const body = await kelompokMagangToApi(patch);
        const updated = await apiFetch(`/api/kelompok-magang/${id}`, { method: 'PUT', body });
        const mapped = kelompokMagangFromApi(updated);
        setKelompokMagang((prev) => prev.map((k) => (k.id === id ? mapped : k)));
        return mapped;
      }
      case 'penempatan': {
        const body = await penempatanToApi(patch);
        const updated = await apiFetch(`/api/penempatan/${id}`, { method: 'PUT', body });
        const mapped = penempatanFromApi(updated);
        setPenempatan((prev) => prev.map((p) => (p.id === id ? mapped : p)));
        return mapped;
      }
      case 'jurnal': {
        const body = {};
        if (patch.status !== undefined) body.status = patch.status;
        if (patch.catatanPembimbing !== undefined) body.catatan_pembimbing = patch.catatanPembimbing;
        if (patch.kegiatan !== undefined) body.kegiatan = patch.kegiatan;
        if (patch.kendala !== undefined) body.kendala = patch.kendala;
        const updated = await apiFetch(`/api/jurnal/${id}`, { method: 'PUT', body });
        const mapped = jurnalFromApi(updated);
        setJurnal((prev) => prev.map((j) => (j.id === id ? mapped : j)));
        return mapped;
      }
      case 'kompetensi': {
        const student = findOwnerStudent(id);
        if (!student) throw new ApiError('Data kompetensi tidak ditemukan.', 404);
        let competencyId = student.kompetensiSiswa.find((k) => k.id === id).competencyId;
        if (patch.nama !== undefined) {
          competencyId = await resolveMasterCompetencyId(patch.nama, patch.kategori);
        }
        const nextList = student.kompetensiSiswa.map((k) =>
          k.id === id
            ? { competencyId, tingkat: patch.tingkat ?? k.tingkat, pengalamanTerkait: patch.pengalamanTerkait ?? k.pengalamanTerkait, sertifikasi: patch.sertifikasi ?? k.sertifikasi }
            : { competencyId: k.competencyId, tingkat: k.tingkat, pengalamanTerkait: k.pengalamanTerkait, sertifikasi: k.sertifikasi }
        );
        await syncStudentCompetencies(student.id, nextList);
        return patch;
      }
      case 'users': {
        const updated = await apiFetch(`/api/users/${id}`, {
          method: 'PUT',
          body: { username: patch.username, nama: patch.nama, email: patch.email, role: patch.role, status: patch.status },
        });
        setUsers((prev) => prev.map((u) => (u.id === id ? userFromApi(updated, u.linkedId) : u)));
        return updated;
      }
      default:
        throw new Error(`Koleksi "${collection}" tidak dikenal.`);
    }
  });

  const removeItem = withErrorAlert(async (collection, id) => {
    switch (collection) {
      case 'siswa':
        await apiFetch(`/api/siswa/${id}`, { method: 'DELETE' });
        setSiswa((prev) => prev.filter((s) => s.id !== id));
        return;
      case 'perusahaan':
        await apiFetch(`/api/perusahaan/${id}`, { method: 'DELETE' });
        setPerusahaan((prev) => prev.filter((p) => p.id !== id));
        return;
      case 'kelompokMagang':
        await apiFetch(`/api/kelompok-magang/${id}`, { method: 'DELETE' });
        setKelompokMagang((prev) => prev.filter((k) => k.id !== id));
        return;
      case 'penempatan':
        await apiFetch(`/api/penempatan/${id}`, { method: 'DELETE' });
        setPenempatan((prev) => prev.filter((p) => p.id !== id));
        return;
      case 'jurnal':
        await apiFetch(`/api/jurnal/${id}`, { method: 'DELETE' });
        setJurnal((prev) => prev.filter((j) => j.id !== id));
        return;
      case 'kompetensi': {
        const student = findOwnerStudent(id);
        if (!student) return;
        const nextList = student.kompetensiSiswa.filter((k) => k.id !== id);
        await syncStudentCompetencies(student.id, nextList);
        return;
      }
      case 'users':
        await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
        setUsers((prev) => prev.filter((u) => u.id !== id));
        return;
      default:
        throw new Error(`Koleksi "${collection}" tidak dikenal.`);
    }
  });

  const resetUserPassword = withErrorAlert(async (userId, newPassword) => {
    await apiFetch(`/api/users/${userId}/reset-password`, { method: 'PUT', body: { new_password: newPassword } });
  });

  // Settings TIDAK ada tabelnya di database (di luar 7 modul CRUD resmi) —
  // tetap disimpan di localStorage seperti sebelumnya, terpisah dari data
  // operasional (siswa/perusahaan/dst.) yang sekarang sungguhan di backend.
  const updateSettings = useCallback((patch) => {
    setSettingsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetSettingsToDefault = useCallback(() => {
    setSettingsState(defaultSettings);
  }, []);

  const value = {
    siswa,
    perusahaan,
    kelompokMagang,
    penempatan,
    jurnal,
    kompetensi,
    users,
    settings,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    resetUserPassword,
    updateSettings,
    resetToSeed: resetSettingsToDefault,
    refresh: refreshAll,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData harus dipakai di dalam <DataProvider>');
  return ctx;
}
