const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', authenticate, accountController.getDashboard);
router.get('/', authenticate, accountController.getMyAccounts);
router.get('/all', authenticate, authorize('ADMIN'), accountController.listAllAccounts);
router.get('/:id', authenticate, accountController.getAccountByIdSecure);

module.exports = router;
