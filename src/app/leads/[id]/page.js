'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { STAGE_COLORS } from '@/lib/constants';
import Avatar from '@/components/Avatar';
import { SkeletonDetail } from '@/components/Skeleton';
import { Button, Card, StageBadge, Badge, Select, Textarea } from '@/components/ui';

const ACTIVITY_TYPES = {
  call: { label: 'Call', color: 'bg-blue-100 text-blue-600', icon: 'phone' },
  email: { label: 'Email', color: 'bg-purple-100 text-purple-600', icon: 'envelope' },
  visit: { label: 'Visit', color: 'bg-green-100 text-green-600', icon: 'building' },
  meeting: { label: 'Meeting', color: 'bg-indigo-100 text-indigo-600', icon: 'users' },
  note: { label: 'Note', color: 'bg-gray-100 text-gray-600', icon: 'pencil' },
  status_change: { label: 'Status Change', color: 'bg-orange-100 text-orange-600', icon: 'arrows' },
  follow_up: { label: 'Follow-up', color: 'bg-yellow-100 text-yellow-600', icon: 'clock' },
};

const STAGE_BANNER_COLORS = {
  New: 'bg-blue-500',
  Contacted: 'bg-yellow-500',
  Visited: 'bg-purple-500',
  Proposal: 'bg-orange-500',
  'Tour Scheduled': 'bg-purple-500',
  Toured: 'bg-indigo-500',
  Negotiation: 'bg-orange-500',
  Won: 'bg-green-500',
  Lost: 'bg-red-500',
};

function ActivityIcon({ type }) {
  const iconMap = {
    phone: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    envelope: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    building: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
      </svg>
    ),
    users: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    pencil: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      </svg>
    ),
    arrows: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16V4m0 0L3 8m4-4 4 4" />
        <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
      </svg>
    ),
    clock: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  };

  return iconMap[type] || null;
}

function formatDate(dateStr) {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function formatCurrency(value) {
  if (value == null || value === '') return '\u2014';
  return `\u20B9${Number(value).toLocaleString('en-IN')}`;
}

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

function formatDateOnly(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function DetailField({ label, children }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <dt className="uppercase tracking-wider text-[11px] text-gray-400 font-semibold">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{children || '\u2014'}</dd>
    </div>
  );
}

export default function ViewLeadPage() {
  const { id } = useParams();
  const addToast = useToast();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityType, setActivityType] = useState('call');
  const [activityDesc, setActivityDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLead();
    fetchActivities();
  }, [id]);

  async function fetchLead() {
    try {
      const res = await fetch(`/api/leads/${id}`);
      if (res.ok) setLead(await res.json());
    } catch (err) {
      console.error('Failed to fetch lead:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchActivities() {
    try {
      const res = await fetch(`/api/leads/${id}/activities`);
      if (res.ok) setActivities(await res.json());
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  }

  async function handleAddActivity(e) {
    e.preventDefault();
    if (!activityDesc.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/leads/${id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activityType, description: activityDesc }),
      });
      if (res.ok) {
        addToast('Activity added', 'success');
        setActivityDesc('');
        setActivityType('call');
        fetchActivities();
      } else {
        addToast('Failed to add activity', 'error');
      }
    } catch (err) {
      console.error('Failed to add activity:', err);
      addToast('Failed to add activity', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <SkeletonDetail />;

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Lead not found</p>
      </div>
    );
  }

  const bannerColor = STAGE_BANNER_COLORS[lead.stage] || 'bg-gray-400';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <Link href="/leads" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Leads
      </Link>

      {/* Header Card */}
      <Card padding="" className="mb-6 sm:mb-8 overflow-hidden border-gray-200">
        <div className={`h-2 rounded-t-xl ${bannerColor}`} />
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar name={lead.name} size="xl" />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
              {lead.company && <p className="text-gray-500 mt-0.5">{lead.company}</p>}
            </div>
            <div className="flex items-center gap-3">
              <StageBadge stage={lead.stage} size="lg" />
              <Button variant="outline" href={`/leads/${id}/edit`}>Edit</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Details Card */}
      <Card className="mb-6 sm:mb-8 border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
          <DetailField label="Email">
            {lead.email ? (
              <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline">{lead.email}</a>
            ) : null}
          </DetailField>
          <DetailField label="Phone">
            {lead.phone ? (
              <a href={`tel:${lead.phone}`} className="text-indigo-600 hover:underline">{lead.phone}</a>
            ) : null}
          </DetailField>
          <DetailField label="Source">{lead.source}</DetailField>
          <DetailField label="Plan Type">{lead.plan_type}</DetailField>
          <DetailField label="Rate Quoted">{formatCurrency(lead.rate_quoted)}</DetailField>
          <DetailField label="Visited">
            {lead.visited ? (
              <Badge variant="green" size="md">Yes</Badge>
            ) : (
              <Badge variant="gray" size="md">No</Badge>
            )}
          </DetailField>
          <DetailField label="Visit Date">{formatDate(lead.visit_date)}</DetailField>
          <DetailField label="Follow-up Date">{formatDate(lead.follow_up_date)}</DetailField>
          <DetailField label="Next Steps">{lead.next_steps}</DetailField>
          <DetailField label="Created">{formatDate(lead.created_at)}</DetailField>
        </dl>
      </Card>

      {/* Activity Timeline */}
      <Card className="border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
          <Badge variant="gray">{activities.length}</Badge>
        </div>

        {/* Add Activity Form */}
        <form onSubmit={handleAddActivity} className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-44"
            >
              {Object.entries(ACTIVITY_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <textarea
              value={activityDesc}
              onChange={(e) => setActivityDesc(e.target.value)}
              placeholder="Describe the activity..."
              rows={3}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <Button
              type="submit"
              disabled={submitting || !activityDesc.trim()}
              className="self-end whitespace-nowrap"
            >
              {submitting ? 'Adding...' : 'Add Update'}
            </Button>
          </div>
        </form>

        {/* Timeline */}
        {activities.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No activities yet</p>
        ) : (
          <div className="relative">
            {activities.map((activity, index) => {
              const config = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.note;
              const isLast = index === activities.length - 1;

              const currentDate = activity.created_at ? formatDateOnly(activity.created_at) : '';
              const prevDate = index > 0 && activities[index - 1].created_at
                ? formatDateOnly(activities[index - 1].created_at)
                : null;
              const showDateSeparator = index === 0 || currentDate !== prevDate;

              return (
                <div key={activity.id || index}>
                  {showDateSeparator && currentDate && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="text-xs font-medium text-gray-400">{currentDate}</span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>
                  )}
                  <div className="relative flex gap-4 pb-6">
                    {!isLast && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.color}`}>
                      <ActivityIcon type={config.icon} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-700">{config.label}</p>
                        <span className="text-xs text-gray-400">{relativeTime(activity.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-900 mt-0.5">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(activity.created_at)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
