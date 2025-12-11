'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.role === 'admin') {
         // Should not happen on this page if we separate them, but good fallback
         router.push('/owner/dashboard');
      } else {
         router.push('/dashboard');
      }

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">Login</h1>
        <p className="text-center text-gray-500 mb-6">Access your dashboard</p>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              required
              placeholder="Enter username"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              placeholder="Enter password"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="h-4 w-4 text-purple-600 border-gray-300 rounded" />
            <label className="ml-2 block text-sm text-gray-900">Remember me for 7 days</label>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 transition"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a> | <a href="/owner/login" className="text-blue-600 hover:underline">Owner Login</a>
        </div>
      </div>
    </div>
  );
}
