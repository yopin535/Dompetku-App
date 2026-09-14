import React from 'react';
import { List, PieChart, LineChart, Settings, Wallet } from 'lucide-react';

const ITEMS = [
  { value: 'home', label: 'Beranda', Icon: List, activeClass: 'text-blue-700 bg-blue-50' },
  { value: 'report', label: 'Laporan', Icon: PieChart, activeClass: 'text-blue-700 bg-blue-50' },
  { value: 'investments', label: 'Investasi', Icon: LineChart, activeClass: 'text-purple-700 bg-purple-50' },
  { value: 'settings', label: 'Menu', Icon: Settings, activeClass: 'text-blue-700 bg-blue-50' },
];

export default function Sidebar({ view, setView }) {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col sticky top-8 h-[calc(100vh-4rem)] bg-white border border-gray-200 rounded-[2rem] shadow-xl p-4">
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="bg-blue-600 p-2 rounded-xl">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 leading-none">Dompetku</p>
          <p className="text-[10px] text-gray-400 mt-1">Wealth Management</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 mt-4">
        {ITEMS.map(({ value, label, Icon, activeClass }) => (
          <button
            key={value}
            onClick={() => setView(value)}
            className={
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all " +
              (view === value ? activeClass : "text-gray-500 hover:bg-gray-100 hover:text-gray-700")
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto px-2 pb-1">
        <p className="text-[10px] text-gray-300">Dompetku Cloud v6.0</p>
      </div>
    </aside>
  );
}
