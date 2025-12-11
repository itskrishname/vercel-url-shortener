'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    admin_invite_code: '',
    external_api_token: '',
    external_domain: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-600">Register</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              required
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
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Admin Invite Code</label>
            <input
              type="password"
              required
              placeholder="Ask owner for code"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.admin_invite_code}
              onChange={(e) => setFormData({ ...formData, admin_invite_code: e.target.value })}
            />
          </div>
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">External Shortener Config</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">API Token</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={formData.external_api_token}
                onChange={(e) => setFormData({ ...formData, external_api_token: e.target.value })}
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Domain (e.g., gplinks.com)</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={formData.external_domain}
                onChange={(e) => setFormData({ ...formData, external_domain: e.target.value })}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 transition"
          >
            Register
          </button>
        </form>
        <div className="mt-4 text-center">
            <a href="/login" className="text-sm text-blue-600 hover:underline">Already have an account? Login</a>
        </div>
      </div>
    </div>
  );
}
