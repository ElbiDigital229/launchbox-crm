import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { addPayment } from '@/lib/financials';
import { handleFinancialError } from '@/lib/financial-errors';

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const payment = await addPayment(id, body);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return handleFinancialError(error);
  }
}
