'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OwnerLoginPage() {
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

      if (data.role !== 'admin') {
          throw new Error('Unauthorized Access');
      }

      router.push('/owner/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
       {/* Dark/Red theme for Owner */}
       <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob"></div>
       <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000"></div>

      <div className="glass-card p-10 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border-red-500/20">
        <div className="flex justify-center mb-6">
            <div className="p-3 bg-red-500/20 rounded-full border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-center text-white">Owner Access</h1>
        <p className="text-center text-red-200 mb-8 font-light">Authorized Personnel Only</p>

        {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl mb-6 text-sm text-center shadow-lg">
            {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Admin ID</label>
            <input
              type="text"
              required
              className="glass-input w-full p-3 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 transition-all border-red-500/20"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Passphrase</label>
            <input
              type="password"
              required
              className="glass-input w-full p-3 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 transition-all border-red-500/20"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-red-500/50 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
