import "server-only"

import { and, count, eq, ne, sql } from "drizzle-orm"

import { db } from "@/db"
import { categories, expenses } from "@/db/schema"
import { isUuid } from "@/lib/expenses"
import {
  FOREIGN_KEY_VIOLATION,
  hasPgCode,
  UNIQUE_VIOLATION,
} from "@/lib/pg-error"
import { requireUserId } from "@/lib/session"

export type CategoryRow = { id: string; name: string }

export async function listCategories(): Promise<CategoryRow[]> {
  const userId = await requireUserId()
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.name)
}

/**
 * True when the user already has a category with this name, ignoring case.
 * The unique index is case-sensitive, so "transport" would slip past it.
 */
async function nameTaken(userId: string, name: string, exceptId?: string) {
  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        sql`lower(${categories.name}) = lower(${name})`,
        exceptId ? ne(categories.id, exceptId) : undefined
      )
    )
    .limit(1)
  return Boolean(row)
}

/** `name` must already be validated. Returns "ok" or "duplicate". */
export async function createCategory(name: string) {
  const userId = await requireUserId()
  if (await nameTaken(userId, name)) return "duplicate" as const
  try {
    await db.insert(categories).values({ userId, name })
  } catch (error) {
    // Same name inserted between the check and the insert.
    if (hasPgCode(error, UNIQUE_VIOLATION)) return "duplicate" as const
    throw error
  }
  return "ok" as const
}

/** `name` must already be validated. Returns "ok", "duplicate" or "not-found". */
export async function renameCategory(id: string, name: string) {
  const userId = await requireUserId()
  if (!isUuid(id)) return "not-found" as const
  if (await nameTaken(userId, name, id)) return "duplicate" as const
  try {
    const updated = await db
      .update(categories)
      .set({ name })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning({ id: categories.id })
    return updated.length > 0 ? ("ok" as const) : ("not-found" as const)
  } catch (error) {
    if (hasPgCode(error, UNIQUE_VIOLATION)) return "duplicate" as const
    throw error
  }
}

export type DeleteCategoryResult =
  | { status: "ok" }
  | { status: "not-found" }
  | { status: "in-use"; expenseCount: number }

async function countExpenses(userId: string, categoryId: string) {
  const [row] = await db
    .select({ n: count() })
    .from(expenses)
    .where(
      and(eq(expenses.userId, userId), eq(expenses.categoryId, categoryId))
    )
  return row?.n ?? 0
}

/** Deletes a category only when no expense uses it. */
export async function deleteCategory(
  id: string
): Promise<DeleteCategoryResult> {
  const userId = await requireUserId()
  if (!isUuid(id)) return { status: "not-found" }

  const used = await countExpenses(userId, id)
  if (used > 0) return { status: "in-use", expenseCount: used }

  try {
    const deleted = await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning({ id: categories.id })
    return deleted.length > 0 ? { status: "ok" } : { status: "not-found" }
  } catch (error) {
    // An expense took this category between the count and the delete; the
    // `on delete restrict` foreign key stopped it.
    if (hasPgCode(error, FOREIGN_KEY_VIOLATION)) {
      return {
        status: "in-use",
        expenseCount: Math.max(1, await countExpenses(userId, id)),
      }
    }
    throw error
  }
}
