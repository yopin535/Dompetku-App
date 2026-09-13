import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, defaultExpenseCategories, defaultIncomeCategories } from '../utils/formatters';

export function useTransactions() {
  const {
    transactions, setTransactions,
    wallets, portfolios, defaultCurrency,
    customCategories,
    homeViewDate, setHomeViewDate,
    searchQuery, setSearchQuery,
    filterType, setFilterType,
    sortBy, setSortBy,
    expandedId, setExpandedId,
    loading, syncStatus
  } = useApp();

  const expenseCategories = useMemo(() => {
    const custom = customCategories.filter(c => c && c.type === 'expense').map(c => c.name);
    return [...defaultExpenseCategories, ...custom];
  }, [customCategories]);

  const incomeCategories = useMemo(() => {
    const custom = customCategories.filter(c => c && c.type === 'income').map(c => c.name);
    return [...defaultIncomeCategories, ...custom];
  }, [customCategories]);

  const walletBalances = useMemo(() => {
    const balances = {};
    wallets.forEach(w => balances[w.id] = parseFloat(w.initialBalance || 0));

    transactions.forEach(t => {
      const tType = t.type || '';
      if (tType === 'income') {
        if (balances[t.walletId] !== undefined) balances[t.walletId] += parseFloat(t.amount || 0);
      } else if (tType === 'expense') {
        if (balances[t.walletId] !== undefined) balances[t.walletId] -= parseFloat(t.amount || 0);
      } else if (tType === 'transfer') {
        if (balances[t.walletId] !== undefined) {
          balances[t.walletId] -= (parseFloat(t.amount || 0) + parseFloat(t.adminFee || 0));
        }
        if (balances[t.toWalletId] !== undefined) {
          balances[t.toWalletId] += parseFloat(t.receivedAmount || t.amount || 0);
        }
      } else if (tType === 'debt') {
        if (t.debtType === 'lend' && balances[t.walletId] !== undefined) balances[t.walletId] -= parseFloat(t.amount || 0);
        if (t.debtType === 'borrow' && balances[t.walletId] !== undefined) balances[t.walletId] += parseFloat(t.amount || 0);
      } else if (tType === 'invest_deposit' && balances[t.walletId] !== undefined) {
        balances[t.walletId] -= parseFloat(t.amount || 0);
      } else if (tType === 'invest_withdraw' && balances[t.walletId] !== undefined) {
        balances[t.walletId] += parseFloat(t.amount || 0);
      }
    });
    return balances;
  }, [wallets, transactions]);

  const totalCashByCurrency = useMemo(() => {
    const totals = {};
    wallets.forEach(w => {
      const curr = w.currency || defaultCurrency;
      totals[curr] = (totals[curr] || 0) + (walletBalances[w.id] || 0);
    });
    return totals;
  }, [wallets, walletBalances, defaultCurrency]);

  const totalInvestmentsByCurrency = useMemo(() => {
    const totals = {};
    portfolios.forEach(p => {
      const curr = p.currency || defaultCurrency;
      totals[curr] = (totals[curr] || 0) + (parseFloat(p.currentValue) || 0);
    });
    return totals;
  }, [portfolios, defaultCurrency]);

  const totalNetWorthByCurrency = useMemo(() => {
    const totals = { ...totalCashByCurrency };
    Object.keys(totalInvestmentsByCurrency).forEach(curr => {
      totals[curr] = (totals[curr] || 0) + totalInvestmentsByCurrency[curr];
    });
    return totals;
  }, [totalCashByCurrency, totalInvestmentsByCurrency]);

  const activeDebts = useMemo(() =>
    transactions.filter(t => t && t.type === 'debt' && t.status === 'unpaid')
      .sort((a,b) => (b.transactionDate || b.createdAt || 0) - (a.transactionDate || a.createdAt || 0)),
    [transactions]
  );

  const settledDebts = useMemo(() =>
    transactions.filter(t => t && t.type === 'debt' && t.status === 'paid')
      .sort((a,b) => (b.paidAt || 0) - (a.paidAt || 0)),
    [transactions]
  );

  const debtSummary = useMemo(() => {
    let totalLend = 0, totalBorrow = 0;
    activeDebts.forEach(d => {
      const remaining = parseFloat(d.amount || 0) - (parseFloat(d.paidAmount) || 0);
      if (d.debtType === 'lend') totalLend += remaining;
      if (d.debtType === 'borrow') totalBorrow += remaining;
    });
    return { totalLend, totalBorrow };
  }, [activeDebts]);

  const processedHomeTransactions = useMemo(() => {
    let result = transactions.filter(t => {
      if (!t) return false;
      const d = new Date(t.transactionDate || t.createdAt || Date.now());
      const isCurrentMonth = d.getMonth() === homeViewDate.getMonth() && d.getFullYear() === homeViewDate.getFullYear();

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchDesc = t.description ? t.description.toLowerCase().includes(q) : false;
        const matchCat = (t.category && typeof t.category === 'string' && t.category.toLowerCase().includes(q)) ||
                         (t.categories && Array.isArray(t.categories) && t.categories.some(c => c && typeof c === 'string' && c.toLowerCase().includes(q)));
        const matchItem = t.items && Array.isArray(t.items) ? t.items.some(i => (i.name && typeof i.name === 'string' && i.name.toLowerCase().includes(q)) || (i.category && typeof i.category === 'string' && i.category.toLowerCase().includes(q))) : false;
        const matchPerson = t.personName ? t.personName.toLowerCase().includes(q) : false;
        if (!matchDesc && !matchCat && !matchItem && !matchPerson) return false;
      } else {
        if (!isCurrentMonth) return false;
      }

      if (filterType !== 'all' && t.type !== filterType) return false;
      return true;
    });

    result.sort((a, b) => {
      const dateA = a.transactionDate || a.createdAt || 0;
      const dateB = b.transactionDate || b.createdAt || 0;
      if (sortBy === 'date_desc') return dateB - dateA;
      if (sortBy === 'date_asc') return dateA - dateB;
      if (sortBy === 'amount_desc') return (b.amount || 0) - (a.amount || 0);
      if (sortBy === 'amount_asc') return (a.amount || 0) - (b.amount || 0);
      return 0;
    });

    return result;
  }, [transactions, homeViewDate, searchQuery, filterType, sortBy]);

  const { groupedHomeTransactions, homeTransactionsCount, isFlatList } = useMemo(() => {
    if (sortBy.includes('amount') || searchQuery) {
      return {
        groupedHomeTransactions: [{ date: searchQuery ? 'Hasil Pencarian' : 'Hasil Filter Data', items: processedHomeTransactions }],
        homeTransactionsCount: processedHomeTransactions.length,
        isFlatList: true
      };
    }

    const grouped = [];
    processedHomeTransactions.forEach(t => {
      const lastGroup = grouped[grouped.length - 1];
      if (lastGroup && lastGroup.date === t.date) lastGroup.items.push(t);
      else grouped.push({ date: t.date, items: [t] });
    });
    return { groupedHomeTransactions: grouped, homeTransactionsCount: processedHomeTransactions.length, isFlatList: false };
  }, [processedHomeTransactions, sortBy, searchQuery]);

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  const changeHomeMonth = (increment) => {
    setHomeViewDate(prevDate => {
      const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + increment, 1);
      return newDate;
    });
  };

  return {
    transactions, setTransactions,
    walletBalances, totalCashByCurrency, totalInvestmentsByCurrency, totalNetWorthByCurrency,
    activeDebts, settledDebts, debtSummary,
    expenseCategories, incomeCategories,
    processedHomeTransactions, groupedHomeTransactions, homeTransactionsCount, isFlatList,
    expandedId, setExpandedId, toggleExpand,
    changeHomeMonth,
    homeViewDate,
    searchQuery, setSearchQuery,
    filterType, setFilterType,
    sortBy, setSortBy,
    formatCurrency,
    loading, syncStatus
  };
}