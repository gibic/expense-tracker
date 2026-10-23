"use server"

import { parseSetCookieHeader, toCookieOptions } from "better-auth/cookies"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

export type AuthFormState = { error: string | null; email: string }

type AuthFailure = { status: number; code: string | undefined }

// Origin for Better Auth's origin check, client IP for its rate limiter,
// user agent for the session row.
const FORWARDED_HEADERS = ["origin", "user-agent", "x-forwarded-for"]

/**
 * Calls a Better Auth endpoint through its HTTP router rather than `auth.api`,
 * because only the router applies rate limiting. Copies the response cookies
 * onto this request. Returns null on success.
 */
async function callAuthEndpoint(
  path: string,
  body: Record<string, string>
): Promise<AuthFailure | null> {
  const incoming = await headers()
  const forwarded = new Headers({ "content-type": "application/json" })
  for (const name of FORWARDED_HEADERS) {
    const value = incoming.get(name)
    if (value) forwarded.set(name, value)
  }
  const base =
    incoming.get("origin") ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000"

  const response = await auth.handler(
    new Request(new URL(`/api/auth${path}`, base), {
      method: "POST",
      headers: forwarded,
      body: JSON.stringify(body),
    })
  )

  const setCookie = response.headers.get("set-cookie")
  if (setCookie) {
    const cookieStore = await cookies()
    parseSetCookieHeader(setCookie).forEach((cookie, name) => {
      cookieStore.set(name, cookie.value, toCookieOptions(cookie))
    })
  }

  if (response.ok) return null
  if (response.status >= 500) {
    throw new Error(`Auth endpoint ${path} failed with ${response.status}`)
  }
  const data: { code?: unknown } = await response.json().catch(() => ({}))
  return {
    status: response.status,
    code: typeof data.code === "string" ? data.code : undefined,
  }
}

const TOO_MANY = "Too many attempts. Wait a minute and try again."

// Only messages that reveal nothing about which emails are registered.
const SIGN_UP_ERRORS: Record<string, string> = {
  SIGN_UP_CLOSED: "Sign-up is closed.",
  INVALID_EMAIL: "Enter a valid email.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
  PASSWORD_TOO_LONG: "Password is too long.",
}

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  }
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData)
  if (!email || !password) {
    return { error: "Enter your email and password.", email }
  }

  const failure = await callAuthEndpoint("/sign-in/email", { email, password })
  if (failure) {
    const error =
      failure.status === 429 ? TOO_MANY : "Invalid email or password."
    return { error, email }
  }
  redirect("/")
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData)
  if (!email || !password) {
    return { error: "Enter your email and password.", email }
  }

  const failure = await callAuthEndpoint("/sign-up/email", {
    name: email,
    email,
    password,
  })
  if (failure) {
    const error =
      failure.status === 429
        ? TOO_MANY
        : ((failure.code && SIGN_UP_ERRORS[failure.code]) ??
          "Couldn't create the account.")
    return { error, email }
  }
  redirect("/")
}
