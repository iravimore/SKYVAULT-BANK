const db = require('../config/db');

function generateAccountNumber() {
  // 10-digit numeric account number, checked for uniqueness
  let accountNumber;
  let exists = true;
  const check = db.prepare('SELECT 1 FROM accounts WHERE account_number = ?');

  while (exists) {
    accountNumber = String(Math.floor(1000000000 + Math.random() * 9000000000));
    exists = !!check.get(accountNumber);
  }
  return accountNumber;
}

module.exports = generateAccountNumber;
