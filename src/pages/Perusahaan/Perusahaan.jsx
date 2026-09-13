import React, { useMemo, useState } from 'react';
import { Search, Plus, Edit, Trash2, Building2, Phone, Mail, MapPin, ListChecks } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { daftarBidangUsaha, daftarJurusan } from '../../data/seed';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const emptyForm = {
  nama: '', bidang: daftarBidangUsaha[0], alamat: '', telepon: '', email: '', penanggungJawab: '', kuota: 1, status: 'Aktif',
  posisi: '', kompetensiDibutuhkan: '', jurusanRelevan: [], tingkatPengalaman: 'Tidak Diperlukan', pendidikanDibutuhkan: '', kriteriaLain: '',
};

const Perusahaan = () => {
  const { perusahaan, penempatan, addItem, updateItem, removeItem } = useData();
  const { user } = useAuth();
  const canManage = user?.role === 'Administrator' || user?.role === 'Petugas';
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const list = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return perusahaan.filter((p) => p.nama.toLowerCase().includes(q) || p.bidang.toLowerCase().includes(q) || (p.posisi || '').toLowerCase().includes(q));
  }, [perusahaan, searchTerm]);

  const terisiCount = (perusahaanId) => penempatan.filter((p) => p.perusahaanId === perusahaanId && ['Diterima', 'Berlangsung'].includes(p.status)).length;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      nama: p.nama, bidang: p.bidang, alamat: p.alamat, telepon: p.telepon, email: p.email, penanggungJawab: p.penanggungJawab, kuota: p.kuota, status: p.status,
      posisi: p.posisi || '', kompetensiDibutuhkan: (p.kompetensiDibutuhkan || []).join(', '), jurusanRelevan: p.jurusanRelevan || [],
      tingkatPengalaman: p.tingkatPengalaman || 'Tidak Diperlukan', pendidikanDibutuhkan: p.pendidikanDibutuhkan || '', kriteriaLain: p.kriteriaLain || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      kuota: Number(form.kuota) || 0,
      kompetensiDibutuhkan: form.kompetensiDibutuhkan.split(',').map((s) => s.trim()).filter(Boolean),
    };
    if (editingId) updateItem('perusahaan', editingId, payload);
    else addItem('perusahaan', payload);
    setModalOpen(false);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleJurusan = (j) => {
    setForm((f) => ({
      ...f,
      jurusanRelevan: f.jurusanRelevan.includes(j) ? f.jurusanRelevan.filter((x) => x !== j) : [...f.jurusanRelevan, j],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Perusahaan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Profil perusahaan/DU-DI beserta Company Requirement — dasar perhitungan Match Score.</p>
        </div>
        <div className="flex items-center gap-3">
          {canManage && (
            <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              <Plus size={16} />
              Tambah Perusahaan
            </button>
          )}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama/bidang/posisi"
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <EmptyState icon={<Building2 size={28} />} title="Belum ada data perusahaan" description="Tambahkan mitra DU/DI untuk mulai menempatkan siswa PKL." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {list.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Building2 size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 leading-tight">{p.nama}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{p.bidang} · {p.posisi || 'Posisi belum diisi'}</p>
                  </div>
                </div>
                <Badge status={p.status} />
              </div>

              <div className="mt-4 space-y-1.5 text-sm text-gray-500">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span className="truncate">{p.alamat}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="shrink-0" />
                  <span>{p.telepon}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="shrink-0" />
                  <span className="truncate">{p.email}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                  <ListChecks size={13} />
                  Kebutuhan Kompetensi
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(p.kompetensiDibutuhkan || []).map((k) => (
                    <span key={k} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs">{k}</span>
                  ))}
                  {(p.kompetensiDibutuhkan || []).length === 0 && <span className="text-xs text-gray-400">Belum ditentukan</span>}
                </div>
                <p className="text-xs text-gray-400 mt-2">Jurusan relevan: {(p.jurusanRelevan || []).join(', ') || '-'} · Pengalaman: {p.tingkatPengalaman}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-500">PJ: <span className="text-gray-700 font-medium">{p.penanggungJawab}</span></span>
                <span className="text-gray-500">Kuota: <span className="text-gray-800 font-semibold">{terisiCount(p.id)}/{p.kuota}</span></span>
              </div>

              {canManage && (
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition">
                    <Edit size={14} />
                    Edit
                  </button>
                  <button onClick={() => setDeleteTarget(p)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 transition">
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Perusahaan' : 'Tambah Perusahaan'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan</label>
              <input required value={form.nama} onChange={set('nama')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bidang Usaha</label>
              <select value={form.bidang} onChange={set('bidang')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {daftarBidangUsaha.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <input value={form.alamat} onChange={set('alamat')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
              <input value={form.telepon} onChange={set('telepon')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Penanggung Jawab</label>
              <input value={form.penanggungJawab} onChange={set('penanggungJawab')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kuota Siswa</label>
              <input type="number" min="0" value={form.kuota} onChange={set('kuota')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={set('status')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-3">Company Requirement (untuk Matching)</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posisi yang Dibutuhkan</label>
                <input placeholder="mis. Web Developer" value={form.posisi} onChange={set('posisi')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kompetensi Dibutuhkan (pisahkan dengan koma)</label>
                <input placeholder="mis. Programming, JavaScript, Web" value={form.kompetensiDibutuhkan} onChange={set('kompetensiDibutuhkan')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jurusan Relevan</label>
                <div className="flex flex-wrap gap-2">
                  {daftarJurusan.map((j) => (
                    <button
                      type="button"
                      key={j}
                      onClick={() => toggleJurusan(j)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                        form.jurusanRelevan.includes(j) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {j}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Pengalaman</label>
                  <select value={form.tingkatPengalaman} onChange={set('tingkatPengalaman')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Tidak Diperlukan">Tidak Diperlukan</option>
                    <option value="Pemula">Pemula</option>
                    <option value="Menengah">Menengah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan Dibutuhkan</label>
                  <input placeholder="mis. SMK/Sederajat Jurusan RPL" value={form.pendidikanDibutuhkan} onChange={set('pendidikanDibutuhkan')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kriteria Lainnya</label>
                <input value={form.kriteriaLain} onChange={set('kriteriaLain')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
              {editingId ? 'Simpan Perubahan' : 'Tambah Perusahaan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeItem('perusahaan', deleteTarget.id)}
        title="Hapus Perusahaan"
        message={`Yakin ingin menghapus "${deleteTarget?.nama}"? Data penempatan terkait tidak akan otomatis terhapus.`}
      />
    </div>
  );
};

export default Perusahaan;
