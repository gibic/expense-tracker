// One-off backfill: seeds default categories for users created before the
// sign-up seeding hook (lib/auth.ts databaseHooks.user.create.after).
//
// Run once:
//   pnpm db:backfill-categories --shipped-at=<ISO time> [--dry-run]
//
// --shipped-at is when the user-create hook (commit 57ea44f) finished
// deploying to production, in UTC, e.g. 2026-10-23T14:10:00Z. Take it from
// the Vercel deploy log, not from git: the commit time is earlier than the
// deploy, and users created in that gap ran old code. Erring later is safe:
// it can only re-seed a post-hook user who has zero categories.
//
// Targets only users created before the user-create hook shipped (commit
// 57ea44f; before it, 4d57625 seeded on every sign-in instead) who have zero
// categories. Users created later were seeded at sign-up, so one who
// deleted every category on purpose is never re-seeded here. Pre-hook users
// who delete all categories after this runs would be seeded again on a re-run,
// so run it once.

import nextEnv from "@next/env"

// Required flag, no default: a hard-coded value was easy to get wrong (it held
// the commit time, not the deploy time). Requires an explicit "Z" or offset
// so the time is not read in the machine's local zone.
function readShippedAt(): Date {
  const arg = process.argv.find((a) => a.startsWith("--shipped-at="))
  const value = arg?.slice("--shipped-at=".length) ?? ""
  const date = new Date(value)
  if (!/(Z|[+-]\d{2}:\d{2})$/.test(value) || Number.isNaN(date.getTime())) {
    console.error(
      "Missing or invalid --shipped-at. Pass the production deploy time of " +
        "commit 57ea44f from the Vercel deploy log, e.g. " +
        "--shipped-at=2026-10-23T14:10:00Z"
    )
    process.exit(1)
  }
  return date
}

const HOOK_SHIPPED_AT = readShippedAt()

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

    console.log(
      `${users.length} user(s) created before ${HOOK_SHIPPED_AT.toISOString()} without categories`
    )
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
