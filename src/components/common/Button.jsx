import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  ...props 
}) {
  const variants = {
    primary: 'bg-gray-900 hover:bg-black text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    outline: 'border border-gray-200 hover:bg-gray-50 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button 
      className={`rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
