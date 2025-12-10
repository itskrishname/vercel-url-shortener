'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Zap, Plus, Trash2, Save, Globe } from 'lucide-react';

interface Provider {
    _id: string;
    name: string;
    apiUrl: string;
    apiToken: string;
}

export default function ApiBuilderPage() {
    // State for the Generator Form
    const [longUrl, setLongUrl] = useState('');
    const [apiUrl, setApiUrl] = useState('');
    const [apiToken, setApiToken] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);

    // State for Saved Providers
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loadingProviders, setLoadingProviders] = useState(true);
    const [isAddingProvider, setIsAddingProvider] = useState(false);

    // New Provider Form State
    const [newProviderName, setNewProviderName] = useState('');
    const [newProviderUrl, setNewProviderUrl] = useState('');
    const [newProviderToken, setNewProviderToken] = useState('');
    const [saveError, setSaveError] = useState('');

    // Fetch Providers on Load
    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            const res = await fetch('/api/providers');
            if (res.ok) {
                const data = await res.json();
                setProviders(data);
            }
        } catch (e) {
            console.error('Failed to fetch providers', e);
        } finally {
            setLoadingProviders(false);
        }
    };

    const handleSaveProvider = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveError('');

        try {
            const res = await fetch('/api/providers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newProviderName,
                    apiUrl: newProviderUrl,
                    apiToken: newProviderToken
                })
            });

            if (res.ok) {
                setIsAddingProvider(false);
                setNewProviderName('');
                setNewProviderUrl('');
                setNewProviderToken('');
                fetchProviders(); // Refresh list
            } else {
                const data = await res.json();
                setSaveError(data.error || 'Failed to save provider');
            }
        } catch (e) {
            setSaveError('Connection error');
        }
    };

    const handleDeleteProvider = async (id: string) => {
        if (!confirm('Are you sure you want to delete this provider?')) return;

        try {
            await fetch(`/api/providers/${id}`, { method: 'DELETE' });
            fetchProviders();
        } catch (e) {
            console.error('Failed to delete', e);
        }
    };

    const loadProvider = (provider: Provider) => {
        setApiUrl(provider.apiUrl);
        setApiToken(provider.apiToken);
    };

    const generateLink = () => {
        if (!apiUrl || !apiToken) return;

        // Ensure clean inputs
        const cleanApiUrl = apiUrl.trim();
        const cleanToken = apiToken.trim();

        // Base URL of the Vercel App
        const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : '';

        // Use the /api/bridge endpoint which supports GET requests for bots
        // Note: Using 'key' instead of 'api' to match standard query params if needed,
        // but our bridge parses 'api' as the token key.
        const link = `${appBaseUrl}/api/bridge?api=${cleanToken}&url=${longUrl || '{url}'}&provider=${encodeURIComponent(cleanApiUrl)}`;
        setGeneratedLink(link);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">API Manager</h1>
                <p className="text-slate-400">Manage external providers and generate Smart Links for your bots.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Saved Providers */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Saved Providers</h2>
                        <button
                            onClick={() => setIsAddingProvider(!isAddingProvider)}
                            className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors text-white"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {isAddingProvider && (
                        <div className="bg-slate-900/50 border border-blue-500/30 p-4 rounded-xl space-y-3">
                            <h3 className="text-sm font-semibold text-blue-400">Add New Provider</h3>
                            <input
                                type="text"
                                placeholder="Name (e.g. GPLinks)"
                                className="w-full bg-black/30 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                value={newProviderName}
                                onChange={(e) => setNewProviderName(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="API URL (e.g. https://site.com/api)"
                                className="w-full bg-black/30 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                value={newProviderUrl}
                                onChange={(e) => setNewProviderUrl(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="API Token"
                                className="w-full bg-black/30 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                value={newProviderToken}
                                onChange={(e) => setNewProviderToken(e.target.value)}
                            />
                            {saveError && <p className="text-red-400 text-xs">{saveError}</p>}
                            <button
                                onClick={handleSaveProvider}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="w-3 h-3" /> Save Provider
                            </button>
                        </div>
                    )}

                    <div className="space-y-3">
                        {loadingProviders ? (
                            <p className="text-slate-500 text-sm">Loading...</p>
                        ) : providers.length === 0 ? (
                            <p className="text-slate-500 text-sm italic">No providers saved yet.</p>
                        ) : (
                            providers.map((provider) => (
                                <div key={provider._id} className="bg-white/5 border border-white/10 p-4 rounded-xl group hover:border-blue-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-white">{provider.name}</h3>
                                        <button
                                            onClick={() => handleDeleteProvider(provider._id)}
                                            className="text-slate-600 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mb-3">{provider.apiUrl}</p>
                                    <button
                                        onClick={() => loadProvider(provider)}
                                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Zap className="w-3 h-3" /> Use This API
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Generator */}
                <div className="lg:col-span-2">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-600/20 rounded-xl">
                                <Zap className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Smart Link Generator</h2>
                                <p className="text-slate-400 text-sm">Generate a universal API link for your bots.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">External API URL</label>
                                <input
                                    type="text"
                                    value={apiUrl}
                                    onChange={(e) => setApiUrl(e.target.value)}
                                    placeholder="https://gplinks.com/api"
                                    className="w-full bg-black/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:border-blue-500 outline-none transition-all"
                                />
                                {apiUrl && !apiUrl.endsWith('/api') && !apiUrl.endsWith('v1') && (
                                    <p className="text-yellow-500 text-xs flex items-center gap-1">
                                        ⚠️ Warning: Most API URLs end in <code>/api</code>. Double check your provider.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">API Token</label>
                                <input
                                    type="text"
                                    value={apiToken}
                                    onChange={(e) => setApiToken(e.target.value)}
                                    placeholder="e.g. 5d41402abc4b2a76b9719d911017c592"
                                    className="w-full bg-black/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Test Destination URL (Optional)</label>
                                <input
                                    type="text"
                                    value={longUrl}
                                    onChange={(e) => setLongUrl(e.target.value)}
                                    placeholder="Leave blank to generate a template link for bots"
                                    className="w-full bg-black/50 border border-slate-700 text-white rounded-xl py-3 px-4 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <button
                                onClick={generateLink}
                                disabled={!apiUrl || !apiToken}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Generate Smart Link
                            </button>

                            {generatedLink && (
                                <div className="mt-8 p-6 bg-slate-900/80 rounded-2xl border border-blue-500/20 animate-in fade-in slide-in-from-top-2">
                                    <h3 className="text-sm font-bold text-slate-400 mb-2">Your Smart Link</h3>
                                    <div className="flex gap-2">
                                        <code className="flex-1 bg-black/50 p-3 rounded-lg text-blue-400 text-sm font-mono break-all border border-slate-800">
                                            {generatedLink}
                                        </code>
                                        <button
                                            onClick={copyToClipboard}
                                            className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg transition-colors border border-slate-700"
                                        >
                                            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                                        <strong>How to use:</strong> Copy this link and use it in your Telegram bot or script.
                                        Replace <code>{'{url}'}</code> with the actual long URL you want to shorten dynamically.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
