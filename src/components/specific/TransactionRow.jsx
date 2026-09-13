import React from 'react';
import { Edit2, Trash2, ArrowRightLeft, TrendingUp, TrendingDown, HandCoins, Briefcase, CreditCard, ChevronUp, ChevronDown, Tag, Receipt, Image as ImageIcon } from 'lucide-react';

export default function TransactionRow({
  t, wallets, formatCurrency, isFlatList,
  isExpanded, onToggleExpand, onEdit, onDelete, onPreviewImage
}) {
  const typeStr = t.type || '';
  const isTransfer = typeStr === 'transfer';
  const isDebt = typeStr === 'debt';
  const isInvest = typeof typeStr === 'string' && typeStr.includes('invest');
  const hasItems = t.items && t.items.length > 0;
  const dompetAsal = wallets.find(w => w.id === t.walletId);

  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4 w-2/3">
          <div className={"w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 " +
            (isTransfer ? "bg-blue-50 text-blue-600" :
              isDebt ? "bg-orange-50 text-orange-600" :
                isInvest ? "bg-purple-50 text-purple-600" :
                  (typeStr === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"))}>
            {isTransfer ? <ArrowRightLeft className="w-4 h-4" /> :
              isDebt ? <HandCoins className="w-4 h-4" /> :
                isInvest ? <Briefcase className="w-4 h-4" /> :
                  (typeStr === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />)}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-gray-800 text-sm truncate">{t.description}</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {isFlatList && <span className="text-[9px] px-1.5 py-0.5 bg-gray-800 text-white rounded font-bold">{t.date}</span>}

              {isTransfer ? (
                <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded font-bold">Transfer</span>
              ) : isDebt ? (
                <span className={"text-[9px] px-1.5 py-0.5 border rounded font-bold " + (t.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100")}>{t.status === 'paid' ? 'Lunas' : 'Belum Lunas'}</span>
              ) : isInvest ? (
                <span className="text-[9px] px-1.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded font-bold">Investasi</span>
              ) : (
                (t.categories || (t.category ? [t.category] : ['Umum'])).map(catLabel => (
                  <span key={t.id + "-" + catLabel} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">{catLabel}</span>
                ))
              )}
              <span className="text-[9px] px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded border border-gray-200"><CreditCard className="w-2.5 h-2.5 inline mr-0.5" /> {dompetAsal ? dompetAsal.name : 'Terhapus'}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={"font-bold text-sm " + (isTransfer ? "text-gray-700" : isDebt ? (t.debtType === 'lend' ? "text-rose-600" : "text-emerald-600") : isInvest ? (typeStr === 'invest_deposit' ? "text-rose-600" : "text-emerald-600") : (typeStr === 'income' ? "text-emerald-600" : "text-rose-600"))}>
            {isTransfer ? "" : isDebt ? (t.debtType === 'lend' ? "-" : "+") : isInvest ? (typeStr === 'invest_deposit' ? "-" : "+") : (typeStr === 'income' ? "+" : "-")}{formatCurrency(t.amount, t.currency)}
          </span>
          <div className="flex items-center gap-2 mt-1">
            {hasItems && !isTransfer && !isDebt && !isInvest && (
              <button onClick={() => onToggleExpand(t.id)} className="text-[10px] flex items-center gap-0.5 text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                Nota {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
            {!t.isSettlement && !isInvest && <button onClick={() => onEdit(t)} className="text-gray-300 hover:text-blue-500 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>}
            <button onClick={() => onDelete(t.id)} className="text-gray-300 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>

      {hasItems && !isTransfer && !isDebt && !isInvest && isExpanded && (
        <div className="bg-blue-50/30 border-t border-gray-100 p-4 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1"><Receipt className="w-3 h-3" /> Rincian Item</p>
            {t.receiptUrl && (
              <button onClick={() => onPreviewImage(t.receiptUrl)} className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1 hover:bg-purple-200"><ImageIcon className="w-3 h-3" /> Lihat Foto</button>
            )}
          </div>
          <ul className="space-y-1.5">
            {t.items.map((item, idx) => (
              <li key={"det-" + idx} className="flex justify-between items-start text-xs border-b border-gray-200/50 pb-1.5 last:border-0 last:pb-0">
                <div className="flex flex-col">
                  <span className="text-gray-700 font-medium">{item.name}</span>
                  {item.category && <span className="text-[9px] text-gray-500 mt-0.5 flex items-center gap-0.5"><Tag className="w-2.5 h-2.5" /> {item.category}</span>}
                </div>
                <span className="font-semibold text-gray-900 mt-0.5">{formatCurrency(item.price || 0, t.currency)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isTransfer && isExpanded && (
        <div className="bg-gray-50 border-t border-gray-100 p-4 animate-in slide-in-from-top-2 text-xs">
          <p className="mb-1"><span className="text-gray-500">Tujuan:</span> <b>{wallets.find(w => w.id === t.toWalletId)?.name || '?'}</b></p>
          {t.currency !== t.targetCurrency && <p className="mb-1 text-green-600 font-bold"><span className="text-gray-500 font-normal">Diterima:</span> {formatCurrency(t.receivedAmount, t.targetCurrency)}</p>}
          {t.adminFee > 0 && <p className="text-rose-500"><span className="text-gray-500">Biaya Admin:</span> -{formatCurrency(t.adminFee, t.currency)}</p>}
        </div>
      )}
      {isTransfer && !isExpanded && (
        <button onClick={() => onToggleExpand(t.id)} className="absolute bottom-1 right-1/2 translate-x-1/2 text-[9px] text-gray-400 bg-white px-2 rounded-t border border-b-0 border-gray-100"><ChevronDown className="w-3 h-3" /></button>
      )}
      {isTransfer && isExpanded && (
        <button onClick={() => onToggleExpand(t.id)} className="w-full bg-gray-100 text-center py-0.5 text-gray-400 hover:bg-gray-200"><ChevronUp className="w-3 h-3 mx-auto" /></button>
      )}
    </div>
  );
}
