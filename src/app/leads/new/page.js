'use client';
import LeadForm from '@/components/LeadForm';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { PageHeader } from '@/components/ui';

export default function NewLeadPage() {
  const router = useRouter();
  const addToast = useToast();

  async function handleSubmit(data) {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        addToast('Lead created successfully', 'success');
        router.push('/leads');
      } else {
        addToast('Failed to create lead', 'error');
      }
    } catch (err) {
      addToast('Failed to create lead', 'error');
    }
  }

  return (
    <div>
      <PageHeader title="Add New Lead" />
      <div className="mt-6">
        <LeadForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
