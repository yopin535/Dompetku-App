import React from 'react';
import { Sparkles } from 'lucide-react';

export default function DummyModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-purple-100 p-3 rounded-full mb-4"><Sparkles className="w-8 h-8 text-purple-600" /></div>
          <h3 className="font-bold text-xl text-gray-900">Isi Data Demo?</h3>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Batal</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">Ya, Tambahkan</button>
        </div>
      </div>
    </div>
  );
}
