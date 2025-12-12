'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Basic Auth Check on Layout Mount
    fetch('/api/user/me')
        .then(res => {
            if (res.status === 401) {
                router.push('/login');
            } else {
                return res.json();
            }
        })
        .then(data => {
            if (data?.user) setUser(data.user);
        })
        .catch(() => {});
  }, [router]);

  const navItems = [
    { name: 'Create Link', href: '/dashboard/create', icon: (
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
    )},
    { name: 'My Links', href: '/dashboard/links', icon: (
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    )},
    { name: 'Settings', href: '/dashboard/settings', icon: (
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    )},
    { name: 'Tools (API)', href: '/dashboard/tools', icon: (
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
    )},
  ];

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-gray-100">

      {/* Floating Sidebar (Glass) */}
      <aside className="w-full md:w-72 p-4 md:p-6 flex flex-col">
        <div className="glass h-full rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
             {/* Decorative gradient blob inside sidebar */}
             <div className="absolute top-0 left-0 w-full h-32 bg-purple-600/20 blur-3xl -z-10"></div>

            <div className="h-20 flex items-center px-6 border-b border-white/5">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-blue-500 mr-3 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
                <h1 className="text-xl font-bold tracking-wide text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">NEXUS<span className="text-purple-400">LINK</span></h1>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="mb-6 px-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Account</p>
                    <div className="glass-card p-3 rounded-xl flex items-center space-x-3 mb-2 bg-white/5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-sm font-bold border border-white/10">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.username || 'Loading...'}</p>
                            <div className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-1 shadow-[0_0_5px_#22c55e]"></span>
                                <p className="text-xs text-gray-400">Online</p>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="space-y-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold px-2 mb-2">Menu</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                                    isActive
                                        ? 'bg-purple-600/20 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-purple-500/30'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30 group"
                >
                    <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto h-screen scrollbar-hide">
        <div className="max-w-7xl mx-auto h-full">
            {children}
        </div>
      </main>
    </div>
  );
}
