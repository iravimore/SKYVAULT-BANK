import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getTransactionDetails } from '../services/transactionService';
import { paiseToRupeesDisplay, formatDateTime, transactionLabel, isCredit } from '../utils/format';

export default function TransactionDetails() {
  const { id } = useParams();
  const [txn, setTxn] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactionDetails(id)
      .then((data) => setTxn(data.transaction))
      .catch((err) => setError(err.response?.data?.error || 'Transaction not found'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Layout>
      <Link to="/history" className="text-sm text-vault-600 hover:underline mb-4 inline-block">
        ← Back to history
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transaction Details</h1>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      {txn && (
        <div className="max-w-lg bg-white rounded-2xl border shadow-sm p-6">
          <div className="text-center mb-6 pb-6 border-b">
            <p className="text-sm text-gray-500 mb-1">{transactionLabel(txn.type)}</p>
            <p className={`text-3xl font-bold ${isCredit(txn.type) ? 'text-green-600' : 'text-red-600'}`}>
              {isCredit(txn.type) ? '+' : '-'}
              {paiseToRupeesDisplay(txn.amount)}
            </p>
            <span
              className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${
                txn.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {txn.status === 'SUCCESS' ? '✓ Success' : txn.status}
            </span>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Date &amp; Time</dt>
              <dd className="text-gray-900 font-medium">{formatDateTime(txn.created_at)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Type</dt>
              <dd className="text-gray-900 font-medium">{transactionLabel(txn.type)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Description</dt>
              <dd className="text-gray-900 font-medium">{txn.description || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Balance after</dt>
              <dd className="text-gray-900 font-medium">{paiseToRupeesDisplay(txn.balance_after)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Reference ID</dt>
              <dd className="text-gray-900 font-mono text-xs">{txn.id}</dd>
            </div>
          </dl>
        </div>
      )}
    </Layout>
  );
}
