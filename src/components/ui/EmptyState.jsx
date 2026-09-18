import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'Belum ada data', description, icon }) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    <div className="p-4 rounded-full bg-gray-50 text-gray-300 dark:bg-slate-800 dark:text-slate-600 mb-3">
      {icon || <Inbox size={28} />}
    </div>
    <h4 className="text-sm font-semibold text-gray-600 dark:text-slate-300">{title}</h4>
    {description && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 max-w-xs">{description}</p>}
  </div>
);

export default EmptyState;
