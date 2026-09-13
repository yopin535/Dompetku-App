import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { firebaseService } from '../services/firebaseService';

export function useInvestments() {
  const { portfolios, user } = useApp();

  const addPortfolio = useCallback(async (data) => {
    if (!user) return;
    return await firebaseService.addPortfolio(data);
  }, [user]);

  const updatePortfolio = useCallback(async (id, data) => {
    if (!user) return;
    await firebaseService.updatePortfolio(id, data);
  }, [user]);

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
  }, [user]);

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
  }, [user]);

  const processUpdateValue = useCallback(async (portfolio, newCurrentValue) => {
    if (!user) return;
    const val = parseFloat(newCurrentValue);
    if (isNaN(val) || val < 0) throw new Error('Nilai tidak valid');
    await firebaseService.updatePortfolio(portfolio.id, { currentValue: val });
  }, [user]);

  return {
    portfolios,
    addPortfolio,
    updatePortfolio,
    processTopUp,
    processWithdraw,
    processUpdateValue
  };
}