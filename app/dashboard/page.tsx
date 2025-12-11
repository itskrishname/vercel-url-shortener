'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Link Form
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<any>(null);

  useEffect(() => {
    // 1. Check Auth (Client-side check for token cookie or basic fetch)
    // We'll try to fetch user details or logs. If 401, redirect.
    fetchUserAndLinks();
  }, []);

  const fetchUserAndLinks = async () => {
    try {
      // We need an endpoint to get current user info + links
      // For now, let's implement a simple GET /api/user/me endpoint or similar.
      // Since I didn't plan it specifically, I'll add it now or use a server action.
      // I'll create `app/api/user/me/route.ts` quickly next.
      const res = await fetch('/api/user/me');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setLinks(data.links);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
        // Call the bridge API manually
        const apiUrl = `/api/shorten?api=${user.app_api_key}&url=${encodeURIComponent(newLinkUrl)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data.status === 'success') {
            setLastGenerated(data);
            fetchUserAndLinks(); // Refresh list
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

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-purple-600">URL Shortener</h1>
            </div>
            <div className="flex items-center space-x-4">
               <span className="text-gray-700">Welcome, {user?.username}</span>
               <button
                onClick={() => {
                    document.cookie = 'token=; Max-Age=0; path=/;';
                    router.push('/login');
                }}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
               >Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

        {/* API Key Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Your Developer API Key</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Use this key to integrate with bots or other tools.</p>
                </div>
                <div className="mt-3 flex items-center bg-gray-100 p-2 rounded">
                    <code className="text-purple-700 font-mono flex-1">{user?.app_api_key}</code>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                    Endpoint: <code className="bg-gray-200 px-1 rounded">GET {window.location.origin}/api/shorten?api=YOUR_KEY&url=TARGET_URL</code>
                </p>
            </div>
        </div>

        {/* Generate Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Link</h3>
                <form onSubmit={handleGenerate} className="mt-4 flex gap-4">
                    <input
                        type="url"
                        required
                        placeholder="Enter URL to shorten (e.g. https://google.com)"
                        className="flex-1 block w-full border border-gray-300 rounded-md p-2"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={generating}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                        {generating ? 'Generating...' : 'Shorten'}
                    </button>
                </form>
                {lastGenerated && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded text-green-800">
                        <p className="font-bold">Success!</p>
                        <p>Original: {lastGenerated.original_url}</p>
                        <p>Shortened: <a href={lastGenerated.shortenedUrl} target="_blank" className="underline">{lastGenerated.shortenedUrl}</a></p>
                    </div>
                )}
            </div>
        </div>

        {/* Logs Table */}
        <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original URL</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">External Short URL</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {links.map((link) => (
                                    <tr key={link._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate" title={link.originalUrl}>{link.originalUrl}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                            <a href={link.externalShortUrl} target="_blank" rel="noopener noreferrer">{link.externalShortUrl}</a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{link.visits}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(link.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {links.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No links generated yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}
