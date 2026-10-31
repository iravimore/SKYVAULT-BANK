import api from './api';

export async function getDashboard() {
  const { data } = await api.get('/accounts/dashboard');
  return data;
}

export async function getMyAccounts() {
  const { data } = await api.get('/accounts');
  return data;
}
