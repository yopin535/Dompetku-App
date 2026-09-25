import React from 'react';
import { Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NotificationIcon({ onClick }) {
  const { unreadCount } = useApp();

  return (
    <button 
      onClick={onClick}
      className="relative p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-blue-100"
      aria-label="Notifikasi"
    >
      <Bell className="w-4 h-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 bg-red-500 text-white rounded-full text-[10px] font-bold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
