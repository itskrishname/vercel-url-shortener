'use client';

import { useState, useEffect } from 'react';
import { Plus, Link as LinkIcon, ExternalLink, RefreshCw, Copy, Check } from 'lucide-react';

interface LinkData {
  token: string;
  originalUrl: string;
  externalShortUrl: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    longUrl: '',
    apiUrl: '',
    apiToken: '',
  });
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch recent links on mount
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links);
      }
    } catch (error) {
      console.error('Failed to fetch links');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedLink('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        const fullLink = `${window.location.origin}/start/${data.token}`;
        setGeneratedLink(fullLink);
        fetchLinks(); // Refresh list
        // Optional: Clear longUrl but keep API settings
        setFormData(prev => ({ ...prev, longUrl: '' }));
      } else {
        alert('Failed to generate link. Check API settings.');
      }
    } catch (error) {
      alert('Error generating link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8 border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LinkIcon className="text-blue-500" />
            Link Manager
          </h1>
          <div className="text-sm text-slate-400">Admin Dashboard</div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generator Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-400" />
                New Link
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Original Long URL</label>
                  <input
                    required
                    type="url"
                    placeholder="https://destination.com/..."
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.longUrl}
                    onChange={(e) => setFormData({...formData, longUrl: e.target.value})}
                  />
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">External API Config</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">API URL (Base)</label>
                      <input
                        required
                        type="url"
                        placeholder="https://shortener.com/api"
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.apiUrl}
                        onChange={(e) => setFormData({...formData, apiUrl: e.target.value})}
                      />
                      <p className="text-[10px] text-slate-500 mt-1">The system will append ?api=TOKEN&url=LONG_URL</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">API Token</label>
                      <input
                        required
                        type="text"
                        placeholder="Secret API Key"
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.apiToken}
                        onChange={(e) => setFormData({...formData, apiToken: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-3 px-4 rounded transition-all flex justify-center items-center gap-2 mt-4"
                >
                  {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : 'Generate Vercel Link'}
                </button>
              </form>

              {generatedLink && (
                <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm font-medium mb-2">Link Created Successfully!</p>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-700">
                    <code className="text-sm flex-1 truncate text-slate-300">{generatedLink}</code>
                    <button onClick={copyToClipboard} className="text-slate-400 hover:text-white transition-colors">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Recent Links</h2>
                <button onClick={fetchLinks} className="text-slate-400 hover:text-white">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3">Vercel Token</th>
                      <th className="px-6 py-3">Original URL</th>
                      <th className="px-6 py-3">External Short URL</th>
                      <th className="px-6 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {links.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                          No links generated yet.
                        </td>
                      </tr>
                    ) : (
                      links.map((link) => (
                        <tr key={link.token} className="hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-blue-400 text-sm">{link.token}</td>
                          <td className="px-6 py-4">
                            <div className="max-w-[200px] truncate text-slate-300 text-sm" title={link.originalUrl}>
                              {link.originalUrl}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <a href={link.externalShortUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-slate-400 hover:text-blue-400 text-sm max-w-[200px] truncate">
                               {link.externalShortUrl}
                               <ExternalLink className="w-3 h-3" />
                             </a>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {new Date(link.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
