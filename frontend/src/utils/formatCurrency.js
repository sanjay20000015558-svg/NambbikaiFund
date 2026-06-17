/**
 * Format currency amount to Indian notation (lakhs, crores)
 * @param {number} amount - Amount in rupees
 * @param {boolean} withSymbol - Include ₹ symbol
 * @returns {string} Formatted string
 */
export const formatCurrency = (amount, withSymbol = true) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return withSymbol ? '₹0' : '0';
  }

  const absAmount = Math.abs(amount);
  let formatted = '';

  if (absAmount >= 10000000) {
    // Crores
    formatted = (absAmount / 10000000).toFixed(2).replace(/\.00$/, '') + ' Cr';
  } else if (absAmount >= 100000) {
    // Lakhs
    formatted = (absAmount / 100000).toFixed(2).replace(/\.00$/, '') + ' L';
  } else if (absAmount >= 1000) {
    // Thousands
    formatted = (absAmount / 1000).toFixed(1).replace(/\.0$/, '') + ' K';
  } else {
    formatted = absAmount.toString();
  }

  if (amount < 0) {
    formatted = '-' + formatted;
  }

  return withSymbol ? `₹${formatted}` : formatted;
};

/**
 * Format to full number with commas
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (raised, target) => {
  if (!target || target === 0) return 0;
  return Math.min(Math.round((raised / target) * 100), 100);
};
