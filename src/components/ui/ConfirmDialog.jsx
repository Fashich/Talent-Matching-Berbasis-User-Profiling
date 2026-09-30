import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel, danger = true }) => {
  const { t } = useLanguage();
  const resolvedTitle = title ?? t('common', 'confirm');
  const resolvedConfirmLabel = confirmLabel ?? t('common', 'delete');
  return (
    <Modal open={open} onClose={onClose} title={resolvedTitle} size="sm">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${danger ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
          <AlertTriangle size={20} />
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">{message}</p>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
        >
          {t('common', 'cancel')}
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
          {resolvedConfirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
