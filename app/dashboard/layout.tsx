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
    { name: 'Create Link', href: '/dashboard/create' },
    { name: 'My Links', href: '/dashboard/links' },
    { name: 'Settings', href: '/dashboard/settings' },
    { name: 'Tools (API)', href: '/dashboard/tools' },
  ];

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-purple-600">URL Shortener</h1>
        </div>
        <div className="p-4">
            <div className="mb-4 px-4 text-sm text-gray-500">
                Welcome, {user?.username}
            </div>
            <nav className="space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`block px-4 py-2 rounded-md text-sm font-medium ${
                                isActive
                                    ? 'bg-purple-50 text-purple-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-8 border-t pt-4">
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                    Logout
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
