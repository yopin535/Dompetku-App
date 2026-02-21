import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, Wallet, TrendingUp, TrendingDown, DollarSign, 
  Cloud, Loader2, Tag, Calendar, PieChart, List, ChevronLeft, ChevronRight, 
  Download, Upload, FileText, CheckCircle, XCircle, X, Settings, Sparkles,
  LogOut, LogIn, AlertTriangle, User, Info, Check, CloudOff, RefreshCw, Globe
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
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';

// =====================================================================
// MASUKKAN KUNCI RAHASIA (FIREBASE CONFIG) MILIKMU DI BAWAH INI
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
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const appId = "dompetku-pribadi"; // ID statis untuk database kamu

const App = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home'); // 'home', 'report', 'settings'
  const [notification, setNotification] = useState(null);
  
  // Status Sinkronisasi: 'synced', 'saving', 'offline'
  const [syncStatus, setSyncStatus] = useState('synced');
  
  // Modal States
  const [showCatModal, setShowCatModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDummyModal, setShowDummyModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Helper tanggal
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // --- Konfigurasi Mata Uang ---
  const currencies = [
    { code: 'IDR', symbol: 'Rp', name: 'Rupiah (IDR)' },
    { code: 'USD', symbol: '$', name: 'Dollar AS (USD)' },
    { code: 'SGD', symbol: 'S$', name: 'Dollar Singapura (SGD)' },
    { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
    { code: 'JPY', symbol: '¥', name: 'Yen Jepang (JPY)' },
    { code: 'MYR', symbol: 'RM', name: 'Ringgit Malaysia (MYR)' },
  ];

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Makanan');
  const [currency, setCurrency] = useState('IDR'); // Default mata uang
  const [date, setDate] = useState(getCurrentDate());

  // Report State
  const [reportDate, setReportDate] = useState(new Date());
  const [reportType, setReportType] = useState('monthly'); // 'weekly', 'monthly', 'yearly'
  const [reportCurrency, setReportCurrency] = useState('IDR'); // Filter mata uang untuk laporan
  const fileInputRef = useRef(null);

  // Kategori Default
  const defaultExpenseCategories = ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya'];
  const defaultIncomeCategories = ['Gaji', 'Bonus', 'Hadiah', 'Penjualan', 'Investasi', 'Freelance', 'Lainnya'];

  // Menggabungkan Kategori Default + Custom
  const expenseCategories = useMemo(() => {
    const custom = customCategories.filter(c => c.type === 'expense').map(c => c.name);
    return [...defaultExpenseCategories, ...custom];
  }, [customCategories]);

  const incomeCategories = useMemo(() => {
    const custom = customCategories.filter(c => c.type === 'income').map(c => c.name);
    return [...defaultIncomeCategories, ...custom];
  }, [customCategories]);

  // Reset kategori saat tipe berubah
  useEffect(() => {
    const currentList = type === 'expense' ? expenseCategories : incomeCategories;
    if (!currentList.includes(category)) {
      setCategory(currentList[0]);
    }
  }, [type, expenseCategories, incomeCategories]);

  // Hapus notifikasi otomatis
  useEffect(() => {
    if (notification) {
      const duration = notification.message.includes('Domain') ? 6000 : 3000;
      const timer = setTimeout(() => setNotification(null), duration);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Cek koneksi internet
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

  // 1. Inisialisasi Autentikasi (Diperbaiki agar sesi tidak hilang saat refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Jika ada sesi yang tersimpan (Google atau Tamu), gunakan itu
        setUser(currentUser);
        setLoading(false);
      } else {
        // Hanya buat sesi Tamu baru JIKA benar-benar tidak ada sesi yang tersimpan
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Gagal login anonim", error);
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Sinkronisasi Data Real-time
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
      
      if (navigator.onLine) {
        setTimeout(() => setSyncStatus('synced'), 800); 
      }
    }, (error) => {
      console.error("Error trans:", error);
      setSyncStatus('offline');
    });

    const catRef = collection(db, 'artifacts', appId, 'users', user.uid, 'categories');
    const unsubCat = onSnapshot(catRef, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomCategories(cats);
    }, (error) => console.error("Error cat:", error));

    return () => {
      unsubTrans();
      unsubCat();
    };
  }, [user]);

  // --- Formatter Mata Uang Dinamis ---
  const formatCurrency = (number, currencyCode = 'IDR') => {
    try {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(number);
    } catch (e) {
      return `${currencyCode} ${number}`;
    }
  };

  // --- Auth Handlers ---
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      setNotification({ type: 'success', message: 'Berhasil login dengan Google!' });
    } catch (error) {
      if (error.code === 'auth/unauthorized-domain') {
        setNotification({ 
          type: 'error', 
          message: 'Gagal: Domain ini belum diizinkan di Firebase Console.' 
        });
      } else if (error.code === 'auth/popup-closed-by-user') {
        setNotification({ type: 'error', message: 'Login dibatalkan.' });
      } else {
        setNotification({ type: 'error', message: 'Gagal login Google.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await signInAnonymously(auth); 
      setNotification({ type: 'success', message: 'Berhasil logout.' });
      setView('home'); 
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // --- Handlers Data ---
  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === '__ADD_NEW__') {
      setShowCatModal(true);
    } else {
      setCategory(val);
    }
  };

  const calculateBalances = () => {
    const balances = {};
    const usedCurrencies = new Set(transactions.map(t => t.currency || 'IDR'));
    usedCurrencies.forEach(c => balances[c] = 0);
    if (usedCurrencies.size === 0) balances['IDR'] = 0;

    transactions.forEach(t => {
      const curr = t.currency || 'IDR';
      if (t.type === 'income') balances[curr] += t.amount;
      else balances[curr] -= t.amount;
    });

    return balances;
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim() || !user) return;
    setSyncStatus('saving');

    const currentList = type === 'expense' ? expenseCategories : incomeCategories;
    if (currentList.includes(newCatName.trim())) {
      setNotification({ type: 'error', message: 'Kategori sudah ada.' });
      setSyncStatus('synced');
      return;
    }

    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'categories'), {
        name: newCatName.trim(),
        type: type, 
        createdAt: Date.now()
      });
      setCategory(newCatName.trim()); 
      setNewCatName('');
      setNotification({ type: 'success', message: 'Kategori ditambahkan.' });
      setShowCatModal(false);
    } catch (error) {
      setNotification({ type: 'error', message: 'Gagal menyimpan kategori.' });
      setSyncStatus('offline');
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!user) return;
    setSyncStatus('saving');
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'categories', catId));
      if (category === catName) {
         const defaults = type === 'expense' ? defaultExpenseCategories : defaultIncomeCategories;
         setCategory(defaults[0]);
      }
      setNotification({ type: 'success', message: 'Kategori dihapus.' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Gagal menghapus kategori.' });
      setSyncStatus('offline');
    }
  };

  const handleResetData = async () => {
    if (!user) return;
    setLoading(true);
    setSyncStatus('saving');
    setShowResetModal(false);

    try {
      const batch = writeBatch(db);
      const transSnapshot = await getDocs(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'));
      transSnapshot.forEach((doc) => batch.delete(doc.ref));
      const catSnapshot = await getDocs(collection(db, 'artifacts', appId, 'users', user.uid, 'categories'));
      catSnapshot.forEach((doc) => batch.delete(doc.ref));

      await batch.commit();
      setTransactions([]);
      setCustomCategories([]);
      setNotification({ type: 'success', message: 'Semua data berhasil direset.' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Gagal mereset data.' });
    } finally {
      setLoading(false);
      setSyncStatus('synced');
    }
  };

  const confirmGenerateDummy = async () => {
    if (!user) return;
    setShowDummyModal(false);
    setLoading(true);
    setSyncStatus('saving');
    try {
      const dummyData = [
        { desc: 'Gaji Bulanan', amount: 5000000, type: 'income', cat: 'Gaji', dayOffset: 0, curr: 'IDR' },
        { desc: 'Makan Siang', amount: 25000, type: 'expense', cat: 'Makanan', dayOffset: 1, curr: 'IDR' },
        { desc: 'Transportasi', amount: 15000, type: 'expense', cat: 'Transportasi', dayOffset: 2, curr: 'IDR' },
        { desc: 'Kopi', amount: 20000, type: 'expense', cat: 'Makanan', dayOffset: 3, curr: 'IDR' },
        { desc: 'Freelance Project', amount: 100, type: 'income', cat: 'Freelance', dayOffset: 4, curr: 'USD' },
        { desc: 'Listrik', amount: 350000, type: 'expense', cat: 'Tagihan', dayOffset: 5, curr: 'IDR' },
        { desc: 'Server Costs', amount: 15, type: 'expense', cat: 'Tagihan', dayOffset: 6, curr: 'USD' },
      ];
      const now = new Date();
      for (const item of dummyData) {
        const dateObj = new Date(now);
        dateObj.setDate(dateObj.getDate() - item.dayOffset);
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
          description: item.desc,
          amount: item.amount,
          type: item.type,
          category: item.cat,
          currency: item.curr || 'IDR',
          date: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          transactionDate: dateObj.getTime(),
          createdAt: Date.now()
        });
      }
      setNotification({ type: 'success', message: 'Data demo ditambahkan.' });
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: 'Gagal membuat data demo.' });
    } finally {
      setLoading(false);
      setSyncStatus('synced');
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!description || !amount || !date || !user) return;
    setSyncStatus('saving');
    try {
      const selectedDate = new Date(date);
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
        description, amount: parseFloat(amount), type, category, currency,
        date: selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        transactionDate: selectedDate.getTime(), createdAt: Date.now()
      });
      setDescription(''); setAmount(''); setDate(getCurrentDate());
      setNotification({ type: 'success', message: 'Transaksi disimpan.' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Gagal menyimpan.' });
      setSyncStatus('offline');
    }
  };

  const handleDelete = async (id) => {
    if (!user) return;
    setSyncStatus('saving');
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id));
      setNotification({ type: 'success', message: 'Transaksi dihapus.' });
    } catch (error) { 
      setSyncStatus('offline');
    }
  };

  // --- Logic Laporan & Helper ---
  
  // Filter berdasarkan periode saja (untuk data mentah di background)
  const filteredByPeriod = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.transactionDate || t.createdAt);
      if (reportType === 'yearly') {
        return tDate.getFullYear() === reportDate.getFullYear();
      } else if (reportType === 'weekly') {
        const current = new Date(reportDate);
        const day = current.getDay();
        const diff = current.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(current);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return tDate >= startOfWeek && tDate <= endOfWeek;
      } else {
        return tDate.getMonth() === reportDate.getMonth() &&
               tDate.getFullYear() === reportDate.getFullYear();
      }
    });
  }, [transactions, reportDate, reportType]);

  // Filter untuk TAMPILAN Laporan (memperhitungkan mata uang)
  const reportTransactions = useMemo(() => {
    // Hanya ambil transaksi yang mata uangnya sesuai dengan filter laporan
    return filteredByPeriod.filter(t => (t.currency || 'IDR') === reportCurrency);
  }, [filteredByPeriod, reportCurrency]);

  const categoryStats = useMemo(() => {
    const stats = {};
    let totalExpense = 0;
    reportTransactions.forEach(t => {
      if (t.type === 'expense') {
        stats[t.category] = (stats[t.category] || 0) + t.amount;
        totalExpense += t.amount;
      }
    });
    return Object.keys(stats)
      .map(cat => ({
        name: cat,
        amount: stats[cat],
        percentage: totalExpense > 0 ? (stats[cat] / totalExpense) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [reportTransactions]);

  const reportSummary = useMemo(() => {
    const inc = reportTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const exp = reportTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    return { income: inc, expense: exp, balance: inc - exp };
  }, [reportTransactions]);

  const changeReportPeriod = (increment) => {
    const newDate = new Date(reportDate);
    if (reportType === 'yearly') {
      newDate.setFullYear(newDate.getFullYear() + increment);
    } else if (reportType === 'weekly') {
      newDate.setDate(newDate.getDate() + (increment * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + increment);
    }
    setReportDate(newDate);
  };

  const getReportTitle = () => {
    if (reportType === 'yearly') return reportDate.getFullYear();
    if (reportType === 'monthly') return reportDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    
    const current = new Date(reportDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(current);
    start.setDate(diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const downloadCSV = () => {
    if (transactions.length === 0) {
      setNotification({ type: 'error', message: 'Tidak ada data.' });
      return;
    }
    const headers = ['iso_date', 'tanggal_display', 'deskripsi', 'kategori', 'tipe', 'mata_uang', 'jumlah'];
    const csvRows = [headers.join(',')];
    transactions.forEach(t => {
      const dateObj = new Date(t.transactionDate || t.createdAt);
      const isoDate = dateObj.toISOString().split('T')[0];
      const row = [
        isoDate, `"${t.date}"`, `"${t.description.replace(/"/g, '""')}"`, 
        t.category, t.type, t.currency || 'IDR', t.amount
      ];
      csvRows.push(row.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Backup_Full_Keuangan.csv`);
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
        setLoading(true);
        setSyncStatus('saving');
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row) continue;
          const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          const cols = matches || row.split(',');
          // Deteksi kolom: V1 punya 6 kolom, V2 punya 7 (ada currency)
          if (cols && cols.length >= 6) {
            const clean = (str) => str ? str.replace(/^"|"$/g, '').replace(/""/g, '"') : '';
            const isoDate = clean(cols[0]);
            const description = clean(cols[2]);
            const category = clean(cols[3]);
            const type = clean(cols[4]);
            
            // Logic deteksi currency
            let curr = 'IDR';
            let amt = 0;
            
            if (cols.length === 7) {
               curr = clean(cols[5]);
               amt = parseFloat(clean(cols[6]));
            } else {
               amt = parseFloat(clean(cols[5]));
            }

            if (isoDate && description && !isNaN(amt)) {
              const dateObj = new Date(isoDate);
              await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
                description, amount: amt, type: type.includes('income') || type.includes('Pemasukan') ? 'income' : 'expense',
                category, currency: curr,
                date: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                transactionDate: dateObj.getTime(), createdAt: Date.now()
              });
              importedCount++;
            }
          }
        }
        setLoading(false);
        setNotification({ type: 'success', message: `Berhasil mengimpor ${importedCount} transaksi.` });
        e.target.value = null;
      } catch (error) {
        setLoading(false);
        setNotification({ type: 'error', message: 'Gagal import.' });
      } finally {
        setSyncStatus('synced');
      }
    };
    reader.readAsText(file);
  };

  // --- Renders Views ---
  const renderHeader = () => (
    <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-20 px-4 py-4 border-b border-gray-200 md:border-none md:static md:px-0 md:py-0 md:bg-transparent">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">Dompetku Cloud</h1>
          <div className="flex items-center gap-2 mt-1">
            {syncStatus === 'saving' && (
              <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                <RefreshCw className="w-3 h-3 animate-spin" /> Menyimpan...
              </span>
            )}
            {syncStatus === 'synced' && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <Check className="w-3 h-3" /> Tersimpan di Cloud
              </span>
            )}
            {syncStatus === 'offline' && (
              <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                <CloudOff className="w-3 h-3" /> Offline
              </span>
            )}
          </div>
        </div>
        <div className="bg-blue-100 p-2 rounded-full"><Wallet className="w-6 h-6 text-blue-600" /></div>
      </header>
    </div>
  );

  const renderHomeView = () => {
    const balances = calculateBalances();
    const balanceKeys = Object.keys(balances);

    return (
      <div className="animate-in fade-in duration-300">
        {/* Kartu Saldo Multi-Mata Uang */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Cloud className="w-24 h-24" /></div>
          <p className="text-blue-100 text-sm mb-2 relative z-10">Total Saldo</p>
          
          <div className="relative z-10 space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {balanceKeys.length === 0 ? (
              <h2 className="text-3xl font-bold">Rp 0</h2>
            ) : (
              balanceKeys.map(curr => (
                <div key={curr} className="flex justify-between items-baseline border-b border-white/10 last:border-0 pb-1 last:pb-0">
                  <h2 className="text-2xl font-bold">{formatCurrency(balances[curr], curr)}</h2>
                  <span className="text-xs text-blue-200 font-medium bg-white/10 px-2 py-0.5 rounded">{curr}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Tambah Transaksi</h3>
          <form onSubmit={handleAddTransaction} className="space-y-3">
            <div className="flex bg-gray-100 p-1 rounded-lg h-[42px] mb-4">
              <button type="button" onClick={() => setType('income')} className={`flex-1 flex items-center justify-center rounded-md text-sm font-medium transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Pemasukan</button>
              <button type="button" onClick={() => setType('expense')} className={`flex-1 flex items-center justify-center rounded-md text-sm font-medium transition-all ${type === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Pengeluaran</button>
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
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.symbol}</option>)}
                  </select>
                  <Globe className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
                <div className="relative">
                  <select value={category} onChange={handleCategoryChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer">
                    {(type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                      <option key={`opt-${cat}`} value={cat}>{cat}</option>
                    ))}
                    <option value="__ADD_NEW__" className="font-bold text-blue-600 bg-blue-50">+ Tambah Kategori...</option>
                  </select>
                  <Tag className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal</label>
                <div className="relative">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={!user || loading} className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 rounded-xl mt-2 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus className="w-5 h-5" /> Simpan Transaksi
            </button>
          </form>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
            Riwayat Terbaru <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{transactions.length} items</span>
          </h3>
          {transactions.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"><DollarSign className="w-6 h-6 text-gray-400" /></div>
              <p className="text-gray-500 text-sm">{loading ? 'Sedang memuat data...' : 'Belum ada transaksi tersimpan'}</p>
            </div>
          ) : (
            <div className="space-y-3 pb-8">
              {transactions.slice(0, 10).map((t) => (
                <div key={t.id} className="group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{t.description}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">{t.category || 'Umum'}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{t.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, t.currency)}</span>
                    <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-rose-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {transactions.length > 10 && <p className="text-center text-xs text-gray-400 mt-4">Menampilkan 10 transaksi terakhir</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReportView = () => (
    <div className="animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button onClick={() => setReportType('weekly')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${reportType === 'weekly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Mingguan</button>
          <button onClick={() => setReportType('monthly')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${reportType === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Bulanan</button>
          <button onClick={() => setReportType('yearly')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${reportType === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tahunan</button>
        </div>
        
        {/* Filter Mata Uang Laporan */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-500">Mata Uang Laporan:</span>
            <select 
              value={reportCurrency} 
              onChange={(e) => setReportCurrency(e.target.value)}
              className="bg-transparent text-sm font-bold text-blue-600 focus:outline-none"
            >
              {[...new Set(transactions.map(t => t.currency || 'IDR'))].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              {/* Fallback jika kosong */}
              {transactions.length === 0 && <option value="IDR">IDR</option>}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeReportPeriod(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
          <div className="text-center">
            <h2 className="font-bold text-gray-900 text-lg">{getReportTitle()}</h2>
            <p className="text-xs text-gray-500">Laporan {reportType === 'weekly' ? 'Mingguan' : reportType === 'monthly' ? 'Bulanan' : 'Tahunan'}</p>
          </div>
          <button onClick={() => changeReportPeriod(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100"><p className="text-xs text-emerald-600 mb-1">Pemasukan ({reportCurrency})</p><p className="font-bold text-emerald-700">{formatCurrency(reportSummary.income, reportCurrency)}</p></div>
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-100"><p className="text-xs text-rose-600 mb-1">Pengeluaran ({reportCurrency})</p><p className="font-bold text-rose-700">{formatCurrency(reportSummary.expense, reportCurrency)}</p></div>
        </div>
        <div className={`text-center p-4 rounded-xl border mb-8 ${reportSummary.balance >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
          <p className="text-xs text-gray-500 mb-1">Arus Kas Bersih (Net Cashflow)</p>
          <p className={`text-2xl font-bold ${reportSummary.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{reportSummary.balance >= 0 ? '+' : ''}{formatCurrency(reportSummary.balance, reportCurrency)}</p>
        </div>
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-gray-500" /> Statistik Pengeluaran ({reportCurrency})</h3>
        {categoryStats.length === 0 ? <div className="text-center py-8 text-gray-400 text-sm">Belum ada data untuk periode dan mata uang ini.</div> : (
          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{cat.name}</span>
                  <div className="text-right"><span className="text-gray-900 font-bold">{formatCurrency(cat.amount, reportCurrency)}</span><span className="text-xs text-gray-500 ml-1">({Math.round(cat.percentage)}%)</span></div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"><div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${cat.percentage}%` }}></div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan</h2>

      {/* 1. Bagian Akun */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Akun Saya</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user?.isAnonymous ? 'bg-gray-100' : 'bg-blue-100'}`}>
              <User className={`w-6 h-6 ${user?.isAnonymous ? 'text-gray-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.isAnonymous ? 'Pengguna Tamu' : user?.displayName || 'Pengguna Google'}</p>
              <p className="text-xs text-gray-500">{user?.isAnonymous ? 'Data tersimpan sementara' : user?.email}</p>
            </div>
          </div>
          {user?.isAnonymous ? (
            <button 
              onClick={handleGoogleLogin}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <LogIn className="w-4 h-4" /> Masuk Google
            </button>
          ) : (
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-medium transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          )}
        </div>
        
        {/* Info Auto Backup */}
        <div className="mt-4 p-3 bg-emerald-50 rounded-xl flex gap-3 border border-emerald-100">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-800">Auto Backup Aktif</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">
              Setiap transaksi yang Anda masukkan otomatis tersimpan ke server Google (Firebase Cloud). Data aman meskipun Anda berganti perangkat (jika sudah login Google).
            </p>
          </div>
        </div>
      </div>

      {/* 2. Pengaturan Kategori */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Kategori</h3>
        <div className="space-y-3">
          <button 
            onClick={() => { setType('expense'); setShowCatModal(true); }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-2 rounded-lg group-hover:bg-rose-200 transition-colors">
                <Tag className="w-5 h-5 text-rose-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800 text-sm">Kategori Pengeluaran</p>
                <p className="text-xs text-gray-400">Atur label pengeluaran</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button 
            onClick={() => { setType('income'); setShowCatModal(true); }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <Tag className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800 text-sm">Kategori Pemasukan</p>
                <p className="text-xs text-gray-400">Atur sumber pendapatan</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* 3. Manajemen Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Manajemen Data</h3>
        
        <div className="space-y-3">
          <button 
            onClick={downloadCSV}
            disabled={transactions.length === 0}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800 text-sm">Export ke Excel (Backup Manual)</p>
                <p className="text-xs text-gray-400">Unduh file .csv untuk arsip pribadi</p>
              </div>
            </div>
          </button>

          <button 
            onClick={handleImportClick}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 transition-all group"
          >
             <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <Upload className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800 text-sm">Restore Data</p>
                <p className="text-xs text-gray-400">Kembalikan data dari file backup</p>
              </div>
            </div>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />

          <button 
            onClick={() => setShowDummyModal(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 transition-all group"
          >
             <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800 text-sm">Isi Data Demo</p>
                <p className="text-xs text-gray-400">Buat transaksi contoh otomatis</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Zona Bahaya */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Zona Bahaya
        </h3>
        
        <p className="text-xs text-gray-500 mb-4">
          Tindakan di bawah ini tidak dapat dibatalkan. Pastikan Anda sudah membackup data Anda.
        </p>

        <button 
          onClick={() => setShowResetModal(true)}
          className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" /> Reset Semua Data
        </button>
      </div>

      <div className="text-center text-xs text-gray-300 pb-8">
        Dompetku Cloud v1.2.0
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 md:p-8 pb-24">
      <div className="max-w-md mx-auto relative min-h-screen">
        {renderHeader()}
        
        {/* Loading Indicator Transparan */}
        {loading && (
          <div className="fixed inset-0 bg-white/60 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-bold text-gray-700">Sinkronisasi Data...</p>
            </div>
          </div>
        )}
        
        {notification && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 w-full max-w-sm px-4">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
              {notification.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}<span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Demo Data */}
        {showDummyModal && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="bg-purple-100 p-3 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-xl text-gray-900">Isi Data Demo?</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Tindakan ini akan menambahkan beberapa transaksi contoh ke dalam catatan Anda.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDummyModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmGenerateDummy}
                  className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                >
                  Ya, Tambahkan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Reset */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="bg-red-100 p-3 rounded-full mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-xl text-gray-900">Hapus Semua Data?</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Tindakan ini akan menghapus semua riwayat transaksi dan kategori kustom Anda secara permanen. Data tidak bisa dikembalikan.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleResetData}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Kelola Kategori */}
        {showCatModal && (
          <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Kelola Kategori {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</h3>
                <button onClick={() => setShowCatModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
              </div>
              <div className="mb-6">
                <form onSubmit={handleSaveCategory}>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Tambah Kategori Baru</label>
                  <div className="flex gap-2">
                    <input 
                      autoFocus
                      type="text" 
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Nama Kategori..." 
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button type="submit" disabled={!newCatName.trim()} className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Kategori Kustom Anda</h4>
                {customCategories.filter(c => c.type === type).length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200"><p className="text-xs text-gray-400">Belum ada kategori kustom.</p></div>
                ) : (
                  <ul className="space-y-2">
                    {customCategories.filter(c => c.type === type).map((c) => (
                      <li key={c.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors">
                        <span className="text-sm font-medium text-gray-700">{c.name}</span>
                        <button onClick={() => handleDeleteCategory(c.id, c.name)} className="text-gray-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-all" title="Hapus Kategori"><Trash2 className="w-4 h-4" /></button>
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
        
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-30 md:max-w-md md:mx-auto md:bottom-4 md:rounded-2xl md:border md:shadow-xl">
          <div className="flex justify-around items-center">
            <button onClick={() => setView('home')} className={`flex flex-col items-center p-2 rounded-xl flex-1 transition-all ${view === 'home' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}><List className="w-6 h-6 mb-1" /><span className="text-xs font-medium">Transaksi</span></button>
            <button onClick={() => setView('report')} className={`flex flex-col items-center p-2 rounded-xl flex-1 transition-all ${view === 'report' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}><FileText className="w-6 h-6 mb-1" /><span className="text-xs font-medium">Laporan</span></button>
            <button onClick={() => setView('settings')} className={`flex flex-col items-center p-2 rounded-xl flex-1 transition-all ${view === 'settings' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}><Settings className="w-6 h-6 mb-1" /><span className="text-xs font-medium">Pengaturan</span></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;