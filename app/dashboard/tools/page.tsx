'use client';

import { useState, useEffect } from 'react';

export default function ToolsPage() {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
    fetch('/api/user/me')
        .then(res => res.json())
        .then(data => {
            if (data.user) setApiKey(data.user.app_api_key);
        });
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Developer Tools</h2>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your API Key</h3>
        <div className="flex items-center bg-gray-100 p-3 rounded border border-gray-200">
            <code className="text-purple-700 font-mono flex-1 break-all">{apiKey}</code>
            <button
                onClick={() => navigator.clipboard.writeText(apiKey)}
                className="ml-2 text-sm text-gray-500 hover:text-gray-700"
            >
                Copy
            </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Documentation</h3>

        <div className="space-y-6">
            <div>
                <h4 className="font-medium text-gray-800">Endpoint</h4>
                <code className="block mt-1 bg-gray-800 text-green-400 p-3 rounded text-sm">
                    GET {baseUrl}/api/shorten
                </code>
            </div>

            <div>
                <h4 className="font-medium text-gray-800">Parameters</h4>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                    <li><code className="bg-gray-100 px-1 rounded">api</code> (Required): Your API key above.</li>
                    <li><code className="bg-gray-100 px-1 rounded">url</code> (Required): The URL you want to shorten.</li>
                </ul>
            </div>

            <div>
                <h4 className="font-medium text-gray-800">Example Request</h4>
                <code className="block mt-1 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {baseUrl}/api/shorten?api={apiKey || 'YOUR_KEY'}&url=https://google.com
                </code>
            </div>

            <div>
                <h4 className="font-medium text-gray-800">Response</h4>
                <pre className="mt-1 bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "status": "success",
  "shortenedUrl": "https://gplinks.com/xyz",
  "original_url": "https://google.com"
}`}
                </pre>
            </div>
        </div>
      </div>
    </div>
  );
}
