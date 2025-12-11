'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CreateLinkPage() {
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<any>(null);
  const [apiKey, setApiKey] = useState('');
  const [hasSettings, setHasSettings] = useState(true);

  useEffect(() => {
    fetch('/api/user/me')
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                setApiKey(data.user.app_api_key);
                if (!data.user.external_api_token || !data.user.external_domain) {
                    setHasSettings(false);
                }
            }
        });
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSettings) {
        alert('Please configure your External API settings first!');
        return;
    }

    setGenerating(true);
    setLastGenerated(null);
    try {
        const apiUrl = `/api/shorten?api=${apiKey}&url=${encodeURIComponent(newLinkUrl)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data.status === 'success') {
            setLastGenerated(data);
            setNewLinkUrl('');
        } else {
            alert('Error: ' + data.message);
        }
    } catch (e) {
        alert('Failed to generate link');
    } finally {
        setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Link</h2>

      {!hasSettings && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                  <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                  </div>
                  <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                          You haven't configured your External Shortener Provider yet.
                          <Link href="/dashboard/settings" className="font-bold underline ml-1">Go to Settings</Link>
                      </p>
                  </div>
              </div>
          </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleGenerate} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Target URL</label>
                <input
                    type="url"
                    required
                    placeholder="https://example.com"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                />
            </div>
            <button
                type="submit"
                disabled={generating || !hasSettings}
                className="w-full bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
                {generating ? 'Shortening...' : 'Shorten URL'}
            </button>
        </form>
      </div>

      {lastGenerated && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-green-900">Link Created!</h3>
            <div className="mt-4 space-y-3">
                <div>
                    <span className="text-sm font-medium text-green-700 block">Original URL</span>
                    <p className="text-sm text-gray-600 truncate">{lastGenerated.original_url}</p>
                </div>
                <div>
                    <span className="text-sm font-medium text-green-700 block">Shortened URL</span>
                    <div className="flex items-center gap-2 mt-1">
                        <input
                            readOnly
                            value={lastGenerated.shortenedUrl}
                            className="block w-full text-sm border-gray-300 rounded-md bg-white p-2"
                        />
                        <button
                            onClick={() => navigator.clipboard.writeText(lastGenerated.shortenedUrl)}
                            className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-50"
                        >
                            Copy
                        </button>
                    </div>
                    <a href={lastGenerated.shortenedUrl} target="_blank" className="text-xs text-blue-600 underline mt-1 block">Test Link</a>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
