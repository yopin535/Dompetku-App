import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '',
  width = 'max-w-md'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className={`bg-white rounded-2xl w-full ${width} p-6 shadow-xl ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id="modal-title" className="font-bold text-lg text-gray-900">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}