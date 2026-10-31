const accountModel = require('../models/accountModel');
const transactionModel = require('../models/transactionModel');
const { AppError } = require('../middleware/errorHandler');

function getMyAccounts(req, res, next) {
  try {
    const accounts = accountModel.getAccountsByUserId(req.user.id);
    res.json({ accounts });
  } catch (err) {
    next(err);
  }
}

function getAccountByIdSecure(req, res, next) {
  try {
    const account = accountModel.getAccountById(req.params.id);
    if (!account) throw new AppError('Account not found', 404);

    // Authorization: customers may only view their own accounts
    if (req.user.role !== 'ADMIN' && account.user_id !== req.user.id) {
      throw new AppError('You do not have access to this account', 403);
    }

    res.json({ account });
  } catch (err) {
    next(err);
  }
}

function getDashboard(req, res, next) {
  try {
    const account = accountModel.getPrimaryAccountForUser(req.user.id);
    if (!account) throw new AppError('No account found for this user', 404);

    const recentTransactions = transactionModel.getTransactionsForAccount(account.id, { limit: 5 });

    res.json({ account, recentTransactions });
  } catch (err) {
    next(err);
  }
}

// Admin only
function listAllAccounts(req, res, next) {
  try {
    const accounts = accountModel.listAllAccounts();
    res.json({ accounts });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyAccounts, getAccountByIdSecure, getDashboard, listAllAccounts };
