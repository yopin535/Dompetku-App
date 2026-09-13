import React from 'react';
import { Plus } from 'lucide-react';
import WalletCard from '../layout/WalletCard';

export default function WalletStrip({ wallets, walletBalances, hideBalance, formatCurrency, onAdd }) {
  if (!wallets || wallets.length === 0) return null;
  return (
    <div className="flex overflow-x-auto gap-3 pb-4 pt-1 snap-x hide-scrollbar px-1">
      {wallets.map(w => (
        <WalletCard key={w.id} wallet={w} walletBalances={walletBalances} hideBalance={hideBalance} formatCurrency={formatCurrency} />
      ))}
      <button onClick={onAdd} className="min-w-[110px] border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-blue-600 hover:border-blue-300 transition-colors snap-start">
        <Plus className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-bold">Dompet Baru</span>
      </button>
    </div>
  );
}
