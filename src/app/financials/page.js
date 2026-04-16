'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { formatPKR, formatDateShort } from '@/lib/format';

function StatCard({ borderColor, iconBg, iconColor, icon, title, value, subtitle }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${borderColor} p-6`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
          <div className={`w-5 h-5 ${iconColor}`}>{icon}</div>
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, children, action }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function BarList({ items, colorClass = 'bg-indigo-500' }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">No data yet.</p>;
  }
  const max = Math.max(...items.map((i) => i.amount), 1);
  return (
    <div className="space-y-3">
      {items.slice(0, 6).map((item) => {
        const pct = Math.max((item.amount / max) * 100, 3);
        return (
          <div key={item.name}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700 truncate">{item.name}</span>
              <span className="text-gray-900 font-medium">{formatPKR(item.amount)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusDistribution({ counts, amounts }) {
  const total = counts.paid + counts.partial + counts.unpaid;
  if (total === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">No expenses yet.</p>;
  }
  const segments = [
    { key: 'paid', label: 'Paid', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    { key: 'partial', label: 'Partial', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
    { key: 'unpaid', label: 'Unpaid', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
  ];
  return (
    <div className="space-y-4">
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
        {segments.map((s) => {
          const pct = (counts[s.key] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={s.key}
              className={`${s.color} transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {segments.map((s) => (
          <div key={s.key} className={`rounded-lg p-3 ${s.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className={`text-xs font-medium uppercase tracking-wider ${s.text}`}>{s.label}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{counts[s.key]}</p>
            <p className="text-xs text-gray-500">{formatPKR(amounts[s.key])}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_PILL = {
  paid: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  unpaid: 'bg-red-100 text-red-700',
};

export default function FinancialsDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/financials/stats');
        if (res.ok) setStats(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financials Dashboard</h1>
            <p className="text-gray-500 mt-1">Expense tracking & cash flow</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-500">
          Loading stats…
        </div>
      </div>
    );
  }

  if (!stats) {
    return <p className="p-8">Failed to load stats.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financials Dashboard</h1>
          <p className="text-gray-500 mt-1">Expense tracking & cash flow</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-sm text-gray-500">{today}</p>
          <Button href="/financials/expenses/new">Add expense</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          borderColor="border-l-indigo-500"
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
          icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          title="This month"
          value={formatPKR(stats.totals.month)}
          subtitle="Total expenses"
        />
        <StatCard
          borderColor="border-l-blue-500"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          title="Year to date"
          value={formatPKR(stats.totals.ytd)}
          subtitle={`${stats.totals.expenseCount} expenses`}
        />
        <StatCard
          borderColor="border-l-emerald-500"
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          title="Paid"
          value={formatPKR(stats.totals.paid)}
          subtitle="Settled amount"
        />
        <StatCard
          borderColor="border-l-red-500"
          iconBg="bg-red-100"
          iconColor="text-red-600"
          icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          title="Outstanding"
          value={formatPKR(stats.totals.unpaid)}
          subtitle={`${stats.totals.overdueCount} overdue`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Status breakdown">
          <StatusDistribution counts={stats.statusCounts} amounts={stats.statusAmounts} />
        </DashboardCard>

        <DashboardCard title="Top categories">
          <BarList items={stats.byCategory} colorClass="bg-indigo-500" />
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Top vendors">
          <BarList items={stats.byVendor} colorClass="bg-purple-500" />
        </DashboardCard>

        <DashboardCard
          title="Recent transactions"
          action={
            <Link href="/financials/expenses" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View all
            </Link>
          }
        >
          {stats.recent.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No transactions yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {stats.recent.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/financials/expenses/${e.id}`}
                    className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{e.vendor?.name || '—'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {e.category?.name || '—'} • {formatDateShort(e.created_at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-semibold text-gray-900">{formatPKR(e.amount)}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase mt-1 ${STATUS_PILL[e.status]}`}>
                        {e.status}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
