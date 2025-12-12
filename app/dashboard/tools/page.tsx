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
    <div className="max-w-4xl mx-auto pt-4">
      <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Developer Tools</h2>
            <p className="text-gray-400 mt-1">Integrate our shortening service into your applications.</p>
          </div>
      </div>

      <div className="glass-card p-8 rounded-2xl border border-white/10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            Your API Key
        </h3>
        <div className="flex items-center bg-black/40 p-4 rounded-xl border border-white/10 group hover:border-purple-500/30 transition-colors">
            <code className="text-purple-400 font-mono flex-1 break-all text-sm md:text-base">{apiKey || 'Loading key...'}</code>
            <button
                onClick={() => navigator.clipboard.writeText(apiKey)}
                className="ml-4 text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-all border border-white/5 hover:border-white/20"
            >
                COPY
            </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
            Keep this key secret. Do not share it in client-side code.
        </p>
      </div>

      <div className="glass-card p-8 rounded-2xl border border-white/10">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            API Documentation
        </h3>

        <div className="space-y-8">
            <div>
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Endpoint</h4>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 font-mono text-sm text-green-400 flex items-center">
                    <span className="text-purple-400 mr-2">GET</span>
                    {baseUrl}/api/shorten
                </div>
            </div>

            <div>
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Parameters</h4>
                <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="min-w-full divide-y divide-white/10 bg-black/20">
                        <tbody className="divide-y divide-white/5">
                            <tr>
                                <td className="px-4 py-3 text-sm font-mono text-purple-300">api</td>
                                <td className="px-4 py-3 text-sm text-gray-400">Required. Your API key shown above.</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-sm font-mono text-purple-300">url</td>
                                <td className="px-4 py-3 text-sm text-gray-400">Required. The destination URL you want to shorten.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Example Request</h4>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar">
                    <code className="text-blue-300 text-sm whitespace-nowrap">
                        {baseUrl}/api/shorten?api={apiKey || 'YOUR_KEY'}&url=https://google.com
                    </code>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Response</h4>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar relative">
                    <pre className="text-gray-300 text-sm font-mono">
{`{
  "status": "success",
  "shortenedUrl": "${baseUrl}/start/xyz...",
  "original_url": "https://google.com"
}`}
                    </pre>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
