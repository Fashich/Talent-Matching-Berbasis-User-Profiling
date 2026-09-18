import React, { useMemo, useState } from 'react';
import { Plus, NotebookPen, MessageSquareText, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { scopedPenempatan, findById } from '../../utils/scope';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const todayISO = () => new Date().toISOString().slice(0, 10);

const Jurnal = () => {
  const { siswa, jurnal, penempatan, addItem, updateItem, removeItem } = useData();
  const { user } = useAuth();
  const isSiswa = user?.role === 'Siswa';
  const isAdmin = user?.role === 'Administrator';

  const myPenempatan = useMemo(() => scopedPenempatan(user, penempatan), [user, penempatan]);
  const myActivePenempatan = myPenempatan.find((p) => p.status === 'Berlangsung') || myPenempatan[0];
  const visibleSiswaIds = new Set(myPenempatan.map((p) => p.siswaId));

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ tanggal: todayISO(), kegiatan: '', kendala: '' });
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [siswaFilter, setSiswaFilter] = useState('Semua');

  const list = useMemo(() => {
    let data = jurnal.filter((j) => visibleSiswaIds.has(j.siswaId));
    if (siswaFilter !== 'Semua') data = data.filter((j) => j.siswaId === siswaFilter);
    return [...data].sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
  }, [jurnal, siswaFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const siswaOptions = useMemo(() => siswa.filter((s) => visibleSiswaIds.has(s.id)), [siswa]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = (e) => {
    e.preventDefault();
    if (!myActivePenempatan) return;
    addItem('jurnal', {
      penempatanId: myActivePenempatan.id,
      siswaId: myActivePenempatan.siswaId,
      tanggal: form.tanggal,
      kegiatan: form.kegiatan,
      kendala: form.kendala,
      status: 'Menunggu',
      catatanPembimbing: '',
    });
    setForm({ tanggal: todayISO(), kegiatan: '', kendala: '' });
    setAddOpen(false);
  };

  const openReview = (j) => {
    setReviewTarget(j);
    setReviewNote(j.catatanPembimbing || '');
  };

  const submitReview = (status) => {
    if (!reviewTarget) return;
    updateItem('jurnal', reviewTarget.id, { status, catatanPembimbing: reviewNote });
    setReviewTarget(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 text-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Jurnal Harian PKL</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isSiswa ? 'Catat kegiatan harian selama PKL berlangsung.' : 'Pantau & tinjau jurnal kegiatan harian seluruh siswa.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isSiswa && siswaOptions.length > 0 && (
            <select value={siswaFilter} onChange={(e) => setSiswaFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="Semua">Semua Siswa</option>
              {siswaOptions.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </select>
          )}
          {isSiswa && (
            <button
              onClick={() => setAddOpen(true)}
              disabled={!myActivePenempatan}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              title={!myActivePenempatan ? 'Kamu belum memiliki penempatan PKL' : undefined}
            >
              <Plus size={16} />
              Tulis Jurnal Hari Ini
            </button>
          )}
        </div>
      </div>

      {isSiswa && !myActivePenempatan && (
        <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm rounded-lg px-4 py-3">
          Kamu belum memiliki data penempatan PKL, sehingga belum bisa mengisi jurnal harian.
        </div>
      )}

      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <EmptyState icon={<NotebookPen size={28} />} title="Belum ada jurnal" description="Jurnal kegiatan harian akan muncul di sini." />
          </div>
        ) : (
          list.map((j) => {
            const s = findById(siswa, j.siswaId);
            return (
              <div key={j.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{j.tanggal}</p>
                    {!isSiswa && <p className="text-xs text-gray-400">{s?.nama} · {s?.kelas}</p>}
                  </div>
                  <Badge status={j.status} />
                </div>
                <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">{j.kegiatan}</p>
                {j.kendala && (
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="font-medium text-gray-600">Kendala: </span>{j.kendala}
                  </p>
                )}
                {j.catatanPembimbing && (
                  <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 flex gap-2">
                    <MessageSquareText size={14} className="shrink-0 mt-0.5 text-gray-400" />
                    <span><span className="font-medium">Catatan pembimbing: </span>{j.catatanPembimbing}</span>
                  </div>
                )}
                <div className="mt-4 flex items-center gap-2">
                  {isAdmin && (
                    <button onClick={() => openReview(j)} className="text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition">
                      Tinjau Jurnal
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => setDeleteTarget(j)} className="text-xs font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition flex items-center gap-1">
                      <Trash2 size={12} />
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tulis Jurnal Harian">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input required type="date" value={form.tanggal} onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan yang Dilakukan</label>
            <textarea required rows={4} value={form.kegiatan} onChange={(e) => setForm((f) => ({ ...f, kegiatan: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kendala (opsional)</label>
            <textarea rows={2} value={form.kendala} onChange={(e) => setForm((f) => ({ ...f, kendala: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
              Simpan Jurnal
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!reviewTarget} onClose={() => setReviewTarget(null)} title="Tinjau Jurnal Harian">
        {reviewTarget && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">{reviewTarget.kegiatan}</div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Pembimbing</label>
              <textarea rows={3} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tulis masukan untuk siswa..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => submitReview('Revisi')} className="px-4 py-2 rounded-lg text-sm font-medium text-red-700 border border-red-200 hover:bg-red-50 transition">
                Minta Revisi
              </button>
              <button onClick={() => submitReview('Disetujui')} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition">
                Setujui
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeItem('jurnal', deleteTarget.id)}
        title="Hapus Jurnal"
        message="Yakin ingin menghapus entri jurnal ini?"
      />
    </div>
  );
};

export default Jurnal;
