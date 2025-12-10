'use client';

import { useState, useEffect } from 'react';
import { Plus, Link as LinkIcon, ExternalLink, RefreshCw, Copy, Check, Search, Calendar, Globe, Trash2, Key, Edit2 } from 'lucide-react';

interface LinkData {
  token: string;
  originalUrl: string;
  externalShortUrl: string;
  createdAt: string;
}

export default function LinksPage() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    longUrl: '',
    apiUrl: '',
    apiToken: '',
  });
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [editingLink, setEditingLink] = useState<LinkData | null>(null);

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

  const handleUpdateLink = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingLink) return;

      try {
          const res = await fetch(`/api/link/${editingLink.token}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  originalUrl: editingLink.originalUrl,
                  externalShortUrl: editingLink.externalShortUrl
              })
          });

          if (res.ok) {
              setEditingLink(null);
              fetchLinks();
          } else {
              alert('Failed to update link');
          }
      } catch (err) {
          alert('Error updating link');
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
        fetchLinks();
        setFormData(prev => ({ ...prev, longUrl: '' }));
      } else {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.error || errorData.message || 'Failed to generate link';
        const details = errorData.details ? `\n\nDetails: ${errorData.details}` : '';
        alert(`Error: ${msg}${details}\n\nPlease check the Diagnostics page if this persists.`);
      }
    } catch (error) {
      alert('Error generating link: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLinks = links.filter(l =>
    l.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
    l.token.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Link Manager</h1>
            <p className="text-slate-400">Create and manage your redirected links.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column: Generator */}
            <div className="xl:col-span-4">
                 <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl sticky top-24">
                  <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                    <Plus className="w-5 h-5 text-blue-400" />
                    New Shortlink
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Destination URL</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input
                            required
                            type="url"
                            placeholder="https://example.com"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-2.5 pl-10 text-white focus:ring-2 focus:ring-blue-500/50 outline-none text-sm transition-all"
                            value={formData.longUrl}
                            onChange={(e) => setFormData({...formData, longUrl: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-4">
                       <div className="flex items-center justify-between">
                         <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">API Configuration</h3>
                         <span className="text-[10px] text-slate-600 bg-slate-900 px-2 py-0.5 rounded">External Service</span>
                       </div>

                       <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-medium ml-1">API Endpoint</label>
                          <input
                            required
                            type="url"
                            placeholder="https://shortener.com/api"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                            value={formData.apiUrl}
                            onChange={(e) => setFormData({...formData, apiUrl: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-medium ml-1">API Token</label>
                          <div className="relative">
                            <Key className="absolute left-3 top-2.5 w-3 h-3 text-slate-500" />
                            <input
                                required
                                type="password"
                                placeholder="Secret Key"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-2.5 pl-8 text-xs text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                value={formData.apiToken}
                                onChange={(e) => setFormData({...formData, apiToken: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex justify-center items-center gap-2 mt-2"
                    >
                      {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : 'Generate Link'}
                    </button>
                  </form>

                  {generatedLink && (
                    <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                      <p className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ready to Share
                      </p>
                      <div className="flex items-center gap-2 bg-slate-950/50 p-2 rounded-lg border border-white/5">
                        <code className="text-xs flex-1 truncate text-slate-300 font-mono select-all">{generatedLink}</code>
                        <button onClick={() => copyToClipboard(generatedLink)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white">
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
            </div>

            {/* Right Column: List */}
            <div className="xl:col-span-8">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden flex flex-col h-full min-h-[500px]">

                  {/* Toolbar */}
                  <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-white">Recent Activity</h2>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search links..."
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button onClick={fetchLinks} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Token</th>
                          <th className="px-6 py-4 font-semibold">Destination</th>
                          <th className="px-6 py-4 font-semibold">External Short</th>
                          <th className="px-6 py-4 font-semibold text-right">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredLinks.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-20 text-center text-slate-500">
                               <div className="flex flex-col items-center gap-3">
                                   <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                       <LinkIcon className="w-6 h-6 text-slate-600" />
                                   </div>
                                   <p>No links found</p>
                               </div>
                            </td>
                          </tr>
                        ) : (
                          filteredLinks.map((link) => (
                            <tr key={link.token} className="hover:bg-white/5 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-mono text-xs font-bold border border-blue-500/20">
                                          {link.token.substring(0,2)}
                                      </div>
                                      <span className="font-mono text-blue-300 text-sm">{link.token}</span>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="max-w-[150px] lg:max-w-[200px] truncate text-slate-300 text-sm font-medium" title={link.originalUrl}>
                                  {link.originalUrl}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                 <a href={link.externalShortUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all text-xs max-w-[150px] truncate">
                                   <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                   <span className="truncate">{link.externalShortUrl}</span>
                                 </a>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3 text-slate-500 text-xs">
                                    <button
                                        onClick={() => setEditingLink(link)}
                                        className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                                        title="Edit Link"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <div className="hidden sm:flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(link.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
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

        {/* Edit Modal */}
        {editingLink && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                    <h3 className="text-lg font-bold text-white mb-4">Edit Link</h3>
                    <form onSubmit={handleUpdateLink} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400">Original Destination</label>
                            <input
                                type="url"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={editingLink.originalUrl}
                                onChange={e => setEditingLink({...editingLink, originalUrl: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400">External Short URL</label>
                            <input
                                type="url"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={editingLink.externalShortUrl}
                                onChange={e => setEditingLink({...editingLink, externalShortUrl: e.target.value})}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setEditingLink(null)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}
