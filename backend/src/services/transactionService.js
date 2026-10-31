const db = require('../config/db');
const accountModel = require('../models/accountModel');
const transactionModel = require('../models/transactionModel');
const { AppError } = require('../middleware/errorHandler');

const MAX_SINGLE_TRANSACTION_PAISE = 100000000; // ₹10,00,000 sanity cap

function assertActiveAccount(account) {
  if (!account) throw new AppError('Account not found', 404);
  if (account.status !== 'ACTIVE') throw new AppError(`Account is ${account.status.toLowerCase()}`, 403);
}

function assertValidAmount(amountPaise) {
  if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
    throw new AppError('Amount must be greater than zero', 400);
  }
  if (amountPaise > MAX_SINGLE_TRANSACTION_PAISE) {
    throw new AppError('Amount exceeds maximum allowed per transaction', 400);
  }
}

const deposit = db.transaction((accountId, amountPaise, description) => {
  const account = accountModel.getAccountById(accountId);
  assertActiveAccount(account);
  assertValidAmount(amountPaise);

  const newBalance = account.balance + amountPaise;
  accountModel.setBalance(accountId, newBalance);

  return transactionModel.insertTransaction({
    accountId,
    type: 'DEPOSIT',
    amount: amountPaise,
    balanceAfter: newBalance,
    description: description || 'Deposit'
  });
});

const withdraw = db.transaction((accountId, amountPaise, description) => {
  const account = accountModel.getAccountById(accountId);
  assertActiveAccount(account);
  assertValidAmount(amountPaise);

  if (account.balance < amountPaise) {
    throw new AppError('Insufficient balance', 400);
  }

  const newBalance = account.balance - amountPaise;
  accountModel.setBalance(accountId, newBalance);

  return transactionModel.insertTransaction({
    accountId,
    type: 'WITHDRAWAL',
    amount: amountPaise,
    balanceAfter: newBalance,
    description: description || 'Withdrawal'
  });
});

const transfer = db.transaction((fromAccountId, toAccountNumber, amountPaise, description) => {
  const fromAccount = accountModel.getAccountById(fromAccountId);
  assertActiveAccount(fromAccount);
  assertValidAmount(amountPaise);

  const toAccount = accountModel.getAccountByNumber(toAccountNumber);
  if (!toAccount) {
    throw new AppError('Recipient account does not exist', 404);
  }
  assertActiveAccount(toAccount);

  if (toAccount.id === fromAccount.id) {
    throw new AppError('Cannot transfer to your own account', 400);
  }

  if (fromAccount.balance < amountPaise) {
    throw new AppError('Insufficient balance', 400);
  }

  const fromNewBalance = fromAccount.balance - amountPaise;
  const toNewBalance = toAccount.balance + amountPaise;

  accountModel.setBalance(fromAccount.id, fromNewBalance);
  accountModel.setBalance(toAccount.id, toNewBalance);

  const outTxn = transactionModel.insertTransaction({
    accountId: fromAccount.id,
    relatedAccountId: toAccount.id,
    type: 'TRANSFER_OUT',
    amount: amountPaise,
    balanceAfter: fromNewBalance,
    description: description || `Transfer to ${toAccount.account_number}`
  });

  transactionModel.insertTransaction({
    accountId: toAccount.id,
    relatedAccountId: fromAccount.id,
    type: 'TRANSFER_IN',
    amount: amountPaise,
    balanceAfter: toNewBalance,
    description: description || `Transfer from ${fromAccount.account_number}`
  });

  return outTxn;
});

module.exports = { deposit, withdraw, transfer, assertValidAmount };
