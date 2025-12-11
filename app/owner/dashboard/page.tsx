'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'invites'

  useEffect(() => {
    const isOwner = localStorage.getItem('isOwner');
    if (!isOwner) {
        router.push('/owner/login');
        return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const [usersRes, invitesRes] = await Promise.all([
            fetch('/api/owner/users'),
            fetch('/api/owner/invites')
        ]);

        const usersData = await usersRes.json();
        const invitesData = await invitesRes.json();

        setUsers(usersData.users || []);
        setInvites(invitesData.codes || []);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const generateInvite = async () => {
      try {
          const res = await fetch('/api/owner/invites', { method: 'POST' });
          const data = await res.json();
          if (data.code) {
              setInvites([data.code, ...invites]);
          }
      } catch (e) {
          alert('Failed to generate code');
      }
  }

  const logout = () => {
      localStorage.removeItem('isOwner');
      router.push('/owner/login');
  }

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert('Copied: ' + text);
  }

  const deleteUser = async (id: string, username: string) => {
      if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) return;

      try {
          const res = await fetch(`/api/owner/users?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
              setUsers(users.filter(u => u._id !== id));
          } else {
              alert('Failed to delete user');
          }
      } catch (e) {
          alert('Error deleting user');
      }
  }

  const toggleSuspend = async (id: string, currentStatus: boolean) => {
      const action = currentStatus ? 'unsuspend' : 'suspend';
      const confirmMsg = currentStatus
        ? 'Unsuspend this user?'
        : 'Suspend this user? They will not be able to log in or generate links.';

      if (!confirm(confirmMsg)) return;

      try {
          const res = await fetch('/api/owner/users', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, action })
          });
          if (res.ok) {
              setUsers(users.map(u => {
                  if (u._id === id) {
                      return { ...u, isSuspended: !currentStatus };
                  }
                  return u;
              }));
          } else {
              alert('Failed to update status');
          }
      } catch (e) {
          alert('Error updating status');
      }
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

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`${activeTab === 'users' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    Registered Users
                </button>
                <button
                    onClick={() => setActiveTab('invites')}
                    className={`${activeTab === 'invites' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                    Invite Codes
                </button>
            </nav>
        </div>

        {activeTab === 'users' && (
            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-red-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((u) => (
                                        <tr key={u._id} className={u.isSuspended ? 'bg-red-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{u.app_api_key}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {u.isSuspended ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Suspended</span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
                                                <button
                                                    onClick={() => toggleSuspend(u._id, u.isSuspended)}
                                                    className={`${u.isSuspended ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'}`}
                                                >
                                                    {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(u._id, u.username)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No users found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'invites' && (
             <div className="flex flex-col">
                 <div className="mb-4">
                     <button
                        onClick={generateInvite}
                        className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition"
                     >
                         Generate New Code
                     </button>
                 </div>
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-red-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used By</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {invites.map((code) => (
                                        <tr key={code._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{code.code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {code.isUsed ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Used</span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {code.usedBy ? code.usedBy.username : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button onClick={() => copyToClipboard(code.code)} className="text-blue-600 hover:text-blue-900">Copy</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}
