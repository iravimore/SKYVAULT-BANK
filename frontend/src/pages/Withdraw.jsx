import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { getMyAccounts } from '../services/accountService';
import { withdraw } from '../services/transactionService';
import { paiseToRupeesDisplay, maskAccountNumber } from '../utils/format';

export default function Withdraw() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ accountId: '', amount: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMyAccounts().then((data) => {
      setAccounts(data.accounts);
      if (data.accounts.length > 0) setForm((f) => ({ ...f, accountId: data.accounts[0].id }));
    });
  }, []);

  const selectedAccount = accounts.find((a) => a.id === form.accountId);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const amountNum = parseFloat(form.amount);
    if (!amountNum || amountNum <= 0) {
      setError('Enter a valid amount greater than zero');
      return;
    }
    if (selectedAccount && amountNum * 100 > selectedAccount.balance) {
      setError('Amount exceeds available balance');
      return;
    }

    setLoading(true);
    try {
      const data = await withdraw({ accountId: form.accountId, amount: amountNum, description: form.description });
      setSuccess(`Withdrew ${paiseToRupeesDisplay(data.transaction.amount)} successfully.`);
      setForm((f) => ({ ...f, amount: '', description: '' }));
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Withdraw Money</h1>
      <div className="max-w-lg bg-white rounded-2xl border shadow-sm p-6">
        <Alert message={error} />
        <Alert type="success" message={success} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
            <select
              name="accountId"
              value={form.accountId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {maskAccountNumber(acc.account_number)} — {paiseToRupeesDisplay(acc.balance)}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Amount (₹)"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="2000"
            value={form.amount}
            onChange={handleChange}
            required
          />
          <Input
            label="Description (optional)"
            name="description"
            placeholder="ATM withdrawal"
            value={form.description}
            onChange={handleChange}
          />

          <Button type="submit" loading={loading} className="w-full mt-2">
            Withdraw
          </Button>
        </form>
      </div>
    </Layout>
  );
}
