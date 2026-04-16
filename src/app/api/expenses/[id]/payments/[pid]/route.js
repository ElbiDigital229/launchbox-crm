import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updatePayment, deletePayment } from '@/lib/financials';
import { handleFinancialError } from '@/lib/financial-errors';

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { pid } = await params;
    const body = await request.json();
    const updated = await updatePayment(pid, body);
    return NextResponse.json(updated);
  } catch (error) {
    return handleFinancialError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Only admins can delete payments' }, { status: 403 });
    }
    const { pid } = await params;
    await deletePayment(pid);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleFinancialError(error);
  }
}
