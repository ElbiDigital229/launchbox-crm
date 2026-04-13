'use client';
import LeadForm from '@/components/LeadForm';
import { useRouter } from 'next/navigation';

export default function NewLeadPage() {
  const router = useRouter();

  async function handleSubmit(data) {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push('/leads');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Lead</h1>
      <LeadForm onSubmit={handleSubmit} />
    </div>
  );
}
