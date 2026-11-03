import "server-only"

import { and, count, desc, eq, gte, lt, sql } from "drizzle-orm"

import { db } from "@/db"
import { categories, expenses } from "@/db/schema"
import type { ExpenseValue } from "@/lib/expense-input"
import { monthRange } from "@/lib/month"
import { FOREIGN_KEY_VIOLATION, hasPgCode } from "@/lib/pg-error"
import { requireUserId } from "@/lib/session"
import { summarize, type MonthSummary } from "@/lib/summary"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Postgres throws on malformed uuid input, so guard before querying. */
export const isUuid = (value: string) => UUID_RE.test(value)

export type ExpenseRow = {
  id: string
  amount: number
  date: string
  note: string | null
  categoryId: string
  categoryName: string
}

export async function listExpenses(opts: {
  month: string
  categoryId?: string
}): Promise<ExpenseRow[]> {
  const userId = await requireUserId()
  const { from, to } = monthRange(opts.month)
  return db
    .select({
      id: expenses.id,
      amount: expenses.amount,
      date: expenses.date,
      note: expenses.note,
      categoryId: expenses.categoryId,
      categoryName: categories.name,
    })
    .from(expenses)
    .innerJoin(categories, eq(categories.id, expenses.categoryId))
    .where(
      and(
        eq(expenses.userId, userId),
        gte(expenses.date, from),
        lt(expenses.date, to),
        opts.categoryId ? eq(expenses.categoryId, opts.categoryId) : undefined
      )
    )
    .orderBy(desc(expenses.date), desc(expenses.createdAt))
}

/** Month total, expense count and per-category breakdown, largest first. */
export async function monthSummary(month: string): Promise<MonthSummary> {
  const userId = await requireUserId()
  const { from, to } = monthRange(month)
  const rows = await db
    .select({
      categoryId: expenses.categoryId,
      categoryName: categories.name,
      total: sql<string>`sum(${expenses.amount})`,
      count: count(),
    })
    .from(expenses)
    .innerJoin(categories, eq(categories.id, expenses.categoryId))
    .where(
      and(
        eq(expenses.userId, userId),
        gte(expenses.date, from),
        lt(expenses.date, to)
      )
    )
    .groupBy(expenses.categoryId, categories.name)
    .orderBy(desc(sql`sum(${expenses.amount})`), categories.name)

  return summarize(rows)
}

export async function getExpense(id: string) {
  const userId = await requireUserId()
  if (!isUuid(id)) return null
  const [row] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
  return row ?? null
}

async function categoryBelongsToUser(userId: string, categoryId: string) {
  if (!isUuid(categoryId)) return false
  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
  return Boolean(row)
}

/** Returns false when the category is not the caller's. */
export async function createExpense(value: ExpenseValue) {
  const userId = await requireUserId()
  if (!(await categoryBelongsToUser(userId, value.categoryId))) return false
  try {
    await db.insert(expenses).values({ ...value, userId })
  } catch (error) {
    // Category deleted between the check and the insert.
    if (hasPgCode(error, FOREIGN_KEY_VIOLATION)) return false
    throw error
  }
  return true
}

/** Returns "ok", "bad-category" or "not-found". */
export async function updateExpense(id: string, value: ExpenseValue) {
  const userId = await requireUserId()
  if (!isUuid(id)) return "not-found" as const
  if (!(await categoryBelongsToUser(userId, value.categoryId))) {
    return "bad-category" as const
  }
  try {
    const updated = await db
      .update(expenses)
      .set(value)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning({ id: expenses.id })
    return updated.length > 0 ? ("ok" as const) : ("not-found" as const)
  } catch (error) {
    // Category deleted between the check and the update.
    if (hasPgCode(error, FOREIGN_KEY_VIOLATION)) return "bad-category" as const
    throw error
  }
}

/** Returns the deleted expense's date, or null when nothing was deleted. */
export async function deleteExpense(id: string): Promise<string | null> {
  const userId = await requireUserId()
  if (!isUuid(id)) return null
  const [row] = await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
    .returning({ date: expenses.date })
  return row?.date ?? null
}
