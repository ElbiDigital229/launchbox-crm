'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { STAGE_COLORS, SOURCES, STAGES } from '@/lib/constants';
import Avatar from '@/components/Avatar';
import { useToast } from '@/components/Toast';

export default function LeadsPage() {
  const addToast = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Lead deleted', 'info');
        setLeads((prev) => prev.filter((l) => l.id !== id));
      } else {
        addToast('Failed to delete lead', 'error');
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
      addToast('Failed to delete lead', 'error');
    }
  }

  const filtered = leads.filter((lead) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (lead.name && lead.name.toLowerCase().includes(q)) ||
      (lead.email && lead.email.toLowerCase().includes(q)) ||
      (lead.company && lead.company.toLowerCase().includes(q));
    const matchesSource = !sourceFilter || lead.source === sourceFilter;
    const matchesStage = !stageFilter || lead.stage === stageFilter;
    return matchesSearch && matchesSource && matchesStage;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading leads...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <Link
          href="/leads/new"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          + Add Lead
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-lg">No leads yet.</p>
          <p className="text-sm mt-1">Add your first lead!</p>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="lg:hidden space-y-2">
            {filtered.map((lead) => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar name={lead.name} size="sm" />
                    <div>
                      <p className="font-semibold text-gray-900">{lead.name}</p>
                      {lead.company && <p className="text-sm text-gray-500">{lead.company}</p>}
                    </div>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${STAGE_COLORS[lead.stage] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {lead.stage}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                  {lead.source && <span className="bg-gray-100 px-2 py-0.5 rounded">{lead.source}</span>}
                  {lead.plan_type && <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{lead.plan_type}</span>}
                  {lead.rate_quoted ? (
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">&#x20B9;{Number(lead.rate_quoted).toLocaleString('en-IN')}</span>
                  ) : null}
                  {lead.visited ? (
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">Visited</span>
                  ) : null}
                </div>
                {lead.follow_up_date && (
                  <p className="text-xs text-gray-400 mt-2">Follow-up: {lead.follow_up_date}</p>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Source</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Stage</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Plan</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Rate</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">Visited</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Follow-up</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, index) => (
                    <tr key={lead.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${index % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={lead.name} size="sm" />
                          <div>
                            <Link href={`/leads/${lead.id}`} className="font-medium text-gray-900 hover:text-indigo-600 hover:underline">
                              {lead.name}
                            </Link>
                            {lead.company && <p className="text-xs text-gray-400">{lead.company}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{lead.source}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STAGE_COLORS[lead.stage] || 'bg-gray-100 text-gray-800'}`}
                        >
                          {lead.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{lead.plan_type || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 text-right">
                        {lead.rate_quoted ? `\u20B9${Number(lead.rate_quoted).toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {lead.visited ? (
                          <span className="text-green-500 font-bold">&#10003;</span>
                        ) : (
                          <span className="text-gray-300 font-bold">&#10005;</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{lead.follow_up_date || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/leads/${lead.id}/edit`}
                            className="hover:bg-gray-100 rounded-lg p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11.333 2A1.886 1.886 0 0 1 14 4.667L5.333 13.333 2 14l.667-3.333L11.333 2Z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg p-1.5 transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334Z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
              Showing {filtered.length} of {leads.length} leads
            </div>
          </div>
        </>
      )}
    </div>
  );
}
