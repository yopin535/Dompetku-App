import React from 'react';
import { X, ChevronDown } from 'lucide-react';
import { CURRENCIES } from '../../utils/formatters';

export default function PortfolioModal({
  open, onClose,
  newPortfolioName, setNewPortfolioName,
  newPortfolioCurrency, setNewPortfolioCurrency,
  newPortfolioTargetType, setNewPortfolioTargetType,
  newPortfolioTargetValue, setNewPortfolioTargetValue,
  newPortfolioDuration, setNewPortfolioDuration,
  newPortfolioCustomDate, setNewPortfolioCustomDate,
  onSave
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm lg:max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800">Buat Portofolio</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Nama Portofolio (Aset)</label>
            <input type="text" autoFocus value={newPortfolioName} onChange={e => setNewPortfolioName(e.target.value)} placeholder="Misal: Saham BBCA, Kripto..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Mata Uang</label>
            <div className="relative">
              <select
                value={newPortfolioCurrency}
                onChange={(e) => setNewPortfolioCurrency(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 appearance-none text-xs font-bold"
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="block text-xs font-bold text-gray-500 mb-2">Target Return (Opsional)</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setNewPortfolioTargetType('amount')}
                className={"py-2 rounded-lg text-xs font-bold transition-colors " + (newPortfolioTargetType === 'amount' ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500")}
              >
                Nominal
              </button>
              <button
                type="button"
                onClick={() => setNewPortfolioTargetType('percentage')}
                className={"py-2 rounded-lg text-xs font-bold transition-colors " + (newPortfolioTargetType === 'percentage' ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500")}
              >
                Persen (%)
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                value={newPortfolioTargetValue}
                onChange={e => setNewPortfolioTargetValue(e.target.value)}
                placeholder={newPortfolioTargetType === 'amount' ? "Contoh: 10000000" : "Contoh: 20"}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              />
              {newPortfolioTargetType === 'percentage' && (
                <span className="absolute right-4 top-2 font-bold text-gray-400">%</span>
              )}
            </div>
          </div>

          {newPortfolioTargetValue && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Durasi Target</label>
              <div className="relative">
                <select
                  value={newPortfolioDuration}
                  onChange={(e) => setNewPortfolioDuration(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 appearance-none text-xs font-bold"
                >
                  <option value="1_month">1 Bulan</option>
                  <option value="3_months">3 Bulan</option>
                  <option value="6_months">6 Bulan</option>
                  <option value="1_year">1 Tahun</option>
                  <option value="custom">Custom Tanggal</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {newPortfolioDuration === 'custom' && (
                <input
                  type="date"
                  value={newPortfolioCustomDate}
                  onChange={e => setNewPortfolioCustomDate(e.target.value)}
                  className="w-full mt-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 text-xs font-medium"
                />
              )}
            </div>
          )}

          <button type="submit" disabled={!newPortfolioName.trim()} className="w-full mt-2 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50">Simpan Portofolio</button>
        </form>
      </div>
    </div>
  );
}
