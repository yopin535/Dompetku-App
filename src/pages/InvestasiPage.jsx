import React from 'react';
import { LineChart, Briefcase, TrendingUp, TrendingDown, Plus, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';

export default function InvestasiPage({
  portfolios, hideBalance, formatCurrency, defaultCurrency,
  setShowPortfolioModal, setActivePortfolio, setInvestActionType, setShowInvestActionModal
}) {
  const totalModal = portfolios.reduce((acc, p) => acc + (parseFloat(p.totalInvested) || 0), 0);
  const totalVal = portfolios.reduce((acc, p) => acc + (parseFloat(p.currentValue) || 0), 0);
  const totalFloating = totalVal - totalModal;
  const isProfit = totalFloating >= 0;

  return (
        <div className="animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-800 rounded-3xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
                <div className="absolute -right-4 -top-4 p-4 opacity-10 pointer-events-none">
                    <LineChart className="w-40 h-40" />
                </div>
                <h2 className="text-sm font-bold text-purple-200 mb-2 relative z-10 flex items-center gap-2"><Briefcase className="w-4 h-4"/> Total Aset Investasi</h2>
                <h3 className="text-3xl font-bold tracking-tight mb-6 relative z-10">
                    {hideBalance ? '••••••••' : formatCurrency(totalVal, defaultCurrency)}
                </h3>

                <div className="grid grid-cols-2 gap-4 relative z-10 border-t border-white/20 pt-4">
                    <div>
                        <p className="text-[10px] text-purple-200 mb-1">Total Modal</p>
                        <p className="font-bold text-sm">{hideBalance ? '••••' : formatCurrency(totalModal, defaultCurrency)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-purple-200 mb-1">Keuntungan (Floating)</p>
                        <p className={"font-bold text-sm flex items-center gap-1 " + (isProfit ? "text-emerald-300" : "text-rose-300")}>
                            {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {hideBalance ? '••••' : (isProfit ? "+" : "") + formatCurrency(totalFloating, defaultCurrency)}
                        </p>
                    </div>
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
                <div className="space-y-4">
                    {portfolios.map(p => {
                        const m = parseFloat(p.totalInvested) || 0;
                        const v = parseFloat(p.currentValue) || 0;
                        const diff = v - m;
                        const isCuan = diff >= 0;
                        const perc = m > 0 ? (diff / m * 100).toFixed(2) : 0;

                        return (
                        <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2"><Briefcase className="w-4 h-4 text-purple-500"/> {p.name}</h4>
                                    <p className="text-[10px] text-gray-400 mt-1">Modal: {formatCurrency(m, p.currency || defaultCurrency)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-gray-900">{formatCurrency(v, p.currency || defaultCurrency)}</p>
                                    <p className={"text-[10px] font-bold mt-0.5 inline-block px-1.5 py-0.5 rounded " + (isCuan ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                                        {isCuan ? "+" : ""}{formatCurrency(diff, p.currency || defaultCurrency)} ({isCuan ? "+" : ""}{perc}%)
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50">
                                <button onClick={() => {setActivePortfolio(p); setInvestActionType('topup'); setShowInvestActionModal(true);}} className="py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition-colors flex flex-col items-center justify-center gap-1"><ArrowUpCircle className="w-4 h-4"/> Top Up</button>
                                <button onClick={() => {setActivePortfolio(p); setInvestActionType('withdraw'); setShowInvestActionModal(true);}} className="py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-bold transition-colors flex flex-col items-center justify-center gap-1"><ArrowDownCircle className="w-4 h-4"/> Tarik</button>
                                <button onClick={() => {setActivePortfolio(p); setInvestActionType('update'); setShowInvestActionModal(true);}} className="py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors flex flex-col items-center justify-center gap-1"><RefreshCw className="w-4 h-4"/> Update Harga</button>
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </div>
  );
}
