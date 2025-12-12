'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OwnerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'invites'>('users');
  const [invites, setInvites] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [usersRes, invitesRes] = await Promise.all([
                fetch('/api/owner/users'),
                fetch('/api/owner/invites')
            ]);

            if (usersRes.status === 401 || invitesRes.status === 401) {
                router.push('/owner/login');
                return;
            }

            const usersData = await usersRes.json();
            const invitesData = await invitesRes.json();

            setUsers(usersData.users || []);
            setInvites(invitesData.invites || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [router]);

  const logout = async () => {
      document.cookie = 'token=; Max-Age=0; path=/;';
      router.push('/owner/login');
  }

  const generateInvite = async () => {
      try {
          const res = await fetch('/api/owner/invites', { method: 'POST' });
          const data = await res.json();
          if (data.status === 'success') {
              setInvites([data.invite, ...invites]);
          } else {
              alert('Error: ' + data.message);
          }
      } catch (e) {
          alert('Failed to generate code');
      }
  }

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
  }

  const deleteUser = async (id: string, username: string) => {
      if(!confirm(`Are you sure you want to delete user ${username}? This cannot be undone.`)) return;
      try {
          const res = await fetch('/api/owner/users', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id })
          });
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
      if(!confirm(`Are you sure you want to ${action} this user?`)) return;

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

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-red-400 font-bold">Accessing Mainframe...</p>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-black font-sans text-gray-100">
      {/* Navbar */}
      <nav className="glass border-b border-red-900/30 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                   <div className="w-10 h-10 rounded bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                       <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                   </div>
                   <div>
                       <h1 className="text-xl font-bold text-white tracking-widest">OWNER<span className="text-red-500">PANEL</span></h1>
                       <p className="text-[10px] text-red-400/70 tracking-[0.2em]">SYSTEM ADMINISTRATOR</p>
                   </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <button
                onClick={logout}
                className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-white hover:border-red-500 hover:bg-red-500/10 flex items-center transition-all"
               >
                 <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                 Terminated Session
               </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="glass-card p-6 rounded-2xl border-l-4 border-l-red-500 relative overflow-hidden group hover:bg-red-900/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-red-600/20"></div>
                <h3 className="text-gray-400 text-sm uppercase tracking-widest font-bold">Total Users</h3>
                <p className="text-4xl font-bold text-white mt-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{users.length}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl border-l-4 border-l-orange-500 relative overflow-hidden group hover:bg-orange-900/10">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-orange-600/20"></div>
                <h3 className="text-gray-400 text-sm uppercase tracking-widest font-bold">Active Invites</h3>
                <p className="text-4xl font-bold text-white mt-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{invites.filter(i => !i.isUsed).length}</p>
            </div>
        </div>

        {/* Tabs */}
        <div className="glass p-1 rounded-xl inline-flex mb-8 bg-black/40 backdrop-blur-md">
            <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'users'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
                User Management
            </button>
            <button
                onClick={() => setActiveTab('invites')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'invites'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
                Access Codes
            </button>
        </div>

        {activeTab === 'users' && (
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-red-300 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-red-300 uppercase tracking-wider">API Key</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-red-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-red-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((u) => (
                                <tr key={u._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{u.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{u.app_api_key}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {u.isSuspended ? (
                                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Suspended</span>
                                        ) : (
                                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Active</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
                                        <button
                                            onClick={() => toggleSuspend(u._id, u.isSuspended)}
                                            className={`transition-colors font-bold ${u.isSuspended ? 'text-green-400 hover:text-green-300' : 'text-orange-400 hover:text-orange-300'}`}
                                        >
                                            {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                                        </button>
                                        <button
                                            onClick={() => deleteUser(u._id, u.username)}
                                            className="text-red-500 hover:text-red-400 font-bold"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No users found in database.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'invites' && (
             <div className="flex flex-col">
                 <div className="mb-6 flex justify-end">
                     <button
                        onClick={generateInvite}
                        className="glass-button bg-gradient-to-r from-red-600 to-orange-600 border-none px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-orange-500/30 flex items-center"
                     >
                         <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                         Generate New Code
                     </button>
                 </div>
                <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-orange-300 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-orange-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-orange-300 uppercase tracking-wider">Used By</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-orange-300 uppercase tracking-wider">Action</th>
                                  </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {invites.map((code) => (
                                    <tr key={code._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white font-mono tracking-wider">{code.code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {code.isUsed ? (
                                                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gray-700 text-gray-300 border border-gray-600">Used</span>
                                            ) : (
                                                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Available</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {code.usedBy ? <span className="text-white font-medium">{code.usedBy.username}</span> : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button onClick={() => copyToClipboard(code.code)} className="text-blue-400 hover:text-blue-300 font-bold hover:underline">Copy Code</button>
                                        </td>
                                    </tr>
                                ))}
                                {invites.length === 0 && (
                                     <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No invite codes generated yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}
