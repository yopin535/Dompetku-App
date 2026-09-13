import React from 'react';
import { X, ChevronDown } from 'lucide-react';
import { getCurrentDate } from '../../utils/formatters';

export default function InstallmentModal({
  open, onClose, selectedDebt,
  installmentAmount, setInstallmentAmount,
  installmentDate, setInstallmentDate,
  installmentWalletId, setInstallmentWalletId,
  wallets, onSubmit, formatCurrency
}) {
  if (!open || !selectedDebt) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800">Catat Pembayaran</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4">
          <p className="text-xs text-gray-500 mb-1">Total Sisa Tagihan:</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(parseFloat(selectedDebt.amount) - (parseFloat(selectedDebt.paidAmount) || 0), selectedDebt.currency)}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-600 mb-2">Jumlah yang dibayar:</label>
          <div className="relative">
            <span className="absolute left-4 top-3 font-bold text-gray-400">{selectedDebt.currency}</span>
            <input
              autoFocus
              type="number"
              value={installmentAmount}
              onChange={(e) => setInstallmentAmount(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-bold text-lg transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1">MASUK/KELUAR KE DOMPET</label>
            <div className="relative">
              <select
                value={installmentWalletId}
                onChange={(e) => setInstallmentWalletId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 appearance-none text-xs font-bold"
              >
                <option value="" disabled>Pilih Dompet</option>
                {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1">TANGGAL BAYAR</label>
            <input
              type="date"
              value={installmentDate || getCurrentDate()}
              onChange={(e) => setInstallmentDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Batal</button>
          <button onClick={onSubmit} disabled={!installmentAmount || parseFloat(installmentAmount) <= 0 || !installmentWalletId} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors">Simpan</button>
        </div>
      </div>
    </div>
  );
}
