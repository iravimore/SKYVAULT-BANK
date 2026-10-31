const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/authMiddleware');
const { amountRules, transferRules } = require('../middleware/validators');

router.post('/deposit', authenticate, amountRules, transactionController.deposit);
router.post('/withdraw', authenticate, amountRules, transactionController.withdraw);
router.post('/transfer', authenticate, transferRules, transactionController.transfer);
router.get('/account/:accountId', authenticate, transactionController.getHistory);
router.get('/:id', authenticate, transactionController.getTransactionDetails);

module.exports = router;
