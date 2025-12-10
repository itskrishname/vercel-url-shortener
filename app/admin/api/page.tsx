'use client';

import { useState } from 'react';
import { Zap, Copy, Check } from 'lucide-react';

export default function ApiBuilderPage() {
  const [apiToolData, setApiToolData] = useState({
      providerWebUrl: '',
      providerUrl: '',
      providerKey: '',
  });
  const [generatedApiUrl, setGeneratedApiUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generateApiString = () => {
      // We use window.location.origin to point to THIS app's bridge
      const baseUrl = `${window.location.origin}/api/bridge`;
      // We encode the external provider's API URL and Key
      const finalUrl = `${baseUrl}?provider=${encodeURIComponent(apiToolData.providerUrl)}&key=${encodeURIComponent(apiToolData.providerKey)}&url=`;
      setGeneratedApiUrl(finalUrl);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">API Builder</h1>
            <p className="text-slate-400">Configure your external shortener connection.</p>
       </div>

       <div className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl">
           <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Configuration</h2>
           </div>

           <p className="text-sm text-slate-400 mb-6">
               Enter the details of your external URL shortener service (e.g., GPLinks, Droplink) to generate a compatible bridge URL for your bots.
           </p>

           <div className="space-y-4">
               {/* NEW FIELD: Provider Web URL */}
               <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Provider Web URL</label>
                  <input
                    type="url"
                    placeholder="https://gplinks.com"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all"
                    value={apiToolData.providerWebUrl}
                    onChange={(e) => setApiToolData({...apiToolData, providerWebUrl: e.target.value})}
                  />
                  <p className="text-[10px] text-slate-600 ml-1">The main website of the shortener service.</p>
               </div>

               <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Provider API URL</label>
                  <input
                    type="url"
                    placeholder="https://gplinks.com/api"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all"
                    value={apiToolData.providerUrl}
                    onChange={(e) => setApiToolData({...apiToolData, providerUrl: e.target.value})}
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Provider API Token</label>
                  <input
                    type="password"
                    placeholder="Secret Key"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all"
                    value={apiToolData.providerKey}
                    onChange={(e) => setApiToolData({...apiToolData, providerKey: e.target.value})}
                  />
               </div>

               <button
                    onClick={generateApiString}
                    className="w-full mt-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-orange-900/20 text-sm"
                >
                    Generate Bridge URL
                </button>
           </div>

           {generatedApiUrl && (
            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-3">
                  Your Vercel Bridge URL
              </p>
              <div className="relative group">
                <textarea
                    readOnly
                    className="w-full h-24 bg-slate-950/50 p-4 rounded-xl border border-white/10 text-xs text-slate-300 font-mono resize-none focus:outline-none"
                    value={generatedApiUrl + 'YOUR_LONG_URL'}
                />
                <button
                    onClick={() => copyToClipboard(generatedApiUrl)}
                    className="absolute bottom-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white backdrop-blur-sm"
                    title="Copy Base URL"
                >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                  Copy this URL and add your destination link at the end.
              </p>
            </div>
          )}
       </div>
    </div>
  );
}
