export const formatCurrency = (number, currencyCode = 'IDR') => {
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 2
    }).format(number);
  } catch (e) {
    return currencyCode + " " + number;
  }
};

export const getCurrentDate = () => {
  const now = new Date();
  return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0');
};

export const CURRENCIES = [
  { code: 'IDR', symbol: 'Rp' },
  { code: 'USD', symbol: '$' },
  { code: 'SGD', symbol: 'S$' },
  { code: 'EUR', symbol: '€' },
  { code: 'JPY', symbol: '¥' },
  { code: 'MYR', symbol: 'RM' },
];

export const defaultExpenseCategories = [
  'Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Biaya Admin', 'Lainnya'
];

export const defaultIncomeCategories = [
  'Gaji', 'Bonus', 'Hadiah', 'Penjualan', 'Investasi', 'Freelance', 'Lainnya'
];