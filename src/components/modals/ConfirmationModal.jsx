import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

export default function ConfirmationModal({ open, onClose, onConfirm, title, message, confirmText = 'Hapus', cancelText = 'Batal', variant = 'danger', showClose = true }) {
  if (!open) return null;

  const variantStyles = {
    danger: 'bg-red-100 text-red-600 border-red-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    info: 'bg-blue-100 text-blue-600 border-blue-200',
  };

  const iconMap = {
    danger: <Trash2 className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <AlertTriangle className="w-5 h-5" />,
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${variantStyles[variant]}`}>
              {iconMap[variant]}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
            </div>
          </div>
          {showClose && <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>}
        </div>

        <p className="text-xs text-gray-600 mb-6">{message}</p>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`flex-1 py-2 text-white rounded-xl text-xs font-bold transition-colors ${
            variant === 'danger' ? 'bg-red-600 hover:bg-red-700' :
            variant === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
            'bg-blue-600 hover:bg-blue-700'
          }`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}