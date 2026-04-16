'use client';

import { useState, useEffect } from 'react';
import { Button, Card, PageHeader, Input, Select } from '@/components/ui';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

function TabButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
}

function CrudList({ label, items, onCreate, onRename, onDelete, isAdmin }) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteState, setDeleteState] = useState(null);
  const addToast = useToast();

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await onCreate(newName.trim());
      setNewName('');
      addToast(`${label} added`, 'success');
    } catch (err) {
      addToast(err.message || `Failed to add ${label.toLowerCase()}`, 'error');
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(id) {
    if (!editingName.trim()) return;
    try {
      await onRename(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
      addToast(`${label} renamed`, 'success');
    } catch (err) {
      addToast(err.message || 'Rename failed', 'error');
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditingName(item.name);
  }

  async function handleDeleteConfirm() {
    if (!deleteState) return;
    try {
      await onDelete(deleteState.id, deleteState.reassignTo);
      setDeleteState(null);
      addToast(`${label} deleted`, 'success');
    } catch (err) {
      if (err.code === 'REASSIGN_REQUIRED') {
        setDeleteState({ ...deleteState, needsReassign: true });
        return;
      }
      addToast(err.message || 'Delete failed', 'error');
    }
  }

  const reassignOptions = deleteState
    ? items.filter((i) => i.id !== deleteState.id)
    : [];

  return (
    <Card>
      <div className="p-5 border-b border-gray-100">
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            placeholder={`New ${label.toLowerCase()} name`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={creating || !newName.trim()}>
            {creating ? 'Adding…' : `Add ${label}`}
          </Button>
        </form>
      </div>

      {items.length === 0 ? (
        <div className="p-10 text-center text-sm text-gray-500">
          No {label.toLowerCase()}s yet. Add one above.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between p-4">
              {editingId === item.id ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button variant="secondary" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleRename(item.id)} disabled={!editingName.trim()}>
                    Save
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-sm text-gray-900">{item.name}</span>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => startEdit(item)}>
                      Rename
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="danger"
                        onClick={() => setDeleteState({ id: item.id, name: item.name, reassignTo: '', needsReassign: false })}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {deleteState && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteState(null)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete {label.toLowerCase()} "{deleteState.name}"?
            </h3>
            {deleteState.needsReassign ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  This {label.toLowerCase()} is in use by existing expenses. Pick another {label.toLowerCase()} to reassign them to.
                </p>
                {reassignOptions.length === 0 ? (
                  <p className="text-sm text-red-600 mb-4">
                    No other {label.toLowerCase()}s exist. Create another one first, then try again.
                  </p>
                ) : (
                  <Select
                    label={`Reassign expenses to`}
                    value={deleteState.reassignTo}
                    onChange={(e) => setDeleteState({ ...deleteState, reassignTo: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {reassignOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </Select>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600 mb-4">
                This will permanently delete the {label.toLowerCase()}.
              </p>
            )}
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="secondary" onClick={() => setDeleteState(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={deleteState.needsReassign && !deleteState.reassignTo}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function FinancialsConfigPage() {
  const [tab, setTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [catRes, venRes, authRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/vendors'),
        fetch('/api/auth'),
      ]);
      setCategories(await catRes.json());
      setVendors(await venRes.json());
      const authData = await authRes.json();
      setCurrentUser(authData.user);
    } finally {
      setLoading(false);
    }
  }

  async function apiReq(url, method, body) {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Request failed');
      err.code = data.code;
      throw err;
    }
    return data;
  }

  const isAdmin = !!currentUser?.is_admin;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financials Configuration"
        subtitle="Manage expense categories and vendors"
      />

      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          active={tab === 'categories'}
          label="Categories"
          onClick={() => setTab('categories')}
        />
        <TabButton
          active={tab === 'vendors'}
          label="Vendors"
          onClick={() => setTab('vendors')}
        />
      </div>

      {loading ? (
        <Card>
          <div className="p-8 text-center text-sm text-gray-500">Loading…</div>
        </Card>
      ) : tab === 'categories' ? (
        <CrudList
          label="Category"
          items={categories}
          isAdmin={isAdmin}
          onCreate={async (name) => {
            await apiReq('/api/categories', 'POST', { name });
            await loadAll();
          }}
          onRename={async (id, name) => {
            await apiReq(`/api/categories/${id}`, 'PATCH', { name });
            await loadAll();
          }}
          onDelete={async (id, reassignTo) => {
            const qs = reassignTo ? `?reassignTo=${reassignTo}` : '';
            await apiReq(`/api/categories/${id}${qs}`, 'DELETE');
            await loadAll();
          }}
        />
      ) : (
        <CrudList
          label="Vendor"
          items={vendors}
          isAdmin={isAdmin}
          onCreate={async (name) => {
            await apiReq('/api/vendors', 'POST', { name });
            await loadAll();
          }}
          onRename={async (id, name) => {
            await apiReq(`/api/vendors/${id}`, 'PATCH', { name });
            await loadAll();
          }}
          onDelete={async (id, reassignTo) => {
            const qs = reassignTo ? `?reassignTo=${reassignTo}` : '';
            await apiReq(`/api/vendors/${id}${qs}`, 'DELETE');
            await loadAll();
          }}
        />
      )}
    </div>
  );
}
