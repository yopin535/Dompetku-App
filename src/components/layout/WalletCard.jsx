import React from 'react';
import { Landmark } from 'lucide-react';

export default function WalletCard({ wallet, walletBalances, hideBalance, formatCurrency, isActive = false, onClick }) {
  const balance = (walletBalances && walletBalances[wallet.id]) || 0;
  return (
    <div
      onClick={onClick}
      className={`min-w-[145px] bg-white rounded-2xl p-4 shadow-sm border transition-colors hover:border-blue-200 snap-start flex flex-col justify-between ${isActive ? 'border-blue-400 ring-2 ring-blue-50' : 'border-gray-100'}${onClick ? ' cursor-pointer' : ''}`}
    >
      <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
        <span className="bg-blue-50 p-1 rounded-md"><Landmark className="w-3 h-3 text-blue-500" /></span>
        {wallet.name}
      </p>
      <p className="font-bold text-base mt-2.5 text-gray-800">
        {hideBalance ? '••••••' : formatCurrency(balance, wallet.currency)}
      </p>
    </div>
  );
}
