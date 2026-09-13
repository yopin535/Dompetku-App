import React from 'react';
import { Sparkles, Eye, EyeOff, Search, SlidersHorizontal, RefreshCw, Cloud, CloudOff, User, X, Wallet, Briefcase } from 'lucide-react';

export default function Header({
  user, defaultCurrency, hideBalance, setHideBalance,
  totalNetWorthByCurrency, totalCashByCurrency, totalInvestmentsByCurrency,
  formatCurrency, syncStatus,
  isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery,
  filterType, sortBy, setShowFilterSheet, setView
}) {
  return (
    <div className="bg-gradient-to-b from-blue-700 to-indigo-800 px-5 pt-6 pb-6 text-white rounded-b-[2rem] shadow-lg mb-2 relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="w-32 h-32" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] text-blue-200 font-bold uppercase tracking-wider">Kekayaan Bersih ({defaultCurrency})</p>
            <button onClick={() => setHideBalance(!hideBalance)} className="text-blue-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
              {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setIsSearchOpen(!isSearchOpen); if (isSearchOpen) setSearchQuery(''); }} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-blue-100">
              <Search className="w-4 h-4" />
            </button>
            <button onClick={() => setShowFilterSheet(true)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-blue-100 relative">
              <SlidersHorizontal className="w-4 h-4" />
              {(filterType !== 'all' || sortBy !== 'date_desc') && <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-blue-800"></span>}
            </button>

            {syncStatus === 'saving' && <RefreshCw className="w-4 h-4 text-blue-200 animate-spin ml-1" />}
            {syncStatus === 'synced' && <Cloud className="w-4 h-4 text-blue-200 ml-1" />}
            {syncStatus === 'offline' && <CloudOff className="w-4 h-4 text-rose-300 ml-1" />}

            <div className="w-8 h-8 ml-1 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm shadow-sm cursor-pointer hover:bg-white/30 transition-all" onClick={() => setView('settings')}>
              {user && user.photoURL && !user.isAnonymous ? (
                <img src={user.photoURL} alt="Profil" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
        </div>

        {isSearchOpen ? (
          <div className="mt-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative">
              <input
                autoFocus
                type="text"
                placeholder="Cari warung, barang, atau teman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/20 border border-white/30 text-white placeholder-blue-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm font-medium backdrop-blur-sm shadow-inner"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-blue-200 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col mt-1 animate-in fade-in duration-200">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              {hideBalance ? '••••••••' : formatCurrency(totalNetWorthByCurrency[defaultCurrency] || 0, defaultCurrency)}
            </h1>
            <div className="flex items-center gap-3 text-[10px] font-medium text-blue-100 bg-black/10 w-max px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
              <span className="flex items-center gap-1"><Wallet className="w-3 h-3 text-blue-300" /> Kas: {hideBalance ? '•••' : formatCurrency(totalCashByCurrency[defaultCurrency] || 0, defaultCurrency)}</span>
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-emerald-300" /> Aset: {hideBalance ? '•••' : formatCurrency(totalInvestmentsByCurrency[defaultCurrency] || 0, defaultCurrency)}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
