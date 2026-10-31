// Backend stores/returns amounts in paise (integer). These helpers convert for display.

export function paiseToRupeesDisplay(paise) {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(rupees);
}

export function maskAccountNumber(accountNumber) {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  return `****${accountNumber.slice(-4)}`;
}

export function formatDate(dateString) {
  const date = new Date(dateString + 'Z'); // SQLite datetime('now') is UTC
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateString) {
  const date = new Date(dateString + 'Z');
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function transactionLabel(type) {
  const labels = {
    DEPOSIT: 'Deposit',
    WITHDRAWAL: 'Withdrawal',
    TRANSFER_OUT: 'Transfer',
    TRANSFER_IN: 'Transfer received'
  };
  return labels[type] || type;
}

export function isCredit(type) {
  return type === 'DEPOSIT' || type === 'TRANSFER_IN';
}
