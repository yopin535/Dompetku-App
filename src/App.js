import React, { useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, Wallet, TrendingUp, TrendingDown, DollarSign, 
  Cloud, Loader2, Tag, Calendar, PieChart, List, ChevronLeft, ChevronRight, 
  Download, Upload, FileText, CheckCircle, XCircle, X, Settings, Sparkles,
  LogOut, LogIn, AlertTriangle, User, Check, CloudOff, RefreshCw, Globe, Edit2, Camera,
  ChevronDown, ChevronUp, Receipt, ArrowRightLeft, CreditCard, Landmark, Eye, EyeOff, Image as ImageIcon,
  HandCoins, Users, CheckSquare, Search, SlidersHorizontal, History, LineChart, Briefcase, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import {
  signInAnonymously,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';

// New Architecture Imports
import { auth, googleProvider } from './config/firebase';
import { firebaseService } from './services/firebaseService';
import { formatCurrency, getCurrentDate, CURRENCIES as currencies } from './utils/formatters';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import AppBanner from './components/layout/AppBanner';
import BottomNav from './components/layout/BottomNav';
import Sidebar from './components/layout/Sidebar';
import LoadingOverlay from './components/common/LoadingOverlay';
import Toast from './components/common/Toast';
import ImagePreview from './components/common/ImagePreview';
import FilterSheet from './components/specific/FilterSheet';
import { SkeletonHome } from './components/common/Skeleton';
import WalletModal from './components/modals/WalletModal';
import ResetModal from './components/modals/ResetModal';
import DummyModal from './components/modals/DummyModal';
import CategoryModal from './components/modals/CategoryModal';
import InstallmentModal from './components/modals/InstallmentModal';
import PortfolioModal from './components/modals/PortfolioModal';
import InvestActionModal from './components/modals/InvestActionModal';
import ItemCategoryModal from './components/modals/ItemCategoryModal';
import DebtModal from './components/modals/DebtModal';
import ReportPage from './pages/ReportPage';
import InvestasiPage from './pages/InvestasiPage';
import SettingsPage from './pages/SettingsPage';
import NotificationPage from './pages/NotificationPage';
import { AppProvider, useApp } from './context/AppContext';
import { useTransactions } from './hooks/useTransactions';
import { useWallets } from './hooks/useWallets';
import { useCategories } from './hooks/useCategories';
import { useInvestments } from './hooks/useInvestments';
import { useNotifications } from './hooks/useNotifications';
import EditPortfolioModal from './components/modals/EditPortfolioModal';

function AppContent() {
  const { view, setView, loading, setLoading, notification, setNotification, syncStatus, setSyncStatus, user, setUser, transactions, setTransactions, customCategories, setCustomCategories, wallets, setWallets, portfolios, setPortfolios, notifications, setNotifications, unreadCount, setUnreadCount, showPortfolioModal, setShowPortfolioModal, newPortfolioName, setNewPortfolioName, showInvestActionModal, setShowInvestActionModal, investActionType, setInvestActionType, activePortfolio, setActivePortfolio, investAmount, setInvestAmount, reportWalletId, setReportWalletId } = useApp();
  
  const { defaultCurrency, setDefaultCurrency, geminiKey, setGeminiKey, gasUrl, setGasUrl, hideBalance, setHideBalance, showFloatingAdd, setShowFloatingAdd, showCatModal, setShowCatModal, showResetModal, setShowResetModal, showWalletModal, setShowWalletModal, showDummyModal, setShowDummyModal, showItemCatModal, setShowItemCatModal, activeItemIndex, setActiveItemIndex, newCatName, setNewCatName, previewImage, setPreviewImage, showDebtModal, setShowDebtModal, activeDebtTab, setActiveDebtTab, searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen, showFilterSheet, setShowFilterSheet, filterType, setFilterType, sortBy, setSortBy, showInstallmentModal, setShowInstallmentModal, selectedDebt, setSelectedDebt, installmentAmount, setInstallmentAmount, installmentDate, setInstallmentDate, installmentWalletId, setInstallmentWalletId, newPortfolioCurrency, setNewPortfolioCurrency, newPortfolioTargetType, setNewPortfolioTargetType, newPortfolioTargetValue, setNewPortfolioTargetValue, newPortfolioDuration, setNewPortfolioDuration, newPortfolioCustomDate, setNewPortfolioCustomDate, showEditPortfolioModal, setShowEditPortfolioModal, editPortfolioModalData, setEditPortfolioModalData } = useApp();

  const { type, setType, description, setDescription, amount, setAmount, currency, setCurrency, date, setDate, selectedCategories, setSelectedCategories, items, setItems, receiptImageUrl, setReceiptImageUrl, walletId, setWalletId, toWalletId, setToWalletId, receivedAmount, setReceivedAmount, adminFee, setAdminFee, debtType, setDebtType, personName, setPersonName, dueDate, setDueDate, newWalletName, setNewWalletName, newWalletCurrency, setNewWalletCurrency, newWalletBalance, setNewWalletBalance, editId, setEditId, homeViewDate, setHomeViewDate, expandedId, setExpandedId, reportDate, setReportDate, reportType, setReportType, reportCurrency, setReportCurrency, isScanning, setIsScanning, uploadStatus, setUploadStatus } = useApp();
  const fileInputRef = useRef(null);
  const receiptInputRef = useRef(null);
  const checkWalletRef = useRef(false);

  const {
    walletBalances, totalCashByCurrency, totalInvestmentsByCurrency, totalNetWorthByCurrency,
    activeDebts, settledDebts, debtSummary,
    expenseCategories, incomeCategories,
    processedHomeTransactions, groupedHomeTransactions, homeTransactionsCount, isFlatList,
    toggleExpand, changeHomeMonth, formatCurrency,
  } = useTransactions();

  const { addWallet, deleteWallet } = useWallets();
  const { addCategory, deleteCategory } = useCategories();
  const { addPortfolio, processTopUp, processWithdraw, processUpdateValue } = useInvestments();

  useEffect(() => {
    if(!editId && (type === 'expense' || type === 'income' || type === 'debt')) {
       setSelectedCategories([]);
    }
  }, [type, editId]);

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

    const unsubTrans = firebaseService.subscribeToCollection('transactions', (data, error) => {
      if (error) {
        console.error("Error trans:", error);
        setSyncStatus('offline');
        return;
      }
      data.sort((a, b) => {
        const dateA = a.transactionDate || a.createdAt || 0;
        const dateB = b.transactionDate || b.createdAt || 0;
        return dateB - dateA;
      });
      setTransactions(data);
      setLoading(false);
      if (navigator.onLine) setTimeout(() => setSyncStatus('synced'), 800);
    }, user.uid);

    const unsubCat = firebaseService.subscribeToCollection('categories', (cats) => {
      setCustomCategories(cats);
    }, user.uid);

    const unsubWal = firebaseService.subscribeToCollection('wallets', async (wals) => {
      setWallets(wals);

      if (wals.length === 0 && !checkWalletRef.current) {
          checkWalletRef.current = true;
          try {
              await firebaseService.addWallet({
                  name: 'Dompet Tunai', currency: defaultCurrency, initialBalance: 0
              }, user.uid);
          } catch(e) {}
      }
      setLoading(false);
    }, user.uid);

    // Listener Portfolio Investasi
    const unsubPort = firebaseService.subscribeToCollection('portfolios', (ports) => {
      setPortfolios(ports);
    }, user.uid);

    // Listener Notifikasi
    const unsubNotif = firebaseService.subscribeToCollection('notifications', (notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
    }, user.uid);

    return () => { unsubTrans(); unsubCat(); unsubWal(); unsubPort(); unsubNotif(); };
  }, [user, defaultCurrency]);

  const handleSaveSettings = (key, val) => {
      if(key === 'gemini') {
          setGeminiKey(val); localStorage.setItem('gemini_api_key', val);
      } else if(key === 'gas') {
          setGasUrl(val); localStorage.setItem('gas_drive_url', val);
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
          await addWallet({
              name: newWalletName, currency: newWalletCurrency, initialBalance: parseFloat(newWalletBalance || 0)
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
          await deleteWallet(id);
          setNotification({ type: 'success', message: 'Dompet dihapus.' });
      } catch (error) { setSyncStatus('offline'); }
  };

  const downloadCSV = () => {
    if (transactions.length === 0) { 
      setNotification({ type: 'error', message: 'Tidak ada data untuk diekspor.' }); 
      return; 
    }
    
    const headers = "id,iso_date,tanggal_display,deskripsi,kategori,tipe,mata_uang,jumlah,dompet_asal,dompet_tujuan,biaya_admin,rincian_item,url_struk,debtType,personName,dueDate,status,paidAmount,isSettlement,settledDebtId";
    const csvRows = [headers];
    
    transactions.forEach(t => {
      const dateObj = new Date(t.transactionDate || t.createdAt || Date.now());
      const isoDate = dateObj.toISOString().split('T')[0];
      const catString = t.categories ? t.categories.join(' & ') : (t.category || 'Umum');
      const cleanDesc = (t.description || '').split('"').join('""');
      
      let itemsString = "";
      if (t.items && Array.isArray(t.items) && t.items.length > 0) {
          itemsString = t.items.map(i => {
              const cleanName = (i.name || '').split('"').join('""');
              return cleanName + "::" + (i.price || 0) + "::" + (i.category || '');
          }).join("||");
      }
      
      const row = [
          t.id || '',
          isoDate,
          `"${t.date || ''}"`,
          `"${cleanDesc}"`,
          `"${catString}"`,
          t.type || '',
          (t.currency || 'IDR'),
          t.amount || 0,
          (t.walletId || ''),
          (t.toWalletId || ''),
          (t.adminFee || 0),
          `"${itemsString}"`,
          `"${(t.receiptUrl || '')}"`,
          (t.debtType || ''),
          `"${(t.personName || '')}"`,
          (t.dueDate || ''),
          (t.status || ''),
          (t.paidAmount || 0),
          (t.isSettlement || false),
          (t.settledDebtId || '')
      ].join(",");
      csvRows.push(row);
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Backup_Dompetku_${getCurrentDate()}.csv`);
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
          const rowText = rows[i].trim();
          if (!rowText) continue;
          
          const cols = []; 
          let cur = ''; 
          let inQuote = false;
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
            
            const hasIdCol = cols[0].length > 15;
            const offset = hasIdCol ? 1 : 0;

            const isoDate = clean(cols[offset]);
            const description = clean(cols[offset+2]);
            const categoryRaw = clean(cols[offset+3]);
            const typeRaw = clean(cols[offset+4]);
            const type = typeRaw.includes('income') ? 'income' : (typeRaw.includes('transfer') ? 'transfer' : (typeRaw.includes('debt') ? 'debt' : (typeRaw.includes('invest') ? typeRaw : 'expense')));
            const catsArray = categoryRaw.split(' & ').map(c => c.trim()).filter(Boolean);

            let curr = 'IDR'; 
            let amt = 0; 
            let wId = wallets[0]?.id || ''; 
            let toWId = ''; 
            let aFee = 0; 
            let parsedItems = []; 
            let recUrl = null;
            let debtT = '', pName = '', dDate = '', st = '', pAmt = 0, isSet = false, setDId = '';

            if (cols.length >= offset + 6) {
                curr = clean(cols[offset+5]); 
                amt = parseFloat(clean(cols[offset+6]));
                wId = clean(cols[offset+7]) || wId;
                toWId = clean(cols[offset+8]);
                aFee = parseFloat(clean(cols[offset+9]) || 0);
                const itemsRaw = clean(cols[offset+10]);
                if (itemsRaw) parsedItems = itemsRaw.split('||').map(itemStr => { 
                    const parts = itemStr.split('::'); 
                    return { name: parts[0] || 'Item', price: parseFloat(parts[1]) || 0, category: parts[2] || '' }; 
                });
                recUrl = clean(cols[offset+11]);
                
                debtT = clean(cols[offset+12]);
                pName = clean(cols[offset+13]);
                dDate = clean(cols[offset+14]);
                st = clean(cols[offset+15]);
                pAmt = parseFloat(clean(cols[offset+16]) || 0);
                isSet = clean(cols[offset+17]) === 'true';
                setDId = clean(cols[offset+18]);
            }
            
            if (isoDate && description && !isNaN(amt)) {
              const dateObj = new Date(isoDate);
              await firebaseService.addTransaction({
                description, amount: amt, type,
                categories: catsArray.length > 0 ? catsArray : ['Umum'],
                category: catsArray[0] || 'Umum',
                currency: curr, walletId: wId, toWalletId: toWId, adminFee: aFee, items: parsedItems,
                receiptUrl: recUrl,
                debtType: debtT, personName: pName, dueDate: dDate, status: st, paidAmount: pAmt,
                isSettlement: isSet, settledDebtId: setDId,
                date: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                transactionDate: dateObj.getTime(), createdAt: Date.now()
              }, user.uid);
              importedCount++;
            }
          }
        }
        setLoading(false); 
        setNotification({ type: 'success', message: `Berhasil mengimpor ${importedCount} transaksi.` });
        e.target.value = null;
      } catch (error) {
        console.error(error);
        setLoading(false); 
        setNotification({ type: 'error', message: 'Gagal membaca file CSV.' });
      } finally { 
        setSyncStatus('synced'); 
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    if (!user) return;
    setLoading(true); 
    setSyncStatus('saving'); 
    setShowResetModal(false);
    try {
      await firebaseService.resetData(user.uid);
      setTransactions([]); 
      setCustomCategories([]); 
      setWallets([]);
      setPortfolios([]);
      setNotification({ type: 'success', message: 'Semua data berhasil direset.' });
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: 'Gagal mereset data.' });
    } finally { 
      setLoading(false); 
      setSyncStatus('synced'); 
    }
  };

  const generateDemoPortfolios = async () => {
    if (!user) return;
    setLoading(true);
    setSyncStatus('saving');
    try {
      const demoPortfolios = [
        {
          name: "Saham BBCA",
          currency: "IDR",
          totalInvested: 10000000,
          currentValue: 11500000,
          targetReturn: 15000000,
          targetReturnType: "amount",
          targetDuration: "3_months",
        },
        {
          name: "Kripto Bitcoin",
          currency: "USD",
          totalInvested: 5000,
          currentValue: 6000,
          targetReturn: 7000,
          targetReturnType: "amount",
          targetDuration: "6_months",
        },
        {
          name: "Reksa Dana Equity",
          currency: "IDR",
          totalInvested: 50000000,
          currentValue: 55000000,
          targetReturn: 60000000,
          targetReturnType: "percentage",
          targetDuration: "3_months",
        },
        {
          name: "Kripto Ethereum",
          currency: "USD",
          totalInvested: 3000,
          currentValue: 3500,
          targetReturn: 4000,
          targetReturnType: "amount",
          targetDuration: "custom",
          targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime(),
        },
      ];

      for (const portfolio of demoPortfolios) {
        await firebaseService.addPortfolio({
          ...portfolio,
          createdAt: Date.now(),
        });
      }

      setNotification({ type: 'success', message: 'Demo portofolio berhasil dibuat. Target akan dicek setelah transaksi.' });
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: 'Gagal membuat demo data.' });
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
      const w1 = wallets[0]?.id || '';
      const w2 = wallets.length > 1 ? wallets[1].id : w1;
      
      const isIDR = defaultCurrency === 'IDR';
      const multiplier = isIDR ? 100 : 1; 
      const baseSalary = isIDR ? 5000000 : 250000;
      const curr = defaultCurrency;

      const dummyData = [
        { desc: 'Gaji Bulanan', amount: baseSalary, type: 'income', cats: ['Gaji'], dayOffset: 6, curr: curr, walletId: w1, items: [] },
        { desc: 'Belanja Supermarket', amount: 4500 * multiplier, type: 'expense', cats: ['Belanja', 'Makanan'], dayOffset: 3, curr: curr, walletId: w2, items: [
            { name: 'Beras 5kg', price: 2000 * multiplier, category: 'Makanan' },
            { name: 'Telur Ayam 1 Pack', price: 300 * multiplier, category: 'Makanan' },
            { name: 'Susu Murni 1L', price: 200 * multiplier, category: 'Makanan' },
            { name: 'Daging Ayam', price: 1000 * multiplier, category: 'Makanan' },
            { name: 'Sabun & Odol', price: 1000 * multiplier, category: 'Belanja' }
        ]},
        { desc: 'Makan Siang Resto', amount: 600 * multiplier, type: 'expense', cats: ['Makanan'], dayOffset: 1, curr: curr, walletId: w2, items: [] },
        { desc: 'Top-up Saldo Transport', amount: 2000 * multiplier, type: 'expense', cats: ['Transportasi'], dayOffset: 2, curr: curr, walletId: w1, items: [] }
      ];

      const now = new Date();
      for (const item of dummyData) {
        const dateObj = new Date(now); 
        dateObj.setDate(dateObj.getDate() - item.dayOffset);
        
        const tData = {
          description: item.desc, 
          amount: item.amount, 
          type: item.type, 
          categories: item.cats, 
          category: item.cats[0] || 'Umum', 
          currency: item.curr,
          walletId: item.walletId,
          items: item.items,
          date: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          transactionDate: dateObj.getTime(), 
          createdAt: Date.now()
        };

        await firebaseService.addTransaction(tData, user.uid);
      }

      // Demo portfolios with targets
      const demoPortfolios = [
        {
          name: "Saham BBCA",
          currency: "IDR",
          totalInvested: 10000000,
          currentValue: 11500000,
          targetReturn: 15000000,
          targetReturnType: "amount",
          targetDuration: "3_months",
        },
        {
          name: "Kripto Bitcoin",
          currency: "USD",
          totalInvested: 5000,
          currentValue: 6000,
          targetReturn: 7000,
          targetReturnType: "amount",
          targetDuration: "6_months",
        },
        {
          name: "Reksa Dana Equity",
          currency: "IDR",
          totalInvested: 50000000,
          currentValue: 55000000,
          targetReturn: 60000000,
          targetReturnType: "percentage",
          targetDuration: "3_months",
        },
        {
          name: "Kripto Ethereum",
          currency: "USD",
          totalInvested: 3000,
          currentValue: 3500,
          targetReturn: 4000,
          targetReturnType: "amount",
          targetDuration: "custom",
          targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime(),
        },
      ];

      for (const portfolio of demoPortfolios) {
        await firebaseService.addPortfolio({
          ...portfolio,
          createdAt: Date.now(),
        });
      }

      setNotification({ type: 'success', message: 'Data demo lengkap (transaksi + portofolio target) berhasil ditambahkan.' });
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: 'Gagal membuat demo data.' });
    } finally { 
      setLoading(false); 
      setSyncStatus('synced'); 
    }
  };

  const compressImage = (file) => {
      return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
              const img = new Image();
              img.src = event.target.result;
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const MAX_WIDTH = 800; 
                  let width = img.width;
                  let height = img.height;
                  if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
                  canvas.width = width; canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, width, height);
                  resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
              };
          };
      });
  };

  const handleScanReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!geminiKey) { setNotification({ type: 'error', message: 'Isi Gemini API Key di Pengaturan!' }); e.target.value = null; return; }

    setIsScanning(true);
    
    try {
        setUploadStatus('Mengompres gambar...');
        const base64Data = await compressImage(file);
        
        let uploadedImageUrl = null;
        if (gasUrl) {
            setUploadStatus('Menyimpan ke Drive...');
            try {
                const response = await fetch(gasUrl, {
                    method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ base64: base64Data, name: `Struk_${Date.now()}.jpg` })
                });
                const data = await response.json();
                if (data.status === 'success') {
                    uploadedImageUrl = data.url;
                    setReceiptImageUrl(data.url);
                }
            } catch (err) {
                console.error("Gagal simpan ke Drive:", err);
                setNotification({ type: 'error', message: 'Gagal upload ke Drive. AI tetap berjalan.' });
            }
        }

        setUploadStatus('AI sedang menganalisis...');
        const prompt = "Ekstrak data dari gambar struk/receipt belanja ini. Jika bahasa asing, biarkan namanya atau terjemahkan sedikit agar mudah dimengerti. " +
        "Kembalikan HANYA format JSON MURNI tanpa markdown. Formatnya harus: " +
        "{\"desc\": \"Nama Toko/Restoran\", \"total\": angka_tanpa_simbol, \"tgl\": \"YYYY-MM-DD\", \"curr\": \"KODE_MATA_UANG\", \"items\": [{\"n\": \"Nama Barang\", \"p\": harga_angka_bulat}]} " +
        "Catatan: 'total' dan 'p' harus NUMBER. Pajak/diskon masukkan sebagai item tersendiri di dalam list items.";

        const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiKey, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: base64Data } }] }] })
        });

        const data = await aiResponse.json();
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
            setItems(result.items.map(item => ({ name: item.n || 'Item', price: item.p || 0, category: '' })));
        } else { setItems([]); }
        
        setType('expense'); setEditId(null);
        setNotification({ type: 'success', message: 'Struk berhasil dibaca!' });

    } catch (error) {
        console.error("AI Scan Error:", error);
        setNotification({ type: 'error', message: "Gagal membaca struk." });
    } finally {
        setIsScanning(false); setUploadStatus(''); e.target.value = null; 
    }
  };

  const handleAddItem = () => setItems([...items, { name: '', price: '', category: '' }]);
  
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

  const handleOpenItemCatModal = (index) => {
      setActiveItemIndex(index);
      setShowItemCatModal(true);
  };

  const handleSelectItemCategory = (cat) => {
      if (activeItemIndex !== null) {
          const newItems = [...items];
          newItems[activeItemIndex].category = cat;
          setItems(newItems);
      }
      setShowItemCatModal(false);
      setActiveItemIndex(null);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const newCat = newCatName.trim();
    if (!newCat || !user) return;
    setSyncStatus('saving');
    try {
      await addCategory(newCat, type);
      setSelectedCategories([newCat]);
      setNewCatName(''); setNotification({ type: 'success', message: 'Kategori ditambahkan.' }); setShowCatModal(false);
    } catch (error) { setSyncStatus('offline'); }
  };

  const handleDeleteCategory = async (catId) => {
    if (!user) return;
    setSyncStatus('saving');
    try {
      await deleteCategory(catId);
      setNotification({ type: 'success', message: 'Kategori dihapus.' });
    } catch (error) { setSyncStatus('offline'); }
  };

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== cat));
      } else {
        setSelectedCategories([]); 
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    
    if (!walletId) {
        setNotification({ type: 'error', message: 'Pilih Dompet / Sumber Dana terlebih dahulu!' });
        return;
    }
    if (!amount || !date || !user) return;
    
    if (type === 'transfer') {
        if(!toWalletId || walletId === toWalletId) {
            setNotification({ type: 'error', message: 'Pilih dompet tujuan yang berbeda!' }); return;
        }
    } else if (type === 'debt') {
        if (!personName.trim()) {
            setNotification({ type: 'error', message: 'Nama teman/orang wajib diisi!' }); return;
        }
    } else {
        if(!description) {
            setNotification({ type: 'error', message: 'Deskripsi tidak boleh kosong!' }); return;
        }
        if(selectedCategories.length === 0) {
            setNotification({ type: 'error', message: 'Pilih minimal 1 Kategori!' }); return;
        }
    }

    setSyncStatus('saving');
    try {
      const selectedDate = new Date(date);
      
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
          
          if (wAsal?.currency !== wTujuan?.currency) transactionData.receivedAmount = parseFloat(receivedAmount || amount);
          else transactionData.receivedAmount = parseFloat(amount);
      } else if (type === 'debt') {
          transactionData.debtType = debtType;
          transactionData.personName = personName;
          transactionData.dueDate = dueDate;
          transactionData.status = 'unpaid';
          transactionData.paidAmount = 0; 
          transactionData.description = (debtType === 'lend' ? "Meminjamkan ke: " : "Pinjaman dari: ") + personName;
          transactionData.category = 'Utang/Piutang';
          transactionData.categories = ['Utang/Piutang'];
          transactionData.currency = wallets.find(w=>w.id === walletId)?.currency || defaultCurrency;
      } else {
          const cleanItems = items.filter(i => i.name.trim() !== '' || i.price !== '');
          transactionData.description = description;
          transactionData.categories = selectedCategories;
          transactionData.category = selectedCategories[0] || 'Umum';
          transactionData.currency = wallets.find(w=>w.id === walletId)?.currency || defaultCurrency;
          transactionData.items = cleanItems;
          if (receiptImageUrl) transactionData.receiptUrl = receiptImageUrl; 
      }

      if (editId) {
        await firebaseService.updateTransaction(editId, transactionData, user.uid);
        setNotification({ type: 'success', message: 'Transaksi diperbarui.' }); 
        setEditId(null);
      } else {
        transactionData.createdAt = Date.now();
        await firebaseService.addTransaction(transactionData, user.uid);
        setNotification({ type: 'success', message: 'Tersimpan.' });
      }
      
      setHomeViewDate(selectedDate); setDescription(''); setAmount(''); setDate(getCurrentDate()); setItems([]);
      setReceivedAmount(''); setAdminFee(''); setReceiptImageUrl(null);
      setPersonName(''); setDueDate('');
      setWalletId(''); 
      setSelectedCategories([]); 
    } catch (error) {
      setNotification({ type: 'error', message: editId ? 'Gagal memperbarui.' : 'Gagal menyimpan.' });
      setSyncStatus('offline');
    }
  };

  const processInstallment = async () => {
      if (!user || !selectedDebt) return;
      const payVal = parseFloat(installmentAmount);
      
      if (!installmentWalletId) {
          setNotification({ type: 'error', message: 'Pilih dompet tujuan/sumber cicilan!' });
          return;
      }
      if (!payVal || payVal <= 0) {
          setNotification({ type: 'error', message: 'Nominal tidak valid!' });
          return;
      }

      setSyncStatus('saving');
      try {
          const currentPaid = selectedDebt.paidAmount || 0;
          const newPaid = currentPaid + payVal;
          const isFullyPaid = newPaid >= selectedDebt.amount;

          await firebaseService.updateTransaction(selectedDebt.id, {
              paidAmount: newPaid,
              ...(isFullyPaid ? { status: 'paid', paidAt: Date.now() } : {})
          }, user.uid);

          const d = installmentDate ? new Date(installmentDate) : new Date();
          
          const tData = {
              amount: payVal, 
              type: selectedDebt.debtType === 'lend' ? 'income' : 'expense',
              walletId: installmentWalletId,
              currency: selectedDebt.currency,
              description: `Cicilan/Bayar: ${selectedDebt.personName} ` + (isFullyPaid ? '(Lunas)' : ''),
              category: 'Pelunasan',
              categories: ['Pelunasan'],
              date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
              transactionDate: d.getTime(),
              createdAt: Date.now(),
              isSettlement: true,
              settledDebtId: selectedDebt.id
          };
          await firebaseService.addTransaction(tData, user.uid);
          
          setNotification({type: 'success', message: isFullyPaid ? 'Utang lunas sepenuhnya!' : 'Cicilan berhasil dicatat.'});
          setShowInstallmentModal(false);
          setSelectedDebt(null);
          setInstallmentAmount('');
          
          if (isFullyPaid && activeDebts.length <= 1) setShowDebtModal(false);
      } catch (e) {
          console.error(e);
          setNotification({type: 'error', message: 'Gagal memproses cicilan.'});
          setSyncStatus('offline');
      }
  };

  const handleSavePortfolio = async (e) => {
      e.preventDefault();
      if (!newPortfolioName || !user) return;
      setSyncStatus('saving');
      try {
          const data = {
              name: newPortfolioName,
              currency: newPortfolioCurrency || defaultCurrency,
              totalInvested: 0,
              currentValue: 0,
              createdAt: Date.now(),
              alertsTriggered: []
          };

          if (newPortfolioTargetValue) {
            data.targetReturn = parseFloat(newPortfolioTargetValue);
            data.targetReturnType = newPortfolioTargetType;
            data.targetDuration = newPortfolioDuration;
          }

          await addPortfolio(data);
          setNewPortfolioName('');
          setNewPortfolioTargetValue('');
          setNewPortfolioDuration('3_months');
          setShowPortfolioModal(false);
          setNotification({ type: 'success', message: 'Portofolio investasi dibuat.' });
      } catch (error) { setSyncStatus('offline'); }
  };

  const handleUpdatePortfolio = async (id, data) => {
    if (!user) return;
    setSyncStatus('saving');
    try {
      const updateData = {
        ...data,
        targetReturn: data.targetReturn ? parseFloat(data.targetReturn) : null,
        targetReturnType: data.targetReturnType,
        targetDuration: data.targetDuration,
        targetEndDate: data.targetEndDate
      };
      await firebaseService.updatePortfolio(id, updateData);
      setShowEditPortfolioModal(false);
      setNotification({ type: 'success', message: 'Portofolio diperbarui.' });
    } catch (error) { 
      setSyncStatus('offline'); 
      setNotification({ type: 'error', message: 'Gagal memperbarui portofolio.' });
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (!user) return;
    setSyncStatus('saving');
    try {
      await firebaseService.deletePortfolio(id);
      setNotification({ type: 'success', message: 'Portofolio dihapus.' });
    } catch (error) { 
      setSyncStatus('offline'); 
      setNotification({ type: 'error', message: 'Gagal menghapus portofolio.' });
    }
  };

  const processInvestAction = async () => {
      if (!user || !activePortfolio) return;

      setSyncStatus('saving');
      try {
          if (investActionType === 'update') {
              await processUpdateValue(activePortfolio, investAmount);
              setNotification({type: 'success', message: 'Nilai portofolio diperbarui.'});
          } else if (investActionType === 'topup') {
              await processTopUp(activePortfolio, investAmount, walletId, date);
              setNotification({type: 'success', message: 'Berhasil Top Up Modal'});
          } else {
              await processWithdraw(activePortfolio, investAmount, walletId, date);
              setNotification({type: 'success', message: 'Dana berhasil ditarik'});
          }
          setShowInvestActionModal(false);
          setInvestAmount('');
          setDate(getCurrentDate());
          setWalletId('');
      } catch (e) {
          console.error(e);
          setNotification({type: 'error', message: e.message || 'Gagal memproses investasi.'});
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
    } else if (t.type === 'debt') {
        setDebtType(t.debtType || 'lend');
        setPersonName(t.personName || '');
        setDueDate(t.dueDate || '');
    } else {
        setDescription(t.description); 
        setReceiptImageUrl(t.receiptUrl || null);
        if(t.items && Array.isArray(t.items)) setItems(t.items); else setItems([]);
        
        let cats = [];
        if (t.categories && Array.isArray(t.categories) && t.categories.length > 0) cats = t.categories;
        else if (t.category) cats = [t.category];
        setSelectedCategories(cats); 
    }
    
    const d = new Date(t.transactionDate || t.createdAt);
    setDate(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null); setDescription(''); setAmount(''); setDate(getCurrentDate()); setItems([]);
    setReceivedAmount(''); setAdminFee(''); setReceiptImageUrl(null);
    setWalletId(''); setSelectedCategories([]);
    setPersonName(''); setDueDate('');
  };

  const handleDelete = async (id) => {
    if (!user) return;
    try { await firebaseService.deleteTransaction(id, user.uid); } catch (error) {}
  };

  const changeReportPeriod = (increment) => {
    setReportDate(prevDate => {
        const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
        if (reportType === 'yearly') newDate.setFullYear(newDate.getFullYear() + increment);
        else if (reportType === 'monthly') {
            newDate.setMonth(newDate.getMonth() + increment);
            newDate.setDate(1); 
        }
        else if (reportType === 'weekly') newDate.setDate(newDate.getDate() + (increment * 7));
        else if (reportType === 'daily') newDate.setDate(newDate.getDate() + increment);
        return newDate;
    });
  };

  const getLabelClass = (cat) => {
    if (!selectedCategories.includes(cat)) return "bg-white text-gray-600 border-gray-200 hover:border-gray-300";
    return type === 'expense' 
      ? "bg-rose-600 text-white border-rose-600 shadow-sm" 
      : "bg-emerald-600 text-white border-emerald-600 shadow-sm";
  };

  const filteredByPeriod = useMemo(() => {
    return transactions.filter(t => {
      if (!t) return false;
      const typeStr = t.type || '';
      if (typeStr === 'debt' || typeStr.includes('invest')) return false; 
      
      const tDate = new Date(t.transactionDate || t.createdAt || Date.now());
      
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

  const reportTransactions = useMemo(() => {
    return filteredByPeriod.filter(t => {
        if ((t.currency || 'IDR') !== reportCurrency) return false;
        if (reportWalletId !== 'all') {
            if (t.walletId !== reportWalletId && t.toWalletId !== reportWalletId) return false;
        }
        return true;
    });
  }, [filteredByPeriod, reportCurrency, reportWalletId]);

  const categoryStats = useMemo(() => {
    const stats = {}; let totalExpense = 0;
    
    reportTransactions.forEach(t => {
      if (t.type === 'expense') { 
        if (t.items && Array.isArray(t.items) && t.items.length > 0) {
            let itemsTotal = 0;
            t.items.forEach(item => {
                const itemPrice = parseFloat(item.price) || 0;
                const itemCat = item.category || (t.categories && t.categories.length > 0 ? t.categories[0] : (t.category || 'Umum'));
                
                stats[itemCat] = (stats[itemCat] || 0) + itemPrice;
                totalExpense += itemPrice;
                itemsTotal += itemPrice;
            });
            const diff = parseFloat(t.amount || 0) - itemsTotal;
            if (diff > 0) {
                const primaryCat = (t.categories && t.categories.length > 0) ? t.categories[0] : (t.category || 'Umum');
                stats[primaryCat] = (stats[primaryCat] || 0) + diff;
                totalExpense += diff;
            }
        } else {
            const primaryCat = (t.categories && t.categories.length > 0) ? t.categories[0] : (t.category || 'Umum');
            stats[primaryCat] = (stats[primaryCat] || 0) + parseFloat(t.amount || 0); 
            totalExpense += parseFloat(t.amount || 0); 
        }
      } else if (t.type === 'transfer' && t.adminFee > 0) {
        stats['Biaya Admin'] = (stats['Biaya Admin'] || 0) + parseFloat(t.adminFee);
        totalExpense += parseFloat(t.adminFee);
      }
    });
    
    return Object.keys(stats)
        .map(cat => ({ name: cat, amount: stats[cat], percentage: totalExpense > 0 ? (stats[cat] / totalExpense) * 100 : 0 }))
        .sort((a, b) => b.amount - a.amount);
  }, [reportTransactions]);

  const reportSummary = useMemo(() => {
    const inc = reportTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
    const exp = reportTransactions.reduce((acc, curr) => {
        if(curr.type === 'expense') return acc + parseFloat(curr.amount || 0);
        if(curr.type === 'transfer' && curr.adminFee > 0) return acc + parseFloat(curr.adminFee);
        return acc;
    }, 0);
    return { income: inc, expense: exp, balance: inc - exp };
  }, [reportTransactions]);

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

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 md:p-8 pb-24 lg:pb-8 relative">
      <div className="max-w-md lg:max-w-7xl mx-auto relative min-h-screen shadow-xl md:rounded-[2rem] bg-gray-50 overflow-hidden">
        <div className="lg:flex lg:gap-6 lg:p-6">
          <Sidebar view={view} setView={setView} />
          <div className="flex-1 min-w-0">
        
        {view === 'home' && (
          <Header
            user={user}
            defaultCurrency={defaultCurrency}
            hideBalance={hideBalance}
            setHideBalance={setHideBalance}
            totalNetWorthByCurrency={totalNetWorthByCurrency}
            totalCashByCurrency={totalCashByCurrency}
            totalInvestmentsByCurrency={totalInvestmentsByCurrency}
            formatCurrency={formatCurrency}
            syncStatus={syncStatus}
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            sortBy={sortBy}
            setShowFilterSheet={setShowFilterSheet}
            setView={setView}
            unreadCount={unreadCount}
          />
        )}
        
        {view !== 'home' && <AppBanner syncStatus={syncStatus} />}
        
        <LoadingOverlay open={loading} />
        
        <Toast notification={notification} />

        <FilterSheet
          open={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          filterType={filterType}
          setFilterType={setFilterType}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />

        <InstallmentModal
          open={showInstallmentModal}
          onClose={() => setShowInstallmentModal(false)}
          selectedDebt={selectedDebt}
          installmentAmount={installmentAmount}
          setInstallmentAmount={setInstallmentAmount}
          installmentDate={installmentDate}
          setInstallmentDate={setInstallmentDate}
          installmentWalletId={installmentWalletId}
          setInstallmentWalletId={setInstallmentWalletId}
          wallets={wallets}
          onSubmit={processInstallment}
          formatCurrency={formatCurrency}
        />

        <DebtModal
          open={showDebtModal}
          onClose={() => setShowDebtModal(false)}
          debtSummary={debtSummary}
          activeDebtTab={activeDebtTab}
          setActiveDebtTab={setActiveDebtTab}
          activeDebts={activeDebts}
          settledDebts={settledDebts}
          formatCurrency={formatCurrency}
          defaultCurrency={defaultCurrency}
          wallets={wallets}
          getCurrentDate={getCurrentDate}
          setSelectedDebt={setSelectedDebt}
          setInstallmentAmount={setInstallmentAmount}
          setInstallmentDate={setInstallmentDate}
          setInstallmentWalletId={setInstallmentWalletId}
          setShowInstallmentModal={setShowInstallmentModal}
        />
        <PortfolioModal
          open={showPortfolioModal}
          onClose={() => setShowPortfolioModal(false)}
          newPortfolioName={newPortfolioName}
          setNewPortfolioName={setNewPortfolioName}
          newPortfolioCurrency={newPortfolioCurrency}
          setNewPortfolioCurrency={setNewPortfolioCurrency}
          newPortfolioTargetType={newPortfolioTargetType}
          setNewPortfolioTargetType={setNewPortfolioTargetType}
          newPortfolioTargetValue={newPortfolioTargetValue}
          setNewPortfolioTargetValue={setNewPortfolioTargetValue}
          newPortfolioDuration={newPortfolioDuration}
          setNewPortfolioDuration={setNewPortfolioDuration}
          newPortfolioCustomDate={newPortfolioCustomDate}
          setNewPortfolioCustomDate={setNewPortfolioCustomDate}
          onSave={handleSavePortfolio}
        />
        <EditPortfolioModal
          open={showEditPortfolioModal}
          onClose={() => setShowEditPortfolioModal(false)}
          portfolio={editPortfolioModalData}
          onSave={handleUpdatePortfolio}
          onDelete={handleDeletePortfolio}
        />
        <InvestActionModal
          open={showInvestActionModal}
          onClose={() => setShowInvestActionModal(false)}
          activePortfolio={activePortfolio}
          investActionType={investActionType}
          investAmount={investAmount}
          setInvestAmount={setInvestAmount}
          walletId={walletId}
          setWalletId={setWalletId}
          date={date}
          setDate={setDate}
          wallets={wallets}
          defaultCurrency={defaultCurrency}
          onSubmit={processInvestAction}
        />
        <ItemCategoryModal
          open={showItemCatModal}
          onClose={() => { setShowItemCatModal(false); setActiveItemIndex(null); }}
          categories={type === 'expense' ? expenseCategories : incomeCategories}
          onSelect={handleSelectItemCategory}
        />
        <DummyModal open={showDummyModal} onClose={() => setShowDummyModal(false)} onConfirm={confirmGenerateDummy} />
        <ResetModal open={showResetModal} onClose={() => setShowResetModal(false)} onConfirm={handleResetData} />
        <WalletModal
          open={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          newWalletName={newWalletName}
          setNewWalletName={setNewWalletName}
          newWalletCurrency={newWalletCurrency}
          setNewWalletCurrency={setNewWalletCurrency}
          newWalletBalance={newWalletBalance}
          setNewWalletBalance={setNewWalletBalance}
          onSave={handleSaveWallet}
        />
        <CategoryModal
          open={showCatModal}
          onClose={() => setShowCatModal(false)}
          type={type}
          newCatName={newCatName}
          setNewCatName={setNewCatName}
          onSave={handleSaveCategory}
          customCategories={customCategories}
          onDelete={handleDeleteCategory}
        />
        <div className="px-4 md:px-0">
          {view === 'home' && (loading && transactions.length === 0 ? <SkeletonHome /> : (
            <HomePage
              wallets={wallets}
              walletBalances={walletBalances}
              hideBalance={hideBalance}
              formatCurrency={formatCurrency}
              onAddWallet={() => setShowWalletModal(true)}
              isScanning={isScanning} uploadStatus={uploadStatus} editId={editId} type={type} setType={setType}
              receiptInputRef={receiptInputRef} handleScanReceipt={handleScanReceipt} handleAddTransaction={handleAddTransaction}
              walletId={walletId} setWalletId={setWalletId} toWalletId={toWalletId} setToWalletId={setToWalletId}
              amount={amount} setAmount={setAmount} receivedAmount={receivedAmount} setReceivedAmount={setReceivedAmount} adminFee={adminFee} setAdminFee={setAdminFee}
              date={date} setDate={setDate} debtType={debtType} setDebtType={setDebtType} personName={personName} setPersonName={setPersonName} dueDate={dueDate} setDueDate={setDueDate}
              description={description} setDescription={setDescription} receiptImageUrl={receiptImageUrl} setReceiptImageUrl={setReceiptImageUrl} setPreviewImage={setPreviewImage}
              items={items} handleAddItem={handleAddItem} handleItemChange={handleItemChange} handleRemoveItem={handleRemoveItem} handleOpenItemCatModal={handleOpenItemCatModal}
              selectedCategories={selectedCategories} expenseCategories={expenseCategories} incomeCategories={incomeCategories} toggleCategory={toggleCategory} getLabelClass={getLabelClass} setShowCatModal={setShowCatModal}
              cancelEdit={cancelEdit} user={user} loading={loading} defaultCurrency={defaultCurrency}
              groupedHomeTransactions={groupedHomeTransactions}
              homeTransactionsCount={homeTransactionsCount}
              homeViewDate={homeViewDate}
              changeHomeMonth={changeHomeMonth}
              searchQuery={searchQuery}
              filterType={filterType}
              sortBy={sortBy}
              isFlatList={isFlatList}
              expandedId={expandedId}
              onToggleExpand={toggleExpand}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          ))}
          {view === 'report' && (
            <div className="mt-4">
              <ReportPage
                reportType={reportType}
                setReportType={setReportType}
                wallets={wallets}
                reportWalletId={reportWalletId}
                setReportWalletId={setReportWalletId}
                changeReportPeriod={changeReportPeriod}
                getReportTitle={getReportTitle}
                formatCurrency={formatCurrency}
                reportSummary={reportSummary}
                reportCurrency={reportCurrency}
                transactions={transactions}
                defaultCurrency={defaultCurrency}
                categoryStats={categoryStats}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                reportTransactions={reportTransactions}
                setReportCurrency={setReportCurrency}
              />
            </div>
          )}
          {view === 'investments' && (
            <div className="mt-4">
              <InvestasiPage
                portfolios={portfolios}
                hideBalance={hideBalance}
                formatCurrency={formatCurrency}
                defaultCurrency={defaultCurrency}
                setShowPortfolioModal={setShowPortfolioModal}
                setActivePortfolio={setActivePortfolio}
                setInvestActionType={setInvestActionType}
                setShowInvestActionModal={setShowInvestActionModal}
                setShowEditPortfolioModal={setShowEditPortfolioModal}
                onDeletePortfolio={handleDeletePortfolio}
              />
            </div>
          )}
          {view === 'settings' && (
            <div className="mt-4">
              <SettingsPage
                setShowDebtModal={setShowDebtModal}
                activeDebts={activeDebts}
                user={user}
                handleGoogleLogin={handleGoogleLogin}
                handleLogout={handleLogout}
                defaultCurrency={defaultCurrency}
                handleSaveSettings={handleSaveSettings}
                currencies={currencies}
                wallets={wallets}
                formatCurrency={formatCurrency}
                handleDeleteWallet={handleDeleteWallet}
                setShowWalletModal={setShowWalletModal}
                geminiKey={geminiKey}
                gasUrl={gasUrl}
                setType={setType}
                setShowCatModal={setShowCatModal}
                transactions={transactions}
                downloadCSV={downloadCSV}
                handleImportClick={handleImportClick}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                setShowDummyModal={setShowDummyModal}
                setShowResetModal={setShowResetModal}
              />
            </div>
          )}
        </div>
        
        {view === 'home' && showFloatingAdd && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-24 right-4 z-40 bg-blue-600 text-white p-3.5 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center animate-in zoom-in duration-200">
            <Plus className="w-6 h-6" />
          </button>
        )}

        <div className="lg:hidden">
          <BottomNav view={view} setView={setView} />
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
