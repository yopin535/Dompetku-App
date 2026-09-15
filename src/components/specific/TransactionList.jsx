import React from 'react';
import { Search, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import TransactionRow from './TransactionRow';

function amountClass(t) {
  const typeStr = t.type || '';
  if (typeStr === 'transfer') return 'text-gray-700';
  if (typeStr === 'debt') return t.debtType === 'lend' ? 'text-rose-600' : 'text-emerald-600';
  if (typeof typeStr === 'string' && typeStr.includes('invest')) return typeStr === 'invest_deposit' ? 'text-rose-600' : 'text-emerald-600';
  return typeStr === 'income' ? 'text-emerald-600' : 'text-rose-600';
}

function amountPrefix(t) {
  const typeStr = t.type || '';
  if (typeStr === 'transfer') return '';
  if (typeStr === 'debt') return t.debtType === 'lend' ? '-' : '+';
  if (typeof typeStr === 'string' && typeStr.includes('invest')) return typeStr === 'invest_deposit' ? '-' : '+';
  return typeStr === 'income' ? '+' : '-';
}

function DesktopTransactionTable({ groupedHomeTransactions, wallets, formatCurrency, onEdit, onDelete }) {
  const rows = groupedHomeTransactions.flatMap(g => (g.items || []).map(t => ({ ...t, groupDate: g.date })));
  if (rows.length === 0) return null;
  return (
    <div className="hidden lg:block pb-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="px-4 py-3 font-bold">Tanggal</th>
              <th className="px-4 py-3 font-bold">Deskripsi</th>
              <th className="px-4 py-3 font-bold">Kategori</th>
              <th className="px-4 py-3 font-bold">Dompet</th>
              <th className="px-4 py-3 font-bold text-right">Jumlah</th>
              <th className="px-4 py-3 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(t => {
              const wallet = wallets.find(w => w.id === t.walletId);
              const cat = (t.categories && t.categories[0]) || t.category || 'Umum';
              return (
                <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{t.date || t.groupDate}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[280px] truncate">{t.description}</td>
                  <td className="px-4 py-3"><span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">{cat}</span></td>
                  <td className="px-4 py-3 text-gray-500">{wallet ? wallet.name : 'Terhapus'}</td>
                  <td className={"px-4 py-3 font-bold text-right whitespace-nowrap " + amountClass(t)}>{amountPrefix(t)}{formatCurrency(t.amount, t.currency)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(t.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
        <>
        <div className="space-y-6 pb-8 lg:hidden">
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
        <DesktopTransactionTable
          groupedHomeTransactions={groupedHomeTransactions}
          wallets={wallets}
          formatCurrency={formatCurrency}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        </>
      )}
    </div>
  );
}
