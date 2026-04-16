'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui';
import ExpenseForm from '@/components/ExpenseForm';
import { useToast } from '@/components/Toast';

export default function NewExpensePage() {
  const router = useRouter();
  const addToast = useToast();

  async function handleSubmit(payload) {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create expense');
    addToast('Expense added', 'success');
    router.push(`/financials/expenses/${data.id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Add expense" subtitle="All amounts are in PKR" />
      <ExpenseForm onSubmit={handleSubmit} submitLabel="Add expense" />
    </div>
  );
}
