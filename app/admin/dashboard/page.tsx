'use client';

import { ArrowRight, Link as LinkIcon, Zap, Globe } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-slate-400">Welcome back to your control center.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl group hover:border-blue-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center mb-4">
                        <LinkIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Total Links</h3>
                    <p className="text-3xl font-bold text-white">Active</p>
                    <Link href="/admin/links" className="text-blue-400 text-xs font-bold mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all">
                        Manage Links <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl group hover:border-yellow-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-yellow-600/20 flex items-center justify-center mb-4">
                        <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">API Status</h3>
                    <p className="text-3xl font-bold text-white">Ready</p>
                     <Link href="/admin/api" className="text-yellow-400 text-xs font-bold mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all">
                        Configure API <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/10 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-xl font-bold text-white mb-2">Create a new shortlink</h2>
                    <p className="text-slate-400 text-sm mb-6 max-w-lg">
                        Generate a secure, trackable short link instantly using our manual generator tool.
                    </p>
                    <Link
                        href="/admin/links"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                    >
                        <Globe className="w-4 h-4" />
                        Go to Generator
                    </Link>
                </div>
            </div>
        </div>
    );
}
