'use client';

import { useState, useEffect } from 'react';

export default function LinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/me')
        .then(res => res.json())
        .then(data => {
            if (data.links) setLinks(data.links);
            setLoading(false);
        });
  }, []);

  if (loading) return <div>Loading links...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Links</h2>
      <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {links.map((link) => (
                      <tr key={link._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate" title={link.originalUrl}>
                              {link.originalUrl}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                              <a href={link.externalShortUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  {link.externalShortUrl}
                              </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {link.visits}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(link.createdAt).toLocaleDateString()}
                          </td>
                      </tr>
                  ))}
                  {links.length === 0 && (
                      <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                              No links generated yet.
                          </td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>
    </div>
  );
}
