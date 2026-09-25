import { useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { firebaseService } from '../services/firebaseService';

export function useNotifications() {
  const { user } = useApp();

  const createNotification = useCallback(async (data) => {
    if (!user) return;
    return await firebaseService.addNotification(data, user.uid);
  }, [user]);

  const getNotifications = useCallback(async () => {
    if (!user) return [];
    return await firebaseService.getNotifications(user.uid);
  }, [user]);

  const getUnreadCount = useCallback(async () => {
    if (!user) return 0;
    return await firebaseService.getUnreadCount(user.uid);
  }, [user]);

  const markAsRead = useCallback(async (id) => {
    if (!user) return;
    await firebaseService.updateNotification(id, { isRead: true }, user.uid);
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    const notifications = await firebaseService.getNotifications(user.uid);
    for (const notif of notifications) {
      if (!notif.isRead) {
        await firebaseService.updateNotification(notif.id, { isRead: true }, user.uid);
      }
    }
  }, [user]);

  const deleteNotification = useCallback(async (id) => {
    if (!user) return;
    await firebaseService.deleteNotification(id, user.uid);
  }, [user]);

  const cleanupOldNotifications = useCallback(async (daysThreshold = 30) => {
    if (!user) return;
    await firebaseService.cleanupOldNotifications(user.uid, daysThreshold);
  }, [user]);

  useEffect(() => {
    if (user) {
      cleanupOldNotifications().catch(console.error);
    }
  }, [user, cleanupOldNotifications]);

  return {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    cleanupOldNotifications
  };
}
