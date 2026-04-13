import Avatar from '@/components/Avatar';
import { STAGE_BAR_COLORS, SOURCE_COLORS } from '@/lib/constants';
import { getDashboardStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isUrgentDate(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const d = new Date(dateStr + 'T00:00:00');
  return d <= tomorrow;
}

function StatCard({ icon, iconBg, iconColor, borderColor, title, value, subtitle }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${borderColor} p-6`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
          <div className={`w-5 h-5 ${iconColor}`}>{icon}</div>
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function EmptyPanel({ icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
      <div className="w-10 h-10 mb-3 text-gray-300">{icon}</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const maxStageCount = Math.max(...stats.byStage.map((s) => s.count), 1);
  const maxSourceCount = Math.max(...stats.bySource.map((s) => s.count), 1);

  const today = new Date();
  const formattedToday = today.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Your coworking pipeline at a glance</p>
        </div>
        <p className="text-sm text-gray-500 mt-2">{formattedToday}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          borderColor="border-l-blue-500"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
          title="Total Leads"
          value={stats.totalLeads}
          subtitle="All time"
        />
        <StatCard
          borderColor="border-l-emerald-500"
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012.75 11h-.5A3.375 3.375 0 009 14.25v4.5m3.75-9V3.75m0 0L15 6m-3.25-2.25L9.5 6" /></svg>}
          title="Won Deals"
          value={stats.wonLeads}
          subtitle="Closed successfully"
        />
        <StatCard
          borderColor="border-l-amber-500"
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          subtitle={`${stats.wonLeads} won of ${stats.totalLeads} total`}
        />
        <StatCard
          borderColor="border-l-indigo-500"
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
          icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>}
          title="Pipeline Value"
          value={`\u20B9${Number(stats.pipelineValue).toLocaleString('en-IN')}`}
          subtitle="Active deals"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Leads by Stage">
          {stats.byStage.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.byStage.map((item) => (
                <div key={item.stage} className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50">
                  <span className="text-sm text-gray-600 w-24 shrink-0">{item.stage}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STAGE_BAR_COLORS[item.stage] || 'bg-indigo-500'} transition-all`}
                      style={{ width: `${Math.max((item.count / maxStageCount) * 100, 4)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Leads by Source">
          {stats.bySource.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.bySource.map((item) => (
                <div key={item.source} className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${SOURCE_COLORS[item.source] || 'bg-gray-400'}`} />
                  <span className="text-sm text-gray-600 w-24 shrink-0">{item.source}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${SOURCE_COLORS[item.source] || 'bg-gray-400'} transition-all`}
                      style={{ width: `${Math.max((item.count / maxSourceCount) * 100, 4)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Upcoming Visits">
          {stats.upcomingVisits.length === 0 ? (
            <EmptyPanel
              icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
              message="No visits scheduled"
            />
          ) : (
            <div className="space-y-3">
              {stats.upcomingVisits.map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50">
                  <Avatar name={lead.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                    <p className="text-xs text-gray-500 truncate">{lead.company || 'No company'}</p>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{formatDate(lead.visit_date)}</span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Upcoming Follow-ups">
          {stats.upcomingFollowUps.length === 0 ? (
            <EmptyPanel
              icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              message="No follow-ups scheduled"
            />
          ) : (
            <div className="space-y-3">
              {stats.upcomingFollowUps.map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50">
                  <Avatar name={lead.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                    <p className="text-xs text-gray-500 truncate">{lead.next_steps || 'No details'}</p>
                  </div>
                  <span className={`text-xs shrink-0 font-medium ${isUrgentDate(lead.follow_up_date) ? 'text-orange-600' : 'text-gray-500'}`}>
                    {formatDate(lead.follow_up_date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
