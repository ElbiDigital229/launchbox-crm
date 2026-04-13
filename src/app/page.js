import StatsCard from '@/components/StatsCard';
import { STAGE_BAR_COLORS, SOURCE_COLORS } from '@/lib/constants';
import { getDashboardStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const stats = getDashboardStats();

  const maxStageCount = Math.max(...stats.byStage.map((s) => s.count), 1);
  const maxSourceCount = Math.max(...stats.bySource.map((s) => s.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your coworking leads</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Leads" value={stats.totalLeads} />
        <StatsCard title="Won Deals" value={stats.wonLeads} />
        <StatsCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          subtitle={`${stats.wonLeads} won of ${stats.totalLeads} total`}
        />
        <StatsCard
          title="Pipeline Value"
          value={`₹${Number(stats.pipelineValue).toLocaleString('en-IN')}`}
          subtitle="Active deals"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Stage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads by Stage</h2>
          {stats.byStage.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.byStage.map((item) => (
                <div key={item.stage} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24 shrink-0">{item.stage}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STAGE_BAR_COLORS[item.stage] || 'bg-indigo-500'}`}
                      style={{ width: `${(item.count / maxStageCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leads by Source */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads by Source</h2>
          {stats.bySource.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.bySource.map((item) => (
                <div key={item.source} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${SOURCE_COLORS[item.source] || 'bg-gray-400'}`} />
                  <span className="text-sm text-gray-600 w-24 shrink-0">{item.source}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${SOURCE_COLORS[item.source] || 'bg-gray-400'}`}
                      style={{ width: `${(item.count / maxSourceCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Visits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Visits</h2>
          {stats.upcomingVisits.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming visits</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500 font-medium">Name</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Company</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Visit Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.upcomingVisits.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-900">{lead.name}</td>
                      <td className="py-2 text-gray-600">{lead.company || '-'}</td>
                      <td className="py-2 text-gray-600">{lead.visit_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Follow-ups */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Follow-ups</h2>
          {stats.upcomingFollowUps.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming follow-ups</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500 font-medium">Name</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Next Steps</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Follow-up</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.upcomingFollowUps.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-900">{lead.name}</td>
                      <td className="py-2 text-gray-600">{lead.next_steps || '-'}</td>
                      <td className="py-2 text-gray-600">{lead.follow_up_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
