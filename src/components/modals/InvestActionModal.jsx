import React from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, RefreshCw, ChevronDown } from 'lucide-react';

export default function InvestActionModal({
  open, onClose, activePortfolio, investActionType,
  investAmount, setInvestAmount,
  walletId, setWalletId, date, setDate,
  wallets, defaultCurrency, onSubmit
}) {
  if (!open || !activePortfolio) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex flex-col justify-end md:items-center md:justify-center animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 duration-300">
      <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full md:max-w-md lg:max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              {investActionType === 'topup' && <><ArrowUpCircle className="w-5 h-5 text-purple-600" /> Top Up Modal</>}
              {investActionType === 'withdraw' && <><ArrowDownCircle className="w-5 h-5 text-gray-600" /> Tarik Dana</>}
              {investActionType === 'update' && <><RefreshCw className="w-5 h-5 text-blue-600" /> Update Harga Pasar</>}
            </h3>
            <p className="text-xs text-gray-500">Portofolio: <b>{activePortfolio.name}</b></p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">
              {investActionType === 'update' ? 'Nilai Saat Ini (Mark-to-Market):' : 'Nominal Transaksi:'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 font-bold text-gray-400">{activePortfolio.currency || defaultCurrency}</span>
              <input
                autoFocus
                type="number"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                placeholder="0"
                className={"w-full border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 font-bold text-lg transition-all " +
                  (investActionType === 'topup' ? "bg-purple-50 border-purple-200 focus:border-purple-500 focus:ring-purple-200 text-purple-900" :
                    investActionType === 'withdraw' ? "bg-gray-50 border-gray-200 focus:border-gray-500 focus:ring-gray-200 text-gray-900" :
                      "bg-blue-50 border-blue-200 focus:border-blue-500 focus:ring-blue-200 text-blue-900")
                }
              />
            </div>
          </div>

          {investActionType !== 'update' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">
                  {investActionType === 'topup' ? 'SUMBER DANA' : 'CAIRKAN KE DOMPET'}
                </label>
                <div className="relative">
                  <select
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 appearance-none text-xs font-bold"
                  >
                    <option value="" disabled>Pilih Dompet</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">TANGGAL TRANSAKSI</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 text-xs font-medium"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={!investAmount || parseFloat(investAmount) < 0 || (investActionType !== 'update' && !walletId)}
          className={"w-full py-3.5 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition-colors " +
            (investActionType === 'topup' ? "bg-purple-600 hover:bg-purple-700" :
              investActionType === 'withdraw' ? "bg-gray-800 hover:bg-gray-900" :
                "bg-blue-600 hover:bg-blue-700")
          }
        >
          {investActionType === 'update' ? 'Simpan Nilai Baru' : 'Proses Transaksi'}
        </button>
      </div>
    </div>
  );
}
