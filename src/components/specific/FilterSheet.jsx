import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'all', label: 'Semua Data' },
  { value: 'expense', label: 'Hanya Pengeluaran' },
  { value: 'income', label: 'Hanya Pemasukan' },
  { value: 'transfer', label: 'Transfer Saja' },
  { value: 'debt', label: 'Utang/Piutang' },
];

const SORT_OPTIONS = [
  { value: 'date_desc', label: '📅 Terbaru Dulu' },
  { value: 'date_asc', label: '📅 Terlama Dulu' },
  { value: 'amount_desc', label: '💰 Nominal Terbesar' },
  { value: 'amount_asc', label: '💰 Nominal Terkecil' },
];

export default function FilterSheet({ open, onClose, filterType, setFilterType, sortBy, setSortBy }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[85] flex flex-col justify-end animate-in fade-in duration-200 md:items-center md:justify-center">
      <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full md:max-w-md animate-in slide-in-from-bottom-full duration-300 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-blue-600" /> Filter & Urutkan</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-800"><X className="w-5 h-5" /></button>
        </div>

        <div className="mb-5">
          <p className="text-xs font-bold text-gray-400 mb-3 tracking-wider">TIPE TRANSAKSI</p>
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map(t => (
              <button key={t.value} onClick={() => setFilterType(t.value)} className={"px-4 py-2 rounded-xl text-xs font-bold border transition-all " + (filterType === t.value ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100")}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 mb-3 tracking-wider">URUTKAN BERDASARKAN</p>
          <div className="grid grid-cols-2 gap-3">
            {SORT_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setSortBy(o.value)} className={"p-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 " + (sortBy === o.value ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100")}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-colors shadow-lg">Terapkan Filter</button>
      </div>
    </div>
  );
}
