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
      if(!confirm('Are you sure you want to delete this link?')) return;

      setDeletingId(id);
      try {
          const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
          if (res.ok) {
              setLinks(links.filter(l => l._id !== id));
          } else {
              alert('Failed to delete');
          }
      } catch (e) {
          alert('Error deleting link');
      } finally {
          setDeletingId(null);
      }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center h-64">
             <div className="relative w-20 h-20">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500/30 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-500 rounded-full animate-spin"></div>
             </div>
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto pt-4">
      <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">My Links</h2>
            <p className="text-gray-400 mt-1">Manage and track your shortened URLs.</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-gray-300">
             Total Links: <span className="text-purple-400 font-bold ml-1 text-lg">{links.length}</span>
          </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5 bg-black/40">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black/40">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">Original URL</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">Short Link</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">Visits</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-purple-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {links.map((link) => (
                        <tr key={link._id} className="hover:bg-white/5 transition-colors duration-150 group">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 max-w-xs relative">
                                <div className="truncate pr-4" title={link.originalUrl}>{link.originalUrl}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center space-x-2">
                                    <span className="text-blue-400 font-mono text-xs bg-blue-900/20 px-2 py-1 rounded border border-blue-500/20 truncate max-w-[150px]">
                                        /start/{link.localToken || link.token}
                                    </span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(getVercelLink(link.localToken || link.token))}
                                        className="text-gray-500 hover:text-white transition-colors p-1"
                                        title="Copy"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    </button>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    <span className="font-bold text-white">{link.visits}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {new Date(link.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => handleDelete(link._id)}
                                    disabled={deletingId === link._id}
                                    className="text-red-400 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500/50 transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                >
                                    {deletingId === link._id ? (
                                        <span className="animate-pulse">Deleting...</span>
                                    ) : (
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Delete
                                        </div>
                                    )}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {links.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-24 text-center text-gray-500">
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                    </div>
                                    <p className="text-xl font-medium text-gray-300">No links generated yet.</p>
                                    <p className="text-sm opacity-60 mt-1">Create your first shortened link to get started.</p>
                                    <Link href="/dashboard/create" className="mt-4 text-purple-400 hover:text-purple-300 underline">Create Link</Link>
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
