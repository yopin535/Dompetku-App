import React from 'react';
import { X } from 'lucide-react';

export default function ItemCategoryModal({ open, onClose, categories, onSelect }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Pilih Kategori Item</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="space-y-2">
          {categories.map(cat => (
            <button
              key={"item-cat-" + cat}
              onClick={() => onSelect(cat)}
              className="w-full text-left p-3 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-colors text-sm font-medium text-gray-700"
            >
              {cat}
            </button>
          ))}
          <div className="pt-2">
            <button onClick={() => onSelect('')} className="w-full text-left p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors text-xs font-medium text-gray-500 italic">
              Hapus Label (Ikut Kategori Struk)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
