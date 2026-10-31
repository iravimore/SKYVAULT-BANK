/**
 * Money is stored internally as an integer number of paise (1 INR = 100 paise)
 * to avoid floating point rounding errors in financial calculations.
 */

function rupeesToPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

function paiseToRupees(paise) {
  return Number((paise / 100).toFixed(2));
}

function formatINR(paise) {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(rupees);
}

function maskAccountNumber(accountNumber) {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  return `****${accountNumber.slice(-4)}`;
}

module.exports = { rupeesToPaise, paiseToRupees, formatINR, maskAccountNumber };
