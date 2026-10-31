import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

const PASSWORD_HINT = 'At least 8 characters, with uppercase, lowercase, and a number.';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏦</div>
          <h1 className="text-xl font-bold text-vault-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start banking with SkyVault</p>
        </div>

        <Alert message={error} />
        <Alert type="success" message={success} />

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Full name"
            name="fullName"
            placeholder="Rahul Sharma"
            value={form.fullName}
            onChange={handleChange}
            required
          />
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
            autoComplete="new-password"
          />
          <p className="text-xs text-gray-500 -mt-3 mb-4">{PASSWORD_HINT}</p>
          <Input
            label="Confirm password"
            type="password"
            name="confirmPassword"
            placeholder="••••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
          <Button type="submit" loading={loading} className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-vault-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
