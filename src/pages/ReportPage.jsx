import React from 'react';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, PieChart, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { CURRENCIES } from '../utils/formatters';

export default function ReportPage({
  reportType, setReportType,
  wallets, reportWalletId, setReportWalletId,
  changeReportPeriod, getReportTitle, formatCurrency, reportSummary, reportCurrency,
  transactions, defaultCurrency, categoryStats, expandedId, setExpandedId, reportTransactions, setReportCurrency
}) {
  const availableCurrencies = [...new Set([...CURRENCIES.map(c => c.code), ...transactions.map(t => t.currency || defaultCurrency)])];
  
  return (
    <div className="animate-in fade-in duration-300">
      
      <div className="bg-white rounded-full shadow-sm border border-gray-100 p-1 mb-3 mx-auto w-max max-w-full flex">
          <button onClick={() => setReportType('daily')} className={"px-4 py-1.5 text-xs font-bold rounded-full transition-all " + (reportType === 'daily' ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}>Harian</button>
          <button onClick={() => setReportType('weekly')} className={"px-4 py-1.5 text-xs font-bold rounded-full transition-all " + (reportType === 'weekly' ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}>Mingguan</button>
          <button onClick={() => setReportType('monthly')} className={"px-4 py-1.5 text-xs font-bold rounded-full transition-all " + (reportType === 'monthly' ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}>Bulanan</button>
      </div>
      
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 hide-scrollbar px-1">
         <button onClick={() => setReportWalletId('all')} className={"whitespace-nowrap px-4 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-full border transition-all " + (reportWalletId === 'all' ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>Semua Dompet</button>
         {wallets.map(w => (
             <button key={"rw-"+w.id} onClick={() => setReportWalletId(w.id)} className={"whitespace-nowrap px-4 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-full border transition-all " + (reportWalletId === w.id ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50")}>{w.name}</button>
         ))}
      </div>
      
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-800 rounded-3xl shadow-xl p-6 mb-6 lg:mb-0 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <TrendingUp className="w-32 h-32" />
        </div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <button onClick={() => changeReportPeriod(-1)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-blue-100" /></button>
          <div className="text-center bg-white/10 backdrop-blur-md px-3 py-1 rounded-full"><h2 className="font-bold text-white text-xs">{getReportTitle()}</h2></div>
          <button onClick={() => changeReportPeriod(1)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-blue-100" /></button>
        </div>
        
        <div className="text-center mb-6 relative z-10">
          <p className="text-blue-200 text-xs font-medium mb-1">Arus Kas Bersih (Sisa Uang)</p>
          <h3 className="text-3xl font-bold tracking-tight">
             {reportSummary.balance >= 0 ? "+" : ""}{formatCurrency(reportSummary.balance, reportCurrency)}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10 border-t border-white/20 pt-4">
            <div>
                <p className="text-[10px] text-blue-200 flex items-center gap-1 mb-1"><TrendingUp className="w-3 h-3 text-emerald-400"/> Pemasukan</p>
                <p className="font-bold text-sm">{formatCurrency(reportSummary.income, reportCurrency)}</p>
            </div>
            <div>
                <p className="text-[10px] text-blue-200 flex items-center gap-1 mb-1"><TrendingDown className="w-3 h-3 text-rose-400"/> Pengeluaran</p>
                <p className="font-bold text-sm">{formatCurrency(reportSummary.expense, reportCurrency)}</p>
            </div>
        </div>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><PieChart className="w-4 h-4 text-blue-600" /> Distribusi Pengeluaran</h3>
            <select value={reportCurrency} onChange={(e) => setReportCurrency(e.target.value)} className="bg-gray-50 text-xs font-bold text-blue-600 focus:outline-none border border-gray-200 rounded px-2 py-1">
              {availableCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>

        {categoryStats.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Belum ada pengeluaran di periode/dompet ini.</div> 
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center mb-6 shadow-inner" style={{ 
                background: `conic-gradient(${categoryStats.map((cat, i) => {
                    const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#64748b'];
                    const start = i === 0 ? 0 : categoryStats.slice(0, i).reduce((sum, c) => sum + c.percentage, 0);
                    return `${colors[i % colors.length]} ${start}% ${start + cat.percentage}%`;
                }).join(', ')})`
            }}>
                <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Total</p>
                    <p className="text-xs font-bold text-gray-800">{formatCurrency(reportSummary.expense, reportCurrency).split(',')[0]}</p>
                </div>
            </div>

            <div className="w-full bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4 flex gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-purple-800 font-medium leading-relaxed">
                    💡 Insight: Pengeluaran terbesarmu habis untuk <b>{categoryStats[0].name}</b> ({Math.round(categoryStats[0].percentage)}%). 
                    {reportSummary.balance < 0 ? " Awas, pengeluaranmu lebih besar dari pemasukan!" : " Pertahankan kebiasaan hematmu!"}
                </p>
            </div>
            
            <div className="w-full space-y-2">
              {categoryStats.map((cat, i) => {
                  const colors = ['bg-blue-500', 'bg-rose-500', 'bg-orange-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500', 'bg-slate-500'];
                  const isExpanded = expandedId === 'cat-' + cat.name;
                  
                  const catTransactions = reportTransactions.filter(t => {
                      if(t.type !== 'expense') return false;
                      if(t.items && Array.isArray(t.items) && t.items.length > 0) return t.items.some(item => (item.category || (t.categories && t.categories.length > 0 ? t.categories[0] : (t.category || 'Umum'))) === cat.name);
                      return ((t.categories && t.categories.length > 0 ? t.categories[0] : (t.category || 'Umum')) === cat.name);
                  });

                  return (
                  <div key={cat.name} className="border border-gray-100 rounded-xl overflow-hidden bg-white">
                      <button onClick={() => setExpandedId(isExpanded ? null : 'cat-' + cat.name)} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`}></div>
                              <span className="text-sm font-bold text-gray-700">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-900">{formatCurrency(cat.amount, reportCurrency)}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
                          </div>
                      </button>
                      
                      {isExpanded && (
                          <div className="bg-gray-50 p-3 border-t border-gray-100">
                              <ul className="space-y-2">
                                  {catTransactions.map(t => (
                                      <li key={"catrep-"+t.id} className="flex justify-between items-center text-xs">
                                          <span className="text-gray-600 truncate mr-2">{t.description}</span>
                                          <span className="font-semibold text-gray-800 flex-shrink-0">{formatCurrency(t.amount, t.currency)}</span>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      )}
                  </div>
              )})}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
