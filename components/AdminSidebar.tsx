'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Link as LinkIcon, Zap, LogOut, X, Menu, Activity } from 'lucide-react';
import { useState } from 'react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Links', href: '/admin/links', icon: LinkIcon },
    { name: 'API Builder', href: '/admin/api', icon: Zap },
    { name: 'Diagnostics', href: '/admin/test', icon: Activity },
  ];

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg shadow-lg border border-white/10"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-slate-950 border-r border-white/10 p-6 transition-transform duration-300 flex flex-col
        lg:translate-x-0 lg:static lg:h-auto lg:min-h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <LinkIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <span className="font-bold text-white text-lg block leading-none">Admin</span>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wider">PANEL</span>
                </div>
            </div>
            <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        <nav className="space-y-2 flex-1">
            {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group relative overflow-hidden
                            ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }
                        `}
                    >
                        {isActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 pointer-events-none" />}
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                        {link.name}
                    </Link>
                );
            })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 mb-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium">System Operational</span>
                </div>
                <p className="text-[10px] text-slate-600 pl-4">v1.2.0 Stable</p>
            </div>

            <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-colors">
                <LogOut className="w-4 h-4" />
                Sign Out
            </Link>
        </div>
      </aside>
    </>
  );
}
