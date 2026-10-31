import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getMyAccounts } from '../services/accountService';
import { getHistory } from '../services/transactionService';
import { paiseToRupeesDisplay, formatDate, transactionLabel, isCredit } from '../utils/format';

const TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'DEPOSIT', label: 'Deposits' },
  { value: 'WITHDRAWAL', label: 'Withdrawals' },
  { value: 'TRANSFER_OUT', label: 'Transfers sent' },
  { value: 'TRANSFER_IN', label: 'Transfers received' }
];

export default function History() {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyAccounts().then((data) => {
      setAccounts(data.accounts);
      if (data.accounts.length > 0) setAccountId(data.accounts[0].id);
    });
  }, []);

  const loadHistory = useCallback(() => {
    if (!accountId) return;
    setLoading(true);
    getHistory(accountId, { type: type || undefined, limit: 100 })
      .then((data) => setTransactions(data.transactions))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load transaction history'))
      .finally(() => setLoading(false));
  }, [accountId, type]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filtered = transactions.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (t.description || '').toLowerCase().includes(q) || transactionLabel(t.type).toLowerCase().includes(q);
  });

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h1>

      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vault-500"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                ****{acc.account_number.slice(-4)}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vault-500"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vault-500"
          />
        </div>

        {loading && <p className="px-5 py-6 text-sm text-gray-500">Loading...</p>}
        {error && <p className="px-5 py-6 text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500">No transactions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Type</th>
                      <th className="px-5 py-3 font-medium">Description</th>
                      <th className="px-5 py-3 font-medium text-right">Amount</th>
                      <th className="px-5 py-3 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{formatDate(txn.created_at)}</td>
                        <td className="px-5 py-3 font-medium text-gray-900">
                          <Link to={`/transactions/${txn.id}`} className="hover:underline text-vault-700">
                            {transactionLabel(txn.type)}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-gray-500">{txn.description || '—'}</td>
                        <td className={`px-5 py-3 text-right font-semibold ${isCredit(txn.type) ? 'text-green-600' : 'text-red-600'}`}>
                          {isCredit(txn.type) ? '+' : '-'}
                          {paiseToRupeesDisplay(txn.amount)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              txn.status === 'SUCCESS'
                                ? 'bg-green-100 text-green-700'
                                : txn.status === 'FAILED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {txn.status === 'SUCCESS' ? '✓ Success' : txn.status === 'FAILED' ? '✕ Failed' : '⏳ Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
