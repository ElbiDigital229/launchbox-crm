import { NextResponse } from 'next/server';
import { getActivitiesByLeadId, createActivity } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const activities = await getActivitiesByLeadId(id);
    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    if (!data.description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }
    const activity = await createActivity({
      lead_id: parseInt(id),
      type: data.type || 'note',
      description: data.description,
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
