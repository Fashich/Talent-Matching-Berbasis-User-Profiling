import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Konfirmasi', message, confirmLabel = 'Hapus', danger = true }) => {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${danger ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
          <AlertTriangle size={20} />
        </div>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition"
        >
          Batal
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition ${
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
