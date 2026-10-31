import React, { useState } from 'react';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setSuccess('Password changed successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="max-w-lg bg-white rounded-2xl border shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium">{user?.full_name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
        </dl>
      </div>

      <div className="max-w-lg bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
        <Alert message={error} />
        <Alert type="success" message={success} />

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Current Password"
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            required
          />
          <Input
            label="New Password"
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <Button type="submit" loading={loading} className="w-full mt-2">
            Update Password
          </Button>
        </form>
      </div>
    </Layout>
  );
}
