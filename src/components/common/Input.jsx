import React from 'react';

export default function Input({ 
  label, 
  error, 
  className = '',
  ...props 
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      )}
      <input
        className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors ${
          error ? 'border-rose-300 focus:border-rose-500' : 'border-gray-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

export function Select({ label, options, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      )}
      <select
        className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Textarea({ label, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      )}
      <textarea
        className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}