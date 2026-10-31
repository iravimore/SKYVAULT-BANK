const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');
const { registerRules, loginRules } = require('../middleware/validators');

router.post('/register', registerRules, authController.register);
router.post('/login', loginLimiter, loginRules, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, authController.changePassword);
router.get('/me', authenticate, authController.me);

module.exports = router;
