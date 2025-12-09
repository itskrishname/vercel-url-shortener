import Link from 'next/link';
import { ArrowRight, Link as LinkIcon, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col font-sans relative overflow-hidden">
       {/* Background Elements */}
       <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
       <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

       {/* Navbar */}
       <nav className="relative z-10 w-full p-6 flex justify-between items-center max-w-6xl mx-auto">
         <div className="flex items-center gap-2 text-white font-bold text-xl">
           <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
             <LinkIcon className="w-4 h-4 text-white" />
           </div>
           LinkManager
         </div>
         <Link href="/login" className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-medium transition-all backdrop-blur-md">
           Admin Login
         </Link>
       </nav>

       {/* Hero Section */}
       <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-6 max-w-4xl mx-auto">
         <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Vercel Powered
         </div>

         <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
           Manage Links with <br />
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
             Ultimate Control
           </span>
         </h1>

         <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
           A powerful, self-hosted URL shortener and deep link manager.
           Secure, fast, and designed for telegram bots and API integrations.
         </p>

         <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
           <Link href="/admin" className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
             Go to Dashboard <ArrowRight className="w-5 h-5" />
           </Link>
           <a href="https://github.com/itskrishname/vercel-url-shortener" target="_blank" rel="noreferrer" className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg transition-all flex items-center justify-center">
             View on GitHub
           </a>
         </div>

         {/* Features Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Instant Redirects</h3>
              <p className="text-sm text-slate-400">High-performance redirection engine powered by Vercel Edge Network.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Bot Protection</h3>
              <p className="text-sm text-slate-400">Integrated timer pages to filter bot traffic and ensure human validation.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <LinkIcon className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">API Integration</h3>
              <p className="text-sm text-slate-400">Seamlessly integrate with external shorteners and manage tokens via API.</p>
            </div>
         </div>
       </main>

       {/* Footer */}
       <footer className="relative z-10 py-8 text-center text-slate-600 text-sm">
         &copy; {new Date().getFullYear()} Universal Link Manager. Deployed on Vercel.
       </footer>
    </div>
  );
}
