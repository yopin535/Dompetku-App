import React from 'react';
import { X } from 'lucide-react';

export default function ImagePreview({ src, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 bg-black/90 z-[90] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"><X className="w-6 h-6" /></button>
      <img src={src} alt="Preview Struk" className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain border border-white/10" />
    </div>
  );
}
