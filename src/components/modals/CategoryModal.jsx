import React from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function CategoryModal({
  open, onClose, type, newCatName, setNewCatName,
  onSave, customCategories, onDelete
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm lg:max-w-lg p-6 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Buat Label {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="mb-6">
          <form onSubmit={onSave}>
            <label className="block text-xs font-medium text-gray-500 mb-2">Nama Label Baru</label>
            <div className="flex gap-2">
              <input autoFocus type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Contoh: Belanja Bulanan" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              <button type="submit" disabled={!newCatName.trim()} className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"><Plus className="w-5 h-5" /></button>
            </div>
          </form>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Label Kustom Anda</h4>
          {customCategories.filter(c => c.type === type).length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200"><p className="text-xs text-gray-400">Belum ada label buatan sendiri.</p></div>
          ) : (
            <ul className="space-y-2">
              {customCategories.filter(c => c.type === type).map((c) => (
                <li key={c.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors">
                  <span className="text-sm font-medium text-gray-700">{c.name}</span>
                  <button onClick={() => onDelete(c.id)} className="text-gray-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
