import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Trash2 } from 'lucide-react';
import { CURRENCIES } from '../../utils/formatters';

export default function EditPortfolioModal({ open, onClose, portfolio, onSave, onDelete }) {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [targetType, setTargetType] = useState('amount');
  const [targetValue, setTargetValue] = useState('');
  const [duration, setDuration] = useState('3_months');
  const [customDate, setCustomDate] = useState('');

  useEffect(() => {
    if (portfolio) {
      setName(portfolio.name || '');
      setCurrency(portfolio.currency || 'IDR');
      setTargetType(portfolio.targetReturnType || 'amount');
      setTargetValue(portfolio.targetReturn ? portfolio.targetReturn.toString() : '');
      setDuration(portfolio.targetDuration || '3_months');
      setCustomDate(portfolio.targetEndDate ? new Date(portfolio.targetEndDate).toISOString().split('T')[0] : '');
    }
  }, [portfolio]);

  if (!open || !portfolio) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const targetReturn = targetValue ? parseFloat(targetValue) : null;
    const updatedData = {
      name,
      currency,
      targetReturn,
      targetReturnType: targetType,
      targetDuration: duration,
      targetEndDate: customDate ? new Date(customDate).getTime() : null
    };
    onSave(portfolio.id, updatedData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm lg:max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-gray-800">Edit Portofolio</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Nama Portofolio</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Misal: Saham BBCA" 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Mata Uang</label>
            <div className="relative">
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 appearance-none text-xs font-bold"
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4">
            <label className="block text-xs font-bold text-gray-500 mb-2">Target Return (Opsional)</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setTargetType('amount')}
                className={"py-2 rounded-lg text-xs font-bold transition-colors " + (targetType === 'amount' ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500")}
              >
                Nominal
              </button>
              <button
                type="button"
                onClick={() => setTargetType('percentage')}
                className={"py-2 rounded-lg text-xs font-bold transition-colors " + (targetType === 'percentage' ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500")}
              >
                Persen (%)
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                value={targetValue}
                onChange={e => setTargetValue(e.target.value)}
                placeholder={targetType === 'amount' ? "Contoh: 10000000" : "Contoh: 20"}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              />
              {targetType === 'percentage' && (
                <span className="absolute right-4 top-2 font-bold text-gray-400">%</span>
              )}
            </div>
          </div>
          
          {targetValue && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Durasi Target</label>
              <div className="relative">
                <select
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 appearance-none text-xs font-bold"
                >
                  <option value="1_month">1 Bulan</option>
                  <option value="3_months">3 Bulan</option>
                  <option value="6_months">6 Bulan</option>
                  <option value="1_year">1 Tahun</option>
                  <option value="custom">Custom Tanggal</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {duration === 'custom' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={e => setCustomDate(e.target.value)}
                  className="w-full mt-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-purple-500 text-xs font-medium"
                />
              )}
            </div>
          )}
          
          <div className="flex gap-3 mt-6">
            <button 
              type="submit" 
              disabled={!name.trim()} 
              className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50"
            >
              Simpan Perubahan
            </button>
            <button 
              type="button"
              onClick={() => {
                if (confirm(`Hapus "${portfolio.name}"?`)) {
                  onDelete(portfolio.id);
                  onClose();
                }
              }}
              className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
