import React from 'react';
import { X, HandCoins, TrendingUp, TrendingDown, Users, History, CheckSquare } from 'lucide-react';

export default function DebtModal({
  open, onClose,
  debtSummary, activeDebtTab, setActiveDebtTab,
  activeDebts, settledDebts,
  formatCurrency, defaultCurrency, wallets, getCurrentDate,
  setSelectedDebt, setInstallmentAmount, setInstallmentDate, setInstallmentWalletId, setShowInstallmentModal
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex flex-col justify-end md:items-center md:justify-center animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:fade-in duration-300">
      <div className="bg-gray-50 w-full md:max-w-md h-[90vh] md:h-[85vh] md:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-2 text-orange-600">
            <HandCoins className="w-6 h-6" />
            <h3 className="font-bold text-lg text-gray-800">Buku Utang & Piutang</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-white p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 relative overflow-hidden">
              <TrendingUp className="absolute -right-2 -bottom-2 w-12 h-12 text-emerald-500 opacity-10" />
              <p className="text-[10px] text-emerald-600 font-bold mb-1 tracking-wider">UANG DI ORANG</p>
              <p className="text-lg font-bold text-emerald-700">{formatCurrency(debtSummary.totalLend, defaultCurrency)}</p>
            </div>
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 relative overflow-hidden">
              <TrendingDown className="absolute -right-2 -bottom-2 w-12 h-12 text-rose-500 opacity-10" />
              <p className="text-[10px] text-rose-600 font-bold mb-1 tracking-wider">HARUS DIBAYAR</p>
              <p className="text-lg font-bold text-rose-700">{formatCurrency(debtSummary.totalBorrow, defaultCurrency)}</p>
            </div>
          </div>
        </div>

        <div className="flex bg-white p-2 border-b border-gray-200 shadow-sm overflow-x-auto hide-scrollbar">
          <button onClick={() => setActiveDebtTab('lend')} className={"whitespace-nowrap px-4 py-2 text-sm font-bold rounded-lg transition-all " + (activeDebtTab === 'lend' ? "bg-orange-100 text-orange-700" : "text-gray-500 hover:bg-gray-50")}>Belum Lunas (Piutang)</button>
          <button onClick={() => setActiveDebtTab('borrow')} className={"whitespace-nowrap px-4 py-2 text-sm font-bold rounded-lg transition-all " + (activeDebtTab === 'borrow' ? "bg-orange-100 text-orange-700" : "text-gray-500 hover:bg-gray-50")}>Belum Lunas (Utang)</button>
          <button onClick={() => setActiveDebtTab('settled')} className={"whitespace-nowrap px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-1 " + (activeDebtTab === 'settled' ? "bg-gray-800 text-white" : "text-gray-500 hover:bg-gray-50")}><History className="w-4 h-4" /> Riwayat Lunas</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeDebtTab === 'settled' ? (
            settledDebts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                <CheckSquare className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-center font-medium">Belum ada riwayat pelunasan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {settledDebts.map(debt => (
                  <div key={"settled-" + debt.id} className="bg-gray-100 border border-gray-200 rounded-xl p-4 shadow-sm opacity-80">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-600 flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-400" /> {debt.personName}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Lunas pada: {new Date(debt.paidAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-base text-gray-500">{formatCurrency(debt.amount, debt.currency)}</span>
                        <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">{debt.debtType === 'lend' ? 'Piutang' : 'Utang'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            activeDebts.filter(d => d.debtType === activeDebtTab).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                <CheckSquare className="w-16 h-16 mb-4 text-emerald-500" />
                <p className="text-center font-medium">Bagus! Tidak ada catatan<br />yang belum lunas di sini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeDebts.filter(d => d.debtType === activeDebtTab).map(debt => {
                  const paidAmt = parseFloat(debt.paidAmount) || 0;
                  const remainingAmt = parseFloat(debt.amount) - paidAmt;
                  const progressPercent = Math.min(100, Math.max(0, (paidAmt / parseFloat(debt.amount)) * 100));

                  return (
                    <div key={"debt-" + debt.id} className="bg-white border border-orange-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                      <div className={"absolute top-0 left-0 w-1 h-full " + (activeDebtTab === 'lend' ? "bg-emerald-400" : "bg-rose-400")}></div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-gray-800 flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-400" /> {debt.personName}</h4>
                          <p className="text-[10px] text-gray-400 mt-1">Dicatat: {debt.date}</p>
                          {debt.dueDate && <p className="text-[10px] text-rose-500 font-medium">Tenggat: {new Date(debt.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                        </div>
                        <div className="text-right">
                          <span className={"font-bold text-lg block " + (activeDebtTab === 'lend' ? "text-emerald-600" : "text-rose-600")}>
                            {formatCurrency(remainingAmt, debt.currency)}
                          </span>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Sisa Tagihan</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                          <span>Telah Dibayar: {formatCurrency(paidAmt, debt.currency)}</span>
                          <span>Total: {formatCurrency(debt.amount, debt.currency)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className={"h-1.5 rounded-full transition-all duration-500 " + (activeDebtTab === 'lend' ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${progressPercent}%` }}></div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedDebt(debt);
                            setInstallmentAmount(remainingAmt.toString());
                            setInstallmentDate(getCurrentDate());
                            setInstallmentWalletId(wallets.length > 0 ? wallets[0].id : '');
                            setShowInstallmentModal(true);
                          }}
                          className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <HandCoins className="w-4 h-4" /> Bayar / Cicil
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
