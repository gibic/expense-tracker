import { redirect } from "next/navigation"

import { hasAccount } from "@/lib/auth"
import { getSession } from "@/lib/session"

import { AuthForm } from "./auth-form"

export default async function SignInPage() {
  if (await getSession()) redirect("/")

  // First visit: no account yet, so offer sign-up instead.
  const mode = (await hasAccount()) ? "sign-in" : "sign-up"

  return (
    <div className="flex min-h-svh md:items-center md:justify-center md:p-8">
      <main className="flex w-full flex-col gap-6 px-4 pt-16 pb-4 md:max-w-[400px] md:rounded-lg md:border md:p-8">
        <h1 className="text-xl font-bold">
          {mode === "sign-up" ? "Create account" : "Sign in"}
        </h1>
        <AuthForm mode={mode} />
      </main>
    </div>
  )
}
