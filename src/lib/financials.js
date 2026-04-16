import prisma from './prisma';

const toNumber = (d) => (d == null ? 0 : Number(d));

// Decimal(12,2) max value = 9_999_999_999.99
const MAX_AMOUNT = 9_999_999_999.99;

// Round to 2 dp to mirror DB precision and avoid float-compare drift
const round2 = (n) => Math.round(n * 100) / 100;

function parseAmount(input) {
  const n = parseFloat(input);
  if (!Number.isFinite(n) || n <= 0) throw new Error('INVALID_AMOUNT');
  if (n > MAX_AMOUNT) throw new Error('AMOUNT_TOO_LARGE');
  return round2(n);
}

function parseDateOrNow(input, fieldName = 'date') {
  if (input == null || input === '') return new Date();
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) {
    const err = new Error('INVALID_DATE');
    err.field = fieldName;
    throw err;
  }
  return d;
}

function parsePositiveInt(input) {
  if (input == null || input === '') return null;
  const s = String(input).trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return n > 0 ? n : null;
}

function deriveStatus(amount, paid) {
  const a = toNumber(amount);
  const p = toNumber(paid);
  if (p <= 0) return 'unpaid';
  if (p < a) return 'partial';
  return 'paid';
}

function serializeExpense(expense) {
  const paidTotal = (expense.payments || []).reduce((s, p) => s + toNumber(p.amount), 0);
  const amount = toNumber(expense.amount);
  return {
    id: expense.id,
    amount,
    category_id: expense.category_id,
    vendor_id: expense.vendor_id,
    created_by_user_id: expense.created_by_user_id,
    created_at: expense.created_at,
    updated_at: expense.updated_at,
    category: expense.category || null,
    vendor: expense.vendor || null,
    created_by: expense.created_by
      ? { id: expense.created_by.id, name: expense.created_by.name, email: expense.created_by.email }
      : null,
    payments: (expense.payments || []).map((p) => ({
      id: p.id,
      amount: toNumber(p.amount),
      payment_date: p.payment_date,
      created_at: p.created_at,
    })),
    paid_total: paidTotal,
    balance: Math.max(amount - paidTotal, 0),
    status: deriveStatus(amount, paidTotal),
  };
}

// --------------------- Categories ---------------------

export async function getAllCategories() {
  return prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } });
}

export async function createCategory(name) {
  return prisma.expenseCategory.create({ data: { name } });
}

export async function renameCategory(id, name) {
  return prisma.expenseCategory.update({
    where: { id: Number(id) },
    data: { name },
  });
}

export async function deleteCategory(id, reassignToId) {
  const targetId = Number(id);
  const reassignId = reassignToId ? Number(reassignToId) : null;

  return prisma.$transaction(async (tx) => {
    const usage = await tx.expense.count({ where: { category_id: targetId } });
    if (usage > 0) {
      if (!reassignId) throw new Error('REASSIGN_REQUIRED');
      if (reassignId === targetId) throw new Error('REASSIGN_SAME');
      const dest = await tx.expenseCategory.findUnique({ where: { id: reassignId } });
      if (!dest) throw new Error('REASSIGN_NOT_FOUND');
      await tx.expense.updateMany({
        where: { category_id: targetId },
        data: { category_id: reassignId },
      });
    }
    return tx.expenseCategory.delete({ where: { id: targetId } });
  });
}

// --------------------- Vendors ---------------------

export async function getAllVendors() {
  return prisma.vendor.findMany({ orderBy: { name: 'asc' } });
}

export async function createVendor(name) {
  return prisma.vendor.create({ data: { name } });
}

export async function renameVendor(id, name) {
  return prisma.vendor.update({
    where: { id: Number(id) },
    data: { name },
  });
}

export async function deleteVendor(id, reassignToId) {
  const targetId = Number(id);
  const reassignId = reassignToId ? Number(reassignToId) : null;

  return prisma.$transaction(async (tx) => {
    const usage = await tx.expense.count({ where: { vendor_id: targetId } });
    if (usage > 0) {
      if (!reassignId) throw new Error('REASSIGN_REQUIRED');
      if (reassignId === targetId) throw new Error('REASSIGN_SAME');
      const dest = await tx.vendor.findUnique({ where: { id: reassignId } });
      if (!dest) throw new Error('REASSIGN_NOT_FOUND');
      await tx.expense.updateMany({
        where: { vendor_id: targetId },
        data: { vendor_id: reassignId },
      });
    }
    return tx.vendor.delete({ where: { id: targetId } });
  });
}

// --------------------- Expenses ---------------------

const expenseInclude = {
  category: true,
  vendor: true,
  created_by: { select: { id: true, name: true, email: true } },
  payments: { orderBy: { payment_date: 'asc' } },
};

export async function getAllExpenses(filters = {}) {
  const where = {};

  const catId = parsePositiveInt(filters.category_id);
  if (catId) where.category_id = catId;

  const venId = parsePositiveInt(filters.vendor_id);
  if (venId) where.vendor_id = venId;

  const dateRange = {};
  if (filters.from) {
    const d = new Date(filters.from);
    if (!Number.isNaN(d.getTime())) dateRange.gte = d;
  }
  if (filters.to) {
    const d = new Date(filters.to);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      dateRange.lte = d;
    }
  }
  if (Object.keys(dateRange).length) where.created_at = dateRange;

  if (filters.search) {
    const s = filters.search.trim();
    if (s) {
      where.OR = [
        { category: { name: { contains: s, mode: 'insensitive' } } },
        { vendor: { name: { contains: s, mode: 'insensitive' } } },
      ];
    }
  }

  const orderBy =
    filters.sort === 'amount_asc' ? { amount: 'asc' } :
    filters.sort === 'amount_desc' ? { amount: 'desc' } :
    filters.sort === 'date_asc' ? { created_at: 'asc' } :
    { created_at: 'desc' };

  const rows = await prisma.expense.findMany({ where, orderBy, include: expenseInclude });
  const serialized = rows.map(serializeExpense);

  // Status filter is applied after derivation
  if (filters.status && filters.status !== 'all') {
    return serialized.filter((e) => e.status === filters.status);
  }
  return serialized;
}

export async function getExpenseById(id) {
  const e = await prisma.expense.findUnique({
    where: { id: Number(id) },
    include: expenseInclude,
  });
  return e ? serializeExpense(e) : null;
}

export async function createExpense(data, userId) {
  const amount = parseAmount(data.amount);
  const categoryId = parsePositiveInt(data.category_id);
  const vendorId = parsePositiveInt(data.vendor_id);
  if (!categoryId) throw new Error('CATEGORY_REQUIRED');
  if (!vendorId) throw new Error('VENDOR_REQUIRED');

  const [category, vendor] = await Promise.all([
    prisma.expenseCategory.findUnique({ where: { id: categoryId }, select: { id: true } }),
    prisma.vendor.findUnique({ where: { id: vendorId }, select: { id: true } }),
  ]);
  if (!category) throw new Error('CATEGORY_NOT_FOUND');
  if (!vendor) throw new Error('VENDOR_NOT_FOUND');

  const payments = [];
  if (data.initial_payment_amount != null && data.initial_payment_amount !== '') {
    const rawP = parseFloat(data.initial_payment_amount);
    if (Number.isFinite(rawP) && rawP > 0) {
      const pAmount = round2(rawP);
      if (pAmount > amount) throw new Error('OVERPAYMENT');
      payments.push({
        amount: pAmount,
        payment_date: parseDateOrNow(data.initial_payment_date, 'initial_payment_date'),
      });
    }
  }

  const created = await prisma.expense.create({
    data: {
      amount,
      category_id: categoryId,
      vendor_id: vendorId,
      created_by_user_id: userId ?? null,
      payments: payments.length ? { create: payments } : undefined,
    },
    include: expenseInclude,
  });
  return serializeExpense(created);
}

export async function updateExpense(id, data) {
  const expenseId = parsePositiveInt(id);
  if (!expenseId) return null;

  const existing = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { payments: true },
  });
  if (!existing) return null;

  const paidTotal = existing.payments.reduce((s, p) => s + toNumber(p.amount), 0);

  const updateData = {};
  if (data.amount !== undefined) {
    const a = parseAmount(data.amount);
    if (a < paidTotal) throw new Error('AMOUNT_BELOW_PAID');
    updateData.amount = a;
  }
  if (data.category_id !== undefined) {
    const catId = parsePositiveInt(data.category_id);
    if (!catId) throw new Error('CATEGORY_REQUIRED');
    const found = await prisma.expenseCategory.findUnique({ where: { id: catId }, select: { id: true } });
    if (!found) throw new Error('CATEGORY_NOT_FOUND');
    updateData.category_id = catId;
  }
  if (data.vendor_id !== undefined) {
    const venId = parsePositiveInt(data.vendor_id);
    if (!venId) throw new Error('VENDOR_REQUIRED');
    const found = await prisma.vendor.findUnique({ where: { id: venId }, select: { id: true } });
    if (!found) throw new Error('VENDOR_NOT_FOUND');
    updateData.vendor_id = venId;
  }

  const updated = await prisma.expense.update({
    where: { id: expenseId },
    data: updateData,
    include: expenseInclude,
  });
  return serializeExpense(updated);
}

export async function deleteExpense(id) {
  return prisma.expense.delete({ where: { id: Number(id) } });
}

// --------------------- Payments ---------------------

export async function addPayment(expenseId, { amount, payment_date }) {
  const a = parseAmount(amount);
  const date = parseDateOrNow(payment_date, 'payment_date');

  const expId = parsePositiveInt(expenseId);
  if (!expId) throw new Error('EXPENSE_NOT_FOUND');

  const expense = await prisma.expense.findUnique({
    where: { id: expId },
    include: { payments: { select: { amount: true } } },
  });
  if (!expense) throw new Error('EXPENSE_NOT_FOUND');

  const paidTotal = expense.payments.reduce((s, p) => s + toNumber(p.amount), 0);
  const remaining = round2(toNumber(expense.amount) - paidTotal);
  if (a > remaining + 0.005) throw new Error('OVERPAYMENT');

  const created = await prisma.payment.create({
    data: { expense_id: expId, amount: a, payment_date: date },
  });
  return {
    id: created.id,
    amount: toNumber(created.amount),
    payment_date: created.payment_date,
    created_at: created.created_at,
  };
}

export async function updatePayment(id, { amount, payment_date }) {
  const paymentId = parsePositiveInt(id);
  if (!paymentId) throw new Error('PAYMENT_NOT_FOUND');

  const existing = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      expense: {
        include: { payments: { select: { id: true, amount: true } } },
      },
    },
  });
  if (!existing) throw new Error('PAYMENT_NOT_FOUND');

  const data = {};
  if (amount !== undefined) {
    const a = parseAmount(amount);
    const otherPaid = existing.expense.payments
      .filter((p) => p.id !== paymentId)
      .reduce((s, p) => s + toNumber(p.amount), 0);
    const expenseAmount = toNumber(existing.expense.amount);
    if (round2(otherPaid + a) > round2(expenseAmount) + 0.005) throw new Error('OVERPAYMENT');
    data.amount = a;
  }
  if (payment_date !== undefined) {
    data.payment_date = parseDateOrNow(payment_date, 'payment_date');
  }
  return prisma.payment.update({ where: { id: paymentId }, data });
}

export async function deletePayment(id) {
  return prisma.payment.delete({ where: { id: Number(id) } });
}

// --------------------- Stats ---------------------

export async function getFinancialStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const all = await prisma.expense.findMany({
    include: expenseInclude,
    orderBy: { created_at: 'desc' },
  });
  const expenses = all.map(serializeExpense);

  const sum = (arr, key) => arr.reduce((s, e) => s + (key ? e[key] : 0), 0);
  const totalAmount = sum(expenses.map((e) => ({ amount: e.amount })), 'amount');

  const monthExpenses = expenses.filter((e) => new Date(e.created_at) >= monthStart);
  const ytdExpenses = expenses.filter((e) => new Date(e.created_at) >= yearStart);

  const paidTotal = expenses.reduce((s, e) => s + e.paid_total, 0);
  const unpaidTotal = expenses.reduce((s, e) => s + e.balance, 0);

  const overdueExpenses = expenses.filter((e) => e.status !== 'paid');
  const overdueAmount = overdueExpenses.reduce((s, e) => s + e.balance, 0);

  const byCategory = {};
  const byVendor = {};
  for (const e of expenses) {
    const cName = e.category?.name || 'Uncategorized';
    const vName = e.vendor?.name || 'Unknown';
    byCategory[cName] = (byCategory[cName] || 0) + e.amount;
    byVendor[vName] = (byVendor[vName] || 0) + e.amount;
  }

  const statusCounts = { paid: 0, partial: 0, unpaid: 0 };
  const statusAmounts = { paid: 0, partial: 0, unpaid: 0 };
  for (const e of expenses) {
    statusCounts[e.status] += 1;
    statusAmounts[e.status] += e.amount;
  }

  return {
    totals: {
      all: totalAmount,
      month: sum(monthExpenses.map((e) => ({ amount: e.amount })), 'amount'),
      ytd: sum(ytdExpenses.map((e) => ({ amount: e.amount })), 'amount'),
      paid: paidTotal,
      unpaid: unpaidTotal,
      overdue: overdueAmount,
      expenseCount: expenses.length,
      overdueCount: overdueExpenses.length,
    },
    byCategory: Object.entries(byCategory)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount),
    byVendor: Object.entries(byVendor)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount),
    statusCounts,
    statusAmounts,
    recent: expenses.slice(0, 8),
  };
}
