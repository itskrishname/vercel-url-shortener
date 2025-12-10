'use client';

import { useState } from 'react';
import { Activity, Play, AlertTriangle, CheckCircle, XCircle, FileJson, FileCode } from 'lucide-react';

export default function TestConnectionPage() {
  const [providerUrl, setProviderUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [testUrl, setTestUrl] = useState('https://google.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/debug/test-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerUrl, apiKey, testUrl }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to run test', details: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Connection Diagnostics</h1>
        <p className="text-slate-400">Test your external shortener configuration before going live.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl h-fit">
           <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Test Parameters</h2>
           </div>

           <div className="space-y-4">
             <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Provider URL</label>
                <input
                  type="url"
                  placeholder="https://gplinks.com/api"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  value={providerUrl}
                  onChange={(e) => setProviderUrl(e.target.value)}
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">API Token</label>
                <input
                  type="text"
                  placeholder="Secret Key"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Test Destination URL</label>
                <input
                  type="url"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                />
             </div>

             <button
                  onClick={runTest}
                  disabled={loading || !providerUrl || !apiKey}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-purple-900/20 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {loading ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> Run Diagnostics
                    </>
                  )}
              </button>
           </div>
        </div>

        {/* Result Section */}
        <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/10 shadow-inner overflow-hidden flex flex-col min-h-[400px]">
           <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
             Test Results
           </h3>

           {!result && !loading && (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-600 opacity-50">
               <Activity className="w-12 h-12 mb-2" />
               <p className="text-sm">Ready to start</p>
             </div>
           )}

           {loading && (
             <div className="flex-1 flex flex-col items-center justify-center text-purple-400">
               <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4" />
               <p className="text-sm font-mono animate-pulse">Connecting to provider...</p>
             </div>
           )}

           {result && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                {/* Status Badge */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${result.success ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                    {result.success ? (
                        <div className="p-2 bg-green-500 rounded-lg text-black"><CheckCircle className="w-5 h-5" /></div>
                    ) : (
                        <div className="p-2 bg-red-500 rounded-lg text-white"><XCircle className="w-5 h-5" /></div>
                    )}
                    <div>
                        <h4 className={`font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                            {result.success ? 'Success' : 'Connection Failed'}
                        </h4>
                        <p className="text-xs text-slate-400">Status Code: <span className="font-mono text-white">{result.statusCode}</span></p>
                    </div>
                </div>

                {/* Response Body Analysis */}
                <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                        {result.isHtml ? <FileCode className="w-3 h-3" /> : <FileJson className="w-3 h-3" />}
                        Response Preview
                    </p>
                    <div className="bg-black/50 rounded-xl p-4 border border-white/5 font-mono text-xs overflow-x-auto">
                        <pre className={result.isHtml ? 'text-orange-300' : 'text-green-300'}>
                            {result.preview}
                        </pre>
                    </div>
                    {result.isHtml && (
                        <div className="flex gap-2 items-start text-orange-400 text-xs bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>
                                <strong>Warning:</strong> The provider returned HTML code instead of JSON.
                                This usually means the URL is incorrect (e.g., pointing to a dashboard page instead of the API endpoint).
                            </p>
                        </div>
                    )}
                </div>

                 {/* Request Details */}
                 <div className="pt-4 border-t border-white/5">
                     <p className="text-[10px] text-slate-500 mb-2">REQUEST SENT TO:</p>
                     <code className="block bg-black/30 p-2 rounded text-[10px] text-slate-400 break-all font-mono">
                         {result.requestUrl}
                     </code>
                 </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
