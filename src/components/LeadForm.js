'use client';

import { useState } from 'react';
import { SOURCES, STAGES, PLANS, LEAD_TAGS, TAG_COLORS } from '@/lib/constants';
import { Button, Card, Badge, Input, Select, Textarea, Toggle, FormSection } from '@/components/ui';

export default function LeadForm({ lead, onSubmit }) {
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    company: lead?.company || '',
    source: lead?.source || 'Walk-in',
    stage: lead?.stage || 'New',
    plan_type: lead?.plan_type || '',
    rate_quoted: lead?.rate_quoted || '',
    visited: lead?.visited ? true : false,
    visit_date: lead?.visit_date || '',
    next_steps: lead?.next_steps || '',
    follow_up_date: lead?.follow_up_date || '',
    notes: lead?.notes || '',
    tags: lead?.tags || [],
  });

  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function toggleTag(tag) {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        rate_quoted: formData.rate_quoted ? parseFloat(formData.rate_quoted) : null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Map tag colors to tailwind classes for selected/unselected states
  const tagVariants = {
    red: { on: 'bg-red-100 text-red-700 border-red-300', off: 'bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-600' },
    blue: { on: 'bg-blue-100 text-blue-700 border-blue-300', off: 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600' },
    purple: { on: 'bg-purple-100 text-purple-700 border-purple-300', off: 'bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:text-purple-600' },
    orange: { on: 'bg-orange-100 text-orange-700 border-orange-300', off: 'bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-600' },
    yellow: { on: 'bg-yellow-100 text-yellow-700 border-yellow-300', off: 'bg-white text-gray-500 border-gray-200 hover:border-yellow-300 hover:text-yellow-600' },
    pink: { on: 'bg-pink-100 text-pink-700 border-pink-300', off: 'bg-white text-gray-500 border-gray-200 hover:border-pink-300 hover:text-pink-600' },
    green: { on: 'bg-green-100 text-green-700 border-green-300', off: 'bg-white text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-600' },
    indigo: { on: 'bg-indigo-100 text-indigo-700 border-indigo-300', off: 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600' },
    gray: { on: 'bg-gray-100 text-gray-700 border-gray-300', off: 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-600' },
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-3xl space-y-6">
        {/* Section 1: Contact Information */}
        <FormSection title="Contact Information">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input label="Name" required name="name" placeholder="e.g., Arjun Mehta" value={formData.name} onChange={handleChange} />
            <Input label="Email" type="email" name="email" placeholder="arjun@company.com" value={formData.email} onChange={handleChange} />
            <Input label="Phone" type="tel" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} />
            <Input label="Company" name="company" placeholder="Company name" value={formData.company} onChange={handleChange} />
          </div>
        </FormSection>

        {/* Section 2: Deal Details */}
        <FormSection title="Deal Details">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Select label="Source" name="source" value={formData.source} onChange={handleChange}>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select label="Stage" name="stage" value={formData.stage} onChange={handleChange}>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select label="Plan Type" name="plan_type" value={formData.plan_type} onChange={handleChange}>
              <option value="">Select a plan</option>
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Input label="Rate Quoted (&#x20B9;)" type="number" name="rate_quoted" placeholder="e.g., 25000" value={formData.rate_quoted} onChange={handleChange} min="0" step="100" />
          </div>
        </FormSection>

        {/* Section 3: Tags */}
        <FormSection title="Tags">
          <p className="text-xs text-gray-500 mb-3">Click to toggle tags for this lead</p>
          <div className="flex flex-wrap gap-2">
            {LEAD_TAGS.map((tag) => {
              const isSelected = formData.tags.includes(tag);
              const color = TAG_COLORS[tag] || 'gray';
              const variant = tagVariants[color] || tagVariants.gray;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                    isSelected ? variant.on : variant.off
                  }`}
                >
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {tag}
                </button>
              );
            })}
          </div>
        </FormSection>

        {/* Section 4: Scheduling */}
        <FormSection title="Scheduling">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input label="Visit Date" type="date" name="visit_date" value={formData.visit_date} onChange={handleChange} />
            <Input label="Follow-up Date" type="date" name="follow_up_date" value={formData.follow_up_date} onChange={handleChange} />
            <div className="sm:col-span-2">
              <Input label="Next Steps" name="next_steps" placeholder="e.g., Schedule office tour" value={formData.next_steps} onChange={handleChange} />
            </div>
            <div className="sm:col-span-2">
              <Toggle label="Has visited the space" checked={formData.visited} onChange={() => setFormData(prev => ({ ...prev, visited: !prev.visited }))} />
            </div>
          </div>
        </FormSection>

        {/* Section 5: Notes */}
        <FormSection title="Notes">
          <Textarea label="Notes" name="notes" rows={3} placeholder="Add any relevant notes about this lead..." value={formData.notes} onChange={handleChange} />
        </FormSection>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : lead ? 'Update Lead' : 'Add Lead'}
          </Button>
          <Button variant="secondary" href={lead ? `/leads/${lead.id}` : '/leads'}>
            Cancel
          </Button>
        </div>
      </Card>
    </form>
  );
}
