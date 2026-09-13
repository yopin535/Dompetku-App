import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { firebaseService } from '../services/firebaseService';

export function useWallets() {
  const { wallets, setWallets, user } = useApp();

  const addWallet = useCallback(async (data) => {
    if (!user) return;
    const walletId = await firebaseService.addWallet(data);
    return walletId;
  }, [user]);

  const deleteWallet = useCallback(async (id) => {
    if (!user) return;
    await firebaseService.deleteWallet(id);
  }, [user]);

  return {
    wallets,
    addWallet,
    deleteWallet
  };
}