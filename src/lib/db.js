import prisma from './prisma';

export async function getAllLeads() {
  return prisma.lead.findMany({
    orderBy: { created_at: 'desc' },
  });
}

export async function getLeadById(id) {
  return prisma.lead.findUnique({
    where: { id: Number(id) },
  });
}

export async function createLead(data) {
  return prisma.lead.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      source: data.source || 'Walk-in',
      stage: data.stage || 'New',
      plan_type: data.plan_type || null,
      rate_quoted: data.rate_quoted ? parseFloat(data.rate_quoted) : null,
      visited: Boolean(data.visited),
      visit_date: data.visit_date || null,
      next_steps: data.next_steps || null,
      follow_up_date: data.follow_up_date || null,
      notes: data.notes || null,
      tags: data.tags || [],
    },
  });
}

export async function updateLead(id, data) {
  const existing = await prisma.lead.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) return null;

  return prisma.lead.update({
    where: { id: Number(id) },
    data: {
      name: data.name ?? existing.name,
      email: data.email ?? existing.email,
      phone: data.phone ?? existing.phone,
      company: data.company ?? existing.company,
      source: data.source ?? existing.source,
      stage: data.stage ?? existing.stage,
      plan_type: data.plan_type ?? existing.plan_type,
      rate_quoted: data.rate_quoted !== undefined
        ? (data.rate_quoted ? parseFloat(data.rate_quoted) : null)
        : existing.rate_quoted,
      visited: data.visited !== undefined ? Boolean(data.visited) : existing.visited,
      visit_date: data.visit_date ?? existing.visit_date,
      next_steps: data.next_steps ?? existing.next_steps,
      follow_up_date: data.follow_up_date ?? existing.follow_up_date,
      notes: data.notes ?? existing.notes,
      tags: data.tags ?? existing.tags,
    },
  });
}

export async function deleteLead(id) {
  return prisma.lead.delete({
    where: { id: Number(id) },
  });
}

export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0];

  const [totalLeads, wonLeads, lostLeads, pipelineAgg, upcomingVisits, upcomingFollowUps, byStageRaw, bySourceRaw] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { stage: 'Won' } }),
    prisma.lead.count({ where: { stage: 'Lost' } }),
    prisma.lead.aggregate({
      _sum: { rate_quoted: true },
      where: { stage: { notIn: ['Won', 'Lost'] } },
    }),
    prisma.lead.findMany({
      where: {
        visit_date: { gte: today },
        visited: false,
      },
      orderBy: { visit_date: 'asc' },
      take: 5,
    }),
    prisma.lead.findMany({
      where: {
        follow_up_date: { gte: today },
      },
      orderBy: { follow_up_date: 'asc' },
      take: 5,
    }),
    prisma.lead.groupBy({
      by: ['stage'],
      _count: { stage: true },
    }),
    prisma.lead.groupBy({
      by: ['source'],
      _count: { source: true },
    }),
  ]);

  return {
    totalLeads,
    wonLeads,
    lostLeads,
    conversionRate: totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0,
    pipelineValue: pipelineAgg._sum.rate_quoted || 0,
    upcomingVisits,
    upcomingFollowUps,
    byStage: byStageRaw.map(s => ({ stage: s.stage, count: s._count.stage })),
    bySource: bySourceRaw.map(s => ({ source: s.source, count: s._count.source })),
  };
}

export async function getActivitiesByLeadId(leadId) {
  return prisma.leadActivity.findMany({
    where: { lead_id: Number(leadId) },
    orderBy: { created_at: 'desc' },
  });
}

export async function createActivity(data) {
  return prisma.leadActivity.create({
    data: {
      lead_id: parseInt(data.lead_id),
      type: data.type || 'note',
      description: data.description,
    },
  });
}

export async function deleteActivity(id) {
  return prisma.leadActivity.delete({
    where: { id: Number(id) },
  });
}
