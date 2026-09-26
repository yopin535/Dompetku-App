import React, { useMemo, useState } from 'react';
import { X, History, ArrowUpCircle, ArrowDownCircle, RefreshCw, Plus, Trash2, Briefcase, ChevronDown } from 'lucide-react';

export default function PortfolioHistoryModal({
  open, onClose,
  portfolios, histories, historyLoading,
  formatCurrency
}) {
  const [filterPortfolioId, setFilterPortfolioId] = useState('all');
  const [filterReason, setFilterReason] = useState('all');
  if (!open) return null;

  const filtered = useMemo(() => {
    return histories.filter(h => {
      if (filterPortfolioId !== 'all' && h.portfolioId !== filterPortfolioId) return false;
      if (filterReason !== 'all' && h.reason !== filterReason) return false;
      return true;
    });
  }, [histories, filterPortfolioId, filterReason]);

  const reasonLabel = (r) => {
    if (r === 'create') return 'Buat';
    if (r === 'topup') return 'Top Up';
    if (r === 'withdraw') return 'Tarik';
    if (r === 'update') return 'Update Harga';
    return r || '-';
  };

  const reasonIcon = (r) => {
    if (r === 'topup') return <ArrowUpCircle className="w-4 h-4 text-purple-600" />;
    if (r === 'withdraw') return <ArrowDownCircle className="w-4 h-4 text-gray-600" />;
    if (r === 'update') return <RefreshCw className="w-4 h-4 text-blue-600" />;
    if (r === 'create') return <Plus className="w-4 h-4 text-emerald-600" />;
    return <History className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl lg:max-w-3xl p-6 shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><History className="w-5 h-5 text-purple-600" /> Riwayat Portofolio</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1">Filter Portofolio</label>
            <div className="relative">
              <select value={filterPortfolioId} onChange={e => setFilterPortfolioId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 appearance-none text-xs font-bold">
                <option value="all">Semua</option>
                {portfolios.map(p => <option key={p.id} value={p.id}>{p.name} ({p.currency || 'IDR'})</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1">Filter Alasan</label>
            <div className="relative">
              <select value={filterReason} onChange={e => setFilterReason(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 appearance-none text-xs font-bold">
                <option value="all">Semua</option>
                <option value="create">Buat</option>
                <option value="topup">Top Up</option>
                <option value="withdraw">Tarik</option>
                <option value="update">Update Harga</option>
              </select>
              <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {historyLoading ? (
            <p className="text-center text-sm text-gray-500 py-8">Memuat riwayat...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Belum ada riwayat. Riwayat tercatat mulai sekarang selamanya.</p>
              <p className="text-xs text-gray-400 mt-1">Top up, tarik, atau update harga untuk melihatnya di sini.</p>
            </div>
          ) : (
            filtered.map(h => {
              const currency = h.currency || 'IDR';
              const diffInvested = (h.newInvested || 0) - (h.prevInvested || 0);
              const diffValue = (h.newValue || 0) - (h.prevValue || 0);
              return (
                <div key={h.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center">{reasonIcon(h.reason)}</div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 flex items-center gap-1">{h.portfolioName || 'Portofolio'} <span className="text-[9px] bg-purple-50 text-purple-600 px-1 py-0.5 rounded">{currency}</span> <span className="text-[10px] text-gray-500">{reasonLabel(h.reason)}</span></p>
                        <p className="text-[11px] text-gray-500">{h.at ? new Date(h.at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                      </div>
                    </div>
                    {h.amount ? <span className="text-xs font-bold text-gray-700">{formatCurrency(h.amount, currency)}</span> : null}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="bg-white rounded-lg p-2 border border-gray-100">
                      <p className="text-gray-400 font-bold text-[9px] uppercase">Modal</p>
                      <p className="font-medium text-gray-800">{formatCurrency(h.prevInvested || 0, currency)} → {formatCurrency(h.newInvested || 0, currency)}</p>
                      {diffInvested !== 0 && <p className={"text-[10px] font-bold " + (diffInvested >= 0 ? "text-emerald-600" : "text-rose-600")}>{diffInvested >= 0 ? "+" : ""}{formatCurrency(diffInvested, currency)}</p>}
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-100">
                      <p className="text-gray-400 font-bold text-[9px] uppercase">Nilai</p>
                      <p className="font-medium text-gray-800">{formatCurrency(h.prevValue || 0, currency)} → {formatCurrency(h.newValue || 0, currency)}</p>
                      {diffValue !== 0 && <p className={"text-[10px] font-bold " + (diffValue >= 0 ? "text-emerald-600" : "text-rose-600")}>{diffValue >= 0 ? "+" : ""}{formatCurrency(diffValue, currency)}</p>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
