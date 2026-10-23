import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { auth } from "@/lib/auth"

/** Session for this request, or null. Cached so one render does one lookup. */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
)

/** Returns the session user id, or redirects to /sign-in. Call from every data-layer function. */
export async function requireUserId() {
  const session = await getSession()
  if (!session) redirect("/sign-in")
  return session.user.id
}
