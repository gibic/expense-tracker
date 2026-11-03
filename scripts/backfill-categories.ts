// One-off backfill: seeds default categories for users created before the
// sign-up seeding hook (lib/auth.ts databaseHooks.user.create.after).
//
// Run once: pnpm db:backfill-categories [--dry-run]
//
// Targets only users created before the user-create hook shipped (commit
// 57ea44f; before it, 4d57625 seeded on every sign-in instead) who have zero
// categories. Users created later were seeded at sign-up, so one who
// deleted every category on purpose is never re-seeded here. Pre-hook users
// who delete all categories after this runs would be seeded again on a re-run,
// so run it once.

import nextEnv from "@next/env"

// When the user-create hook reached production, in UTC (user.created_at has
// no time zone). Users created before the deploy ran old code, so this must
// be the production deploy time of 57ea44f, not its commit time. Erring later
// is safe: it can only re-seed a post-hook user who has zero categories.
const HOOK_SHIPPED_AT = new Date("2026-10-23T13:55:53Z")

// Load .env before importing db/ (db/index.ts reads DATABASE_URL on import).
// @next/env is CJS: no named ESM export, so use the default import.
nextEnv.loadEnvConfig(process.cwd())

async function main() {
  const dryRun = process.argv.includes("--dry-run")

  const { db } = await import("@/db")
  const { categories, user } = await import("@/db/schema")
  const { seedDefaultCategories } = await import("@/db/seed")
  const { and, eq, lt, notExists } = await import("drizzle-orm")

  try {
    await backfill()
  } finally {
    // Close the pg pool so the process exits as soon as the work is done.
    await db.$client.end()
  }

  async function backfill() {
    const users = await db
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(
        and(
          lt(user.createdAt, HOOK_SHIPPED_AT),
          notExists(
            db
              .select({ id: categories.id })
              .from(categories)
              .where(eq(categories.userId, user.id))
          )
        )
      )

    console.log(`${users.length} pre-hook user(s) without categories`)
    if (dryRun) {
      for (const u of users) console.log(`would seed ${u.email} (${u.id})`)
      return
    }

    let failed = 0
    for (const u of users) {
      try {
        await seedDefaultCategories(u.id)
        console.log(`seeded ${u.email} (${u.id})`)
      } catch (error) {
        failed++
        console.error(`failed ${u.email} (${u.id})`, error)
      }
    }

    console.log(`done: ${users.length - failed} seeded, ${failed} failed`)
    if (failed > 0) process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
