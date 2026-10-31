const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

function createUser({ fullName, email, passwordHash, role = 'CUSTOMER' }) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'ACTIVE', datetime('now'), datetime('now'))
  `).run(id, fullName, email.toLowerCase(), passwordHash, role);
  return getUserById(id);
}

function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
}

function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function updateLastLogin(id) {
  db.prepare(`UPDATE users SET last_login_at = datetime('now'), failed_login_attempts = 0, updated_at = datetime('now') WHERE id = ?`).run(id);
}

function incrementFailedAttempts(id) {
  db.prepare(`UPDATE users SET failed_login_attempts = failed_login_attempts + 1, updated_at = datetime('now') WHERE id = ?`).run(id);
}

function lockUser(id) {
  db.prepare(`UPDATE users SET status = 'LOCKED', updated_at = datetime('now') WHERE id = ?`).run(id);
}

function updatePassword(id, passwordHash) {
  db.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(passwordHash, id);
}

function toPublicUser(user) {
  if (!user) return null;
  const { password_hash, failed_login_attempts, ...publicFields } = user;
  return publicFields;
}

function listAllUsers() {
  return db.prepare('SELECT id, full_name, email, role, status, created_at, last_login_at FROM users ORDER BY created_at DESC').all();
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateLastLogin,
  incrementFailedAttempts,
  lockUser,
  updatePassword,
  toPublicUser,
  listAllUsers
};
