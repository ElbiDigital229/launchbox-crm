'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Select, FormSection } from '@/components/ui';
import { toDateInputValue } from '@/lib/format';

export default function ExpenseForm({ expense, onSubmit, submitLabel = 'Save expense' }) {
  const router = useRouter();
  const isEdit = !!expense;

  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const [formData, setFormData] = useState({
    amount: expense?.amount ?? '',
    category_id: expense?.category_id ?? '',
    vendor_id: expense?.vendor_id ?? '',
  });

  const [markPaidNow, setMarkPaidNow] = useState(false);
  const [initialPayment, setInitialPayment] = useState({
    amount: '',
    payment_date: toDateInputValue(new Date()),
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLists() {
      try {
        const [catRes, venRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/vendors'),
        ]);
        setCategories(await catRes.json());
        setVendors(await venRes.json());
      } catch (err) {
        setError('Failed to load categories/vendors');
      } finally {
        setLoadingLists(false);
      }
    }
    loadLists();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than zero');
      return;
    }
    if (!formData.category_id) {
      setError('Category is required');
      return;
    }
    if (!formData.vendor_id) {
      setError('Vendor is required');
      return;
    }
    if (markPaidNow) {
      const p = parseFloat(initialPayment.amount);
      if (!(p > 0)) {
        setError('Payment amount must be greater than zero');
        return;
      }
      if (p > parseFloat(formData.amount)) {
        setError('Payment amount cannot exceed expense amount');
        return;
      }
      if (!initialPayment.payment_date) {
        setError('Payment date is required');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        category_id: Number(formData.category_id),
        vendor_id: Number(formData.vendor_id),
      };
      if (!isEdit && markPaidNow) {
        payload.initial_payment_amount = parseFloat(initialPayment.amount);
        payload.initial_payment_date = initialPayment.payment_date;
      }
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }

  const missingLists =
    !loadingLists && (categories.length === 0 || vendors.length === 0);

  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {missingLists && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            You need at least one category and one vendor before adding an expense.{' '}
            <a href="/financials/config" className="font-semibold underline">Go to Configuration</a>
          </div>
        )}

        <FormSection title="Expense details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Amount (PKR)"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
            />
            <Select
              label="Category *"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              disabled={loadingLists}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            <Select
              label="Vendor *"
              name="vendor_id"
              value={formData.vendor_id}
              onChange={handleChange}
              disabled={loadingLists}
            >
              <option value="">Select vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </Select>
          </div>
        </FormSection>

        {!isEdit && (
          <FormSection title="Payment status">
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMarkPaidNow(false)}
                  className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                    !markPaidNow
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Unpaid — add payment later
                </button>
                <button
                  type="button"
                  onClick={() => setMarkPaidNow(true)}
                  className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                    markPaidNow
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Record a payment now
                </button>
              </div>

              {markPaidNow && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Payment amount (PKR)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={initialPayment.amount}
                    onChange={(e) => setInitialPayment({ ...initialPayment, amount: e.target.value })}
                    placeholder="Full or partial amount"
                  />
                  <Input
                    label="Payment date"
                    type="date"
                    value={initialPayment.payment_date}
                    onChange={(e) => setInitialPayment({ ...initialPayment, payment_date: e.target.value })}
                  />
                </div>
              )}
            </div>
          </FormSection>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || loadingLists || missingLists}>
            {submitting ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
