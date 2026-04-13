'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LeadForm from '@/components/LeadForm';
import { useToast } from '@/components/Toast';
import { Button, PageHeader } from '@/components/ui';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function EditLeadPage() {
  const { id } = useParams();
  const router = useRouter();
  const addToast = useToast();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    setShowDeleteConfirm(false);
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
      <PageHeader
        title="Edit Lead"
        action={
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Lead'}
          </Button>
        }
      />
      <div className="mt-6">
        <LeadForm lead={lead} onSubmit={handleSubmit} />
      </div>
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Lead"
        message={`Are you sure you want to delete "${lead?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
