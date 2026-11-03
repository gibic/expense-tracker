import Link from "next/link"
import { redirect } from "next/navigation"

import { Logo } from "@/components/logo"
import { hasAccount, isSignUpAllowed } from "@/lib/auth"
import { getSession } from "@/lib/session"

import { AuthForm } from "./auth-form"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[] }>
}) {
  const [session, accountExists] = await Promise.all([
    getSession(),
    hasAccount(),
  ])
  if (session) redirect("/")

  // First visit: no account yet, so offer sign-up instead. After that, sign-up
  // is offered only when ALLOW_SIGN_UP=true.
  const canSwitch = accountExists && isSignUpAllowed()
  const { mode: requested } = await searchParams
  const mode =
    !accountExists || (canSwitch && requested === "sign-up")
      ? "sign-up"
      : "sign-in"

  return (
    <div className="flex min-h-svh md:items-center md:justify-center md:p-8">
      <main className="flex w-full flex-col gap-6 px-4 pt-16 pb-4 md:max-w-[400px] md:rounded-lg md:border md:p-8">
        <Logo />
        <h1 className="text-xl font-bold">
          {mode === "sign-up" ? "Create account" : "Sign in"}
        </h1>
        <AuthForm key={mode} mode={mode} />
        {canSwitch && (
          <p className="text-center text-sm text-muted-foreground">
            {mode === "sign-up" ? "Have an account? " : "No account? "}
            <Link
              href={mode === "sign-up" ? "/sign-in" : "/sign-in?mode=sign-up"}
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              {mode === "sign-up" ? "Sign in" : "Create one"}
            </Link>
          </p>
        )}
      </main>
    </div>
  )
}
