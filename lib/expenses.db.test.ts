import { inArray } from "drizzle-orm"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { Client } from "pg"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

import { db } from "@/db"
import { categories, expenses, user } from "@/db/schema"

import { monthSummary } from "./expenses"

// Runs against a real Postgres. Set DATABASE_URL in .env.test.local to a
// database whose name ends in "_test"; it is created and migrated if needed.
// Without it, this suite is skipped.

const { session } = vi.hoisted(() => ({ session: { userId: "" } }))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/session", () => ({
  requireUserId: async () => session.userId,
}))

const url = process.env.DATABASE_URL
const dbName = url ? new URL(url).pathname.slice(1) : ""
// Guard: never write test rows into a dev or production database.
const enabled = /^\w+_test$/.test(dbName)

async function ensureDatabase() {
  const admin = new URL(url!)
  admin.pathname = "/postgres"
  const client = new Client({ connectionString: admin.toString() })
  await client.connect()
  try {
    const { rowCount } = await client.query(
      "select 1 from pg_database where datname = $1",
      [dbName]
    )
    // dbName matched /^\w+_test$/, so quoting it is safe.
    if (!rowCount) await client.query(`create database "${dbName}"`)
  } finally {
    await client.end()
  }
}

const run = crypto.randomUUID().slice(0, 8)
const alice = `test-alice-${run}`
const bob = `test-bob-${run}`

describe.skipIf(!enabled)("monthSummary (Postgres)", () => {
  const cat: Record<string, string> = {}

  beforeAll(async () => {
    await ensureDatabase()
    await migrate(db, { migrationsFolder: "drizzle" })

    await db.insert(user).values([
      { id: alice, name: "Alice", email: `${alice}@example.test` },
      { id: bob, name: "Bob", email: `${bob}@example.test` },
    ])
    const rows = await db
      .insert(categories)
      .values([
        { userId: alice, name: "Bills" },
        { userId: alice, name: "Travel" },
        { userId: alice, name: "Food" },
        { userId: alice, name: "Unused" },
        { userId: bob, name: "Bills" },
      ])
      .returning({
        id: categories.id,
        userId: categories.userId,
        name: categories.name,
      })
    for (const r of rows)
      cat[`${r.userId === alice ? "a" : "b"}:${r.name}`] = r.id

    await db.insert(expenses).values([
      // October 2026, Alice.
      {
        userId: alice,
        categoryId: cat["a:Bills"],
        amount: 500_000,
        date: "2026-10-01",
      },
      {
        userId: alice,
        categoryId: cat["a:Bills"],
        amount: 250_000,
        date: "2026-10-31",
      },
      {
        userId: alice,
        categoryId: cat["a:Food"],
        amount: 100_000,
        date: "2026-10-15",
      },
      {
        userId: alice,
        categoryId: cat["a:Food"],
        amount: 150_000,
        date: "2026-10-20",
      },
      {
        userId: alice,
        categoryId: cat["a:Travel"],
        amount: 250_000,
        date: "2026-10-05",
      },
      // Just outside October.
      {
        userId: alice,
        categoryId: cat["a:Bills"],
        amount: 999,
        date: "2026-09-30",
      },
      {
        userId: alice,
        categoryId: cat["a:Bills"],
        amount: 999,
        date: "2026-11-01",
      },
      // Bob, same month.
      {
        userId: bob,
        categoryId: cat["b:Bills"],
        amount: 777,
        date: "2026-10-10",
      },
    ])
  })

  afterAll(async () => {
    const users = [alice, bob]
    await db.delete(expenses).where(inArray(expenses.userId, users))
    await db.delete(categories).where(inArray(categories.userId, users))
    await db.delete(user).where(inArray(user.id, users))
    await db.$client.end()
  })

  it("totals one month for the signed-in user, largest first, ties by name", async () => {
    session.userId = alice
    const result = await monthSummary("2026-10")

    expect(result.total).toBe(1_250_000)
    expect(result.count).toBe(5)
    expect(result.byCategory).toEqual([
      {
        categoryId: cat["a:Bills"],
        categoryName: "Bills",
        total: 750_000,
        count: 2,
        share: 60,
      },
      {
        categoryId: cat["a:Food"],
        categoryName: "Food",
        total: 250_000,
        count: 2,
        share: 20,
      },
      {
        categoryId: cat["a:Travel"],
        categoryName: "Travel",
        total: 250_000,
        count: 1,
        share: 20,
      },
    ])
  })

  it("excludes other users' expenses", async () => {
    session.userId = bob
    const result = await monthSummary("2026-10")

    expect(result.total).toBe(777)
    expect(result.byCategory.map((c) => c.categoryId)).toEqual([cat["b:Bills"]])
  })

  it("returns zeros for a month with no expenses", async () => {
    session.userId = alice
    expect(await monthSummary("2026-08")).toEqual({
      total: 0,
      count: 0,
      byCategory: [],
    })
  })
})
