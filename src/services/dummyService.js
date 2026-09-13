import { firebaseService } from './firebaseService';

export const generateRichDummyData = async () => {
  try {
    const wallets = [
      { name: 'Dompet Tunai', currency: 'IDR', initialBalance: 500000 },
      { name: 'Bank BCA', currency: 'IDR', initialBalance: 15000000 },
      { name: 'GoPay', currency: 'IDR', initialBalance: 1000000 }
    ];

    const createdWallets = [];
    for (const w of wallets) {
      const docRef = await firebaseService.addWallet(w);
      createdWallets.push({ id: docRef, ...w });
    }

    const [tunai, bca, gopay] = createdWallets;

    const portfolios = [
      { name: 'Saham Bluechip', currency: 'IDR', totalInvested: 5000000, currentValue: 5250000 },
      { name: 'Crypto Trading', currency: 'IDR', totalInvested: 2000000, currentValue: 1800000 }
    ];

    for (const p of portfolios) {
      await firebaseService.addPortfolio(p);
    }

    const now = new Date();
    const transactions = [
      {
        description: 'Gaji September',
        amount: 10000000,
        type: 'income',
        category: 'Gaji',
        categories: ['Gaji'],
        walletId: bca.id,
        currency: 'IDR',
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      },
      {
        description: 'Bayar Kost',
        amount: 2500000,
        type: 'expense',
        category: 'Tagihan',
        categories: ['Tagihan'],
        walletId: bca.id,
        currency: 'IDR',
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 2).getTime()
      },
      {
        description: 'Belanja Mingguan',
        amount: 450000,
        type: 'expense',
        category: 'Belanja',
        categories: ['Belanja'],
        walletId: tunai.id,
        currency: 'IDR',
        items: [
          { name: 'Beras', price: 150000 },
          { name: 'Minyak', price: 50000 },
          { name: 'Daging', price: 250000 }
        ],
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 5).getTime()
      },
      {
        description: 'Transfer ke GoPay',
        amount: 500000,
        type: 'transfer',
        walletId: bca.id,
        toWalletId: gopay.id,
        adminFee: 2500,
        receivedAmount: 500000,
        currency: 'IDR',
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 10).getTime()
      },
      {
        description: 'Pinjamkan ke Budi',
        amount: 200000,
        type: 'debt',
        debtType: 'lend',
        personName: 'Budi',
        status: 'unpaid',
        paidAmount: 0,
        walletId: tunai.id,
        currency: 'IDR',
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 12).getTime()
      }
    ];

    for (const t of transactions) {
      await firebaseService.addTransaction(t);
    }

    return true;
  } catch (error) {
    console.error('Failed to generate dummy data:', error);
    throw error;
  }
};

export const dummyService = {
  generateRichDummyData
};
