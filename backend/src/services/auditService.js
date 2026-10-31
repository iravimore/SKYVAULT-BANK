const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const logger = require('../utils/logger');

/**
 * Records a security/business audit event.
 * Action examples: USER_REGISTER, USER_LOGIN, FAILED_LOGIN, USER_LOGOUT,
 * DEPOSIT, WITHDRAW, TRANSFER, PASSWORD_CHANGE
 */
function recordEvent({ userId = null, action, status, req = null, metadata = {} }) {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, status, ip_address, user_agent, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(
      uuidv4(),
      userId,
      action,
      status,
      req ? (req.ip || req.headers['x-forwarded-for'] || 'unknown') : null,
      req ? (req.headers['user-agent'] || 'unknown') : null,
      JSON.stringify(metadata)
    );
    logger.info(`AUDIT: ${action} - ${status}`, { userId, ...metadata });
  } catch (err) {
    // Audit logging must never crash the main request flow
    logger.error('Failed to write audit log', { error: err.message });
  }
}

function getLogsForUser(userId, limit = 50) {
  return db.prepare(`
    SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
  `).all(userId, limit);
}

function getAllLogs(limit = 200) {
  return db.prepare(`
    SELECT audit_logs.*, users.email
    FROM audit_logs
    LEFT JOIN users ON users.id = audit_logs.user_id
    ORDER BY audit_logs.created_at DESC LIMIT ?
  `).all(limit);
}

module.exports = { recordEvent, getLogsForUser, getAllLogs };
