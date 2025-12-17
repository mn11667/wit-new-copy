import React, { useState, useEffect } from 'react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import {
  listUsers,
  createUser as adminCreateUser,
  updateUser as adminUpdateUser,
  deleteUser as adminDeleteUser,
  fetchUserProgressSummary,
  fetchUserDetails,
  AdminUser,
} from '../../services/adminApi';
import { User } from '../../context/AuthContext';
import { UserEditModal } from './UserEditModal'; // Import the new modal

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'USER' as 'USER' | 'ADMIN' });
  const [progressSummary, setProgressSummary] = useState<{ id: string; name: string; email: string; completed: number; bookmarks: number; percent: number }[]>([]);
  const [selectedUserStats, setSelectedUserStats] = useState<{ userId: string; bookmarks: number; progress: number; percent: number } | null>(null);
  const [pwdOld, setPwdOld] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null); // State for user being edited
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const loadUsers = async () => {
    try {
      const data = await listUsers();
      setUsers(data);
      const summary = await fetchUserProgressSummary();
      setProgressSummary(summary.summaries);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminCreateUser(userForm);
      setUserForm({ name: '', email: '', password: '', role: 'USER' });
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'User create failed');
    }
  };

  const removeUser = async (u: AdminUser) => {
    if (!confirm('Delete this user?')) return;
    try {
      await adminDeleteUser(u.id);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };



  const viewUserStats = async (u: User) => {
    try {
      const stats = await fetchUserDetails(u.id);
      setSelectedUserStats({
        userId: u.id,
        bookmarks: stats.bookmarks.length,
        progress: stats.completedCount,
        percent: stats.percent,
      });
    } catch (err: any) {
      setError(err.message || 'Stats fetch failed');
    }
  };

  const handleManageUser = (user: AdminUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleUpdateUser = async (
    userId: string,
    data: {
      status?: User['status'];
      role?: User['role'];
      isActive?: boolean;
      subscriptionStatus?: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE';
      subscriptionStartDate?: string | null;
      subscriptionEndDate?: string | null;
      subscriptionPlanId?: string;
    },
  ) => {
    try {
      // Drop empty strings/nullish so we don't fail validation for optional fields
      const sanitized: Record<string, unknown> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value === '' || value === undefined || value === null) return;
        sanitized[key] = value;
      });

      await adminUpdateUser(userId, sanitized);
      loadUsers(); // Reload users to reflect changes
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  };


  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-rose-500">{error}</p>}

      <Card>
        <p className="text-xs uppercase tracking-[0.22em] text-secondary">Add user</p>
        <form className="mt-3 grid gap-3 md:grid-cols-4" onSubmit={handleCreateUser}>
          <input
            className="glass w-full rounded-xl border-transparent bg-black/20 px-3 py-2 text-white shadow-inner focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Name"
            value={userForm.name}
            onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <input
            className="glass w-full rounded-xl border-transparent bg-black/20 px-3 py-2 text-white shadow-inner focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Email"
            type="email"
            value={userForm.email}
            onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))}
            required
          />
          <input
            className="glass w-full rounded-xl border-transparent bg-black/20 px-3 py-2 text-white shadow-inner focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Password"
            type="password"
            value={userForm.password}
            onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))}
            required
          />
          <select
            className="glass w-full rounded-xl border-transparent bg-black/20 px-3 py-2 text-white shadow-inner focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary"
            value={userForm.role}
            onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value as 'USER' | 'ADMIN' }))}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <Button type="submit" className="md:col-span-4">
            Create user
          </Button>
        </form>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-[0.22em] text-secondary">Users</p>
        <div className="mt-3 space-y-2">
          {users.length === 0 && <p className="text-sm text-slate-400">No users yet.</p>}
          {users.map((u) => (
            <div key={u.id} className="glass flex flex-wrap items-center justify-between rounded-xl p-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  {u.name} <span className="text-xs text-slate-400">({u.role})</span>
                </p>
                <p className="text-xs text-slate-400">
                  {u.email} - Status: {u.status} - Active: {u.isActive ? 'Yes' : 'No'}
                </p>
                <p className="text-xs text-slate-400">
                  Sub: {u.subscription?.plan?.tier ?? 'FREE'} ({u.subscription?.status ?? 'INACTIVE'}) | Start:{' '}
                  {u.subscription?.startDate ? new Date(u.subscription.startDate).toLocaleDateString() : 'N/A'} | Expires:{' '}
                  {u.subscription?.endDate ? new Date(u.subscription.endDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => viewUserStats(u)}>
                  Stats
                </Button>
                <Button variant="ghost" onClick={() => handleManageUser(u)}>
                  Manage
                </Button>
                <Button variant="danger" onClick={() => removeUser(u)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
        {selectedUserStats && (
          <div className="glass mt-4 rounded-xl p-3 text-sm text-white">
            <p className="font-semibold">User progress</p>
            <p>Completed files: {selectedUserStats.progress}</p>
            <p>Bookmarks: {selectedUserStats.bookmarks}</p>
            <p>Progress: {selectedUserStats.percent}%</p>
          </div>
        )}
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.22em] text-secondary">Overall progress</p>
          <div className="mt-2 space-y-2">
            {progressSummary.map((s) => (
              <div key={s.id} className="glass rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{s.name}</span>
                  <span className="text-xs text-slate-400">{s.email}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/20">
                  <div className="h-full bg-gradient-to-r from-secondary to-primary" style={{ width: `${s.percent}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {s.completed} completed · {s.bookmarks} bookmarked · {s.percent}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
      {editingUser && (
        <UserEditModal
          user={editingUser}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleUpdateUser}
        />
      )}
    </div>
  );
};
