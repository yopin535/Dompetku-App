import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { firebaseService } from '../services/firebaseService';

export function useInvestments() {
  const { portfolios, user } = useApp();

  const addPortfolio = useCallback(async (data) => {
    if (!user) return;
    const id = await firebaseService.addPortfolio(data);
    await firebaseService.addPortfolioHistory({
      portfolioId: id,
      portfolioName: data.name,
      currency: data.currency || 'IDR',
      prevInvested: 0,
      newInvested: 0,
      prevValue: 0,
      newValue: 0,
      reason: 'create',
      amount: 0
    });
    return id;
  }, [user]);

  const updatePortfolio = useCallback(async (id, data) => {
    if (!user) return;
    await firebaseService.updatePortfolio(id, data);
  }, [user]);

  const createNotification = useCallback(async (message, category) => {
    if (!user) return;
    await firebaseService.addNotification({
      title: 'Target Investasi Tercapai',
      message,
      category,
      isRead: false
    }, user.uid);
  }, [user]);

  const writeHistory = useCallback(async (portfolio, reason, amount) => {
    if (!user) return;
    await firebaseService.addPortfolioHistory({
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
      currency: portfolio.currency || 'IDR',
      prevInvested: parseFloat(portfolio.totalInvested) || 0,
      newInvested: parseFloat(portfolio.totalInvested) || 0,
      prevValue: parseFloat(portfolio.currentValue) || 0,
      newValue: parseFloat(portfolio.currentValue) || 0,
      reason,
      amount: parseFloat(amount) || 0
    });
  }, [user]);

  const checkTargets = useCallback(async () => {
    if (!user) return;
    
    portfolios.forEach(async (portfolio) => {
      if (portfolio.targetReturn === undefined || portfolio.targetReturn === null) return;
      
      const currentValue = parseFloat(portfolio.currentValue) || 0;
      const totalInvested = parseFloat(portfolio.totalInvested) || 0;
      const profit = currentValue - totalInvested;
      const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
      const alertsTriggered = portfolio.alertsTriggered || [];
      
      let newAlerts = [...alertsTriggered];
      
      if (portfolio.targetReturnType === 'percentage') {
        const targetPercentage = parseFloat(portfolio.targetReturn);
        const threshold50 = targetPercentage * 0.5;
        const threshold80 = targetPercentage * 0.8;
        
        if (profitPercentage >= threshold50 && !alertsTriggered.includes('50%')) {
          await createNotification(`Portofolio "${portfolio.name}" mencapai 50% dari target!`, 'invest');
          newAlerts.push('50%');
        }
        if (profitPercentage >= threshold80 && !alertsTriggered.includes('80%')) {
          await createNotification(`Portofolio "${portfolio.name}" mencapai 80% dari target!`, 'invest');
          newAlerts.push('80%');
        }
        if (profitPercentage >= targetPercentage && !alertsTriggered.includes('100%')) {
          await createNotification(`Portofolio "${portfolio.name}" mencapai 100% target!`, 'invest');
          newAlerts.push('100%');
        }
      } else {
        const targetAmount = parseFloat(portfolio.targetReturn);
        const threshold50 = targetAmount * 0.5;
        const threshold80 = targetAmount * 0.8;
        
        if (profit >= threshold50 && !alertsTriggered.includes('50%')) {
          await createNotification(`Portofolio "${portfolio.name}" mencapai 50% dari target!`, 'invest');
          newAlerts.push('50%');
        }
        if (profit >= threshold80 && !alertsTriggered.includes('80%')) {
          await createNotification(`Portofolio "${portfolio.name}" mencapai 80% dari target!`, 'invest');
          newAlerts.push('80%');
        }
        if (profit >= targetAmount && !alertsTriggered.includes('100%')) {
          await createNotification(`Portofolio "${portfolio.name}" mencapai 100% target!`, 'invest');
          newAlerts.push('100%');
        }
      }
      
      if (newAlerts.length !== alertsTriggered.length) {
        await firebaseService.updatePortfolio(portfolio.id, { alertsTriggered: newAlerts });
      }
    });
  }, [user, portfolios, createNotification]);

  const processTopUp = useCallback(async (portfolio, amount, walletId, date) => {
    if (!user) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) throw new Error('Nominal tidak valid');
    if (!walletId) throw new Error('Pilih dompet terlebih dahulu');

    const d = date ? new Date(date) : new Date();
    const tData = {
      amount: amt,
      type: 'invest_deposit',
      walletId,
      currency: portfolio.currency || 'IDR',
      description: `Top Up Modal: ${portfolio.name}`,
      category: 'Investasi',
      categories: ['Investasi'],
      date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      transactionDate: d.getTime(),
      createdAt: Date.now(),
      portfolioId: portfolio.id
    };
    await firebaseService.addTransaction(tData);

    const newModal = (parseFloat(portfolio.totalInvested) || 0) + amt;
    const newVal = (parseFloat(portfolio.currentValue) || 0) + amt;
    await firebaseService.updatePortfolio(portfolio.id, { totalInvested: newModal, currentValue: newVal });

    await firebaseService.addPortfolioHistory({
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
      currency: portfolio.currency || 'IDR',
      prevInvested: parseFloat(portfolio.totalInvested) || 0,
      newInvested: newModal,
      prevValue: parseFloat(portfolio.currentValue) || 0,
      newValue: newVal,
      reason: 'topup',
      amount: amt
    });
    
    await checkTargets();
  }, [user, checkTargets]);

  const processWithdraw = useCallback(async (portfolio, amount, walletId, date) => {
    if (!user) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) throw new Error('Nominal tidak valid');
    if (!walletId) throw new Error('Pilih dompet terlebih dahulu');

    const d = date ? new Date(date) : new Date();
    const tData = {
      amount: amt,
      type: 'invest_withdraw',
      walletId,
      currency: portfolio.currency || 'IDR',
      description: `Tarik Dana: ${portfolio.name}`,
      category: 'Investasi',
      categories: ['Investasi'],
      date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      transactionDate: d.getTime(),
      createdAt: Date.now(),
      portfolioId: portfolio.id
    };
    await firebaseService.addTransaction(tData);

    const newModal = Math.max(0, (parseFloat(portfolio.totalInvested) || 0) - amt);
    const newVal = Math.max(0, (parseFloat(portfolio.currentValue) || 0) - amt);
    await firebaseService.updatePortfolio(portfolio.id, { totalInvested: newModal, currentValue: newVal });

    await firebaseService.addPortfolioHistory({
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
      currency: portfolio.currency || 'IDR',
      prevInvested: parseFloat(portfolio.totalInvested) || 0,
      newInvested: newModal,
      prevValue: parseFloat(portfolio.currentValue) || 0,
      newValue: newVal,
      reason: 'withdraw',
      amount: amt
    });
  }, [user]);

  const processUpdateValue = useCallback(async (portfolio, newCurrentValue) => {
    if (!user) return;
    const val = parseFloat(newCurrentValue);
    if (isNaN(val) || val < 0) throw new Error('Nilai tidak valid');

    const prevVal = parseFloat(portfolio.currentValue) || 0;
    await firebaseService.updatePortfolio(portfolio.id, { currentValue: val });

    await firebaseService.addPortfolioHistory({
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
      currency: portfolio.currency || 'IDR',
      prevInvested: parseFloat(portfolio.totalInvested) || 0,
      newInvested: parseFloat(portfolio.totalInvested) || 0,
      prevValue: prevVal,
      newValue: val,
      reason: 'update',
      amount: val - prevVal
    });
    
    await checkTargets();
  }, [user, checkTargets]);

  return {
    portfolios,
    addPortfolio,
    updatePortfolio,
    processTopUp,
    processWithdraw,
    processUpdateValue,
    checkTargets
  };
}
