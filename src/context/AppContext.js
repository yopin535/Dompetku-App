import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');
  const [notification, setNotification] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [defaultCurrency, setDefaultCurrency] = useState(localStorage.getItem('defaultCurrency') || 'IDR');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [gasUrl, setGasUrl] = useState(localStorage.getItem('gas_drive_url') || '');
  const [hideBalance, setHideBalance] = useState(false);

  const [showFloatingAdd, setShowFloatingAdd] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showDummyModal, setShowDummyModal] = useState(false);

  const [showItemCatModal, setShowItemCatModal] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  const [newCatName, setNewCatName] = useState('');

  const [previewImage, setPreviewImage] = useState(null);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [activeDebtTab, setActiveDebtTab] = useState('lend');

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [installmentDate, setInstallmentDate] = useState('');
  const [installmentWalletId, setInstallmentWalletId] = useState('');

  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioCurrency, setNewPortfolioCurrency] = useState(defaultCurrency);
  const [newPortfolioTargetType, setNewPortfolioTargetType] = useState('amount');
  const [newPortfolioTargetValue, setNewPortfolioTargetValue] = useState('');
  const [newPortfolioDuration, setNewPortfolioDuration] = useState('3_months');
  const [newPortfolioCustomDate, setNewPortfolioCustomDate] = useState('');
  const [showInvestActionModal, setShowInvestActionModal] = useState(false);
  const [investActionType, setInvestActionType] = useState('topup');
  const [activePortfolio, setActivePortfolio] = useState(null);
  const [investAmount, setInvestAmount] = useState('');
  const [showEditPortfolioModal, setShowEditPortfolioModal] = useState(false);
  const [editPortfolioModalData, setEditPortfolioModalData] = useState(null);

  const [reportWalletId, setReportWalletId] = useState('all');

  const [type, setType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [date, setDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [receiptImageUrl, setReceiptImageUrl] = useState(null);
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [adminFee, setAdminFee] = useState('');

  const [debtType, setDebtType] = useState('lend');
  const [personName, setPersonName] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletCurrency, setNewWalletCurrency] = useState(defaultCurrency);
  const [newWalletBalance, setNewWalletBalance] = useState('');

  const [editId, setEditId] = useState(null);
  const [homeViewDate, setHomeViewDate] = useState(new Date());
  const [expandedId, setExpandedId] = useState(null);

  const [reportDate, setReportDate] = useState(new Date());
  const [reportType, setReportType] = useState('monthly');
  const [reportCurrency, setReportCurrency] = useState(defaultCurrency);

  const [isScanning, setIsScanning] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const checkWalletRef = useRef(false);

  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user, setUser,
        transactions, setTransactions,
        customCategories, setCustomCategories,
        wallets, setWallets,
        portfolios, setPortfolios,
        notifications, setNotifications,
        unreadCount, setUnreadCount,
        loading, setLoading,
        view, setView,
        notification, setNotification, showNotification,
        syncStatus, setSyncStatus,
        defaultCurrency, setDefaultCurrency,
        geminiKey, setGeminiKey,
        gasUrl, setGasUrl,
        hideBalance, setHideBalance,
        showFloatingAdd, setShowFloatingAdd,
        showCatModal, setShowCatModal,
        showResetModal, setShowResetModal,
        showWalletModal, setShowWalletModal,
        showDummyModal, setShowDummyModal,
        showItemCatModal, setShowItemCatModal,
        activeItemIndex, setActiveItemIndex,
        newCatName, setNewCatName,
        previewImage, setPreviewImage,
        showDebtModal, setShowDebtModal,
        activeDebtTab, setActiveDebtTab,
        searchQuery, setSearchQuery,
        isSearchOpen, setIsSearchOpen,
        showFilterSheet, setShowFilterSheet,
        filterType, setFilterType,
        sortBy, setSortBy,
        showInstallmentModal, setShowInstallmentModal,
        selectedDebt, setSelectedDebt,
        installmentAmount, setInstallmentAmount,
        installmentDate, setInstallmentDate,
        installmentWalletId, setInstallmentWalletId,
        showPortfolioModal, setShowPortfolioModal,
        newPortfolioName, setNewPortfolioName,
        newPortfolioCurrency, setNewPortfolioCurrency,
        newPortfolioTargetType, setNewPortfolioTargetType,
        newPortfolioTargetValue, setNewPortfolioTargetValue,
        newPortfolioDuration, setNewPortfolioDuration,
        newPortfolioCustomDate, setNewPortfolioCustomDate,
        showInvestActionModal, setShowInvestActionModal,
        investActionType, setInvestActionType,
        activePortfolio, setActivePortfolio,
        investAmount, setInvestAmount,
        showEditPortfolioModal, setShowEditPortfolioModal,
        editPortfolioModalData, setEditPortfolioModalData,
        type, setType,
        description, setDescription,
        amount, setAmount,
        currency, setCurrency,
        date, setDate,
        selectedCategories, setSelectedCategories,
        items, setItems,
        receiptImageUrl, setReceiptImageUrl,
        walletId, setWalletId,
        toWalletId, setToWalletId,
        receivedAmount, setReceivedAmount,
        adminFee, setAdminFee,
        debtType, setDebtType,
        personName, setPersonName,
        dueDate, setDueDate,
        newWalletName, setNewWalletName,
        newWalletCurrency, setNewWalletCurrency,
        newWalletBalance, setNewWalletBalance,
        editId, setEditId,
        homeViewDate, setHomeViewDate,
        expandedId, setExpandedId,
        reportDate, setReportDate,
        reportType, setReportType,
        reportCurrency, setReportCurrency,
        isScanning, setIsScanning,
        uploadStatus, setUploadStatus,
        checkWalletRef,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
