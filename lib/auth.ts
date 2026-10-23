import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"

import { db } from "@/db"
import { user } from "@/db/schema"
import { seedDefaultCategories } from "@/db/seed"

export async function hasAccount() {
  const existing = await db.select({ id: user.id }).from(user).limit(1)
  return existing.length > 0
}

/** Sign-up is open only while no account exists, unless ALLOW_SIGN_UP=true. */
async function isSignUpOpen() {
  return process.env.ALLOW_SIGN_UP === "true" || !(await hasAccount())
}

// Each Vercel deployment trusts its own URLs, so previews pass the origin check.
const vercelOrigins = [
  process.env.VERCEL_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
]
  .filter(Boolean)
  .map((host) => `https://${host}`)

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  trustedOrigins: vercelOrigins,
  // Serverless instances share no memory, so counters live in Postgres.
  rateLimit: { storage: "database" },
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async () => {
          if (!(await isSignUpOpen())) {
            throw new APIError("FORBIDDEN", { message: "Sign-up is closed." })
          }
        },
      },
    },
    session: {
      create: {
        // Runs on every sign-in, including the one right after sign-up, so a
        // failed seed is retried next time. Runs after the commit, so a throw
        // here would fail a sign-in that already succeeded: log instead.
        after: async (session) => {
          try {
            await seedDefaultCategories(session.userId)
          } catch (error) {
            console.error("Seeding default categories failed", error)
          }
        },
      },
    },
  },
  plugins: [nextCookies()], // keep last
})
