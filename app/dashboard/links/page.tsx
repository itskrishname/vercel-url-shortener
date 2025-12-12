'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function getVercelLink(token: string) {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/start/${token}`;
}

export default function LinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLinks = () => {
    fetch('/api/links')
        .then((res) => res.json())
        .then((data) => {
            if (data.status === 'success' && Array.isArray(data.links)) {
                setLinks(data.links);
            } else {
                setLinks([]);
            }
        })
        .catch(() => setLinks([]))
        .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleDelete = async (id: string) => {
      // Confirm with user
      if(!confirm('Are you sure you want to delete this link? This will stop the redirect immediately.')) return;

      setDeletingId(id);
      try {
          const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
          if (res.ok) {
              setLinks(links.filter(l => l._id !== id));
          } else {
              const data = await res.json();
              alert(data.error || 'Failed to delete');
          }
      } catch (e) {
          alert('Error deleting link');
      } finally {
          setDeletingId(null);
      }
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center h-96">
             <div className="relative w-24 h-24">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500/20 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_20px_#06b6d4]"></div>
             </div>
             <p className="mt-8 text-cyan-500/80 font-mono text-sm tracking-widest animate-pulse">SYNCHRONIZING DATA...</p>
          </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto pt-4 pb-20">
      <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">My Links</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full mt-2"></div>
          </div>
          <div className="glass px-6 py-3 rounded-xl border border-white/10 text-sm text-gray-300 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
             Active Nodes: <span className="text-cyan-400 font-bold ml-2 text-xl">{links.length}</span>
          </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-black/40">
                    <tr>
                        <th className="px-6 py-5 text-left text-xs font-bold text-purple-400 uppercase tracking-[0.1em]">Original Target</th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-cyan-400 uppercase tracking-[0.1em]">Nexus Bridge</th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-pink-400 uppercase tracking-[0.1em]">Traffic</th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Timestamp</th>
                        <th className="px-6 py-5 text-right text-xs font-bold text-red-400 uppercase tracking-[0.1em]">Command</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {links.map((link) => (
                        <tr key={link._id} className="hover:bg-white/5 transition-all duration-200 group">
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-300 max-w-xs relative">
                                <div className="truncate pr-4 font-mono opacity-80 group-hover:opacity-100 group-hover:text-white transition-opacity" title={link.originalUrl}>{link.originalUrl}</div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm">
                                <div className="flex items-center space-x-3">
                                    <span className="text-cyan-300 font-mono text-xs bg-cyan-900/20 px-3 py-1.5 rounded-lg border border-cyan-500/20 truncate max-w-[180px] shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                        /start/{link.localToken || link.token}
                                    </span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(getVercelLink(link.localToken || link.token))}
                                        className="text-gray-500 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
                                        title="Copy Link"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    </button>
                                </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm">
                                <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-3 ${link.visits > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
                                    <span className="font-bold text-white text-lg">{link.visits}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                                {new Date(link.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => handleDelete(link._id)}
                                    disabled={deletingId === link._id}
                                    className="text-red-400 hover:text-red-200 bg-red-500/5 hover:bg-red-500/20 px-4 py-2 rounded-xl border border-red-500/10 hover:border-red-500/40 transition-all duration-300"
                                >
                                    {deletingId === link._id ? (
                                        <span className="animate-pulse">...</span>
                                    ) : (
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Delete
                                        </div>
                                    )}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {links.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-32 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="relative w-24 h-24 mb-6 group">
                                        <div className="absolute inset-0 bg-purple-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
                                        <div className="relative w-full h-full bg-black/50 rounded-full flex items-center justify-center border border-white/10 group-hover:border-purple-500/50 transition-colors">
                                             <svg className="w-10 h-10 text-gray-600 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-400 mb-2">No Active Bridges</p>
                                    <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">Your network is silent. Initialize your first link bridge to start routing traffic.</p>
                                    <Link href="/dashboard/create" className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_#06b6d4]">
                                        Initialize Link
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
