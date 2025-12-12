'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
         router.push('/owner/dashboard');
      } else {
         router.push('/dashboard');
      }

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs for Atmosphere */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>

      <div className="glass-card p-10 rounded-2xl shadow-2xl w-full max-w-md relative z-10">
        <h1 className="text-3xl font-bold mb-2 text-center text-white">Welcome Back</h1>
        <p className="text-center text-purple-200 mb-8 font-light">Enter your credentials to continue</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-2 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              required
              placeholder="Enter username"
              className="glass-input w-full p-3 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition-all"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Enter password"
              className="glass-input w-full p-3 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
             <div className="flex items-center">
               <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500" />
               <label htmlFor="remember" className="ml-2 block text-sm text-gray-300">Remember me</label>
             </div>
             <a href="#" className="text-sm text-purple-300 hover:text-white transition-colors">Forgot Password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Don't have an account? <Link href="/register" className="text-white hover:underline font-semibold">Register</Link>
        </div>
        <div className="mt-4 text-center text-xs text-gray-500">
           <Link href="/owner/login" className="hover:text-gray-300 transition-colors">Owner Access</Link>
        </div>
      </div>
    </div>
  );
}
