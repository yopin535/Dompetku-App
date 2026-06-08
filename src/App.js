import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, Wallet, TrendingUp, TrendingDown, DollarSign, 
  Cloud, Loader2, Tag, Calendar, PieChart, List, ChevronLeft, ChevronRight, 
  Download, Upload, FileText, CheckCircle, XCircle, X, Settings, Sparkles,
  LogOut, LogIn, AlertTriangle, User, Info, Check, CloudOff, RefreshCw, Globe, Edit2, Camera,
  ChevronDown, ChevronUp, Receipt, ArrowRightLeft, CreditCard, Landmark, Eye, EyeOff
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
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home'); 
  const [notification, setNotification] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced');
  
  // --- PENGATURAN BAWAAN & PRIVASI ---
  const [defaultCurrency, setDefaultCurrency] = useState(localStorage.getItem('defaultCurrency') || 'JPY');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [hideBalance, setHideBalance] = useState(false); 
  
  const [showFloatingAdd, setShowFloatingAdd] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showDummyModal, setShowDummyModal] = useState(false); 
  const [newCatName, setNewCatName] = useState('');

  const getCurrentDate = () => {
    const now = new Date();
    return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0');
  };

  const currencies = [
    { code: 'IDR', symbol: 'Rp' },
    { code: 'USD', symbol: '$' },
    { code: 'SGD', symbol: 'S$' },
    { code: 'EUR', symbol: '€' },
    { code: 'JPY', symbol: '¥' },
    { code: 'MYR', symbol: 'RM' },
  ];

  // --- FORM STATES ---
  const [type, setType] = useState('expense'); 
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency); 
  const [date, setDate] = useState(getCurrentDate());
  const [selectedCategories, setSelectedCategories] = useState(['Makanan']);
  const [items, setItems] = useState([]); 
  
  // States Khusus Dompet & Transfer
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [adminFee, setAdminFee] = useState('');
  
  // States Dompet Baru
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletCurrency, setNewWalletCurrency] = useState(defaultCurrency);
  const [newWalletBalance, setNewWalletBalance] = useState('');
  
  const [editId, setEditId] = useState(null);
  const [homeViewDate, setHomeViewDate] = useState(new Date());
  const [expandedId, setExpandedId] = useState(null);

  const [reportDate, setReportDate] = useState(new Date());
  const [reportType, setReportType] = useState('monthly'); 
  const [reportCurrency, setReportCurrency] = useState(defaultCurrency); 
  
  const fileInputRef = useRef(null);
  const receiptInputRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const checkWalletRef = useRef(false);

  const defaultExpenseCategories = ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Biaya Admin', 'Lainnya'];
  const defaultIncomeCategories = ['Gaji', 'Bonus', 'Hadiah', 'Penjualan', 'Investasi', 'Freelance', 'Lainnya'];

  const expenseCategories = useMemo(() => {
    const custom = customCategories.filter(c => c.type === 'expense').map(c => c.name);
    return [...defaultExpenseCategories, ...custom];
  }, [customCategories]);

  const incomeCategories = useMemo(() => {
    const custom = customCategories.filter(c => c.type === 'income').map(c => c.name);
    return [...defaultIncomeCategories, ...custom];
  }, [customCategories]);

  // FIX: Reset kategori default hanya saat ganti tab (expense/income) & tidak sedang edit
  useEffect(() => {
    if(!editId && type !== 'transfer') {
       setSelectedCategories([type === 'expense' ? 'Makanan' : 'Gaji']);
    }
  }, [type, editId]);

  useEffect(() => {
      if(wallets.length > 0 && !walletId && !editId) {
          setWalletId(wallets[0].id);
          setCurrency(wallets[0].currency);
      }
      if(wallets.length > 1 && !toWalletId && !editId && type === 'transfer') {
          setToWalletId(wallets[1].id);
      }
  }, [wallets, walletId, toWalletId, editId, type]);

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

    const walRef = collection(db, 'artifacts', appId, 'users', user.uid, 'wallets');
    const unsubWal = onSnapshot(walRef, async (snapshot) => {
      const wals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWallets(wals);
      
      if (wals.length === 0 && !checkWalletRef.current) {
          checkWalletRef.current = true;
          try {
              await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'wallets'), {
                  name: 'Dompet Tunai', currency: defaultCurrency, initialBalance: 0, createdAt: Date.now()
              });
          } catch(e) {}
      }
      setLoading(false);
    }, (error) => {
        setSyncStatus('offline');
        setLoading(false);
    });

    return () => { unsubTrans(); unsubCat(); unsubWal(); };
  }, [user, defaultCurrency]);

  const formatCurrency = (number, currencyCode = defaultCurrency) => {
    try {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 2
      }).format(number);
    } catch (e) {
      return currencyCode + " " + number;
    }
  };

  // --- PERHITUNGAN SALDO & KEKAYAAN BERSIH ---
  const walletBalances = useMemo(() => {
    const balances = {};
    wallets.forEach(w => balances[w.id] = parseFloat(w.initialBalance || 0));
    
    transactions.forEach(t => {
       if (t.type === 'income') {
           if(balances[t.walletId] !== undefined) balances[t.walletId] += parseFloat(t.amount || 0);
       } else if (t.type === 'expense') {
           if(balances[t.walletId] !== undefined) balances[t.walletId] -= parseFloat(t.amount || 0);
       } else if (t.type === 'transfer') {
           if(balances[t.walletId] !== undefined) {
               balances[t.walletId] -= (parseFloat(t.amount || 0) + parseFloat(t.adminFee || 0));
           }
           if(balances[t.toWalletId] !== undefined) {
               balances[t.toWalletId] += parseFloat(t.receivedAmount || t.amount || 0);
           }
       }
    });
    return balances;
  }, [wallets, transactions]);

  const totalBalancesByCurrency = useMemo(() => {
      const totals = {};
      wallets.forEach(w => {
          const curr = w.currency || defaultCurrency;
          totals[curr] = (totals[curr] || 0) + (walletBalances[w.id] || 0);
      });
      return totals;
  }, [wallets, walletBalances, defaultCurrency]);

  const handleSaveSettings = (key, val) => {
      if(key === 'gemini') {
          setGeminiKey(val); localStorage.setItem('gemini_api_key', val);
      } else if (key === 'currency') {
          setDefaultCurrency(val); localStorage.setItem('defaultCurrency', val);
          setReportCurrency(val);
          setNotification({ type: 'success', message: 'Mata uang default diubah ke ' + val });
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

  const handleSaveWallet = async (e) => {
      e.preventDefault();
      if (!newWalletName || !user) return;
      setSyncStatus('saving');
      try {
          await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'wallets'), { 
              name: newWalletName, currency: newWalletCurrency, initialBalance: parseFloat(newWalletBalance || 0), createdAt: Date.now() 
          });
          setNewWalletName(''); setNewWalletBalance(''); setShowWalletModal(false);
          setNotification({ type: 'success', message: 'Dompet baru dibuat.' });
      } catch (error) { setSyncStatus('offline'); }
  };

  const handleDeleteWallet = async (id) => {
      if(wallets.length <= 1) {
          setNotification({ type: 'error', message: 'Minimal harus ada 1 dompet aktif!' });
          return;
      }
      setSyncStatus('saving');
      try {
          await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'wallets', id));
          setNotification({ type: 'success', message: 'Dompet dihapus.' });
      } catch (error) { setSyncStatus('offline'); }
  };

  // --- AI SCANNER ---
  const handleScanReceipt = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!geminiKey) { setNotification({ type: 'error', message: 'Isi Gemini API Key di Pengaturan!' }); e.target.value = null; return; }

    setIsScanning(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        let mimeType = file.type;
        if (!mimeType) { mimeType = file.name.toLowerCase().endsWith('.heic') ? 'image/heic' : 'image/jpeg'; }
        
        const prompt = "Ekstrak data dari gambar struk/receipt belanja ini. Jika bahasa asing, biarkan namanya atau terjemahkan sedikit agar mudah dimengerti. " +
        "Kembalikan HANYA format JSON MURNI tanpa markdown. Formatnya harus: " +
        "{\"desc\": \"Nama Toko/Restoran\", \"total\": angka_tanpa_simbol, \"tgl\": \"YYYY-MM-DD\", \"curr\": \"KODE_MATA_UANG\", \"items\": [{\"n\": \"Nama Barang\", \"p\": harga_angka_bulat}]} " +
        "Catatan: 'total' dan 'p' harus NUMBER. Pajak/diskon masukkan sebagai item tersendiri di dalam list items.";

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiKey, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: mimeType, data: base64Data } }] }] })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const result = JSON.parse(rawText);

        if (result.desc) setDescription(result.desc);
        if (result.total) setAmount(result.total.toString());
        if (result.tgl) {
            const regexDate = /^\d{4}-\d{2}-\d{2}$/;
            if(regexDate.test(result.tgl)) setDate(result.tgl);
        }
        
        if (result.curr && currencies.some(c => c.code === result.curr)) {
            const matchedWallet = wallets.find(w => w.currency === result.curr);
            if(matchedWallet) setWalletId(matchedWallet.id);
            setCurrency(result.curr);
        }
        
        if (result.items && Array.isArray(result.items)) {
            setItems(result.items.map(item => ({ name: item.n || 'Item', price: item.p || 0 })));
        } else { setItems([]); }
        
        setType('expense'); setEditId(null);
        setNotification({ type: 'success', message: 'Struk berhasil dibaca! Periksa rincian di form.' });

      } catch (error) {
        console.error("AI Scan Error:", error);
        setNotification({ type: 'error', message: "Gagal membaca struk. (Error: " + (error.message || "Parse Error") + ")" });
      } finally {
        setIsScanning(false); e.target.value = null; 
      }
    };
  };

  const handleAddItem = () => setItems([...items, { name: '', price: '' }]);
  const handleItemChange = (index, field, value) => {
      const newItems = [...items];
      newItems[index][field] = value;
      setItems(newItems);
      if(field === 'price') {
          let newTotal = 0;
          newItems.forEach(item => { const p = parseFloat(item.price); if(!isNaN(p)) newTotal += p; });
          setAmount(newTotal.toString());
      }
  };
  const handleRemoveItem = (index) => {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      let newTotal = 0;
      newItems.forEach(item => { const p = parseFloat(item.price); if(!isNaN(p)) newTotal += p; });
      setAmount(newTotal.toString());
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const newCat = newCatName.trim();
    if (!newCat || !user) return;
    setSyncStatus('saving');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'categories'), { name: newCat, type, createdAt: Date.now() });
      setSelectedCategories([newCat]);
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

  // Mengembalikan fitur multi-select untuk memilih lebih dari 1 kategori
  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== cat));
      } else {
        setNotification({ type: 'error', message: 'Minimal pilih 1 kategori.' });
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !date || !user || !walletId) return;
    
    if (type === 'transfer') {
        if(!toWalletId || walletId === toWalletId) {
            setNotification({ type: 'error', message: 'Pilih dompet tujuan yang berbeda!' }); return;
        }
    } else {
        if(!description) {
            setNotification({ type: 'error', message: 'Deskripsi tidak boleh kosong!' }); return;
        }
    }

    setSyncStatus('saving');
    try {
      const selectedDate = new Date(date);
      const cleanItems = items.filter(i => i.name.trim() !== '' || i.price !== '');
      
      const transactionData = {
        amount: parseFloat(amount), 
        type, 
        walletId,
        date: selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        transactionDate: selectedDate.getTime()
      };

      if (type === 'transfer') {
          const wAsal = wallets.find(w => w.id === walletId);
          const wTujuan = wallets.find(w => w.id === toWalletId);
          
          transactionData.description = "Transfer: " + (wAsal?.name || "Asal") + " ➞ " + (wTujuan?.name || "Tujuan");
          transactionData.toWalletId = toWalletId;
          transactionData.currency = wAsal?.currency || defaultCurrency;
          transactionData.targetCurrency = wTujuan?.currency || defaultCurrency;
          transactionData.adminFee = parseFloat(adminFee || 0);
          
          if (wAsal?.currency !== wTujuan?.currency) {
              transactionData.receivedAmount = parseFloat(receivedAmount || amount);
          } else {
              transactionData.receivedAmount = parseFloat(amount);
          }
      } else {
          transactionData.description = description;
          transactionData.categories = selectedCategories;
          transactionData.category = selectedCategories[0] || 'Umum';
          transactionData.currency = wallets.find(w=>w.id === walletId)?.currency || defaultCurrency;
          transactionData.items = cleanItems;
      }

      if (editId) {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', editId), transactionData);
        setNotification({ type: 'success', message: 'Transaksi diperbarui.' }); setEditId(null);
      } else {
        transactionData.createdAt = Date.now();
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), transactionData);
        setNotification({ type: 'success', message: 'Tersimpan.' });
      }
      
      setHomeViewDate(selectedDate); setDescription(''); setAmount(''); setDate(getCurrentDate()); setItems([]);
      setReceivedAmount(''); setAdminFee('');
      const currentList = type === 'expense' ? expenseCategories : incomeCategories;
      setSelectedCategories([currentList[0]]);
    } catch (error) {
      setNotification({ type: 'error', message: editId ? 'Gagal memperbarui.' : 'Gagal menyimpan.' });
      setSyncStatus('offline');
    }
  };

  const handleEditClick = (t) => {
    setEditId(t.id); 
    setType(t.type); 
    setAmount(t.amount.toString()); 
    setWalletId(t.walletId);
    
    if (t.type === 'transfer') {
        setToWalletId(t.toWalletId);
        setReceivedAmount(t.receivedAmount?.toString() || '');
        setAdminFee(t.adminFee?.toString() || '');
        setDescription('');
    } else {
        setDescription(t.description); 
        if(t.items && Array.isArray(t.items)) setItems(t.items); else setItems([]);
        
        let cats = [];
        if (t.categories && Array.isArray(t.categories) && t.categories.length > 0) cats = t.categories;
        else if (t.category) cats = [t.category];
        else cats = [t.type === 'expense' ? expenseCategories[0] : incomeCategories[0]];
        setSelectedCategories(cats); 
    }
    
    const d = new Date(t.transactionDate || t.createdAt);
    setDate(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null); setDescription(''); setAmount(''); setDate(getCurrentDate()); setItems([]);
    setReceivedAmount(''); setAdminFee('');
    setSelectedCategories([type === 'expense' ? expenseCategories[0] : incomeCategories[0]]);
  };

  const handleDelete = async (id) => {
    if (!user) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id)); } catch (error) {}
  };

  const toggleExpand = (id) => {
      if(expandedId === id) setExpandedId(null);
      else setExpandedId(id);
  };

  // --- UI COMPONENTS: HEADER BARU (SUPER RINGKAS TANPA NAMA & DOMPETKU) ---
  const renderHeader = () => {
    return (
      <div className="bg-gradient-to-b from-blue-700 to-indigo-800 px-5 pt-6 pb-6 text-white rounded-b-[2rem] shadow-lg mb-2 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32" />
         </div>
         
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-1">
               <div className="flex items-center gap-2">
                  <p className="text-xs text-blue-200 font-medium">Total Kekayaan Bersih ({defaultCurrency})</p>
                  <button onClick={() => setHideBalance(!hideBalance)} className="text-blue-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                     {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
               </div>
               <div className="flex items-center gap-3">
                  {syncStatus === 'saving' && <RefreshCw className="w-4 h-4 text-blue-200 animate-spin" />}
                  {syncStatus === 'synced' && <Cloud className="w-4 h-4 text-blue-200" />}
                  {syncStatus === 'offline' && <CloudOff className="w-4 h-4 text-rose-300" />}
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm shadow-sm cursor-pointer hover:bg-white/30 transition-all" onClick={() => setView('settings')}>
                     {user && user.photoURL && !user.isAnonymous ? (
                        <img src={user.photoURL} alt="Profil" className="w-full h-full rounded-full object-cover" />
                     ) : (
                        <User className="w-4 h-4 text-white" />
                     )}
                  </div>
               </div>
            </div>
            
            <div className="flex items-baseline gap-2">
               <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {hideBalance ? '••••••••' : formatCurrency(totalBalancesByCurrency[defaultCurrency] || 0, defaultCurrency)}
               </h1>
            </div>
            
            {Object.keys(totalBalancesByCurrency).length > 1 && (
               <div className="mt-2.5 flex flex-wrap gap-2">
                  {Object.keys(totalBalancesByCurrency).filter(c => c !== defaultCurrency).map(c => (
                     <span key={c} className="text-[10px] font-medium bg-black/20 px-2 py-1 rounded-full border border-white/10 backdrop-blur-md">
                        {hideBalance ? '•••' : formatCurrency(totalBalancesByCurrency[c], c)}
                     </span>
                  ))}
               </div>
            )}
         </div>
      </div>
    );
  };

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
    const wAsal = wallets.find(w => w.id === walletId);
    const wTujuan = wallets.find(w => w.id === toWalletId);
    const isCrossCurrency = wAsal && wTujuan && wAsal.currency !== wTujuan.currency;

    return (
      <div className="animate-in fade-in duration-300">
        
        {wallets.length > 0 && (
            <div className="flex overflow-x-auto gap-3 pb-4 pt-1 snap-x hide-scrollbar px-1">
               {wallets.map(w => (
                  <div key={w.id} className="min-w-[145px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100 snap-start flex flex-col justify-between hover:border-blue-200 transition-colors">
                     <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
                         <span className="bg-blue-50 p-1 rounded-md"><Landmark className="w-3 h-3 text-blue-500" /></span> 
                         {w.name}
                     </p>
                     <p className="font-bold text-base mt-2.5 text-gray-800">
                         {hideBalance ? '••••••' : formatCurrency(walletBalances[w.id] || 0, w.currency)}
                     </p>
                  </div>
               ))}
               <button onClick={() => setShowWalletModal(true)} className="min-w-[110px] border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-blue-600 hover:border-blue-300 transition-colors snap-start">
                   <Plus className="w-6 h-6 mb-1" />
                   <span className="text-[10px] font-bold">Dompet Baru</span>
               </button>
            </div>
        )}

        <div className={"bg-white rounded-2xl shadow-sm border p-5 mb-6 mt-2 transition-all relative overflow-hidden " + (editId ? "border-blue-300 ring-4 ring-blue-50" : "border-gray-100")}>
          {isScanning && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
              <p className="text-sm font-bold text-gray-700">Menganalisis Struk...</p>
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
            <div className="flex bg-gray-100 p-1 rounded-lg h-[42px] gap-1">
              <button type="button" onClick={() => setType('income')} className={"flex-1 flex items-center justify-center rounded-md text-[11px] md:text-xs font-bold transition-all " + (type === 'income' ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}><TrendingUp className="w-3 h-3 mr-1" /> Pemasukan</button>
              <button type="button" onClick={() => setType('expense')} className={"flex-1 flex items-center justify-center rounded-md text-[11px] md:text-xs font-bold transition-all " + (type === 'expense' ? "bg-rose-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}><TrendingDown className="w-3 h-3 mr-1" /> Pengeluaran</button>
              <button type="button" onClick={() => setType('transfer')} className={"flex-1 flex items-center justify-center rounded-md text-[11px] md:text-xs font-bold transition-all " + (type === 'transfer' ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}><ArrowRightLeft className="w-3 h-3 mr-1" /> Transfer</button>
            </div>
            
            {type === 'transfer' ? (
                <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                   <div className="grid grid-cols-2 gap-3">
                       <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">DARI DOMPET (Asal)</label>
                          <div className="relative">
                              <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 appearance-none text-xs font-bold">
                                {wallets.map(w => <option key={"s-"+w.id} value={w.id}>{w.name} ({w.currency})</option>)}
                              </select>
                              <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-gray-400 pointer-events-none" />
                          </div>
                       </div>
                       <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">KE DOMPET (Tujuan)</label>
                          <div className="relative">
                              <select value={toWalletId} onChange={(e) => setToWalletId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 appearance-none text-xs font-bold">
                                <option value="">-- Pilih Tujuan --</option>
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
                       <p className="text-[9px] text-gray-400 mt-1">Biaya ini akan dicatat otomatis sebagai pengeluaran.</p>
                   </div>
                   
                   <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">TANGGAL TRANSAKSI</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-xs" />
                   </div>
                </div>
            ) : (
                <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Dompet Sumber</label>
                      <div className="relative">
                          <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 appearance-none text-sm font-bold text-blue-700">
                            {wallets.map(w => <option key={"s-"+w.id} value={w.id}>{w.name} ({w.currency})</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Deskripsi Kegiatan</label>
                      <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={type === 'expense' ? "Makan Siang..." : "Gaji Bulanan..."} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-all font-medium" />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                           <label className="text-xs font-bold text-gray-600 flex items-center gap-1"><Receipt className="w-3.5 h-3.5" /> Rincian Barang (Opsional)</label>
                           <button type="button" onClick={handleAddItem} className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded shadow-sm font-medium hover:bg-gray-100">+ Tambah Baris</button>
                        </div>
                        
                        {items.length === 0 ? (
                            <p className="text-[10px] text-gray-400 text-center italic mb-2">Tambah manual rincian harga untuk pelacakan</p>
                        ) : (
                            <div className="space-y-2 mb-3">
                                {items.map((item, index) => (
                                    <div key={"item-" + index} className="flex items-center gap-2">
                                        <input type="text" placeholder="Nama brg" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} className="flex-1 min-w-0 bg-white border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
                                        <input type="number" placeholder="Harga" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} className="w-20 text-right bg-white border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
                                        <button type="button" onClick={() => handleRemoveItem(index)} className="text-gray-300 hover:text-rose-500"><XCircle className="w-4 h-4" /></button>
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
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">Kategori</label>
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

        <div>
          <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <button type="button" onClick={() => changeHomeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            <div className="text-center">
              <h3 className="font-bold text-gray-800 text-sm">{homeViewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
              <p className="text-[10px] text-gray-500">{homeTransactionsCount} transaksi dicatat</p>
            </div>
            <button type="button" onClick={() => changeHomeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
          </div>
          
          {groupedHomeTransactions.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"><DollarSign className="w-6 h-6 text-gray-400" /></div>
              <p className="text-gray-500 text-sm">Belum ada transaksi di bulan ini.</p>
            </div>
          ) : (
            <div className="space-y-6 pb-8">
              {groupedHomeTransactions.map((group) => (
                <div key={group.date} className="animate-in fade-in slide-in-from-bottom-2">
                  <h4 className="text-sm font-bold text-gray-500 border-b border-gray-200 pb-2 mb-3 sticky top-[72px] bg-gray-50/95 backdrop-blur-sm z-10">{group.date}</h4>
                  <div className="space-y-3">
                    {group.items.map((t) => {
                      const isTransfer = t.type === 'transfer';
                      const hasItems = t.items && t.items.length > 0;
                      const isExpanded = expandedId === t.id;
                      const dompetAsal = wallets.find(w => w.id === t.walletId);
                      
                      return (
                      <div key={t.id} className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4 w-2/3">
                              <div className={"w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 " + (isTransfer ? "bg-blue-50 text-blue-600" : (t.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"))}>
                                 {isTransfer ? <ArrowRightLeft className="w-4 h-4" /> : (t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />)}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-semibold text-gray-800 text-sm truncate">{t.description}</h4>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {isTransfer ? (
                                      <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded font-bold">Transfer</span>
                                  ) : (
                                    (t.categories || (t.category ? [t.category] : ['Umum'])).map(catLabel => (
                                        <span key={t.id + "-" + catLabel} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">{catLabel}</span>
                                    ))
                                  )}
                                  <span className="text-[9px] px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded border border-gray-200"><CreditCard className="w-2.5 h-2.5 inline mr-0.5" /> {dompetAsal ? dompetAsal.name : 'Terhapus'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className={"font-bold text-sm " + (isTransfer ? "text-gray-700" : (t.type === 'income' ? "text-emerald-600" : "text-rose-600"))}>
                                 {isTransfer ? "" : (t.type === 'income' ? "+" : "-")}{formatCurrency(t.amount, t.currency)}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                  {hasItems && !isTransfer && (
                                      <button onClick={() => toggleExpand(t.id)} className="text-[10px] flex items-center gap-0.5 text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                          Nota {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      </button>
                                  )}
                                  <button onClick={() => handleEditClick(t)} className="text-gray-300 hover:text-blue-500 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                        </div>
                        
                        {/* Rincian Nota UI Dropdown */}
                        {hasItems && !isTransfer && isExpanded && (
                            <div className="bg-blue-50/30 border-t border-gray-100 p-4 animate-in slide-in-from-top-2">
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1"><Receipt className="w-3 h-3" /> Rincian Item</p>
                                <ul className="space-y-1.5">
                                    {t.items.map((item, idx) => (
                                        <li key={"det-" + idx} className="flex justify-between text-xs border-b border-gray-200/50 pb-1.5 last:border-0 last:pb-0">
                                            <span className="text-gray-700">{item.name}</span>
                                            <span className="font-semibold text-gray-900">{formatCurrency(item.price || 0, t.currency)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Detail Info Transfer */}
                        {isTransfer && isExpanded && (
                            <div className="bg-gray-50 border-t border-gray-100 p-4 animate-in slide-in-from-top-2 text-xs">
                                <p className="mb-1"><span className="text-gray-500">Tujuan:</span> <b>{wallets.find(w=>w.id === t.toWalletId)?.name || '?'}</b></p>
                                {t.currency !== t.targetCurrency && <p className="mb-1 text-green-600 font-bold"><span className="text-gray-500 font-normal">Diterima:</span> {formatCurrency(t.receivedAmount, t.targetCurrency)}</p>}
                                {t.adminFee > 0 && <p className="text-rose-500"><span className="text-gray-500">Biaya Admin:</span> -{formatCurrency(t.adminFee, t.currency)}</p>}
                            </div>
                        )}
                        {/* Tombol kecil paksa buka kalau transfer */}
                        {isTransfer && !isExpanded && (
                             <button onClick={() => toggleExpand(t.id)} className="absolute bottom-1 right-1/2 translate-x-1/2 text-[9px] text-gray-400 bg-white px-2 rounded-t border border-b-0 border-gray-100"><ChevronDown className="w-3 h-3" /></button>
                        )}
                        {isTransfer && isExpanded && (
                             <button onClick={() => toggleExpand(t.id)} className="w-full bg-gray-100 text-center py-0.5 text-gray-400 hover:bg-gray-200"><ChevronUp className="w-3 h-3 mx-auto" /></button>
                        )}
                      </div>
                    )})}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const filteredByPeriod = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.transactionDate || t.createdAt);
      
      if (reportType === 'daily') {
          return tDate.getDate() === reportDate.getDate() && tDate.getMonth() === reportDate.getMonth() && tDate.getFullYear() === reportDate.getFullYear();
      } else if (reportType === 'weekly') {
          const current = new Date(reportDate);
          const day = current.getDay();
          const diff = current.getDate() - day + (day === 0 ? -6 : 1);
          const startOfWeek = new Date(current);
          startOfWeek.setDate(diff); startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6); endOfWeek.setHours(23, 59, 59, 999);
          return tDate >= startOfWeek && tDate <= endOfWeek;
      } else if (reportType === 'monthly') {
          return tDate.getMonth() === reportDate.getMonth() && tDate.getFullYear() === reportDate.getFullYear();
      } else {
          return tDate.getFullYear() === reportDate.getFullYear();
      }
    });
  }, [transactions, reportDate, reportType]);

  const reportTransactions = useMemo(() => filteredByPeriod.filter(t => (t.currency || 'IDR') === reportCurrency), [filteredByPeriod, reportCurrency]);

  const categoryStats = useMemo(() => {
    const stats = {}; let totalExpense = 0;
    reportTransactions.forEach(t => {
      if (t.type === 'expense') { 
        const primaryCat = (t.categories && t.categories.length > 0) ? t.categories[0] : (t.category || 'Umum');
        stats[primaryCat] = (stats[primaryCat] || 0) + parseFloat(t.amount); 
        totalExpense += parseFloat(t.amount); 
      } else if (t.type === 'transfer' && t.adminFee > 0) {
        stats['Biaya Admin'] = (stats['Biaya Admin'] || 0) + parseFloat(t.adminFee);
        totalExpense += parseFloat(t.adminFee);
      }
    });
    return Object.keys(stats).map(cat => ({ name: cat, amount: stats[cat], percentage: totalExpense > 0 ? (stats[cat] / totalExpense) * 100 : 0 })).sort((a, b) => b.amount - a.amount);
  }, [reportTransactions]);

  const reportSummary = useMemo(() => {
    const inc = reportTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const exp = reportTransactions.reduce((acc, curr) => {
        if(curr.type === 'expense') return acc + parseFloat(curr.amount);
        if(curr.type === 'transfer' && curr.adminFee > 0) return acc + parseFloat(curr.adminFee);
        return acc;
    }, 0);
    return { income: inc, expense: exp, balance: inc - exp };
  }, [reportTransactions]);

  const changeReportPeriod = (increment) => {
    const newDate = new Date(reportDate);
    if (reportType === 'yearly') newDate.setFullYear(newDate.getFullYear() + increment);
    else if (reportType === 'monthly') newDate.setMonth(newDate.getMonth() + increment);
    else if (reportType === 'weekly') newDate.setDate(newDate.getDate() + (increment * 7));
    else if (reportType === 'daily') newDate.setDate(newDate.getDate() + increment);
    setReportDate(newDate);
  };

  const getReportTitle = () => {
    if (reportType === 'yearly') return reportDate.getFullYear();
    else if (reportType === 'monthly') return reportDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    else if (reportType === 'weekly') {
        const current = new Date(reportDate);
        const day = current.getDay();
        const diff = current.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(current); start.setDate(diff); 
        const end = new Date(start); end.setDate(start.getDate() + 6);
        return start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + " - " + end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } else if (reportType === 'daily') return reportDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
    return '';
  };

  const renderReportView = () => (
    <div className="animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6 gap-1">
          <button onClick={() => setReportType('daily')} className={"flex-1 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all " + (reportType === 'daily' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Harian</button>
          <button onClick={() => setReportType('weekly')} className={"flex-1 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all " + (reportType === 'weekly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Mingguan</button>
          <button onClick={() => setReportType('monthly')} className={"flex-1 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all " + (reportType === 'monthly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Bulanan</button>
          <button onClick={() => setReportType('yearly')} className={"flex-1 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all " + (reportType === 'yearly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Tahunan</button>
        </div>
        
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-500">Mata Uang Laporan:</span>
            <select value={reportCurrency} onChange={(e) => setReportCurrency(e.target.value)} className="bg-transparent text-sm font-bold text-blue-600 focus:outline-none">
              {[...new Set(transactions.map(t => t.currency || defaultCurrency))].map(c => <option key={c} value={c}>{c}</option>)}
              {transactions.length === 0 && <option value={defaultCurrency}>{defaultCurrency}</option>}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeReportPeriod(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
          <div className="text-center"><h2 className="font-bold text-gray-900 text-[15px]">{getReportTitle()}</h2></div>
          <button onClick={() => changeReportPeriod(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100"><p className="text-xs text-emerald-600 mb-1">Total Pemasukan</p><p className="font-bold text-emerald-700">{formatCurrency(reportSummary.income, reportCurrency)}</p></div>
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-100"><p className="text-xs text-rose-600 mb-1">Total Pengeluaran</p><p className="font-bold text-rose-700">{formatCurrency(reportSummary.expense, reportCurrency)}</p></div>
        </div>
        <div className={"text-center p-4 rounded-xl border mb-8 " + (reportSummary.balance >= 0 ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100")}>
          <p className="text-xs text-gray-500 mb-1">Arus Kas Bersih (Net Cashflow)</p>
          <p className={"text-2xl font-bold " + (reportSummary.balance >= 0 ? "text-blue-700" : "text-orange-700")}>{reportSummary.balance >= 0 ? "+" : ""}{formatCurrency(reportSummary.balance, reportCurrency)}</p>
        </div>
        
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-gray-500" /> Distribusi Pengeluaran</h3>
        {categoryStats.length === 0 ? <div className="text-center py-8 text-gray-400 text-sm">Belum ada pengeluaran.</div> : (
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
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><List className="w-4 h-4 text-gray-500" /> Semua Riwayat ({reportCurrency})</h3>
        {reportTransactions.length === 0 ? <div className="text-center py-8 text-gray-400 text-sm">Tidak ada transaksi yang tercatat.</div> : (
          <div className="space-y-3">
            {[...reportTransactions].sort((a, b) => new Date(b.transactionDate || b.createdAt) - new Date(a.transactionDate || a.createdAt)).map((t) => {
              const isTransfer = t.type === 'transfer';
              const isExpanded = expandedId === t.id;
              const hasItems = t.items && t.items.length > 0;
              
              if (isTransfer && (!t.adminFee || t.adminFee <= 0)) return null;
              
              return (
              <div key={"rep"+t.id} className="py-2 border-b border-gray-50 last:border-0 group cursor-pointer" onClick={() => hasItems && toggleExpand(t.id)}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 w-2/3">
                       <div className={"w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 " + (isTransfer ? "bg-blue-50 text-blue-600" : (t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"))}>
                         {isTransfer ? <ArrowRightLeft className="w-4 h-4" /> : (t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />)}
                       </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{isTransfer ? "Biaya Admin Transfer" : t.description}</p>
                          <div className="flex flex-wrap items-center gap-1 mt-0.5">
                            <span className="text-[9px] text-gray-400">{t.date}</span>
                            {!isTransfer && (t.categories || (t.category ? [t.category] : ['Umum'])).map(catLabel => (
                               <span key={"rep-cat-" + catLabel} className="text-[8px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded font-medium">{catLabel}</span>
                            ))}
                            {hasItems && <span className="text-[8px] bg-blue-50 text-blue-600 px-1 py-0.5 rounded font-bold ml-1">Lihat Nota</span>}
                          </div>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                        <p className={"text-sm font-bold " + (isTransfer ? "text-rose-600" : (t.type === 'income' ? "text-emerald-600" : "text-rose-600"))}>
                            {isTransfer ? "-" : (t.type === 'income' ? "+" : "-")}
                            {formatCurrency(isTransfer ? t.adminFee : t.amount, t.currency)}
                        </p>
                    </div>
                </div>
                
                {hasItems && !isTransfer && isExpanded && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs animate-in fade-in">
                        <ul className="space-y-1.5">
                            {t.items.map((item, idx) => (
                                <li key={"repdet-" + idx} className="flex justify-between border-b border-gray-200/50 pb-1.5 last:border-0 last:pb-0">
                                    <span className="text-gray-600">{item.name}</span>
                                    <span className="font-semibold text-gray-800">{formatCurrency(item.price || 0, t.currency)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );

  const downloadCSV = () => {
    if (transactions.length === 0) { setNotification({ type: 'error', message: 'Tidak ada data.' }); return; }
    const headers = "iso_date,tanggal_display,deskripsi,kategori,tipe,mata_uang,jumlah,dompet_asal,dompet_tujuan,biaya_admin,rincian_item";
    const csvRows = [headers];
    
    transactions.forEach(t => {
      const dateObj = new Date(t.transactionDate || t.createdAt);
      const isoDate = dateObj.toISOString().split('T')[0];
      const catString = t.categories ? t.categories.join(' & ') : (t.category || 'Umum');
      const cleanDesc = t.description.split('"').join('""');
      
      let itemsString = "";
      if (t.items && t.items.length > 0) {
          itemsString = t.items.map(i => {
              const cleanName = (i.name || '').split('"').join('""');
              return cleanName + "::" + (i.price || 0);
          }).join("||");
      }
      
      const row = isoDate + "," + 
                  '"' + t.date + '",' + 
                  '"' + cleanDesc + '",' + 
                  '"' + catString + '",' + 
                  t.type + "," + 
                  (t.currency || 'IDR') + "," + 
                  t.amount + "," +
                  (t.walletId || '') + "," +
                  (t.toWalletId || '') + "," +
                  (t.adminFee || 0) + "," +
                  '"' + itemsString + '"';
      csvRows.push(row);
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Backup_Dompetku_V3.csv');
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
          const rowText = rows[i].trim();
          if (!rowText) continue;
          
          const cols = []; let cur = ''; let inQuote = false;
          for (let j = 0; j < rowText.length; j++) {
              const char = rowText[j];
              if (char === '"' && rowText[j+1] === '"') { cur += '""'; j++; } 
              else if (char === '"') { inQuote = !inQuote; } 
              else if (char === ',' && !inQuote) { cols.push(cur); cur = ''; } 
              else { cur += char; }
          }
          cols.push(cur);

          if (cols && cols.length >= 6) {
            const clean = (str) => {
                if(!str) return '';
                let s = str.trim();
                if(s.startsWith('"') && s.endsWith('"')) s = s.substring(1, s.length - 1);
                return s.split('""').join('"');
            };
            
            const isoDate = clean(cols[0]);
            const description = clean(cols[2]);
            const categoryRaw = clean(cols[3]);
            const typeRaw = clean(cols[4]);
            const type = typeRaw.includes('income') ? 'income' : (typeRaw.includes('transfer') ? 'transfer' : 'expense');
            const catsArray = categoryRaw.split(' & ').map(c => c.trim()).filter(Boolean);

            let curr = 'IDR'; let amt = 0; 
            let wId = wallets[0]?.id || ''; let toWId = ''; let aFee = 0; let parsedItems = [];

            if (cols.length >= 11) {
                curr = clean(cols[5]); amt = parseFloat(clean(cols[6]));
                wId = clean(cols[7]) || wId;
                toWId = clean(cols[8]);
                aFee = parseFloat(clean(cols[9]) || 0);
                const itemsRaw = clean(cols[10]);
                if (itemsRaw) parsedItems = itemsRaw.split('||').map(itemStr => { const parts = itemStr.split('::'); return { name: parts[0] || 'Item', price: parseFloat(parts[1]) || 0 }; });
            } else if (cols.length >= 8) {
                curr = clean(cols[5]); amt = parseFloat(clean(cols[6]));
                const itemsRaw = clean(cols[7]);
                if (itemsRaw) parsedItems = itemsRaw.split('||').map(itemStr => { const parts = itemStr.split('::'); return { name: parts[0] || 'Item', price: parseFloat(parts[1]) || 0 }; });
            } else if (cols.length === 7) { curr = clean(cols[5]); amt = parseFloat(clean(cols[6])); } 
            else { amt = parseFloat(clean(cols[5])); }
            
            if (isoDate && description && !isNaN(amt)) {
              const dateObj = new Date(isoDate);
              await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
                description, amount: amt, type,
                categories: catsArray.length > 0 ? catsArray : ['Umum'],
                category: catsArray[0] || 'Umum',
                currency: curr, walletId: wId, toWalletId: toWId, adminFee: aFee, items: parsedItems,
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
        setLoading(false); setNotification({ type: 'error', message: 'Gagal import file CSV.' });
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
      const walSnapshot = await getDocs(collection(db, 'artifacts', appId, 'users', user.uid, 'wallets'));
      walSnapshot.forEach((doc) => batch.delete(doc.ref));
      
      await batch.commit();
      setTransactions([]); setCustomCategories([]); setWallets([]);
      setNotification({ type: 'success', message: 'Semua Data direset bersih.' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Gagal mereset.' });
    } finally { setLoading(false); setSyncStatus('synced'); }
  };

  const confirmGenerateDummy = async () => {
    if (!user) return;
    setShowDummyModal(false); setLoading(true); setSyncStatus('saving');
    try {
      // 1. Siapkan dompet untuk simulasi (gunakan yang ada)
      const w1 = wallets[0]?.id || '';
      const w2 = wallets.length > 1 ? wallets[1].id : w1;
      
      // 2. Sesuaikan nominal berdasarkan mata uang (IDR vs JPY/Lainnya)
      const isIDR = defaultCurrency === 'IDR';
      const multiplier = isIDR ? 100 : 1; 
      const baseSalary = isIDR ? 5000000 : 250000;
      const curr = defaultCurrency;

      const dummyData = [
        { desc: 'Gaji Bulanan', amount: baseSalary, type: 'income', cats: ['Gaji'], dayOffset: 6, curr: curr, walletId: w1, items: [] },
        { desc: 'Belanja Supermarket (TRIAL)', amount: 4500 * multiplier, type: 'expense', cats: ['Belanja', 'Makanan'], dayOffset: 3, curr: curr, walletId: w2, items: [
            { name: 'Beras 5kg', price: 2000 * multiplier },
            { name: 'Telur Ayam 1 Pack', price: 300 * multiplier },
            { name: 'Susu Murni 1L', price: 200 * multiplier },
            { name: 'Daging Ayam', price: 1000 * multiplier },
            { name: 'Sayur & Buah', price: 1000 * multiplier }
        ]},
        { desc: 'Makan Siang (Matsuya/Warteg)', amount: 600 * multiplier, type: 'expense', cats: ['Makanan'], dayOffset: 1, curr: curr, walletId: w2, items: [] },
        { desc: 'Top-up Kartu Transport', amount: 2000 * multiplier, type: 'expense', cats: ['Transportasi'], dayOffset: 2, curr: curr, walletId: w1, items: [] }
      ];

      // 3. Jika ada lebih dari 1 dompet, simulasikan transfer beda dompet (Tarik tunai)
      if (wallets.length > 1) {
          const dompetAsal = wallets[0];
          const dompetTujuan = wallets[1];
          dummyData.push({
              desc: `Tarik Tunai ${dompetAsal.name} ➞ ${dompetTujuan.name}`,
              amount: 10000 * multiplier,
              type: 'transfer',
              cats: [],
              dayOffset: 4,
              walletId: dompetAsal.id,
              toWalletId: dompetTujuan.id,
              adminFee: 20 * multiplier,
              receivedAmount: 10000 * multiplier,
              currency: dompetAsal.currency,
              targetCurrency: dompetTujuan.currency,
              items: []
          });
      }

      const now = new Date();
      for (const item of dummyData) {
        const dateObj = new Date(now); dateObj.setDate(dateObj.getDate() - item.dayOffset);
        
        const tData = {
          description: item.desc, amount: item.amount, type: item.type, 
          categories: item.cats, category: item.cats[0] || 'Umum', currency: item.currency || item.curr,
          walletId: item.walletId,
          items: item.items,
          date: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          transactionDate: dateObj.getTime(), createdAt: Date.now()
        };

        if (item.type === 'transfer') {
            tData.toWalletId = item.toWalletId;
            tData.adminFee = item.adminFee;
            tData.receivedAmount = item.receivedAmount;
            tData.targetCurrency = item.targetCurrency;
        }

        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), tData);
      }
      setNotification({ type: 'success', message: 'Data demo realistis ditambahkan.' });
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
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400" /> Regional</h3>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Mata Uang Default (Bawaan)</label>
          <div className="relative">
            <select value={defaultCurrency} onChange={(e) => handleSaveSettings('currency', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold">
               {currencies.map(c => <option key={c.code} value={c.code}>{c.code} ({c.name || c.symbol})</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Digunakan untuk dompet baru dan laporan utama.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Manajemen Dompet</h3>
            <button onClick={() => setShowWalletModal(true)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">+ Dompet Baru</button>
        </div>
        <div className="space-y-2">
            {wallets.map(w => (
                <div key={"sett-w-"+w.id} className="flex justify-between items-center bg-gray-50 border border-gray-200 p-3 rounded-xl">
                    <div>
                        <p className="font-bold text-gray-800 text-sm">{w.name} <span className="text-[9px] bg-gray-200 text-gray-600 px-1 rounded ml-1">{w.currency}</span></p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Saldo Awal: {formatCurrency(w.initialBalance, w.currency)}</p>
                    </div>
                    <button onClick={() => handleDeleteWallet(w.id)} className="text-gray-400 hover:text-rose-500 p-1 bg-white rounded-lg shadow-sm border border-gray-100"><Trash2 className="w-4 h-4" /></button>
                </div>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Sparkles className="w-16 h-16 text-purple-600" /></div>
        <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Fitur AI Scan Struk</h3>
        <p className="text-xs text-gray-500 mb-4 pr-10">Masukkan API Key dari Google Gemini untuk mengaktifkan fitur scan otomatis. Data ini aman dan hanya disimpan di HP Anda.</p>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Gemini API Key</label>
          <input 
            type="password" 
            value={geminiKey} 
            onChange={(e) => handleSaveSettings('gemini', e.target.value)} 
            placeholder="AIzaSy..." 
            className="w-full bg-purple-50/50 border border-purple-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono text-sm"
          />
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
              <div className="text-left"><p className="font-medium text-gray-800 text-sm">Export ke Excel</p><p className="text-xs text-gray-400">Unduh file backup</p></div>
            </div>
          </button>
          <button onClick={handleImportClick} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 transition-all group">
             <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors"><Upload className="w-5 h-5 text-emerald-600" /></div>
              <div className="text-left"><p className="font-medium text-gray-800 text-sm">Restore Data</p><p className="text-xs text-gray-400">Kembalikan data dari backup</p></div>
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
        <button onClick={() => setShowResetModal(true)} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2"><Trash2 className="w-5 h-5" /> Reset Semua Data & Dompet</button>
      </div>
      
      <div className="text-center text-[10px] text-gray-300 pb-8">Dompetku Cloud v3.3.0 (Bulletproof Select)</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 md:p-8 pb-24">
      <div className="max-w-md mx-auto relative min-h-screen shadow-xl md:rounded-[2rem] bg-gray-50 overflow-hidden">
        
        {view === 'home' && renderHeader()}
        
        {view !== 'home' && (
            <div className="bg-gradient-to-b from-blue-700 to-indigo-800 px-5 py-4 text-white shadow-md relative overflow-hidden">
                <div className="flex items-center justify-end relative z-10">
                   <div className="flex items-center gap-2">
                       {syncStatus === 'saving' && <RefreshCw className="w-4 h-4 text-blue-200 animate-spin" />}
                       {syncStatus === 'synced' && <Cloud className="w-4 h-4 text-blue-200" />}
                       {syncStatus === 'offline' && <CloudOff className="w-4 h-4 text-rose-300" />}
                   </div>
                </div>
            </div>
        )}
        
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

        {showWalletModal && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Buat Dompet Baru</h3>
                <button onClick={() => setShowWalletModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
              </div>
              <form onSubmit={handleSaveWallet} className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Nama Dompet / Bank</label>
                      <input type="text" autoFocus value={newWalletName} onChange={e=>setNewWalletName(e.target.value)} placeholder="Contoh: BCA, Cash Jepang..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Mata Uang</label>
                          <select value={newWalletCurrency} onChange={e=>setNewWalletCurrency(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                              {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Saldo Awal</label>
                          <input type="number" value={newWalletBalance} onChange={e=>setNewWalletBalance(e.target.value)} placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
                      </div>
                  </div>
                  <button type="submit" disabled={!newWalletName.trim()} className="w-full mt-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50">Simpan Dompet</button>
              </form>
            </div>
          </div>
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

        <div className="px-4 md:px-0">
          {view === 'home' && renderHomeView()}
          {view === 'report' && <div className="mt-4">{renderReportView()}</div>}
          {view === 'settings' && <div className="mt-4">{renderSettingsView()}</div>}
        </div>
        
        {view === 'home' && showFloatingAdd && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-24 right-4 z-40 bg-blue-600 text-white p-3.5 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center animate-in zoom-in duration-200">
            <Plus className="w-6 h-6" />
          </button>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-30 md:max-w-md md:mx-auto md:bottom-4 md:rounded-2xl md:border md:shadow-xl">
          <div className="flex justify-around items-center">
            <button onClick={() => setView('home')} className={"flex flex-col items-center p-2 rounded-xl flex-1 transition-all " + (view === 'home' ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-gray-600")}><List className="w-6 h-6 mb-1" /><span className="text-[10px] font-bold mt-1">Beranda</span></button>
            <button onClick={() => setView('report')} className={"flex flex-col items-center p-2 rounded-xl flex-1 transition-all " + (view === 'report' ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-gray-600")}><FileText className="w-6 h-6 mb-1" /><span className="text-[10px] font-bold mt-1">Laporan</span></button>
            <button onClick={() => setView('settings')} className={"flex flex-col items-center p-2 rounded-xl flex-1 transition-all " + (view === 'settings' ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-gray-600")}><Settings className="w-6 h-6 mb-1" /><span className="text-[10px] font-bold mt-1">Menu</span></button>
          </div>
        </div>
      </div>
    </div>
  );
      }
