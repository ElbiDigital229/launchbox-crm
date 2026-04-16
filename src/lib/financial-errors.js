import { NextResponse } from 'next/server';

const ERROR_MAP = {
  INVALID_AMOUNT:      { status: 400, message: 'Amount must be a positive number.' },
  AMOUNT_TOO_LARGE:    { status: 400, message: 'Amount is too large (max Rs 9,999,999,999.99).' },
  AMOUNT_BELOW_PAID:   { status: 400, message: 'New amount cannot be lower than what has already been paid.' },
  INVALID_DATE:        { status: 400, message: 'Date is invalid.' },
  CATEGORY_REQUIRED:   { status: 400, message: 'Category is required.' },
  VENDOR_REQUIRED:     { status: 400, message: 'Vendor is required.' },
  CATEGORY_NOT_FOUND:  { status: 400, message: 'Selected category does not exist.' },
  VENDOR_NOT_FOUND:    { status: 400, message: 'Selected vendor does not exist.' },
  OVERPAYMENT:         { status: 400, message: 'Payment exceeds the remaining balance.' },
  EXPENSE_NOT_FOUND:   { status: 404, message: 'Expense not found.' },
  PAYMENT_NOT_FOUND:   { status: 404, message: 'Payment not found.' },
  REASSIGN_REQUIRED:   { status: 409, message: 'In use. Provide reassignTo query parameter.', code: 'REASSIGN_REQUIRED' },
  REASSIGN_SAME:       { status: 400, message: 'Cannot reassign to the same record.' },
  REASSIGN_NOT_FOUND:  { status: 404, message: 'Reassignment target not found.' },
};

export function handleFinancialError(error, fallbackMessage = 'Internal error') {
  // Prisma known error codes
  if (error?.code === 'P2002') {
    return NextResponse.json({ error: 'A record with this name already exists.' }, { status: 409 });
  }
  if (error?.code === 'P2003') {
    return NextResponse.json({ error: 'Referenced record does not exist.' }, { status: 400 });
  }
  if (error?.code === 'P2025') {
    return NextResponse.json({ error: 'Record not found.' }, { status: 404 });
  }
  if (error?.code === 'P2000') {
    return NextResponse.json({ error: 'Value exceeds allowed precision.' }, { status: 400 });
  }

  const mapped = ERROR_MAP[error?.message];
  if (mapped) {
    const body = { error: mapped.message };
    if (mapped.code) body.code = mapped.code;
    return NextResponse.json(body, { status: mapped.status });
  }

  return NextResponse.json({ error: error?.message || fallbackMessage }, { status: 500 });
}
