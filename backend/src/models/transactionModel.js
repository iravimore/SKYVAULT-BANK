const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

function insertTransaction({ accountId, relatedAccountId = null, type, amount, balanceAfter, description = '', status = 'SUCCESS' }) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO transactions (id, account_id, related_account_id, type, amount, balance_after, description, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(id, accountId, relatedAccountId, type, amount, balanceAfter, description, status);
  return getTransactionById(id);
}

function getTransactionById(id) {
  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
}

function getTransactionsForAccount(accountId, { limit = 50, offset = 0, type = null } = {}) {
  if (type) {
    return db.prepare(`
      SELECT * FROM transactions WHERE account_id = ? AND type = ?
      ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(accountId, type, limit, offset);
  }
  return db.prepare(`
    SELECT * FROM transactions WHERE account_id = ?
    ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).all(accountId, limit, offset);
}

function countTransactionsForAccount(accountId) {
  return db.prepare('SELECT COUNT(*) as count FROM transactions WHERE account_id = ?').get(accountId).count;
}

module.exports = {
  insertTransaction,
  getTransactionById,
  getTransactionsForAccount,
  countTransactionsForAccount
};
