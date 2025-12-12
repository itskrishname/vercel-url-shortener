'use client';

import { useState, useEffect } from 'react';

export default function LinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/me')
        .then(res => res.json())
        .then(data => {
            if (data.links) setLinks(data.links);
            setLoading(false);
        })
        .catch(err => {
            console.error("Failed to fetch links", err);
            setLoading(false);
        });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link? This action cannot be undone.")) return;

    setDeletingId(id);
    try {
        const res = await fetch(`/api/links/${id}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            setLinks(prev => prev.filter(link => link._id !== id));
        } else {
            alert("Failed to delete link.");
        }
    } catch (error) {
        console.error("Error deleting link:", error);
        alert("An error occurred.");
    } finally {
        setDeletingId(null);
    }
  };

  const getVercelLink = (localToken: string) => {
    // Construct the vercel link on the client side
    // Or we could have passed it from backend.
    // Assuming relative path for now or window.location.origin
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/start/${localToken}`;
    }
    return `/start/${localToken}`;
  };

  if (loading) return <div className="p-8 text-center text-white">Loading links...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-8">My Links</h2>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Original URL</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Vercel Link (Share This)</th>
                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Target Short Link</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Visits</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {links.map((link) => (
                        <tr key={link._id} className="hover:bg-white/5 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 max-w-xs truncate" title={link.originalUrl}>
                                {link.originalUrl}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400">
                                <div className="flex items-center space-x-2">
                                    <a href={getVercelLink(link.localToken || link.token)} target="_blank" rel="noopener noreferrer" className="hover:text-purple-300 hover:underline truncate max-w-[150px]">
                                        {getVercelLink(link.localToken || link.token)}
                                    </a>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(getVercelLink(link.localToken || link.token))}
                                        className="text-xs bg-purple-600/50 hover:bg-purple-600 p-1 rounded text-white"
                                        title="Copy"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">
                                <a href={link.externalShortUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 hover:underline truncate max-w-[150px]">
                                    {link.externalShortUrl}
                                </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {link.visits}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {new Date(link.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => handleDelete(link._id)}
                                    disabled={deletingId === link._id}
                                    className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-3 py-1 rounded-md transition-colors disabled:opacity-50"
                                >
                                    {deletingId === link._id ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {links.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                                <div className="flex flex-col items-center">
                                    <svg className="w-12 h-12 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                    <p className="text-lg">No links generated yet.</p>
                                    <p className="text-sm opacity-70">Create one in the "Create Link" tab!</p>
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
