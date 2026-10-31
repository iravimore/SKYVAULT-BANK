import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏦</div>
          <h1 className="text-xl font-bold text-vault-900">SkyVault Bank</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back</p>
        </div>

        <Alert message={error} />

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="user@example.com"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••••"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
          <Button type="submit" loading={loading} className="w-full mt-2">
            Login
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-vault-600 font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
