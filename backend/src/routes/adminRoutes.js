const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate, authorize('ADMIN'));

router.get('/users', adminController.listUsers);
router.get('/audit-logs', adminController.listAuditLogs);

module.exports = router;
