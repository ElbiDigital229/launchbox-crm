import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllCategories, createCategory } from '@/lib/financials';
import { handleFinancialError } from '@/lib/financial-errors';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return handleFinancialError(error);
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const created = await createCategory(name.trim());
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleFinancialError(error);
  }
}
