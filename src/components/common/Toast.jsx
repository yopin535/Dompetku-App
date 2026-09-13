import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function Toast({ notification }) {
  if (!notification) return null;
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 w-full max-w-sm px-4">
      <div className={"flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border " + (notification.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800")}>
        {notification.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}<span className="text-sm font-medium">{notification.message}</span>
      </div>
    </div>
  );
}
