'use client';
import LeadForm from '@/components/LeadForm';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Lead</h1>
      <LeadForm onSubmit={handleSubmit} />
    </div>
  );
}
