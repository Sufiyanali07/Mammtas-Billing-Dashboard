/**
 * Format a number as Indian Rupees (₹)
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  // Return ₹0.00 if amount is not a number or is null/undefined
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0.00";
  }

  // Convert to Indian numbering format (with commas at thousands, lakhs, crores)
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
};
