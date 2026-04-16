import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { renameCategory, deleteCategory } from '@/lib/financials';
import { handleFinancialError } from '@/lib/financial-errors';

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const updated = await renameCategory(id, name.trim());
    return NextResponse.json(updated);
  } catch (error) {
    return handleFinancialError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Only admins can delete categories' }, { status: 403 });
    }
    const { id } = await params;
    const url = new URL(request.url);
    const reassignTo = url.searchParams.get('reassignTo');
    await deleteCategory(id, reassignTo);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleFinancialError(error);
  }
}
