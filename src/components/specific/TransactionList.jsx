import React from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import TransactionRow from './TransactionRow';

export default function TransactionList({
  groupedHomeTransactions, homeTransactionsCount, homeViewDate, changeHomeMonth,
  searchQuery, filterType, sortBy,
  wallets, formatCurrency, isFlatList, expandedId, onToggleExpand, onEdit, onDelete, onPreviewImage
}) {
  return (
    <div>
      {!searchQuery && !sortBy.includes('amount') && (
        <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <button type="button" onClick={() => changeHomeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
          <div className="text-center">
            <h3 className="font-bold text-gray-800 text-sm">{homeViewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
            <p className="text-[10px] text-gray-500">{homeTransactionsCount} transaksi</p>
          </div>
          <button type="button" onClick={() => changeHomeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
        </div>
      )}

      {groupedHomeTransactions.length === 0 || (groupedHomeTransactions.length === 1 && groupedHomeTransactions[0].items.length === 0) ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"><Search className="w-6 h-6 text-gray-400" /></div>
          <p className="text-gray-500 text-sm">{searchQuery || filterType !== 'all' ? 'Tidak ada data yang cocok dengan filter/pencarian.' : 'Belum ada transaksi di bulan ini.'}</p>
        </div>
      ) : (
        <div className="space-y-6 pb-8">
          {groupedHomeTransactions.map((group) => (
            <div key={group.date} className="animate-in fade-in slide-in-from-bottom-2">
              <h4 className="text-sm font-bold text-gray-500 border-b border-gray-200 pb-2 mb-3 sticky top-[72px] bg-gray-50/95 backdrop-blur-sm z-10">{group.date}</h4>
              <div className="space-y-3">
                {group.items.map((t) => (
                  <TransactionRow
                    key={t.id}
                    t={t}
                    wallets={wallets}
                    formatCurrency={formatCurrency}
                    isFlatList={isFlatList}
                    isExpanded={expandedId === t.id}
                    onToggleExpand={onToggleExpand}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPreviewImage={onPreviewImage}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
