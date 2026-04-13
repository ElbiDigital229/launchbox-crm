'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LeadForm from '@/components/LeadForm';
import { useToast } from '@/components/Toast';

export default function EditLeadPage() {
  const { id } = useParams();
  const router = useRouter();
  const addToast = useToast();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchLead() {
      try {
        const res = await fetch(`/api/leads/${id}`);
        if (res.ok) {
          const data = await res.json();
          setLead(data);
        } else {
          router.push('/leads');
        }
      } catch (err) {
        console.error('Failed to fetch lead:', err);
        router.push('/leads');
      } finally {
        setLoading(false);
      }
    }
    fetchLead();
  }, [id, router]);

  async function handleSubmit(data) {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      addToast('Lead updated successfully', 'success');
      router.push(`/leads/${id}`);
    } else {
      addToast('Failed to update lead', 'error');
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this lead? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Lead deleted', 'info');
        router.push('/leads');
      } else {
        addToast('Failed to delete lead', 'error');
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
      addToast('Failed to delete lead', 'error');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading lead...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Lead not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete Lead'}
        </button>
      </div>
      <LeadForm lead={lead} onSubmit={handleSubmit} />
    </div>
  );
}
