import api from './api';

export async function deposit({ accountId, amount, description }) {
  const { data } = await api.post('/transactions/deposit', { accountId, amount, description });
  return data;
}

export async function withdraw({ accountId, amount, description }) {
  const { data } = await api.post('/transactions/withdraw', { accountId, amount, description });
  return data;
}

export async function transfer({ fromAccountId, toAccountNumber, amount, description }) {
  const { data } = await api.post('/transactions/transfer', { fromAccountId, toAccountNumber, amount, description });
  return data;
}

export async function getHistory(accountId, params = {}) {
  const { data } = await api.get(`/transactions/account/${accountId}`, { params });
  return data;
}

export async function getTransactionDetails(id) {
  const { data } = await api.get(`/transactions/${id}`);
  return data;
}
