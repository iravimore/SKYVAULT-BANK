import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { getMyAccounts } from '../services/accountService';
import { transfer } from '../services/transactionService';
import { paiseToRupeesDisplay, maskAccountNumber } from '../utils/format';

export default function Transfer() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ fromAccountId: '', toAccountNumber: '', amount: '', description: '' });
  const [step, setStep] = useState('form'); // form | review | done
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getMyAccounts().then((data) => {
      setAccounts(data.accounts);
      if (data.accounts.length > 0) {
        setForm((f) => ({ ...f, fromAccountId: data.accounts[0].id }));
      }
    });
  }, []);

  const selectedAccount = accounts.find((a) => a.id === form.fromAccountId);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.fromAccountId) return 'Please select an account';
    if (!form.toAccountNumber.trim()) return 'Recipient account number is required';
    const amountNum = parseFloat(form.amount);
    if (!amountNum || amountNum <= 0) return 'Enter a valid amount greater than zero';
    if (selectedAccount && amountNum * 100 > selectedAccount.balance) return 'Amount exceeds available balance';
    if (form.toAccountNumber.trim() === selectedAccount?.account_number) return 'Cannot transfer to your own account';
    return '';
  };

  const handleReview = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep('review');
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await transfer({
        fromAccountId: form.fromAccountId,
        toAccountNumber: form.toAccountNumber.trim(),
        amount: parseFloat(form.amount),
        description: form.description
      });
      setResult(data.transaction);
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed. Please try again.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transfer Money</h1>
      <div className="max-w-lg bg-white rounded-2xl border shadow-sm p-6">
        <Alert message={error} />

        {step === 'form' && (
          <form onSubmit={handleReview} noValidate>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
              <select
                name="fromAccountId"
                value={form.fromAccountId}
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
              label="Recipient Account Number"
              name="toAccountNumber"
              placeholder="9876543210"
              value={form.toAccountNumber}
              onChange={handleChange}
              required
            />
            <Input
              label="Amount (₹)"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="5000"
              value={form.amount}
              onChange={handleChange}
              required
            />
            <Input
              label="Description (optional)"
              name="description"
              placeholder="Rent"
              value={form.description}
              onChange={handleChange}
            />

            <Button type="submit" className="w-full mt-2">
              Review Transfer
            </Button>
          </form>
        )}

        {step === 'review' && (
          <div>
            <p className="text-gray-700 mb-6 text-center text-lg">
              Transfer <span className="font-semibold">₹{parseFloat(form.amount).toLocaleString('en-IN')}</span> to account{' '}
              <span className="font-semibold">{maskAccountNumber(form.toAccountNumber)}</span>?
            </p>
            {form.description && <p className="text-sm text-gray-500 text-center mb-6">"{form.description}"</p>}
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep('form')} disabled={loading}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleConfirm} loading={loading}>
                Confirm
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && result && (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Transaction successful</h2>
            <p className="text-gray-500 text-sm mb-6">
              {paiseToRupeesDisplay(result.amount)} sent to {maskAccountNumber(form.toAccountNumber)}
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => navigate('/history')}>
                View History
              </Button>
              <Button className="flex-1" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
