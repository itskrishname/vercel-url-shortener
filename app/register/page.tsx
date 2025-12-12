'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background Blobs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>

      <div className="glass-card p-8 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 my-10">
        <h1 className="text-3xl font-bold mb-2 text-center text-white">Create Account</h1>
        <p className="text-center text-purple-200 mb-6 font-light">Join the Universal Link Bridge</p>

        {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-2 rounded mb-6 text-sm text-center">
            {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              required
              className="glass-input w-full p-2.5 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition-all"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              className="glass-input w-full p-2.5 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Invite Code</label>
            <input
              type="text"
              required
              placeholder="Required for registration"
              className="glass-input w-full p-2.5 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition-all"
              value={formData.admin_invite_code}
              onChange={(e) => setFormData({ ...formData, admin_invite_code: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-white/10 mt-4">
            <h3 className="text-sm font-semibold text-purple-300 mb-4 uppercase tracking-wider">External Shortener Setup</h3>
            <div className="grid grid-cols-1 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">API Token</label>
                <input
                    type="text"
                    required
                    placeholder="e.g. 5d41402abc4b2a76b9719d911017c592"
                    className="glass-input w-full p-2.5 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition-all"
                    value={formData.external_api_token}
                    onChange={(e) => setFormData({ ...formData, external_api_token: e.target.value })}
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Domain Provider</label>
                <input
                    type="text"
                    required
                    placeholder="e.g., gplinks.com"
                    className="glass-input w-full p-2.5 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition-all"
                    value={formData.external_domain}
                    onChange={(e) => setFormData({ ...formData, external_domain: e.target.value })}
                />
                </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
             {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account? <Link href="/login" className="text-white hover:underline font-semibold">Login here</Link>
        </div>
      </div>
    </div>
  );
}
