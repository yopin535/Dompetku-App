import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

export default function Notification({ notification, onDismiss }) {
  if (!notification) return null;

  const icons = {
    success: <CheckCircle className="w-4 h-4" />,
    error: <XCircle className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
  };

  const colors = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${colors[notification.type] || colors.success}`}>
        {icons[notification.type] || icons.success}
        <span>{notification.message}</span>
        <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
