import React from 'react';
import { HandCoins, User, LogIn, LogOut, Globe, ChevronDown, Trash2, Sparkles, Tag, ChevronRight, Download, Upload, AlertTriangle, Plus } from 'lucide-react';

export default function SettingsPage({
  setShowDebtModal, activeDebts,
  user, handleGoogleLogin, handleLogout,
  defaultCurrency, handleSaveSettings, currencies,
  wallets, formatCurrency, handleDeleteWallet, setShowWalletModal,
  geminiKey, gasUrl, setType, setShowCatModal,
  transactions, downloadCSV, handleImportClick, fileInputRef, handleFileChange,
  setShowDummyModal, setShowResetModal
}) {
  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan</h2>
      
      {/* MENU BUKU UTANG & PIUTANG */}
      <button onClick={() => setShowDebtModal(true)} className="w-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl shadow-md p-4 mb-6 relative overflow-hidden flex items-center justify-between group hover:shadow-lg transition-all text-left">
        <div className="absolute top-0 right-0 p-2 opacity-20 pointer-events-none"><HandCoins className="w-20 h-20" /></div>
        <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"><HandCoins className="w-6 h-6 text-white" /></div>
            <div>
                <h3 className="text-white font-bold text-lg">Buku Utang & Piutang</h3>
                <p className="text-orange-100 text-xs">Pantau utang teman atau pinjamanmu.</p>
            </div>
        </div>
        {activeDebts.length > 0 && (
            <div className="bg-white text-rose-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm relative z-10 flex items-center gap-1">
               {activeDebts.length} Belum Lunas
            </div>
        )}
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Akun Saya</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={"w-12 h-12 rounded-full flex items-center justify-center " + (user?.isAnonymous ? "bg-gray-100" : "bg-blue-100")}>
              <User className={"w-6 h-6 " + (user?.isAnonymous ? "text-gray-400" : "text-blue-600")} />
            </div>
            <div><p className="font-bold text-gray-900">{user?.isAnonymous ? 'Pengguna Tamu' : user?.displayName || 'Pengguna Google'}</p><p className="text-xs text-gray-500">{user?.isAnonymous ? 'Data tersimpan sementara' : user?.email}</p></div>
          </div>
          {user?.isAnonymous ? 
            <button onClick={handleGoogleLogin} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"><LogIn className="w-4 h-4" /> Masuk Google</button> : 
            <button onClick={handleLogout} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-medium transition-colors flex items-center gap-2"><LogOut className="w-4 h-4" /> Keluar</button>
          }
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400" /> Regional</h3>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Mata Uang Default (Bawaan)</label>
          <div className="relative">
            <select value={defaultCurrency} onChange={(e) => handleSaveSettings('currency', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold">
               {currencies.map(c => <option key={c.code} value={c.code}>{c.code} ({c.name || c.symbol})</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Manajemen Dompet</h3>
            <button onClick={() => setShowWalletModal(true)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">+ Dompet Baru</button>
        </div>
        <div className="space-y-2">
            {wallets.map(w => (
                <div key={"sett-w-"+w.id} className="flex justify-between items-center bg-gray-50 border border-gray-200 p-3 rounded-xl">
                    <div>
                        <p className="font-bold text-gray-800 text-sm">{w.name} <span className="text-[9px] bg-gray-200 text-gray-600 px-1 rounded ml-1">{w.currency}</span></p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Saldo Awal: {formatCurrency(w.initialBalance, w.currency)}</p>
                    </div>
                    <button onClick={() => handleDeleteWallet(w.id)} className="text-gray-400 hover:text-rose-500 p-1 bg-white rounded-lg shadow-sm border border-gray-100"><Trash2 className="w-4 h-4" /></button>
                </div>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Sparkles className="w-16 h-16 text-purple-600" /></div>
        <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Integrasi AI & Drive</h3>
        <p className="text-xs text-gray-500 mb-4 pr-10">Kunci API Gemini diperlukan untuk scan teks struk. Webhook Apps Script diperlukan untuk menyimpan foto ke Drive.</p>
        
        <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gemini API Key</label>
              <input 
                type="password" 
                value={geminiKey} 
                onChange={(e) => handleSaveSettings('gemini', e.target.value)} 
                placeholder="AIzaSy..." 
                className="w-full bg-purple-50/50 border border-purple-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">URL Webhook Google Drive</label>
              <input 
                type="text" 
                value={gasUrl} 
                onChange={(e) => handleSaveSettings('gas', e.target.value)} 
                placeholder="https://script.google.com/macros/s/..." 
                className="w-full bg-blue-50/50 border border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-[10px]"
              />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Kategori Label</h3>
        <div className="space-y-3">
          <button onClick={() => { setType('expense'); setShowCatModal(true); }} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 transition-all group">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-2 rounded-lg group-hover:bg-rose-200 transition-colors"><Tag className="w-5 h-5 text-rose-600" /></div>
              <div className="text-left"><p className="font-medium text-gray-800 text-sm">Label Pengeluaran</p><p className="text-xs text-gray-400">Atur pilihan label pengeluaran</p></div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => { setType('income'); setShowCatModal(true); }} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 transition-all group">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors"><Tag className="w-5 h-5 text-emerald-600" /></div>
              <div className="text-left"><p className="font-medium text-gray-800 text-sm">Label Pemasukan</p><p className="text-xs text-gray-400">Atur pilihan label pendapatan</p></div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Manajemen Data</h3>
        <div className="space-y-3">
          <button onClick={downloadCSV} disabled={transactions.length === 0} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all group">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors"><Download className="w-5 h-5 text-blue-600" /></div>
              <div className="text-left"><p className="font-medium text-gray-800 text-sm">Export ke Excel/CSV</p><p className="text-xs text-gray-400">Unduh file backup</p></div>
            </div>
          </button>
          <button onClick={handleImportClick} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 transition-all group">
             <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors"><Upload className="w-5 h-5 text-emerald-600" /></div>
              <div className="text-left"><p className="font-medium text-gray-800 text-sm">Restore Data</p><p className="text-xs text-gray-400">Kembalikan data dari file CSV</p></div>
            </div>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
          <button onClick={() => setShowDummyModal(true)} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 transition-all group">
             <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors"><Sparkles className="w-5 h-5 text-purple-600" /></div>
              <div className="text-left"><p className="font-medium text-gray-800 text-sm">Isi Data Demo</p><p className="text-xs text-gray-400">Buat transaksi contoh otomatis</p></div>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Zona Bahaya</h3>
        <button onClick={() => setShowResetModal(true)} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2"><Trash2 className="w-5 h-5" /> Reset Semua Data & Dompet</button>
      </div>
      
      <div className="text-center text-[10px] text-gray-300 pb-8">Dompetku Cloud v6.0 (Wealth Management)</div>
    </div>
  );
}
