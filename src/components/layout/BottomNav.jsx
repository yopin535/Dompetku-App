import React from 'react';
import { List, PieChart, LineChart, Settings } from 'lucide-react';

const ITEMS = [
  { value: 'home', label: 'Beranda', Icon: List, activeClass: 'text-blue-600 bg-blue-50' },
  { value: 'report', label: 'Laporan', Icon: PieChart, activeClass: 'text-blue-600 bg-blue-50' },
  { value: 'investments', label: 'Investasi', Icon: LineChart, activeClass: 'text-purple-600 bg-purple-50' },
  { value: 'settings', label: 'Menu', Icon: Settings, activeClass: 'text-blue-600 bg-blue-50' },
];

export default function BottomNav({ view, setView }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-30 md:max-w-md md:mx-auto md:bottom-4 md:rounded-2xl md:border md:shadow-xl">
      <div className="flex justify-around items-center">
        {ITEMS.map(({ value, label, Icon, activeClass }) => (
          <button key={value} onClick={() => setView(value)} className={"flex flex-col items-center p-2 rounded-xl flex-1 transition-all " + (view === value ? activeClass : "text-gray-400 hover:text-gray-600")}><Icon className="w-6 h-6 mb-1" /><span className="text-[10px] font-bold mt-1">{label}</span></button>
        ))}
      </div>
    </div>
  );
}
