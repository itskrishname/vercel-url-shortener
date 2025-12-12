'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [token, setToken] = useState('');
  const [domain, setDomain] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetch('/api/user/me')
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                setToken(data.user.external_api_token || '');
                setDomain(data.user.external_domain || '');
            }
        });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
        const res = await fetch('/api/user/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ external_api_token: token, external_domain: domain })
        });
        const data = await res.json();
        if (res.ok) {
            setMsg({ type: 'success', text: 'Settings saved successfully!' });
        } else {
            setMsg({ type: 'error', text: data.message || 'Failed to save settings' });
        }
    } catch (e) {
        setMsg({ type: 'error', text: 'An error occurred' });
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-4">
      <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Settings</h2>
            <p className="text-gray-400 mt-1">Configure your external URL shortener provider.</p>
          </div>
      </div>

      <div className="glass-card p-8 rounded-2xl border border-white/10 relative overflow-hidden">
        {/* Background decorative element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">Provider Configuration</h3>
        <p className="text-sm text-gray-400 mb-8 max-w-2xl">
            This application acts as a bridge. The actual shortening is performed by an external service (like GPLinks, Droplink).
            Enter your API credentials below.
        </p>

        {msg && (
            <div className={`p-4 mb-6 rounded-xl border ${msg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                <div className="flex items-center">
                    {msg.type === 'success' ? (
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    {msg.text}
                </div>
            </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Token</label>
                <div className="relative">
                    <input
                        type="text"
                        required
                        className="glass-input block w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500/50"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="e.g. 5d41402abc4b2a76b9719d911017c592"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Shortener Domain</label>
                <div className="relative">
                     <input
                        type="text"
                        required
                        className="glass-input block w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500/50"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="e.g. gplinks.com"
                    />
                     <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    Enter the domain of your provider (e.g., <code>gplinks.com</code> or <code>droplink.co</code>).
                </p>
            </div>
            <div className="pt-6">
                <button
                    type="submit"
                    disabled={saving}
                    className="glass-button-primary px-8 py-3 rounded-xl font-bold text-white shadow-lg disabled:opacity-50 disabled:transform-none"
                >
                    {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
