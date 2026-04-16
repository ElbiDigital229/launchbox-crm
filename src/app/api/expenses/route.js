import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllExpenses, createExpense } from '@/lib/financials';
import { handleFinancialError } from '@/lib/financial-errors';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const url = new URL(request.url);
    const filters = {
      status: url.searchParams.get('status') || undefined,
      category_id: url.searchParams.get('category_id') || undefined,
      vendor_id: url.searchParams.get('vendor_id') || undefined,
      from: url.searchParams.get('from') || undefined,
      to: url.searchParams.get('to') || undefined,
      search: url.searchParams.get('search') || undefined,
      sort: url.searchParams.get('sort') || undefined,
    };
    const expenses = await getAllExpenses(filters);
    return NextResponse.json(expenses);
  } catch (error) {
    return handleFinancialError(error);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await request.json();
    const expense = await createExpense(data, user.id);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return handleFinancialError(error);
  }
}
