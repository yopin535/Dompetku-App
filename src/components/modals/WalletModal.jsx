import React from 'react';
import { X } from 'lucide-react';
import { CURRENCIES } from '../../utils/formatters';

export default function WalletModal({
  open, onClose,
  newWalletName, setNewWalletName,
  newWalletCurrency, setNewWalletCurrency,
  newWalletBalance, setNewWalletBalance,
  onSave
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm lg:max-w-lg p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Buat Dompet Baru</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Nama Dompet / Bank</label>
            <input type="text" autoFocus value={newWalletName} onChange={e => setNewWalletName(e.target.value)} placeholder="Contoh: BCA, Cash Jepang..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Mata Uang</label>
              <select value={newWalletCurrency} onChange={e => setNewWalletCurrency(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Saldo Awal</label>
              <input type="number" value={newWalletBalance} onChange={e => setNewWalletBalance(e.target.value)} placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <button type="submit" disabled={!newWalletName.trim()} className="w-full mt-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50">Simpan Dompet</button>
        </form>
      </div>
    </div>
  );
}
