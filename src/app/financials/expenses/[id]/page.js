'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, PageHeader, Input, Badge } from '@/components/ui';
import ExpenseForm from '@/components/ExpenseForm';
import { useToast } from '@/components/Toast';
import { formatPKR, formatDateShort, toDateInputValue } from '@/lib/format';

const STATUS_VARIANT = {
  paid: 'green',
  partial: 'yellow',
  unpaid: 'red',
};

function StatusPill({ status }) {
  const colors = {
    paid: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-amber-100 text-amber-700',
    unpaid: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${colors[status]}`}>
      {status}
    </span>
  );
}

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const addToast = useToast();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editing, setEditing] = useState(false);

  const [newPayment, setNewPayment] = useState({
    amount: '',
    payment_date: toDateInputValue(new Date()),
  });
  const [addingPayment, setAddingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [confirmDeleteExpense, setConfirmDeleteExpense] = useState(false);

  useEffect(() => {
    loadAll();
  }, [id]);

  async function loadAll() {
    setLoading(true);
    try {
      const [expRes, authRes] = await Promise.all([
        fetch(`/api/expenses/${id}`),
        fetch('/api/auth'),
      ]);
      if (!expRes.ok) {
        setExpense(null);
        return;
      }
      setExpense(await expRes.json());
      const authData = await authRes.json();
      setCurrentUser(authData.user);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(payload) {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update');
    addToast('Expense updated', 'success');
    setEditing(false);
    await loadAll();
  }

  async function handleAddPayment(e) {
    e.preventDefault();
    setPaymentError('');
    const amt = parseFloat(newPayment.amount);
    if (!(amt > 0)) {
      setPaymentError('Amount must be greater than zero');
      return;
    }
    if (amt > expense.balance) {
      setPaymentError(`Amount cannot exceed remaining balance (${formatPKR(expense.balance)})`);
      return;
    }
    if (!newPayment.payment_date) {
      setPaymentError('Payment date is required');
      return;
    }
    setAddingPayment(true);
    try {
      const res = await fetch(`/api/expenses/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          payment_date: newPayment.payment_date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add payment');
      addToast('Payment recorded', 'success');
      setNewPayment({ amount: '', payment_date: toDateInputValue(new Date()) });
      await loadAll();
    } catch (err) {
      setPaymentError(err.message);
    } finally {
      setAddingPayment(false);
    }
  }

  async function handleDeletePayment(pid) {
    if (!confirm('Delete this payment?')) return;
    try {
      const res = await fetch(`/api/expenses/${id}/payments/${pid}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      addToast('Payment deleted', 'success');
      await loadAll();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleDeleteExpense() {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      addToast('Expense deleted', 'success');
      router.push('/financials/expenses');
    } catch (err) {
      addToast(err.message, 'error');
      setConfirmDeleteExpense(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Expense" />
        <Card><div className="p-8 text-sm text-gray-500 text-center">Loading…</div></Card>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="space-y-6">
        <PageHeader title="Expense" />
        <Card><div className="p-8 text-sm text-gray-500 text-center">Expense not found.</div></Card>
      </div>
    );
  }

  const isAdmin = !!currentUser?.is_admin;

  if (editing) {
    return (
      <div className="space-y-6">
        <PageHeader title={`Edit expense #${expense.id}`} />
        <ExpenseForm
          expense={expense}
          onSubmit={handleUpdate}
          submitLabel="Save changes"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Expense #${expense.id}`}
        subtitle={`Logged ${formatDateShort(expense.created_at)}${expense.created_by ? ` by ${expense.created_by.name}` : ''}`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
            {isAdmin && (
              <Button variant="danger" onClick={() => setConfirmDeleteExpense(true)}>Delete</Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Amount</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{formatPKR(expense.amount)}</p>
              </div>
              <StatusPill status={expense.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Category</p>
                <p className="text-sm text-gray-900 mt-1">{expense.category?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Vendor</p>
                <p className="text-sm text-gray-900 mt-1">{expense.vendor?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Paid so far</p>
                <p className="text-sm text-gray-900 mt-1">{formatPKR(expense.paid_total)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Remaining</p>
                <p className="text-sm text-gray-900 mt-1">{formatPKR(expense.balance)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Record payment</h3>
            {expense.status === 'paid' ? (
              <p className="text-sm text-gray-500">Fully paid — no balance remaining.</p>
            ) : (
              <form onSubmit={handleAddPayment} className="space-y-3">
                <Input
                  label="Amount (PKR)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  placeholder={`Up to ${formatPKR(expense.balance)}`}
                />
                <Input
                  label="Payment date"
                  type="date"
                  value={newPayment.payment_date}
                  onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                />
                {paymentError && (
                  <p className="text-sm text-red-600">{paymentError}</p>
                )}
                <Button type="submit" disabled={addingPayment} className="w-full">
                  {addingPayment ? 'Adding…' : 'Add payment'}
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Payment history</h3>
          {expense.payments.length === 0 ? (
            <p className="text-sm text-gray-500">No payments recorded yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {expense.payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatPKR(p.amount)}</p>
                    <p className="text-xs text-gray-500">{formatDateShort(p.payment_date)}</p>
                  </div>
                  {isAdmin && (
                    <Button variant="ghost-danger" size="sm" onClick={() => handleDeletePayment(p.id)}>
                      Delete
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {confirmDeleteExpense && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setConfirmDeleteExpense(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete expense?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete the expense and all its payment records. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDeleteExpense(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDeleteExpense}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
