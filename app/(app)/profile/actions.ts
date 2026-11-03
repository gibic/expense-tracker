"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

// Sign-out is not rate limited, so `auth.api` is fine here. The nextCookies
// plugin clears the session cookies.
export async function signOut() {
  await auth.api.signOut({ headers: await headers() })
  redirect("/sign-in")
}
