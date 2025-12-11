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
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">External Shortener Configuration</h3>
        <p className="text-sm text-gray-500 mb-6">
            Configure the external service (like GPLinks, Droplink) that will actually shorten the URLs.
        </p>

        {msg && (
            <div className={`p-4 mb-4 rounded-md ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {msg.text}
            </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">API Token</label>
                <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-purple-500 focus:border-purple-500"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="e.g. 5d41402abc4b2a76b9719d911017c592"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Shortener Domain</label>
                <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-purple-500 focus:border-purple-500"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. gplinks.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                    Enter the domain of your provider (e.g., <code>gplinks.com</code> or <code>droplink.co</code>).
                </p>
            </div>
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
