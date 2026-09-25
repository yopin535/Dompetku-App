import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  getDocs,
  writeBatch,
  updateDoc
} from 'firebase/firestore';

import { auth } from '../config/firebase';
import { APP_ID } from '../config/firebase';
import { db } from '../config/firebase';

const getUserId = (explicitUserId) => explicitUserId || auth.currentUser?.uid;

const getCollectionRef = (collectionName, userId) => {
  const uid = getUserId(userId);
  if (!uid) throw new Error('User not authenticated');
  return collection(db, 'artifacts', APP_ID, 'users', uid, collectionName);
};

const getDocRef = (collectionName, docId, userId) => {
  const uid = getUserId(userId);
  if (!uid) throw new Error('User not authenticated');
  return doc(db, 'artifacts', APP_ID, 'users', uid, collectionName, docId);
};

export const firebaseService = {
  // Transaksi
  async addTransaction(data, userId) {
    try {
      const col = getCollectionRef('transactions', userId);
      const docRef = await addDoc(col, {
        ...data,
        createdAt: data.createdAt || Date.now(),
        transactionDate: data.transactionDate || Date.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  async getTransactions(userId) {
    try {
      const col = getCollectionRef('transactions', userId);
      const snapshot = await getDocs(col);
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const dateA = a.transactionDate || a.createdAt || 0;
        const dateB = b.transactionDate || b.createdAt || 0;
        return dateB - dateA;
      });
      return docs;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  },

  async updateTransaction(id, data, userId) {
    try {
      const docRef = getDocRef('transactions', id, userId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  async deleteTransaction(id, userId) {
    try {
      const docRef = getDocRef('transactions', id, userId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  // Dompet
  async addWallet(data, userId) {
    try {
      const col = getCollectionRef('wallets', userId);
      const docRef = await addDoc(col, { ...data, createdAt: Date.now() });
      return docRef.id;
    } catch (error) {
      console.error('Error adding wallet:', error);
      throw error;
    }
  },

  async getWallets(userId) {
    try {
      const col = getCollectionRef('wallets', userId);
      const snapshot = await getDocs(col);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting wallets:', error);
      throw error;
    }
  },

  async deleteWallet(id, userId) {
    try {
      const docRef = getDocRef('wallets', id, userId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting wallet:', error);
      throw error;
    }
  },

  // Kategori
  async addCategory(data, userId) {
    try {
      const col = getCollectionRef('categories', userId);
      const docRef = await addDoc(col, { ...data, createdAt: Date.now() });
      return docRef.id;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  async getCategories(userId) {
    try {
      const col = getCollectionRef('categories', userId);
      const snapshot = await getDocs(col);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  async deleteCategory(id, userId) {
    try {
      const docRef = getDocRef('categories', id, userId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Portofolio
  async addPortfolio(data, userId) {
    try {
      const col = getCollectionRef('portfolios', userId);
      const docRef = await addDoc(col, { ...data, createdAt: Date.now() });
      return docRef.id;
    } catch (error) {
      console.error('Error adding portfolio:', error);
      throw error;
    }
  },

  async getPortfolios(userId) {
    try {
      const col = getCollectionRef('portfolios', userId);
      const snapshot = await getDocs(col);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting portfolios:', error);
      throw error;
    }
  },

  async updatePortfolio(id, data, userId) {
    try {
      const docRef = getDocRef('portfolios', id, userId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  },

  async deletePortfolio(id, userId) {
    try {
      const docRef = getDocRef('portfolios', id, userId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      throw error;
    }
  },

  // Notifications
  async addNotification(data, userId) {
    try {
      const col = getCollectionRef('notifications', userId);
      const docRef = await addDoc(col, {
        ...data,
        createdAt: data.createdAt || Date.now(),
        isRead: false
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  },

  async getNotifications(userId) {
    try {
      const col = getCollectionRef('notifications', userId);
      const snapshot = await getDocs(col);
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return docs;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  async getUnreadNotifications(userId) {
    try {
      const col = getCollectionRef('notifications', userId);
      const snapshot = await getDocs(col);
      return snapshot.docs
        .filter(doc => !doc.data().isRead)
        .map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      throw error;
    }
  },

  async getUnreadCount(userId) {
    try {
      const col = getCollectionRef('notifications', userId);
      const snapshot = await getDocs(col);
      return snapshot.docs.filter(doc => !doc.data().isRead).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },

  async updateNotification(id, data, userId) {
    try {
      const docRef = getDocRef('notifications', id, userId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  },

  async deleteNotification(id, userId) {
    try {
      const docRef = getDocRef('notifications', id, userId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  async cleanupOldNotifications(userId, daysThreshold = 30) {
    try {
      const col = getCollectionRef('notifications', userId);
      const now = Date.now();
      const threshold = now - (daysThreshold * 24 * 60 * 60 * 1000);
      
      const snapshot = await getDocs(col);
      const batch = writeBatch(db);
      
      snapshot.docs.forEach(doc => {
        if (doc.data().createdAt < threshold) {
          batch.delete(doc.ref);
        }
      });
      
      await batch.commit();
      return { deleted: batch._writeBatch._ops.length };
    } catch (error) {
      console.error('Error cleaning old notifications:', error);
      throw error;
    }
  },

  // Batch operations
  async resetData(userId) {
    try {
      const batch = writeBatch(db);
      const collections = ['transactions', 'categories', 'wallets', 'portfolios'];
      
      for (const collName of collections) {
        const col = getCollectionRef(collName, userId);
        const snapshot = await getDocs(col);
        snapshot.docs.forEach(d => batch.delete(d.ref));
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error resetting data:', error);
      throw error;
    }
  },

  // Snapshot listeners (for real-time updates)
  subscribeToCollection(collectionName, callback, userId) {
    try {
      const col = getCollectionRef(collectionName, userId);
      return onSnapshot(col, (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(docs);
      }, (error) => {
        console.error(`Snapshot error for ${collectionName}:`, error);
        callback([], error);
      });
    } catch (error) {
      console.error('Error setting up listener:', error);
      throw error;
    }
  }
};