'use client';

import { useState, useEffect } from 'react';
import { Button, Card, PageHeader } from '@/components/ui';
import { Input } from '@/components/ui';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    const res = await fetch('/api/auth');
    const data = await res.json();
    setCurrentUser(data.user);
  }

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || 'Failed to create user', 'error');
        return;
      }

      setUsers((prev) => [data, ...prev]);
      addToast('User created successfully', 'success');
      setFormData({ name: '', email: '', password: '' });
      setShowForm(false);
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || 'Failed to delete user', 'error');
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
      addToast('User removed', 'success');
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  if (!currentUser?.is_admin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Only admins can manage users.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="User Management"
        subtitle="Add or remove users who can access the CRM"
        action={
          !showForm && (
            <Button onClick={() => setShowForm(true)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add User
            </Button>
          )
        }
      />

      {/* Add User Form */}
      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleCreate} className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">
              New User
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
              />
              <Input
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Set a password"
            />
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create User'}
              </Button>
              <Button variant="secondary" type="button" onClick={() => { setShowForm(false); setFormData({ name: '', email: '', password: '' }); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Users List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${user.is_admin ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      {user.is_admin && (
                        <span className="text-[10px] font-medium bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                {!user.is_admin && (
                  <Button
                    variant="ghost-danger"
                    size="sm"
                    onClick={() => setDeleteTarget(user)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove User"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? They will no longer be able to access the CRM.`}
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
