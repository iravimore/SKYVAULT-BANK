const { body, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
}

const registerRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  handleValidation
];

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation
];

const amountRules = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  handleValidation
];

const transferRules = [
  body('fromAccountId').notEmpty().withMessage('fromAccountId is required'),
  body('toAccountNumber').trim().notEmpty().withMessage('toAccountNumber is required')
    .isLength({ min: 6, max: 20 }).withMessage('Invalid account number format'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  handleValidation
];

module.exports = { registerRules, loginRules, amountRules, transferRules, handleValidation };
