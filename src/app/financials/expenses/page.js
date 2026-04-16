'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button, Card, PageHeader, Input, Select } from '@/components/ui';
import { formatPKR, formatDateShort } from '@/lib/format';

const STATUS_COLORS = {
  paid: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  unpaid: 'bg-red-100 text-red-700',
};

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium uppercase ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
}

export default function ExpensesListPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: 'all',
    category_id: '',
    vendor_id: '',
    from: '',
    to: '',
    search: '',
    sort: 'date_desc',
  });

  useEffect(() => {
    async function loadLists() {
      const [catRes, venRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/vendors'),
      ]);
      setCategories(await catRes.json());
      setVendors(await venRes.json());
    }
    loadLists();
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    async function loadExpenses() {
      setLoading(true);
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(filters)) {
        if (v && v !== 'all') qs.set(k, v);
      }
      try {
        const res = await fetch(`/api/expenses?${qs}`, { signal: ctrl.signal });
        if (res.ok) setExpenses(await res.json());
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadExpenses();
    return () => ctrl.abort();
  }, [filters]);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters({
      status: 'all',
      category_id: '',
      vendor_id: '',
      from: '',
      to: '',
      search: '',
      sort: 'date_desc',
    });
  }

  const totals = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const paid = expenses.reduce((s, e) => s + e.paid_total, 0);
    const balance = expenses.reduce((s, e) => s + e.balance, 0);
    return { total, paid, balance };
  }, [expenses]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        subtitle={`${expenses.length} ${expenses.length === 1 ? 'transaction' : 'transactions'}`}
        action={<Button href="/financials/expenses/new">Add expense</Button>}
      />

      <Card>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Input
            placeholder="Search vendor or category"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
          <Select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="all">All status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </Select>
          <Select
            value={filters.category_id}
            onChange={(e) => updateFilter('category_id', e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select
            value={filters.vendor_id}
            onChange={(e) => updateFilter('vendor_id', e.target.value)}
          >
            <option value="">All vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </Select>
          <Input
            type="date"
            value={filters.from}
            onChange={(e) => updateFilter('from', e.target.value)}
          />
          <Input
            type="date"
            value={filters.to}
            onChange={(e) => updateFilter('to', e.target.value)}
          />
        </div>
        <div className="p-4 pt-0 flex flex-wrap gap-3 items-center justify-between border-t border-gray-100">
          <Select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="max-w-xs"
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="amount_desc">Amount: high to low</option>
            <option value="amount_asc">Amount: low to high</option>
          </Select>
          <Button variant="secondary" size="sm" onClick={resetFilters}>
            Reset filters
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <div className="p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatPKR(totals.total)}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500">Paid</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{formatPKR(totals.paid)}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500">Outstanding</p>
            <p className="text-xl font-bold text-red-600 mt-1">{formatPKR(totals.balance)}</p>
          </div>
        </Card>
      </div>

      <Card>
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">Loading…</div>
        ) : expenses.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No expenses match your filters.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {formatDateShort(e.created_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-900">{e.category?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-900">{e.vendor?.name || '—'}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{formatPKR(e.amount)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatPKR(e.balance)}</td>
                      <td className="px-4 py-3"><StatusPill status={e.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/financials/expenses/${e.id}`}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="lg:hidden divide-y divide-gray-100">
              {expenses.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/financials/expenses/${e.id}`}
                    className="block p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {e.vendor?.name || '—'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {e.category?.name || '—'} • {formatDateShort(e.created_at)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{formatPKR(e.amount)}</p>
                        <div className="mt-1"><StatusPill status={e.status} /></div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
