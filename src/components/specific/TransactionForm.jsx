import React from 'react';
import { Loader2, Edit2, Camera, TrendingUp, TrendingDown, ArrowRightLeft, HandCoins, ChevronDown, CreditCard, Calendar, Image as ImageIcon, X, Receipt, Tag, Plus, Check, AlertTriangle } from 'lucide-react';

export default function TransactionForm({
  isScanning, uploadStatus, editId, type, setType,
  receiptInputRef, handleScanReceipt, handleAddTransaction,
  wallets, walletId, setWalletId, toWalletId, setToWalletId,
  amount, setAmount, receivedAmount, setReceivedAmount, adminFee, setAdminFee,
  date, setDate, debtType, setDebtType, personName, setPersonName, dueDate, setDueDate,
  description, setDescription, receiptImageUrl, setReceiptImageUrl, setPreviewImage,
  items, handleAddItem, handleItemChange, handleRemoveItem, handleOpenItemCatModal,
  selectedCategories, expenseCategories, incomeCategories, toggleCategory, getLabelClass, setShowCatModal,
  cancelEdit, user, loading, defaultCurrency
}) {
  const wAsal = wallets.find(w => w.id === walletId);
  const wTujuan = wallets.find(w => w.id === toWalletId);
  const isCrossCurrency = wAsal && wTujuan && wAsal.currency !== wTujuan.currency;

  return (
        <div className={"bg-white rounded-2xl shadow-sm border p-5 mb-6 mt-2 transition-all relative overflow-hidden " + (editId ? "border-blue-300 ring-4 ring-blue-50" : "border-gray-100")}>
          {isScanning && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
              <p className="text-sm font-bold text-gray-700">{uploadStatus}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              {editId ? <Edit2 className="w-5 h-5 text-blue-600" /> : "Catat Transaksi"}
            </h3>
            
            {!editId && type === 'expense' && (
              <div>
                <input type="file" accept="image/*" ref={receiptInputRef} onChange={handleScanReceipt} className="hidden" />
                <button type="button" onClick={() => receiptInputRef.current?.click()} className="flex items-center gap-1.5 text-[11px] font-bold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100 hover:bg-purple-100 transition-colors shadow-sm">
                  <Camera className="w-3.5 h-3.5" /> Scan AI
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-lg h-[42px] gap-1 overflow-x-auto hide-scrollbar">
              <button type="button" onClick={() => setType('income')} className={"flex-none px-3 flex items-center justify-center rounded-md text-[11px] md:text-xs font-bold transition-all " + (type === 'income' ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}><TrendingUp className="w-3 h-3 mr-1" /> Pemasukan</button>
              <button type="button" onClick={() => setType('expense')} className={"flex-none px-3 flex items-center justify-center rounded-md text-[11px] md:text-xs font-bold transition-all " + (type === 'expense' ? "bg-rose-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}><TrendingDown className="w-3 h-3 mr-1" /> Pengeluaran</button>
              <button type="button" onClick={() => setType('transfer')} className={"flex-none px-3 flex items-center justify-center rounded-md text-[11px] md:text-xs font-bold transition-all " + (type === 'transfer' ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}><ArrowRightLeft className="w-3 h-3 mr-1" /> Transfer</button>
              <button type="button" onClick={() => setType('debt')} className={"flex-none px-3 flex items-center justify-center rounded-md text-[11px] md:text-xs font-bold transition-all " + (type === 'debt' ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}><HandCoins className="w-3 h-3 mr-1" /> Utang/Piutang</button>
            </div>
            
            {type === 'transfer' ? (
                <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                   <div className="grid grid-cols-2 gap-3">
                       <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">DARI DOMPET (Asal)</label>
                          <div className="relative">
                              <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 appearance-none text-xs font-bold">
                                <option value="" disabled>-- Pilih Dompet --</option>
                                {wallets.map(w => <option key={"s-"+w.id} value={w.id}>{w.name} ({w.currency})</option>)}
                              </select>
                              <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-gray-400 pointer-events-none" />
                          </div>
                       </div>
                       <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">KE DOMPET (Tujuan)</label>
                          <div className="relative">
                              <select value={toWalletId} onChange={(e) => setToWalletId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 appearance-none text-xs font-bold">
                                <option value="" disabled>-- Pilih Tujuan --</option>
                                {wallets.filter(w => w.id !== walletId).map(w => <option key={"d-"+w.id} value={w.id}>{w.name} ({w.currency})</option>)}
                              </select>
                              <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-gray-400 pointer-events-none" />
                          </div>
                       </div>
                   </div>
                   
                   <div>
                       <label className="block text-[10px] font-bold text-gray-500 mb-1">JUMLAH YANG DIKIRIM {wAsal ? `(${wAsal.currency})` : ''}</label>
                       <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-all font-bold text-gray-800" />
                   </div>
                   
                   {isCrossCurrency && (
                       <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl animate-in slide-in-from-top-2">
                           <label className="block text-[10px] font-bold text-yellow-800 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> JUMLAH DITERIMA (Beda Mata Uang: {wTujuan.currency})</label>
                           <input type="number" value={receivedAmount} onChange={(e) => setReceivedAmount(e.target.value)} placeholder={`Jumlah uang masuk dalam ${wTujuan.currency}`} className="w-full bg-white border border-yellow-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-yellow-500 transition-all font-bold text-gray-800" />
                       </div>
                   )}
                   
                   <div>
                       <label className="block text-[10px] font-bold text-gray-500 mb-1">BIAYA ADMIN / TRANSAKSI (Opsional)</label>
                       <input type="number" value={adminFee} onChange={(e) => setAdminFee(e.target.value)} placeholder={`0 ${wAsal ? wAsal.currency : ''}`} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-all text-xs" />
                   </div>
                   
                   <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">TANGGAL TRANSAKSI</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-xs" />
                   </div>
                </div>
            ) : type === 'debt' ? (
                <div className="space-y-4 bg-orange-50/30 p-4 rounded-xl border border-orange-100">
                   <div className="flex bg-white p-1 rounded-lg border border-orange-200">
                      <button type="button" onClick={() => setDebtType('lend')} className={"flex-1 py-1.5 text-xs font-bold rounded-md transition-all " + (debtType === 'lend' ? "bg-orange-500 text-white" : "text-gray-500 hover:text-gray-700")}>Memberi Pinjaman</button>
                      <button type="button" onClick={() => setDebtType('borrow')} className={"flex-1 py-1.5 text-xs font-bold rounded-md transition-all " + (debtType === 'borrow' ? "bg-orange-500 text-white" : "text-gray-500 hover:text-gray-700")}>Meminjam Uang</button>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">{debtType === 'lend' ? 'DOMPET KELUAR' : 'DOMPET MASUK'}</label>
                          <div className="relative">
                              <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 appearance-none text-xs font-bold">
                                <option value="" disabled>-- Pilih Dompet --</option>
                                {wallets.map(w => <option key={"s-"+w.id} value={w.id}>{w.name} ({w.currency})</option>)}
                              </select>
                              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                      </div>
                      <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">TANGGAL CATAT</label>
                          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 text-xs" />
                      </div>
                   </div>

                   <div>
                       <label className="block text-[10px] font-bold text-gray-500 mb-1">NAMA ORANG/TEMAN</label>
                       <input type="text" value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Contoh: Budi, Kantor..." className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-all font-medium text-sm" />
                   </div>
                   
                   <div>
                       <label className="block text-[10px] font-bold text-gray-500 mb-1">TOTAL NOMINAL {wAsal ? `(${wAsal.currency})` : ''}</label>
                       <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-all font-bold text-gray-800 text-lg" />
                   </div>

                   <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">TENGGAT WAKTU (Opsional)</label>
                      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500 text-xs text-gray-500" />
                   </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Sumber Dana</label>
                          <div className="relative">
                              <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 appearance-none text-sm font-bold text-blue-700">
                                <option value="" disabled>Pilih Dompet...</option>
                                {wallets.map(w => <option key={"s-"+w.id} value={w.id}>{w.name} ({w.currency})</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Tanggal</label>
                          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-medium" />
                        </div>
                    </div>
                
                    <div>
                      <div className="flex justify-between items-end mb-1">
                          <label className="block text-xs font-medium text-gray-500">Deskripsi Kegiatan</label>
                          {receiptImageUrl && (
                              <div className="relative flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 cursor-pointer hover:bg-blue-100" onClick={() => setPreviewImage(receiptImageUrl)}>
                                  <ImageIcon className="w-3 h-3" /> Foto Struk
                                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-600" onClick={(e) => { e.stopPropagation(); setReceiptImageUrl(null); }}><X className="w-2.5 h-2.5"/></span>
                              </div>
                          )}
                      </div>
                      <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={type === 'expense' ? "Makan Siang..." : "Gaji Bulanan..."} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-all font-medium" />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                           <label className="text-xs font-bold text-gray-600 flex items-center gap-1"><Receipt className="w-3.5 h-3.5" /> Rincian Barang (Opsional)</label>
                            <button type="button" onClick={handleAddItem} className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded shadow-sm font-medium hover:bg-gray-100">+ Tambah Baris</button>
                        </div>
                        
                        {!items || items.length === 0 ? (
                            <p className="text-[10px] text-gray-400 text-center italic mb-2">Tambah manual rincian harga untuk pelacakan</p>
                        ) : (
                            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                                {items.map((item, index) => (
                                    <div key={"item-" + index} className="flex flex-col gap-2 p-2 bg-white rounded-lg border border-gray-100 mb-2">
                                        <div className="flex items-center gap-2">
                                            <input type="text" placeholder="Nama brg" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
                                            <input type="number" placeholder="Harga" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} className="w-24 text-right bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
                                            <button type="button" onClick={() => handleRemoveItem(index)} className="text-gray-300 hover:text-rose-500"><XCircle className="w-5 h-5" /></button>
                                        </div>
                                        <div className="flex justify-start">
                                            <button type="button" onClick={() => handleOpenItemCatModal(index)} className={"text-[10px] px-2 py-1 rounded-md border flex items-center gap-1 transition-colors " + (item.category ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100")}>
                                                <Tag className="w-3 h-3" /> {item.category || 'Pilih Label (Opsional)'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="pt-2 border-t border-gray-200 border-dashed">
                            <label className="block text-[10px] text-gray-500 mb-1">Total {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'} ({wAsal ? wAsal.currency : defaultCurrency})</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-bold text-gray-800 text-lg" />
                        </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">Kategori Utama (Struk)</label>
                      <div className="flex flex-wrap gap-2">
                        {(type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                          <button 
                            key={"label-" + cat} 
                            type="button" 
                            onClick={() => toggleCategory(cat)} 
                            className={"px-3 py-1.5 rounded-full text-xs font-medium transition-all border " + getLabelClass(cat)}
                          >
                            {cat}
                          </button>
                        ))}
                        <button type="button" onClick={() => setShowCatModal(true)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-blue-600 hover:bg-gray-200 transition-all flex items-center gap-1"><Plus className="w-3 h-3" /> Baru</button>
                      </div>
                    </div>
                </>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              {editId && <button type="button" onClick={cancelEdit} className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-xl transition-colors">Batal</button>}
              <button type="submit" disabled={!user || loading || isScanning || wallets.length === 0} className={"text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed " + (editId ? "w-2/3 bg-blue-600 hover:bg-blue-700" : "w-full bg-gray-900 hover:bg-black")}>
                {editId ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />} 
                {editId ? "Simpan Perubahan" : (type === 'transfer' ? "Proses Transfer" : "Simpan Transaksi")}
              </button>
            </div>
          </form>
        </div>
  );
}
