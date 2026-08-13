import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';
import { Search, Plus, UserCheck, UserX, Trash2, X } from 'lucide-react';

export const AdminUserManagement = () => {
  const { token, user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('STUDENT');
  const [createError, setCreateError] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (roleFilter) query.set('role', roleFilter);

    fetch(getApiUrl(`/api/admin/users?${query.toString()}`), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUsers(data.data.users);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, token]);

  const handleToggleStatus = async (targetUser) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${targetUser._id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !targetUser.isActive }),
      });
      const data = await res.json();
      if (data.success) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (targetUser, newRoleVal) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${targetUser._id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRoleVal }),
      });
      const data = await res.json();
      if (data.success) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Delete user ${email}? This action cannot be undone.`)) return;

    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error?.message || 'Delete failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    try {
      const res = await fetch(getApiUrl('/api/admin/users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName, email: newEmail, password: newPassword, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        fetchUsers();
      } else {
        setCreateError(data.error?.message || 'Create user failed.');
      }
    } catch (err) {
      setCreateError('Network error.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">User Accounts Administration</h1>
          <p className="text-xs text-slate-400">Manage learner profiles, instructor credentials, role permissions, and access status.</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 outline-none"
        >
          <option value="">All Roles</option>
          <option value="STUDENT">STUDENT</option>
          <option value="INSTRUCTOR">INSTRUCTOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading user accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/50">
                    <td className="p-4 font-semibold text-white flex items-center space-x-3">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <span>{u.name}</span>
                    </td>
                    <td className="p-4 text-slate-300">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs font-semibold rounded px-2 py-1 outline-none text-purple-300"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="INSTRUCTOR">INSTRUCTOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        u.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded ${
                          u.isActive
                            ? 'text-amber-400 hover:bg-amber-500/10'
                            : 'text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>

                      {u._id !== currentUser.id && (
                        <button
                          onClick={() => handleDelete(u._id, u.email)}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Create New User Account</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Permission</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 outline-none"
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="INSTRUCTOR">INSTRUCTOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
