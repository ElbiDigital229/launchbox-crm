import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getExpenseById, updateExpense, deleteExpense } from '@/lib/financials';
import { handleFinancialError } from '@/lib/financial-errors';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const expense = await getExpenseById(id);
    if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    return NextResponse.json(expense);
  } catch (error) {
    return handleFinancialError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const data = await request.json();
    const updated = await updateExpense(id, data);
    if (!updated) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return handleFinancialError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Only admins can delete expenses' }, { status: 403 });
    }
    const { id } = await params;
    await deleteExpense(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleFinancialError(error);
  }
}
