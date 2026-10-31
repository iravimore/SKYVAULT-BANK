import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getMyAccounts } from '../services/accountService';
import { paiseToRupeesDisplay, maskAccountNumber } from '../utils/format';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAccounts()
      .then((data) => setAccounts(data.accounts))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load accounts'))
      .finally(() => setLoading(false));
  }, []);

  const statusColor = {
    ACTIVE: 'bg-green-100 text-green-700',
    FROZEN: 'bg-blue-100 text-blue-700',
    CLOSED: 'bg-gray-200 text-gray-600'
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Accounts</h1>

      {loading && <div className="text-gray-500">Loading accounts...</div>}
      {error && <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 capitalize">{acc.account_type.toLowerCase()} Account</p>
                <p className="text-lg font-semibold text-gray-900">{maskAccountNumber(acc.account_number)}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[acc.status] || 'bg-gray-100'}`}>
                {acc.status}
              </span>
            </div>
            <p className="text-2xl font-bold text-vault-900">{paiseToRupeesDisplay(acc.balance)}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
