import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, Wallet, TrendingUp, TrendingDown, DollarSign, 
  Cloud, Loader2, Tag, Calendar, PieChart, List, ChevronLeft, ChevronRight, 
  Download, Upload, FileText, CheckCircle, XCircle, X, Settings, Sparkles,
  LogOut, LogIn, AlertTriangle, User, Info, Check, CloudOff, RefreshCw, Globe, Edit2, Camera
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  getDocs, 
  writeBatch,
  updateDoc
} from 'firebase/firestore';

// =====================================================================
// FIREBASE CONFIG MILIKMU
// =====================================================================
const firebaseConfig = {
  apiKey: "AIzaSyA3GU59sJ0W9QKGyWZ3LjBffUnNoxp46MY",
  authDomain: "dompetku-app-a98c9.firebaseapp.com",
  projectId: "dompetku-app-a98c9",
  storageBucket: "dompetku-app-a98c9.firebasestorage.app",
  messagingSenderId: "16951434157",
  appId: "1:16951434157:web:f72d408a86b903cdfcdf24"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});

const googleProvider = new GoogleAuthProvider();
const appId = "dompetku-pribadi"; 

export default function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home'); 
  const [notification, setNotification] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced');
  
  const [showFloatingAdd, setShowFloatingAdd] = useState(false);
  
  const [showCatModal, setShowCatModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDummyModal, setShowDummyModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const getCurrentDate = () => {
    const now = new Date();
    return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0');
  };

  const currencies = [
    { code: 'IDR', symbol: 'Rp', name: 'Rupiah (IDR)' },
    { code: 'USD', symbol: '$', name: 'Dollar AS (USD)' },
    { code: 'SGD', symbol: 'S$', name: 'Dollar Singapura (SGD)' },
    { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
    { code: 'JPY', symbol: '¥', name: 'Yen Jepang (JPY)' },
    { code: 'MYR', symbol: 'RM', name: 'Ringgit Malaysia (MYR)' },
  ];

  // --- FORM STATES ---
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [currency, setCurrency] = useState('IDR'); 
  const [date, setDate] = useState(getCurrentDate());
  const [selectedCategories, setSelectedCategories] = useState(['Makanan']);
  
  const [editId, setEditId] = useState(null);
  const [homeViewDate, setHomeViewDate] = useState(new Date());

  const [reportDate, setReportDate] = useState(new Date());
  const [reportType, setReportType] = useState('monthly'); 
  const [reportCurrency, setReportCurrency] = useState('IDR'); 
  const fileInputRef = useRef(null);
  const receiptInputRef = useRef(null);

  // --- AI SCANNER STATES ---
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [isScanning, setIsScanning] = useState(false);

  const defaultExpenseCategories = ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya'];
  const defaultIncomeCategories = ['Gaji', 'Bonus', 'Hadiah', 'Penjualan', 'Investasi', 'Freelance', 'Lainnya'];

  const expenseCategories = useMemo(() => {
    const custom = customCategories.filter(c => c.type === 'expense').map(c => c.name);
    return [...defaultExpenseCategories, ...custom];
  }, [customCategories]);

  const incomeCategories = useMemo(() => {
    const custom = customCategories.filter(c => c.type === 'income').map(c => c.name);
    return [...defaultIncomeCategories, ...custom];
  }, [customCategories]);

  useEffect(() => {
    const currentList = type === 'expense' ? expenseCategories : incomeCategories;
    setSelectedCategories([currentList[0]]);
  }, [type, expenseCategories, incomeCategories]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const handleScroll = () => setShowFloatingAdd(window.scrollY > 350);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOnline = () => setSyncStatus('synced');
    const handleOffline = () => setSyncStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Auth error:", error);
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const transRef = collection(db, 'artifacts', appId, 'users', user.uid, 'transactions');
    const unsubTrans = onSnapshot(transRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => {
        const dateA = a.transactionDate || a.createdAt;
        const dateB = b.transactionDate || b.createdAt;
        return dateB - dateA; 
      });
      setTransactions(data);
      setLoading(false);
      if (navigator.onLine) setTimeout(() => setSyncStatus('synced'), 800); 
    }, (error) => {
      console.error("Error trans:", error);
      setSyncStatus('offline');
    });

    const catRef = collection(db, 'artifacts', appId, 'users', user.uid, 'categories');
    const unsubCat = onSnapshot(catRef, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomCategories(cats);
    });

    return () => { unsubTrans(); unsubCat(); };
  }, [user]);

  const formatCurrency = (number, currencyCode = 'IDR') => {
    try {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 2
      }).format(number);
    } catch (e) {
      return currencyCode + " " + number;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      setNotification({ type: 'success', message: 'Berhasil login Google!' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Gagal login.' });
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setNotification({ type: 'success', message: 'Berhasil logout.' });
      setView('home'); 
    } catch (error) { console.error(error); }
  };

  const handleSaveGeminiKey = (e) => {
    const val = e.target.value.trim();
    setGeminiKey(val);
    localStorage.setItem('gemini_api_key', val);
  };

  // --- FUNGSI SCAN STRUK AI (GEMINI 2.5 FLASH + HEIC SUPPORT) ---
  const handleScanReceipt = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!geminiKey) {
      setNotification({ type: 'error', message: 'Isi Gemini API Key di Pengaturan terlebih dahulu!' });
      e.target.value = null;
      return;
    }

    setIsScanning(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        
        // 1. Dukungan Format Foto .heic agar tidak ditolak sistem
        let mimeType = file.type;
        if (!mimeType) {
          if (file.name.toLowerCase().endsWith('.heic')) {
            mimeType = 'image/heic';
          } else {
            mimeType = 'image/jpeg';
          }
        }
        
        // 2. Instruksi (Prompt) yang bebas error sintaks
        const prompt = "Anda adalah asisten pencatat keuangan. Analisis gambar struk ini. " +
        "Temukan Nama Toko, Total Harga Akhir (hilangkan koma/simbol mata uang), Tanggal (format YYYY-MM-DD), dan tentukan kode Mata Uang (JPY, IDR, USD). " +
        "Kembalikan HANYA dalam format JSON MURNI (tanpa format markdown, tanpa teks lain): " +
        "{ \"description\": \"Nama Toko\", \"amount\": angka_bulat, \"date\": \"YYYY-MM-DD\", \"currency\": \"JPY\" }";

        // 3. Update Model ke gemini-2.5-flash
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiKey, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: mimeType, data: base64Data } }] }]
          })
        });

        const data = await response.json();
        
        // Memunculkan pesan error spesifik jika API Key / Kuota bermasalah
        if (data.error) throw new Error(data.error.message);

        const aiText = data.candidates[0].content.parts[0].text;
        
        // Pembersihan Markdown otomatis tanpa backticks
        let cleanJson = aiText;
        cleanJson = cleanJson.split("```json").join("");
        cleanJson = cleanJson.split("```").join("");
        cleanJson = cleanJson.trim();
        
        const result = JSON.parse(cleanJson);

        if (result.description) setDescription(result.description);
        if (result.amount) setAmount(result.amount.toString());
        if (result.date) setDate(result.date);
        if (result.currency && currencies.some(c => c.code === result.currency)) {
            setCurrency(result.currency);
        }
        
        setType('expense');
        setSelectedCategories(['Belanja']); 
        setNotification({ type: 'success', message: 'Berhasil membaca struk!' });

      } catch (error) {
        console.error("AI Scan Error:", error);
        setNotification({ type: 'error', message: "Error: " + (error.message || "Gagal memproses gambar") });
      } finally {
        setIsScanning(false);
        e.target.value = null;
      }
    };
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const newCat = newCatName.trim();
    if (!newCat || !user) return;
    setSyncStatus('saving');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'categories'), { name: newCat, type, createdAt: Date.now() });
      if (!selectedCategories.includes(newCat)) setSelectedCategories([...selectedCategories, newCat]);
      setNewCatName(''); setNotification({ type: 'success', message: 'Kategori ditambahkan.' }); setShowCatModal(false);
    } catch (error) { setSyncStatus('offline'); }
  };

  const handleDeleteCategory = async (catId) => {
    if (!user) return;
    setSyncStatus('saving');
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'categories', catId));
      setNotification({ type: 'success', message: 'Kategori dihapus.' });
    } catch (error) { setSyncStatus('offline'); }
  };

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) setSelectedCategories(selectedCategories.filter(c => c !== cat));
      else setNotification({ type: 'error', message: 'Minimal pilih 1 kategori.' });
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!description || !amount || !date || !user) return;
    setSyncStatus('saving');
    try {
      const selectedDate = new Date(date);
      const transactionData = {
        description, amount: parseFloat(amount), type, 
        categories: selectedCategories, category: selectedCategories[0] || 'Umum', 
        currency,
        date: selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        transactionDate: selectedDate.getTime()
      };

      if (editId) {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', editId), transactionData);
        setNotification({ type: 'success', message: 'Transaksi diperbarui.' }); setEditId(null);
      } else {
        transactionData.createdAt = Date.now();
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), transactionData);
        setNotification({ type: 'success', message: 'Transaksi disimpan.' });
      }
      
      setHomeViewDate(selectedDate); setDescription(''); setAmount(''); setDate(getCurrentDate());
      const currentList = type === 'expense' ? expenseCategories : incomeCategories;
      setSelectedCategories([currentList[0]]);
    } catch (error) {
      setNotification({ type: 'error', message: editId ? 'Gagal memperbarui.' : 'Gagal menyimpan.' });
      setSyncStatus('offline');
    }
  };

  const handleEditClick = (t) => {
    setEditId(t.id); setDescription(t.description); setAmount(t.amount.toString()); setType(t.type);
    let cats = [];
    if (t.categories && Array.isArray(t.categories) && t.categories.length > 0) cats = t.categories;
    else if (t.category) cats = [t.category];
    else cats = [t.type === 'expense' ? expenseCategories[0] : incomeCategories[0]];
    
    setSelectedCategories(cats); setCurrency(t.currency || 'IDR');
    const d = new Date(t.transactionDate || t.createdAt);
    setDate(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null); setDescription(''); setAmount(''); setDate(getCurrentDate());
    setSelectedCategories([type === 'expense' ? expenseCategories[0] : incomeCategories[0]]);
  };

  const handleDelete = async (id) => {
    if (!user) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id)); } catch (error) {}
  };

  const renderHeader = () => (
    <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-20 px-4 py-4 border-b border-gray-200 md:border-none md:static md:px-0 md:py-0 md:bg-transparent">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">Dompetku Cloud</h1>
          <div className="flex items-center gap-2 mt-1">
            {syncStatus === 'saving' && <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"><RefreshCw className="w-3 h-3 animate-spin" /> Menyimpan...</span>}
            {syncStatus === 'synced' && <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><Check className="w-3 h-3" /> Tersimpan</span>}
            {syncStatus === 'offline' && <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"><CloudOff className="w-3 h-3" /> Offline</span>}
          </div>
        </div>
        <div className="bg-blue-100 p-2 rounded-full"><Wallet className="w-6 h-6 text-blue-600" /></div>
      </header>
    </div>
  );

  const changeHomeMonth = (increment) => {
    const newDate = new Date(homeViewDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setHomeViewDate(newDate);
  };

  const { groupedHomeTransactions, homeTransactionsCount } = useMemo(() => {
    const filtered = transactions.filter(t => {
      const d = new Date(t.transactionDate || t.createdAt);
      return d.getMonth() === homeViewDate.getMonth() && d.getFullYear() === homeViewDate.getFullYear();
    });
    const grouped = [];
    filtered.forEach(t => {
      const lastGroup = grouped[grouped.length - 1];
      if (lastGroup && lastGroup.date === t.date) lastGroup.items.push(t);
      else grouped.push({ date: t.date, items: [t] });
    });
    return { groupedHomeTransactions: grouped, homeTransactionsCount: filtered.length };
  }, [transactions, homeViewDate]);

  const getLabelClass = (cat) => {
    if (!selectedCategories.includes(cat)) return "bg-white text-gray-600 border-gray-200 hover:border-gray-300";
    return type === 'expense' 
      ? "bg-rose-600 text-white border-rose-600 shadow-sm" 
      : "bg-emerald-600 text-white border-emerald-600 shadow-sm";
  };

  const renderHomeView = () => {
    return (
      <div className="animate-in fade-in duration-300">
        <div className={"bg-white rounded-2xl shadow-sm border p-5 mt-2 mb-6 transition-all relative overflow-hidden " + (editId ? "border-blue-300 ring-4 ring-blue-50" : "border-gray-100")}>
          {isScanning && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
              <p className="text-sm font-bold text-gray-700">Menganalisis Struk...</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              {editId ? <Edit2 className="w-5 h-5 text-blue-600" /> : "Tambah Transaksi"}
            </h3>
            
            {!editId && (
              <div>
                <input type="file" accept="image/*" ref={receiptInputRef} onChange={handleScanReceipt} className="hidden" />
                <button type="button" onClick={() => receiptInputRef.current?.click()} className="flex items-center gap-1.5 text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100 hover:bg-purple-100 transition-colors">
                  <Camera className="w-3.5 h-3.5" /> Scan Struk
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-lg h-[42px]">
              <button type="button" onClick={() => setType('income')} className={"flex-1 flex items-center justify-center rounded-md text-sm font-medium transition-all " + (type === 'income' ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}>Pemasukan</button>
              <button type="button" onClick={() => setType('expense')} className={"flex-1 flex items-center justify-center rounded-md text-sm font-medium transition-all " + (type === 'expense' ? "bg-rose-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}>Pengeluaran</button>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Deskripsi</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contoh: Nasi Goreng" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Jumlah</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Mata Uang</label>
                <div className="relative">
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none">
                    {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.symbol}</option>)}
                  </select>
                  <Globe className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal</label>
              <div className="relative">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Label Kategori (Pilih 1 atau lebih)</label>
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
                <button type="button" onClick={() => setShowCatModal(true)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-blue-600 hover:bg-gray-200 transition-all flex items-center gap-1"><Plus className="w-3 h-3" /> Tambah</button>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-2 border-t border-gray-100">
              {editId && <button type="button" onClick={cancelEdit} className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-xl transition-colors">Batal</button>}
              <button type="submit" disabled={!user || loading || isScanning} className={"text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed " + (editId ? "w-2/3 bg-blue-600 hover:bg-blue-700" : "w-full bg-gray-900 hover:bg-black")}>
                {editId ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />} 
                {editId ? "Perbarui" : "Simpan Transaksi"}
              </button>
            </div>
          </form>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <button type="button" onClick={() => changeHomeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            <div className="text-center">
              <h3 className="font-bold text-gray-800 text-sm">{homeViewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
              <p className="text-[10px] text-gray-500">{homeTransactionsCount} transaksi</p>
            </div>
            <button type="button" onClick={() => changeHomeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
          </div>
          
          {groupedHomeTransactions.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"><DollarSign className="w-6 h-6 text-gray-400" /></div>
              <p className="text-gray-500 text-sm">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="space-y-6 pb-8">
              {groupedHomeTransactions.map((group) => (
                <div key={group.date} className="animate-in fade-in slide-in-from-bottom-2">
                  <h4 className="text-sm font-bold text-gray-500 border-b border-gray-200 pb-2 mb-3 sticky top-[72px] bg-gray-50/95 backdrop-blur-sm z-10">{group.date}</h4>
                  <div className="space-y-3">
                    {group.items.map((t) => (
                      <div key={t.id} className="group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4 w-2/3">
                          <div className={"w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 " + (t.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                             {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm truncate">{t.description}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(t.categories || (t.category ? [t.category] : ['Umum'])).map(catLabel => (
                                <span key={t.id + "-" + catLabel} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">{catLabel}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className={"font-bold text-sm mr-2 " + (t.type === 'income' ? "text-emerald-600" : "text-rose-600")}>
                             {t.type === 'income' ? "+" : "-"}{formatCurrency(t.amount, t.currency)}
                          </span>
                          <button onClick={() => handleEditClick(t)} className="text-gray-300 hover:text-blue-500 transition-colors p-1"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-rose-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- LAPORAN ---
  const filteredByPeriod = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.transactionDate || t.createdAt);
      if (reportType === 'yearly') return tDate.getFullYear() === reportDate.getFullYear();
      else return tDate.getMonth() === reportDate.getMonth() && tDate.getFullYear() === reportDate.getFullYear();
    });
  }, [transactions, reportDate, reportType]);

  const reportTransactions = useMemo(() => filteredByPeriod.filter(t => (t.currency || 'IDR') === reportCurrency), [filteredByPeriod, reportCurrency]);

  const categoryStats = useMemo(() => {
    const stats = {}; let totalExpense = 0;
    reportTransactions.forEach(t => {
      if (t.type === 'expense') { 
        const primaryCat = (t.categories && t.categories.length > 0) ? t.categories[0] : (t.category || 'Umum');
        stats[primaryCat] = (stats[primaryCat] || 0) + t.amount; 
        totalExpense += t.amount; 
      }
    });
    return Object.keys(stats).map(cat => ({ name: cat, amount: stats[cat], percentage: totalExpense > 0 ? (stats[cat] / totalExpense) * 100 : 0 })).sort((a, b) => b.amount - a.amount);
  }, [reportTransactions]);

  const reportSummary = useMemo(() => {
    const inc = reportTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const exp = reportTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    return { income: inc, expense: exp, balance: inc - exp };
  }, [reportTransactions]);

  const changeReportPeriod = (increment) => {
    const newDate = new Date(reportDate);
    if (reportType === 'yearly') newDate.setFullYear(newDate.getFullYear() + increment);
    else newDate.setMonth(newDate.getMonth() + increment);
    setReportDate(newDate);
  };

  const getReportTitle = () => {
    if (reportType === 'yearly') return reportDate.getFullYear();
    if (reportType === 'monthly') return reportDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    return '';
  };

  const getBalanceColorClass = () => {
     if (reportSummary.balance >= 0) return "bg-blue-50 border-blue-100";
     return "bg-orange-50 border-orange-100";
  };

  const getBalanceTextClass = () => {
     if (reportSummary.balance >= 0) return "text-blue-700";
     return "text-orange-700";
  };

  const renderReportView = () => (
    <div className="animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button onClick={() => setReportType('monthly')} className={"flex-1 py-1.5 text-xs font-medium rounded-md transition-all " + (reportType === 'monthly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Bulanan</button>
          <button onClick={() => setReportType('yearly')} className={"flex-1 py-1.5 text-xs font-medium rounded-md transition-all " + (reportType === 'yearly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Tahunan</button>
        </div>
        
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-500">Mata Uang:</span>
            <select value={reportCurrency} onChange={(e) => setReportCurrency(e.target.value)} className="bg-transparent text-sm font-bold text-blue-600 focus:outline-none">
              {[...new Set(transactions.map(t => t.currency || 'IDR'))].map(c => <option key={c} value={c}>{c}</option>)}
              {transactions.length === 0 && <option value="IDR">IDR</option>}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeReportPeriod(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
          <div className="text-center"><h2 className="font-bold text-gray-900 text-lg">{getReportTitle()}</h2></div>
          <button onClick={() => changeReportPeriod(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100"><p className="text-xs text-emerald-600 mb-1">Pemasukan</p><p className="font-bold text-emerald-700">{formatCurrency(reportSummary.income, reportCurrency)}</p></div>
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-100"><p className="text-xs text-rose-600 mb-1">Pengeluaran</p><p className="font-bold text-rose-700">{formatCurrency(reportSummary.expense, reportCurrency)}</p></div>
        </div>
        <div className={"text-center p-4 rounded-xl border mb-8 " + getBalanceColorClass()}>
          <p className="text-xs text-gray-500 mb-1">Arus Kas Bersih (Net Cashflow)</p>
          <p className={"text-2xl font-bold " + getBalanceTextClass()}>{reportSummary.balance >= 0 ? "+" : ""}{formatCurrency(reportSummary.balance, reportCurrency)}</p>
        </div>
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-gray-500" /> Statistik Pengeluaran (Berdasarkan Label Utama)</h3>
        {categoryStats.length === 0 ? <div className="text-center py-8 text-gray-400 text-sm">Belum ada data.</div> : (
          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-700 font-medium">{cat.name}</span><div className="text-right"><span className="text-gray-900 font-bold">{formatCurrency(cat.amount, reportCurrency)}</span><span className="text-xs text-gray-500 ml-1">({Math.round(cat.percentage)}%)</span></div></div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: String(cat.percentage) + "%" }}></div></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><List className="w-4 h-4 text-gray-500" /> Rincian Transaksi ({reportCurrency})</h3>
        {reportTransactions.length === 0 ? <div className="text-center py-8 text-gray-400 text-sm">Tidak ada transaksi.</div> : (
          <div className="space-y-3">
            {[...reportTransactions].sort((a, b) => new Date(b.transactionDate || b.createdAt) - new Date(a.transactionDate || a.createdAt)).map((t) => (
              <div key={t.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3 w-2/3">
                   <div className={"w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 " + (t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                     {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                   </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{t.description}</p>
                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        <span className="text-[9px] text-gray-400">{t.date}</span>
                        {(t.categories || (t.category ? [t.category] : ['Umum'])).map(catLabel => (
                           <span key={"rep-" + t.id + "-" + catLabel} className="text-[8px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded font-medium">{catLabel}</span>
                        ))}
                      </div>
                    </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2"><p className={"text-sm font-bold " + (t.type === 'income' ? "text-emerald-600" : "text-rose-600")}>{t.type === 'income' ? "+" : "-"}{formatCurrency(t.amount, t.currency)}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const downloadCSV = () => {
    if (transactions.length === 0) {
      setNotification({ type: 'error', message: 'Tidak ada data.' });
      return;
    }
    const headers = "iso_date,tanggal_display,deskripsi,kategori,tipe,mata_uang,jumlah";
    const csvRows = [headers];
    
    transactions.forEach(t => {
      const dateObj = new Date(t.transactionDate || t.createdAt);
      const isoDate = dateObj.toISOString().split('T')[0];
      const catString = t.categories ? t.categories.join(' & ') : (t.category || 'Umum');
      
      const cleanDesc = t.description.split('"').join('""');
      
      const row = isoDate + "," + 
                  '"' + t.date + '",' + 
                  '"' + cleanDesc + '",' + 
                  '"' + catString + '",' + 
                  t.type + "," + 
                  (t.currency || 'IDR') + "," + 
                  t.amount;
      csvRows.push(row);
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Backup_Dompetku.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rows = event.target.result.split('\n');
        let importedCount = 0;
        setLoading(true); setSyncStatus('saving');
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row) continue;
          const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          const cols = matches || row.split(',');
          if (cols && cols.length >= 6) {
            const clean = (str) => str ? str.replace(/^"|"$/g, '').replace(/""/g, '"') : '';
            const isoDate = clean(cols[0]);
            const description = clean(cols[2]);
            const categoryRaw = clean(cols[3]);
            const type = clean(cols[4]);
            
            const catsArray = categoryRaw.split(' & ').map(c => c.trim()).filter(Boolean);

            let curr = 'IDR'; let amt = 0;
            if (cols.length === 7) { curr = clean(cols[5]); amt = parseFloat(clean(cols[6])); } 
            else { amt = parseFloat(clean(cols[5])); }
            
            if (isoDate && description && !isNaN(amt)) {
              const dateObj = new Date(isoDate);
              await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
                description, amount: amt, type: type.includes('income') || type.includes('Pemasukan') ? 'income' : 'expense',
                categories: catsArray.length > 0 ? catsArray : ['Umum'],
                category: catsArray[0] || 'Umum',
                currency: curr,
                date: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                transactionDate: dateObj.getTime(), createdAt: Date.now()
              });
              importedCount++;
            }
          }
        }
        setLoading(false); setNotification({ type: 'success', message: 'Berhasil mengimpor ' + importedCount + ' transaksi.' });
        e.target.value = null;
      } catch (error) {
        setLoading(false); setNotification({ type: 'error', message: 'Gagal import.' });
      } finally { setSyncStatus('synced'); }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    if (!user) return;
    setLoading(true); setSyncStatus('saving'); setShowResetModal(false);
    try {
      const batch = writeBatch(db);
      const transSnapshot = await getDocs(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'));
      transSnapshot.forEach((doc) => batch.delete(doc.ref));
      const catSnapshot = await getDocs(collection(db, 'artifacts', appId, 'users', user.uid, 'categories'));
      catSnapshot.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      setTransactions([]); setCustomCategories([]);
      setNotification({ type: 'success', message: 'Data direset.' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Gagal mereset.' });
    } finally { setLoading(false); setSyncStatus('synced'); }
  };

  const confirmGenerateDummy = async () => {
    if (!user) return;
    setShowDummyModal(false); setLoading(true); setSyncStatus('saving');
    try {
      const dummyData = [
        { desc: 'Gaji Bulanan', amount: 5000000, type: 'income', cats: ['Gaji'], dayOffset: 0, curr: 'IDR' },
        { desc: 'Makan Siang', amount: 25000, type: 'expense', cats: ['Makanan'], dayOffset: 1, curr: 'IDR' },
        { desc: 'Ongkos & Jajan', amount: 45000, type: 'expense', cats: ['Transportasi', 'Hiburan'], dayOffset: 2, curr: 'IDR' }
      ];
      const now = new Date();
      for (const item of dummyData) {
        const dateObj = new Date(now); dateObj.setDate(dateObj.getDate() - item.dayOffset);
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
          description: item.desc, amount: item.amount, type: item.type, 
          categories: item.cats, category: item.cats[0], currency: item.curr,
          date: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          transactionDate: dateObj.getTime(), createdAt: Date.now()
        });
      }
      setNotification({ type: 'success', message: 'Demo ditambahkan.' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Gagal membuat demo.' });
    } finally { setLoading(false); setSyncStatus('synced'); }
  };

  const renderSettingsView = () => (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Akun Saya</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={"w-12 h-12 rounded-full flex items-center justify-center " + (user?.isAnonymous ? "bg-gray-100" : "bg-blue-100")}>
              <User className={"w-6 h-6 " + (user?.isAnonymous ? "text-gray-400" : "text-blue-600")} />
            </div>
            <div><p className="font-bold text-gray-900">{user?.isAnonymous ? 'Pengguna Tamu' : user?.displayName || 'Pengguna Google'}</p><p className="text-xs text-gray-500">{user?.isAnonymous ? 'Data tersimpan sementara' : user?.email}</p></div>
          </div>
          {user?.isAnonymous ? 
            <button onClick={handleGoogleLogin} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"><LogIn className="w-4 h-4" /> Masuk Google</button> : 
            <button onClick={handleLogout} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-medium transition-colors flex items-center gap-2"><LogOut className="w-4 h-4" /> Keluar</button>
          }
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="w-16 h-16 text-purple-600" /></div>
        <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Fitur AI Scan Struk</h3>
        <p className="text-xs text-gray-500 mb-4 pr-10">Masukkan API Key dari Google Gemini untuk mengaktifkan fitur scan otomatis. Data ini aman dan hanya disimpan di HP Anda.</p>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Gemini API Key</label>
          <input 
            type="password" 
            value={geminiKey} 
            onChange={handleSaveGeminiKey} 
            placeholder="AIzaSy..." 
            className="w-full bg-purple-50/50 border border-purple-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono text-sm"
          />
          {!geminiKey && (
             <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="inline-block mt-2 text-[10px] text-blue-600 hover:underline">
               Dapatkan API Key Gratis di Google AI Studio &rarr;
             </a>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Kategori Label</h3>
        <div className="space-y-3">
          <button onClick={() => { setType('expense'); setShowCatModal(true); }} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 transition-all group">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-2 rounded-lg group-hover:bg-rose-200 transition-colors"><Tag className="w-5 h-5 text-rose-600" /></div>
              <div className="text-left"><p className="font-medium text-gray-800 text-sm">Label Pengeluaran</p><p className="text-xs text-gray-400">Atur pilihan label pengeluaran</p></div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => { setType('income'); setShowCatModal(true); }} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 transition-all group">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors"><Tag className="w-5 h-5 text-emerald-600" /></div>
              <div className="text-left"><p className="font-medium text-gray-800 text-sm">Label Pemasukan</p><p className="text-xs text-gray-400">Atur pilihan label pendapatan</p></div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Manajemen Data</h3>
        <div className="space-y-3">
          <button onClick={downloadCSV} disabled={transactions.length === 0} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all group">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors"><Download className="w-5 h-5 text-blue-600" /></div>
              <div className="text-left"><p className="font-medium text-gray-800 text-sm">Export ke Excel</p><p className="text-xs text-gray-400">Unduh file .csv untuk arsip</p></div>
            </div>
          </button>
          <button onClick={handleImportClick} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 transition-all group">
             <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors"><Upload className="w-5 h-5 text-emerald-600" /></div>
              <div className="text-left"><p className="font-medium text-gray-800 text-sm">Restore Data</p><p className="text-xs text-gray-400">Kembalikan data dari file backup</p></div>
            </div>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
          <button onClick={() => setShowDummyModal(true)} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 transition-all group">
             <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors"><Sparkles className="w-5 h-5 text-purple-600" /></div>
              <div className="text-left"><p className="font-medium text-gray-800 text-sm">Isi Data Demo</p><p className="text-xs text-gray-400">Buat transaksi contoh otomatis</p></div>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Zona Bahaya</h3>
        <button onClick={() => setShowResetModal(true)} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2"><Trash2 className="w-5 h-5" /> Reset Semua Data</button>
      </div>
      
      <div className="text-center text-xs text-gray-300 pb-8">Dompetku Cloud v2.2.0 (AI Edition)</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 md:p-8 pb-24">
      <div className="max-w-md mx-auto relative min-h-screen">
        {renderHeader()}
        {loading && <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center"><div className="flex flex-col items-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" /><p className="text-sm text-gray-500">Memuat data...</p></div></div>}
        
        {notification && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 w-full max-w-sm px-4">
            <div className={"flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border " + (notification.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800")}>
              {notification.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}<span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {showDummyModal && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl"><div className="flex flex-col items-center text-center mb-6"><div className="bg-purple-100 p-3 rounded-full mb-4"><Sparkles className="w-8 h-8 text-purple-600" /></div><h3 className="font-bold text-xl text-gray-900">Isi Data Demo?</h3></div><div className="flex gap-3"><button onClick={() => setShowDummyModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Batal</button><button onClick={confirmGenerateDummy} className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">Ya, Tambahkan</button></div></div></div>
        )}

        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl"><div className="flex flex-col items-center text-center mb-6"><div className="bg-red-100 p-3 rounded-full mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div><h3 className="font-bold text-xl text-gray-900">Hapus Semua Data?</h3></div><div className="flex gap-3"><button onClick={() => setShowResetModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Batal</button><button onClick={handleResetData} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200">Ya, Hapus</button></div></div></div>
        )}

        {showCatModal && (
          <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Buat Label {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</h3>
                <button onClick={() => setShowCatModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
              </div>
              <div className="mb-6">
                <form onSubmit={handleSaveCategory}>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Nama Label Baru</label>
                  <div className="flex gap-2">
                    <input autoFocus type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Contoh: Belanja Bulanan" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    <button type="submit" disabled={!newCatName.trim()} className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"><Plus className="w-5 h-5" /></button>
                  </div>
                </form>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Label Kustom Anda</h4>
                {customCategories.filter(c => c.type === type).length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200"><p className="text-xs text-gray-400">Belum ada label buatan sendiri.</p></div>
                ) : (
                  <ul className="space-y-2">
                    {customCategories.filter(c => c.type === type).map((c) => (
                      <li key={c.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors">
                        <span className="text-sm font-medium text-gray-700">{c.name}</span>
                        <button onClick={() => handleDeleteCategory(c.id, c.name)} className="text-gray-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 md:px-0">
          {view === 'home' && renderHomeView()}
          {view === 'report' && renderReportView()}
          {view === 'settings' && renderSettingsView()}
        </div>
        
        {view === 'home' && showFloatingAdd && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-24 right-4 z-40 bg-blue-600 text-white p-3.5 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center animate-in zoom-in duration-200">
            <Plus className="w-6 h-6" />
          </button>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-30 md:max-w-md md:mx-auto md:bottom-4 md:rounded-2xl md:border md:shadow-xl">
          <div className="flex justify-around items-center">
            <button onClick={() => setView('home')} className={"flex flex-col items-center p-2 rounded-xl flex-1 transition-all " + (view === 'home' ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-gray-600")}><List className="w-6 h-6 mb-1" /><span className="text-xs font-medium">Transaksi</span></button>
            <button onClick={() => setView('report')} className={"flex flex-col items-center p-2 rounded-xl flex-1 transition-all " + (view === 'report' ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-gray-600")}><FileText className="w-6 h-6 mb-1" /><span className="text-xs font-medium">Laporan</span></button>
            <button onClick={() => setView('settings')} className={"flex flex-col items-center p-2 rounded-xl flex-1 transition-all " + (view === 'settings' ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-gray-600")}><Settings className="w-6 h-6 mb-1" /><span className="text-xs font-medium">Pengaturan</span></button>
          </div>
        </div>
      </div>
    </div>
  );
  }
