import React from 'react';
import { X } from 'lucide-react';

export default function PortfolioModal({ open, onClose, newPortfolioName, setNewPortfolioName, onSave }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm lg:max-w-lg p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800">Buat Portofolio</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Nama Portofolio (Aset)</label>
            <input type="text" autoFocus value={newPortfolioName} onChange={e => setNewPortfolioName(e.target.value)} placeholder="Misal: Saham BBCA, Kripto..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500" required />
          </div>
          <button type="submit" disabled={!newPortfolioName.trim()} className="w-full mt-2 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50">Simpan Portofolio</button>
        </form>
      </div>
    </div>
  );
}
