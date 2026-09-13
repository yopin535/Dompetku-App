import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { firebaseService } from '../services/firebaseService';

export function useCategories() {
  const { customCategories, setCustomCategories, user } = useApp();

  const addCategory = useCallback(async (name, type) => {
    if (!user) return;
    await firebaseService.addCategory({ name, type });
  }, [user]);

  const deleteCategory = useCallback(async (id) => {
    if (!user) return;
    await firebaseService.deleteCategory(id);
  }, [user]);

  return {
    customCategories,
    setCustomCategories,
    addCategory,
    deleteCategory
  };
}