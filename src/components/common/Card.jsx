import React from 'react';

export default function Card({ 
  className = '', 
  children,
  header,
  footer 
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      {header && <div className="border-b border-gray-200 px-6 py-4">{header}</div>}
      <div className="p-6">{children}</div>
      {footer && <div className="border-t border-gray-200 px-6 py-4">{footer}</div>}
    </div>
  );
}

export function MetricCard({ title, value, change = null, icon, className = '' }) {
  const changeClass = change > 0 ? 'text-emerald-600' : change < 0 ? 'text-rose-600' : 'text-gray-500';
  
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-gray-50">{icon}</div>
        <div>
          <p className="text-xs font-medium text-gray-500">{title}</p>
          <p className="font-bold text-gray-900">{value}</p>
          {change !== null && (
            <p className={`text-xs font-medium ${changeClass}`}>
              {change >= 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}