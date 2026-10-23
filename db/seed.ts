import { eq } from "drizzle-orm"

import { db } from "@/db"
import { categories } from "@/db/schema"
import { DEFAULT_CATEGORIES } from "@/lib/categories"

/**
 * Inserts the default categories for a user who has none. Safe to call more
 * than once: a user who already has categories is left alone, and concurrent
 * calls skip rows the other call already wrote.
 */
export async function seedDefaultCategories(userId: string) {
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.userId, userId))
    .limit(1)
  if (existing.length > 0) return

  await db
    .insert(categories)
    .values(DEFAULT_CATEGORIES.map((name) => ({ userId, name })))
    .onConflictDoNothing({ target: [categories.userId, categories.name] })
}
