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
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-gray-100 selection:bg-purple-500 selection:text-white">

      {/* Floating Sidebar (Glass) */}
      <aside className="w-full md:w-72 p-4 md:p-6 flex flex-col z-20 sticky top-0 md:h-screen">
        <div className="glass h-full rounded-2xl flex flex-col overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] relative border border-white/5 backdrop-blur-xl bg-black/40">
             {/* Decorative gradient blob inside sidebar */}
             <div className="absolute top-0 left-0 w-full h-48 bg-purple-600/10 blur-[50px] -z-10"></div>
             <div className="absolute bottom-0 right-0 w-full h-48 bg-blue-600/10 blur-[50px] -z-10"></div>

            <div className="h-24 flex items-center px-6 border-b border-white/5">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-10 h-10 rounded-lg bg-black flex items-center justify-center border border-white/10">
                         <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                </div>
                <div className="ml-3">
                    <h1 className="text-xl font-black tracking-wider text-white">NEXUS<span className="text-purple-500">LINK</span></h1>
                    <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">Universal Bridge</p>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <div className="mb-8 px-2">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 pl-1">User Profile</p>
                    <div className="glass-card p-3 rounded-xl flex items-center space-x-3 mb-2 bg-gradient-to-r from-white/5 to-transparent border border-white/5 hover:border-white/20 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-sm font-bold">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.username || 'Loading...'}</p>
                            <div className="flex items-center mt-0.5">
                                <span className="relative flex h-2 w-2 mr-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">System Online</p>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold px-3 mb-2">Main Menu</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                                    isActive
                                        ? 'bg-purple-500/10 text-white shadow-[0_0_20px_rgba(168,85,247,0.15)] border border-purple-500/30'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>}
                                <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-purple-400' : 'group-hover:scale-110 group-hover:text-white'}`}>
                                    {item.icon}
                                </span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-white/5 bg-black/20">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/30 group"
                >
                    <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    LOGOUT
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto h-screen scrollbar-hide relative z-10">
        <div className="max-w-7xl mx-auto h-full pb-20 md:pb-0">
            {children}
        </div>
      </main>
    </div>
  );
}
