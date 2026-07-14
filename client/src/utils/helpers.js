/**
 * Formats a number as Indian Rupee (INR) currency.
 * e.g. 599 -> ₹599
 */
export const formatPrice = (price) => {
  if (price === undefined || price === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Formats a Date object or string as DD MMM YYYY.
 * e.g. '2026-07-03' -> 03 Jul 2026
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Truncates text to a specified maximum length and appends '...'.
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Returns a Bootstrap color class based on the order or payment status.
 */
export const getStatusColor = (status) => {
  if (!status) return 'secondary';
  
  switch (status.toLowerCase()) {
    case 'pending':
    case 'processing':
      return 'warning text-dark';
    case 'shipped':
      return 'info text-dark';
    case 'delivered':
    case 'paid':
    case 'success':
    case 'active':
    case 'fulfilled':
      return 'success';
    case 'failed':
    case 'cancelled':
    case 'danger':
      return 'danger';
    case 'refunded':
    case 'notified':
      return 'primary';
    default:
      return 'secondary';
  }
};

/**
 * Calculates discount percentage between original price and current price.
 */
export const calculateDiscount = (originalPrice, currentPrice) => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.round(discount);
};
