import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingOverlay({ open }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <p className="text-sm text-gray-500">Memuat data...</p>
      </div>
    </div>
  );
}
