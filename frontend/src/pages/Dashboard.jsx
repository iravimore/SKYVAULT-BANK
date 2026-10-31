import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../services/accountService';
import { paiseToRupeesDisplay, maskAccountNumber, formatDate, transactionLabel, isCredit } from '../utils/format';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {greeting}, {firstName} 👋
      </h1>

      {loading && <div className="text-gray-500">Loading dashboard...</div>}
      {error && <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-vault-600 to-vault-900 text-white rounded-2xl p-6 shadow-sm">
              <p className="text-vault-100 text-sm mb-1">Available Balance</p>
              <p className="text-3xl font-bold">{paiseToRupeesDisplay(data.account.balance)}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <p className="text-gray-500 text-sm mb-1">Account</p>
              <p className="text-2xl font-semibold text-gray-900">{maskAccountNumber(data.account.account_number)}</p>
              <p className="text-sm text-gray-500 mt-1 capitalize">
                {data.account.account_type.toLowerCase()} · {data.account.status}
              </p>
            </div>
          </div>

          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-3 mb-8">
            <Link to="/deposit" className="px-5 py-2.5 rounded-xl bg-white border shadow-sm hover:shadow font-medium text-sm text-gray-700">
              💰 Deposit
            </Link>
            <Link to="/withdraw" className="px-5 py-2.5 rounded-xl bg-white border shadow-sm hover:shadow font-medium text-sm text-gray-700">
              🏧 Withdraw
            </Link>
            <Link to="/transfer" className="px-5 py-2.5 rounded-xl bg-vault-500 text-white shadow-sm hover:bg-vault-600 font-medium text-sm">
              ↗️ Transfer
            </Link>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
              <Link to="/history" className="text-sm text-vault-600 hover:underline">
                View all
              </Link>
            </div>
            {data.recentTransactions.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500">No transactions yet.</p>
            ) : (
              <ul className="divide-y">
                {data.recentTransactions.map((txn) => (
                  <li key={txn.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{transactionLabel(txn.type)}</p>
                      <p className="text-gray-500">{formatDate(txn.created_at)}</p>
                    </div>
                    <span className={`font-semibold ${isCredit(txn.type) ? 'text-green-600' : 'text-red-600'}`}>
                      {isCredit(txn.type) ? '+' : '-'}
                      {paiseToRupeesDisplay(txn.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
