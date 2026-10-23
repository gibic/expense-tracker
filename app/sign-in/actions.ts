"use server"

import { APIError } from "better-auth/api"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

export type AuthFormState = { error: string | null }

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
  if (!email || !password) return { error: "Enter your email and password." }

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })
  } catch (error) {
    if (error instanceof APIError) return { error: error.message }
    throw error
  }
  redirect("/")
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData)
  if (!email || !password) return { error: "Enter your email and password." }

  try {
    await auth.api.signUpEmail({
      body: { name: email, email, password },
      headers: await headers(),
    })
  } catch (error) {
    if (error instanceof APIError) return { error: error.message }
    throw error
  }
  redirect("/")
}
