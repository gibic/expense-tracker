import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"

import { db } from "@/db"
import { user } from "@/db/schema"
import { seedDefaultCategories } from "@/db/seed"
import { canSignUp } from "@/lib/sign-up"

export async function hasAccount() {
  const existing = await db.select({ id: user.id }).from(user).limit(1)
  return existing.length > 0
}

/** ALLOW_SIGN_UP=true keeps sign-up open for anyone. */
export function isSignUpAllowed() {
  return process.env.ALLOW_SIGN_UP === "true"
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
        before: async (newUser) => {
          const allowed = canSignUp(newUser.email, {
            allowSignUp: isSignUpAllowed(),
            ownerEmail: process.env.OWNER_EMAIL,
            accountExists: await hasAccount(),
          })
          if (!allowed) {
            throw new APIError("FORBIDDEN", {
              message: "Sign-up is closed.",
              code: "SIGN_UP_CLOSED",
            })
          }
        },
        // Runs after the commit, so a throw here would fail a sign-up that
        // already succeeded: log instead.
        after: async (newUser) => {
          try {
            await seedDefaultCategories(newUser.id)
          } catch (error) {
            console.error("Seeding default categories failed", error)
          }
        },
      },
    },
  },
  plugins: [nextCookies()], // keep last
})
