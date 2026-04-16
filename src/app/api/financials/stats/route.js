import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getFinancialStats } from '@/lib/financials';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const stats = await getFinancialStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
