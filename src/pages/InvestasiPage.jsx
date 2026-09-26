import React, { useMemo, useState } from 'react';
import { LineChart, Briefcase, TrendingUp, TrendingDown, Plus, ArrowUpCircle, ArrowDownCircle, RefreshCw, Globe, Target, Calendar, MoreVertical, Edit2, Trash2 } from 'lucide-react';

export default function InvestasiPage({
  portfolios, hideBalance, formatCurrency, defaultCurrency,
  setShowPortfolioModal, setActivePortfolio, setInvestActionType, setShowInvestActionModal,
  setShowEditPortfolioModal, onDeletePortfolio
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  // Multi-currency summary per currency
  const currencySummary = useMemo(() => {
    const result = {};
    portfolios.forEach(p => {
      const currency = p.currency || defaultCurrency;
      if (!result[currency]) {
        result[currency] = { totalInvested: 0, currentValue: 0, count: 0 };
      }
      result[currency].totalInvested += parseFloat(p.totalInvested) || 0;
      result[currency].currentValue += parseFloat(p.currentValue) || 0;
      result[currency].count += 1;
    });
    return result;
  }, [portfolios, defaultCurrency]);

  const totalModal = portfolios.reduce((acc, p) => acc + (parseFloat(p.totalInvested) || 0), 0);
  const totalVal = portfolios.reduce((acc, p) => acc + (parseFloat(p.currentValue) || 0), 0);
  const totalFloating = totalVal - totalModal;
  const isProfit = totalFloating >= 0;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Multi-currency summary grid */}
      <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-800 rounded-3xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 p-4 opacity-10 pointer-events-none">
          <Globe className="w-40 h-40" />
        </div>
        <h2 className="text-sm font-bold text-purple-200 mb-2 relative z-10 flex items-center gap-2"><Globe className="w-4 h-4"/> Ringkasan Aset per Mata Uang</h2>
        
        <div className="grid grid-cols-2 gap-4 relative z-10">
          {Object.keys(currencySummary).length === 0 ? (
            <div className="col-span-2 text-center py-4">
              <p className="text-purple-200 text-xs">Belum ada portfolio</p>
            </div>
          ) : (
            Object.entries(currencySummary).map(([currency, data]) => {
              const floating = data.currentValue - data.totalInvested;
              const isProfitCurrency = floating >= 0;
              return (
                <div key={currency} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-purple-200">{currency}</span>
                    <span className="text-[10px] text-purple-200">({data.count} portfolio)</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-purple-200">Total Aset:</span>
                      <span className="text-xs font-bold">{hideBalance ? '••••' : formatCurrency(data.currentValue, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-purple-200">Modal:</span>
                      <span className="text-xs">{hideBalance ? '••••' : formatCurrency(data.totalInvested, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-purple-200">Floating:</span>
                      <span className={`text-xs font-bold ${isProfitCurrency ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {hideBalance ? '••••' : `${isProfitCurrency ? '+' : ''}${formatCurrency(floating, currency)}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-bold text-gray-800 text-sm">Daftar Portofolio</h3>
        <button onClick={() => setShowPortfolioModal(true)} className="text-[10px] font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors flex items-center gap-1"><Plus className="w-3 h-3"/> Tambah Baru</button>
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
          <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"><LineChart className="w-6 h-6 text-purple-400" /></div>
          <p className="text-gray-800 font-bold text-sm mb-1">Belum ada investasi</p>
          <p className="text-gray-500 text-xs px-8">Catat aset seperti Saham, Reksa Dana, atau Kripto di sini.</p>
        </div>
      ) : (
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {portfolios.map(p => {
            const m = parseFloat(p.totalInvested) || 0;
            const v = parseFloat(p.currentValue) || 0;
            const diff = v - m;
            const isCuan = diff >= 0;
            const perc = m > 0 ? (diff / m * 100).toFixed(2) : 0;
            const currency = p.currency || defaultCurrency;

            // Target display logic
            const targetDisplay = p.targetReturn ? 
              p.targetReturnType === 'percentage' ? 
                `Target: ${p.targetReturn}%` : 
                `Target: ${formatCurrency(p.targetReturn, currency)}`
              : null;

            return (
              <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{currency}</span>
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)} 
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === p.id && (
                      <div className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 animate-in fade-in zoom-in-95 duration-150">
                        <button 
                          onClick={() => { setShowEditPortfolioModal(p); setOpenMenuId(null); }} 
                          className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button 
                          onClick={() => { onDeletePortfolio(p.id); setOpenMenuId(null); }} 
                          className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-800 flex items-center gap-2"><Briefcase className="w-4 h-4 text-purple-500"/> {p.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Modal: {formatCurrency(m, currency)}</p>
                    {targetDisplay && (
                      <div className="flex items-center gap-1 mt-1">
                        <Target className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] text-amber-600 font-bold">{targetDisplay}</span>
                        {p.targetDuration && (
                          <span className="text-[8px] text-gray-500 ml-1 flex items-center gap-0.5">
                            <Calendar className="w-2 h-2" /> {p.targetDuration === '1_month' ? '1 bulan' : p.targetDuration === '3_months' ? '3 bulan' : p.targetDuration === '6_months' ? '6 bulan' : '1 tahun'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">{formatCurrency(v, currency)}</p>
                    <p className={"text-[10px] font-bold mt-0.5 inline-block px-1.5 py-0.5 rounded " + (isCuan ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                      {isCuan ? "+" : ""}{formatCurrency(diff, currency)} ({isCuan ? "+" : ""}{perc}%)
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50">
                  <button onClick={() => {setActivePortfolio(p); setInvestActionType('topup'); setShowInvestActionModal(true);}} className="py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition-colors flex flex-col items-center justify-center gap-1"><ArrowUpCircle className="w-4 h-4"/> Top Up</button>
                  <button onClick={() => {setActivePortfolio(p); setInvestActionType('withdraw'); setShowInvestActionModal(true);}} className="py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-bold transition-colors flex flex-col items-center justify-center gap-1"><ArrowDownCircle className="w-4 h-4"/> Tarik</button>
                  <button onClick={() => {setActivePortfolio(p); setInvestActionType('update'); setShowInvestActionModal(true);}} className="py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors flex flex-col items-center justify-center gap-1"><RefreshCw className="w-4 h-4"/> Update Harga</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
