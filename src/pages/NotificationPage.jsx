import React from 'react';
import { Bell, ChevronLeft, Trash2, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationPage() {
  const { setView, notifications, setNotifications } = useApp();
  const { markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="px-4 lg:px-6 pt-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('home')} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Bell className="w-5 h-5 text-purple-600" /> Notifikasi</h2>
            <p className="text-xs text-gray-500">Kamu punya {unreadCount} notifikasi belum dibaca</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Tandai Semua Sudah Dibaca
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
          <div className="bg-purple-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-7 h-7 text-purple-400" />
          </div>
          <p className="text-gray-800 font-bold text-sm mb-1">Belum ada notifikasi</p>
          <p className="text-gray-500 text-xs px-8">Setiap transaksi atau pencapaian investasi akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <div key={notif.id} className={`bg-white rounded-2xl p-5 shadow-sm border ${notif.isRead ? 'border-gray-100' : 'border-purple-200'} relative overflow-hidden`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className={`font-bold text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                    {notif.title || 'Notifikasi'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {notif.category === 'invest' ? 'Investasi' : 
                     notif.category === 'wallet' ? 'Dompet' : 
                     notif.category === 'budget' ? 'Budget' : 'Sistem'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">
                    {new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {!notif.isRead && <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>}
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-4">
                {notif.message || 'Pesan tidak tersedia'}
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-gray-50">
                {!notif.isRead && (
                  <button 
                    onClick={() => handleMarkRead(notif.id)}
                    className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Tandai Sudah Dibaca
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(notif.id)}
                  className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1 ml-auto">
                  <Trash2 className="w-3 h-3" /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
