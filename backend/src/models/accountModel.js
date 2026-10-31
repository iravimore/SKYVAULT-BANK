const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const generateAccountNumber = require('../utils/generateAccountNumber');

function createAccount({ userId, accountType = 'SAVINGS', openingBalance = 0 }) {
  const id = uuidv4();
  const accountNumber = generateAccountNumber();
  db.prepare(`
    INSERT INTO accounts (id, user_id, account_number, account_type, status, balance, currency, created_at)
    VALUES (?, ?, ?, ?, 'ACTIVE', ?, 'INR', datetime('now'))
  `).run(id, userId, accountNumber, accountType, openingBalance);
  return getAccountById(id);
}

function getAccountById(id) {
  return db.prepare('SELECT * FROM accounts WHERE id = ?').get(id);
}

function getAccountByNumber(accountNumber) {
  return db.prepare('SELECT * FROM accounts WHERE account_number = ?').get(accountNumber);
}

function getAccountsByUserId(userId) {
  return db.prepare('SELECT * FROM accounts WHERE user_id = ?').all(userId);
}

function getPrimaryAccountForUser(userId) {
  return db.prepare('SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at ASC LIMIT 1').get(userId);
}

// Balance updates happen only inside services/transactionService.js via DB transactions
function setBalance(accountId, newBalance) {
  db.prepare('UPDATE accounts SET balance = ? WHERE id = ?').run(newBalance, accountId);
}

function listAllAccounts() {
  return db.prepare(`
    SELECT accounts.*, users.full_name, users.email
    FROM accounts JOIN users ON users.id = accounts.user_id
    ORDER BY accounts.created_at DESC
  `).all();
}

module.exports = {
  createAccount,
  getAccountById,
  getAccountByNumber,
  getAccountsByUserId,
  getPrimaryAccountForUser,
  setBalance,
  listAllAccounts
};
