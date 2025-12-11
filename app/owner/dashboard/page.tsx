'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage flag for "Owner" auth (simple version)
    // In a real app, we'd check a secure cookie.
    const isOwner = localStorage.getItem('isOwner');
    if (!isOwner) {
        router.push('/owner/login');
        return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const res = await fetch('/api/owner/users');
        if (res.status === 401) {
            // If the API endpoint is protected, we might fail here.
            // But since I haven't implemented a specific Owner API yet, I'll do it now.
        }
        const data = await res.json();
        setUsers(data.users || []);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const logout = () => {
      localStorage.removeItem('isOwner');
      router.push('/owner/login');
  }

  if (loading) return <div className="p-10 text-center text-red-600">Loading Admin Console...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-red-700 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Owner Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
               <button
                onClick={logout}
                className="text-white hover:text-gray-200 text-sm font-medium border border-white px-3 py-1 rounded"
               >Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Registered Users</h2>

        <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-red-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">External Domain</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((u) => (
                                    <tr key={u._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{u.app_api_key}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.external_domain}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
