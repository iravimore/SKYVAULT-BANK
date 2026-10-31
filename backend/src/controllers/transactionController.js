const accountModel = require('../models/accountModel');
const transactionModel = require('../models/transactionModel');
const transactionService = require('../services/transactionService');
const auditService = require('../services/auditService');
const { rupeesToPaise } = require('../utils/money');
const { AppError } = require('../middleware/errorHandler');

function assertOwnsAccount(req, account) {
  if (!account) throw new AppError('Account not found', 404);
  if (req.user.role !== 'ADMIN' && account.user_id !== req.user.id) {
    throw new AppError('You do not have access to this account', 403);
  }
}

function deposit(req, res, next) {
  try {
    const { accountId, amount, description } = req.body;
    if (!accountId || amount === undefined) {
      throw new AppError('accountId and amount are required', 400);
    }

    const account = accountModel.getAccountById(accountId);
    assertOwnsAccount(req, account);

    const amountPaise = rupeesToPaise(amount);
    const txn = transactionService.deposit(accountId, amountPaise, description);

    auditService.recordEvent({ userId: req.user.id, action: 'DEPOSIT', status: 'SUCCESS', req, metadata: { accountId, amount } });
    res.status(201).json({ message: 'Deposit successful', transaction: txn });
  } catch (err) {
    if (err.statusCode) {
      auditService.recordEvent({ userId: req.user?.id, action: 'DEPOSIT', status: 'FAILED', req, metadata: { reason: err.message } });
    }
    next(err);
  }
}

function withdraw(req, res, next) {
  try {
    const { accountId, amount, description } = req.body;
    if (!accountId || amount === undefined) {
      throw new AppError('accountId and amount are required', 400);
    }

    const account = accountModel.getAccountById(accountId);
    assertOwnsAccount(req, account);

    const amountPaise = rupeesToPaise(amount);
    const txn = transactionService.withdraw(accountId, amountPaise, description);

    auditService.recordEvent({ userId: req.user.id, action: 'WITHDRAW', status: 'SUCCESS', req, metadata: { accountId, amount } });
    res.status(201).json({ message: 'Withdrawal successful', transaction: txn });
  } catch (err) {
    if (err.statusCode) {
      auditService.recordEvent({ userId: req.user?.id, action: 'WITHDRAW', status: 'FAILED', req, metadata: { reason: err.message } });
    }
    next(err);
  }
}

function transfer(req, res, next) {
  try {
    const { fromAccountId, toAccountNumber, amount, description } = req.body;
    if (!fromAccountId || !toAccountNumber || amount === undefined) {
      throw new AppError('fromAccountId, toAccountNumber and amount are required', 400);
    }

    const fromAccount = accountModel.getAccountById(fromAccountId);
    assertOwnsAccount(req, fromAccount);

    const amountPaise = rupeesToPaise(amount);
    const txn = transactionService.transfer(fromAccountId, toAccountNumber, amountPaise, description);

    auditService.recordEvent({
      userId: req.user.id,
      action: 'TRANSFER',
      status: 'SUCCESS',
      req,
      metadata: { fromAccountId, toAccountNumber, amount }
    });

    res.status(201).json({ message: 'Transfer successful', transaction: txn });
  } catch (err) {
    if (err.statusCode) {
      auditService.recordEvent({ userId: req.user?.id, action: 'TRANSFER', status: 'FAILED', req, metadata: { reason: err.message } });
    }
    next(err);
  }
}

function getHistory(req, res, next) {
  try {
    const { accountId } = req.params;
    const { type, limit = 20, offset = 0 } = req.query;

    const account = accountModel.getAccountById(accountId);
    assertOwnsAccount(req, account);

    const transactions = transactionModel.getTransactionsForAccount(accountId, {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      type: type || null
    });
    const total = transactionModel.countTransactionsForAccount(accountId);

    res.json({ transactions, total });
  } catch (err) {
    next(err);
  }
}

function getTransactionDetails(req, res, next) {
  try {
    const txn = transactionModel.getTransactionById(req.params.id);
    if (!txn) throw new AppError('Transaction not found', 404);

    const account = accountModel.getAccountById(txn.account_id);
    assertOwnsAccount(req, account);

    res.json({ transaction: txn });
  } catch (err) {
    next(err);
  }
}

module.exports = { deposit, withdraw, transfer, getHistory, getTransactionDetails };
