const userModel = require('../models/userModel');
const auditService = require('../services/auditService');

function listUsers(req, res, next) {
  try {
    res.json({ users: userModel.listAllUsers() });
  } catch (err) {
    next(err);
  }
}

function listAuditLogs(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 200;
    res.json({ logs: auditService.getAllLogs(limit) });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, listAuditLogs };
