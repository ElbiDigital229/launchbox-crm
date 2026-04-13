'use client';

import { useState } from 'react';
import { SOURCES, STAGES, PLANS } from '@/lib/constants';

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
  });

  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

  const inputClass =
    'block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const sectionHeaderClass = 'text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3';
  const sectionDividerClass = 'border-b border-gray-100 pb-2 mb-4';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl space-y-6">
      {/* Section 1: Contact Information */}
      <div>
        <div className={sectionDividerClass}>
          <h3 className={sectionHeaderClass}>Contact Information</h3>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g., Arjun Mehta"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="arjun@company.com"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              name="phone"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Company</label>
            <input
              type="text"
              name="company"
              placeholder="Company name"
              value={formData.company}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Deal Details */}
      <div>
        <div className={sectionDividerClass}>
          <h3 className={sectionHeaderClass}>Deal Details</h3>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Source</label>
            <select name="source" value={formData.source} onChange={handleChange} className={inputClass}>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Stage</label>
            <select name="stage" value={formData.stage} onChange={handleChange} className={inputClass}>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Plan Type</label>
            <select name="plan_type" value={formData.plan_type} onChange={handleChange} className={inputClass}>
              <option value="">Select a plan</option>
              {PLANS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Rate Quoted (&#x20B9;)</label>
            <input
              type="number"
              name="rate_quoted"
              placeholder="e.g., 25000"
              value={formData.rate_quoted}
              onChange={handleChange}
              className={inputClass}
              min="0"
              step="100"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Scheduling */}
      <div>
        <div className={sectionDividerClass}>
          <h3 className={sectionHeaderClass}>Scheduling</h3>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Visit Date</label>
            <input
              type="date"
              name="visit_date"
              value={formData.visit_date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Follow-up Date</label>
            <input
              type="date"
              name="follow_up_date"
              value={formData.follow_up_date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Next Steps</label>
            <input
              type="text"
              name="next_steps"
              placeholder="e.g., Schedule office tour"
              value={formData.next_steps}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Has visited the space</label>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, visited: !prev.visited }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.visited ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                formData.visited ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Notes */}
      <div>
        <div className={sectionDividerClass}>
          <h3 className={sectionHeaderClass}>Notes</h3>
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Add any relevant notes about this lead..."
            value={formData.notes}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : lead ? 'Update Lead' : 'Add Lead'}
        </button>
        <a
          href={lead ? `/leads/${lead.id}` : '/leads'}
          className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
