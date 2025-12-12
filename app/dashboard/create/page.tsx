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
    <div className="max-w-4xl mx-auto pt-8">
      <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Create Link</h2>
            <p className="text-gray-400 mt-1">Transform your long URLs into powerful short links.</p>
          </div>
      </div>

      {!hasSettings && (
          <div className="glass-card border-l-4 border-l-yellow-500 p-4 mb-8 bg-yellow-500/10">
              <div className="flex items-start">
                  <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                  </div>
                  <div className="ml-3">
                      <h3 className="text-sm font-bold text-yellow-200">Configuration Required</h3>
                      <p className="text-sm text-yellow-100/70 mt-1">
                          You need to setup your external shortener provider before creating links.
                      </p>
                      <div className="mt-3">
                          <Link href="/dashboard/settings" className="text-sm font-bold text-yellow-400 hover:text-yellow-300 underline decoration-2 underline-offset-2">
                              Go to Settings &rarr;
                          </Link>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
        {/* Glow effect behind the card */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[100px] -z-10 pointer-events-none"></div>

        <form onSubmit={handleGenerate} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Destination URL</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <input
                        type="url"
                        required
                        placeholder="Paste your long link here (e.g., https://youtube.com/...)"
                        className="glass-input block w-full pl-12 pr-4 py-4 rounded-xl text-lg placeholder-gray-500"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                    />
                </div>
            </div>
            <button
                type="submit"
                disabled={generating || !hasSettings}
                className="w-full glass-button-primary py-4 rounded-xl text-lg font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {generating ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Shortening...
                    </span>
                ) : (
                    'Shorten URL'
                )}
            </button>
        </form>
      </div>

      {lastGenerated && (
        <div className="mt-8 glass-card p-1 rounded-2xl border-green-500/30 bg-green-900/10 animate-fade-in-up">
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-6">
                <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Link Generated Successfully!</h3>
                </div>

                <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Original URL</span>
                        <p className="text-sm text-gray-300 truncate font-mono">{lastGenerated.original_url}</p>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-green-400 uppercase tracking-wider block mb-2 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">Your Short Link</span>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-grow">
                                <input
                                    readOnly
                                    value={lastGenerated.shortenedUrl}
                                    className="block w-full text-base font-medium font-mono border-green-500/30 rounded-lg bg-green-500/5 text-green-300 p-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] focus:outline-none"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(lastGenerated.shortenedUrl);
                                    // Could add a toast here
                                }}
                                className="glass-button px-6 py-4 rounded-lg font-bold hover:bg-white/10 active:scale-95 transition-all whitespace-nowrap"
                            >
                                Copy Link
                            </button>
                        </div>
                        <div className="mt-3 flex justify-end">
                            <a href={lastGenerated.shortenedUrl} target="_blank" className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center transition-colors">
                                Test Link <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
