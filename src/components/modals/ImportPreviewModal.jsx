import React from 'react';
import { X, AlertTriangle, Download, AlertCircle, RefreshCw, Wallet } from 'lucide-react';

export default function ImportPreviewModal({
  open, onClose,
  parsedTransData, parsedPortData, missingWallets,
  transNew, transDup, portNew, portDup, totalNew, totalDup,
  overwriteDup, setOverwriteDup, skipDup, setSkipDup,
  walletMapping, setWalletMapping,
  onConfirm, onCancel,
  wallets
}) {
  if (!open) return null;

  const availableWallets = wallets || [];
  const hasMissing = missingWallets && missingWallets.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><Download className="w-5 h-5 text-blue-600" /></div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Konfirmasi Import Backup</h3>
              <p className="text-xs text-gray-500">Silakan periksa ringkasan data sebelum melanjutkan</p>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-[10px] text-green-700">Transaksi Baru</p>
            <p className="font-bold text-green-800">{totalNew > 0 ? (parseInt(transNew) + parseInt(portNew)) : 0}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-[10px] text-yellow-700">Transaksi Duplikat</p>
            <p className="font-bold text-yellow-800">{transDup}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-[10px] text-green-700">Portofolio Baru</p>
            <p className="font-bold text-green-800">{portNew}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-[10px] text-yellow-700">Portofolio Duplikat</p>
            <p className="font-bold text-yellow-800">{portDup}</p>
          </div>
        </div>

        {/* Wallet Mapping */}
        {hasMissing && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {missingWallets.length} Dompet tidak ditemukan, perlu pemetaan manual</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {missingWallets.map(name => (
                <div key={name} className="flex items-center gap-2 bg-white border border-orange-200 rounded-lg p-2">
                  <span className="text-xs text-orange-700 font-medium flex-1">{name}</span>
                  <select
                    value={walletMapping[name] || ''}
                    onChange={e => setWalletMapping(prev => ({ ...prev, [name]: e.target.value }))}
                    className="w-40 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Pilih Dompet</option>
                    {availableWallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.currency})</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duplicate handling options */}
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-bold text-gray-700 mb-3">Penanganan Data Duplikat</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="radio" name="dup" checked={skipDup && !overwriteDup} onChange={() => { setSkipDup(true); setOverwriteDup(false); }} className="rounded border-gray-200 text-purple-600" />
              <span className="text-xs text-gray-700">Lewati duplikat (default) — hanya import data baru</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="dup" checked={overwriteDup} onChange={() => { setOverwriteDup(true); setSkipDup(false); }} className="rounded border-gray-200 text-purple-600" />
              <span className="text-xs text-gray-700">Timpa duplikat — perbarui data yang sudah ada</span>
            </label>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button onClick={onCancel} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200">Batal</button>
          <button onClick={onConfirm} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700">Proses Import</button>
        </div>
      </div>
    </div>
  );
}