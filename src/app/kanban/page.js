'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import { SkeletonKanban } from '@/components/Skeleton';

const STAGES = [
  'New',
  'Contacted',
  'Tour Scheduled',
  'Toured',
  'Negotiation',
  'Won',
  'Lost',
];

const STAGE_BORDER_COLORS = {
  New: 'border-t-blue-500',
  Contacted: 'border-t-yellow-500',
  'Tour Scheduled': 'border-t-purple-500',
  Toured: 'border-t-indigo-500',
  Negotiation: 'border-t-orange-500',
  Won: 'border-t-green-500',
  Lost: 'border-t-red-500',
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d <= today;
}

function formatFollowUpDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Draggable Card ─────────────────────────────────────────────────────────

function DraggableCard({ lead, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: String(lead.id) });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  if (isDragging) {
    // Render an invisible placeholder while dragging (DragOverlay handles the visual)
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white rounded-lg shadow-sm p-3 mb-2 opacity-30 border border-dashed border-gray-300"
      >
        <p className="font-semibold text-sm text-transparent">{lead.name}</p>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Only navigate if this was a click, not a drag
        onClick(lead.id);
      }}
      className="bg-white rounded-lg shadow-sm p-3 mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <LeadCardContent lead={lead} />
    </div>
  );
}

// ─── Card Content (shared between real card and overlay) ────────────────────

function LeadCardContent({ lead }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Avatar name={lead.name} size="sm" />
        <p className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
          {lead.name}
          {lead.visited === 1 && (
            <span
              className="inline-block w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
              title="Visited"
            />
          )}
        </p>
      </div>

      {lead.company && (
        <p className="text-xs text-gray-500 mt-0.5">{lead.company}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mt-2">
        {lead.plan_type && (
          <span className="inline-block text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
            {lead.plan_type}
          </span>
        )}
        {lead.rate_quoted != null && lead.rate_quoted > 0 && (
          <span className="inline-block text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
            {formatCurrency(lead.rate_quoted)}
          </span>
        )}
      </div>

      {lead.source && (
        <p className="text-[11px] text-gray-400 mt-2">{lead.source}</p>
      )}

      {lead.follow_up_date && (
        <div className={`flex items-center gap-1 mt-2 text-[11px] ${isOverdue(lead.follow_up_date) ? 'text-red-500' : 'text-gray-400'}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{formatFollowUpDate(lead.follow_up_date)}</span>
        </div>
      )}
    </>
  );
}

// ─── Droppable Column ───────────────────────────────────────────────────────

function DroppableColumn({ stage, leads, onCardClick }) {
  const { isOver, setNodeRef } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[240px] sm:min-w-[280px] max-w-[240px] sm:max-w-[280px] flex flex-col bg-gray-50 rounded-lg border-t-4 ${
        STAGE_BORDER_COLORS[stage]
      } ${isOver ? 'ring-2 ring-indigo-300 bg-indigo-50/40' : ''}`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <h3 className="font-semibold text-sm text-gray-700">{stage}</h3>
        <span className="text-xs font-medium bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 min-w-[24px] text-center">
          {leads.length}
        </span>
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {leads.map((lead) => (
          <DraggableCard key={lead.id} lead={lead} onClick={onCardClick} />
        ))}
        {leads.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg py-8 text-center">
            <p className="text-xs text-gray-400">No leads</p>
          </div>
        )}
      </div>

      {/* Add lead link */}
      <Link href={`/leads/new?stage=${encodeURIComponent(stage)}`} className="block mt-2 text-center py-2 text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
        + Add lead
      </Link>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function KanbanPage() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  // Use PointerSensor with a distance activation constraint so clicks still work
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        setLeads(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Group leads by stage
  const leadsByStage = {};
  STAGES.forEach((stage) => {
    leadsByStage[stage] = leads.filter((l) => l.stage === stage);
  });

  const activeLead = activeId
    ? leads.find((l) => String(l.id) === activeId)
    : null;

  const handleDragStart = useCallback((event) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (event) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const leadId = String(active.id);
      const newStage = over.id; // droppable id is the stage name

      // Only update if dropped on a valid stage column
      if (!STAGES.includes(newStage)) return;

      const lead = leads.find((l) => String(l.id) === leadId);
      if (!lead || lead.stage === newStage) return;

      // Optimistic update
      setLeads((prev) =>
        prev.map((l) =>
          String(l.id) === leadId ? { ...l, stage: newStage } : l
        )
      );

      // Persist to API
      try {
        const res = await fetch(`/api/leads/${lead.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: newStage }),
        });
        if (!res.ok) throw new Error('Update failed');
      } catch {
        // Revert on failure
        setLeads((prev) =>
          prev.map((l) =>
            String(l.id) === leadId ? { ...l, stage: lead.stage } : l
          )
        );
      }
    },
    [leads]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleCardClick = useCallback(
    (id) => {
      router.push(`/leads/${id}`);
    },
    [router]
  );

  if (loading) {
    return (
      <div className="p-4">
        <SkeletonKanban />
      </div>
    );
  }

  return (
    <div className="sm:p-2">
      {/* Page header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">
          Drag leads between stages
        </p>
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <DroppableColumn
              key={stage}
              stage={stage}
              leads={leadsByStage[stage]}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        {/* Drag overlay for smooth drag visual */}
        <DragOverlay>
          {activeLead ? (
            <div className="bg-white rounded-lg shadow-lg p-3 opacity-80 ring-2 ring-indigo-400 w-[264px] cursor-grabbing">
              <LeadCardContent lead={activeLead} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
