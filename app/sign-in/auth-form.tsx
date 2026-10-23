"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { signIn, signUp, type AuthFormState } from "./actions"

const initialState: AuthFormState = { error: null, email: "" }

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const [state, formAction, pending] = useActionState(
    mode === "sign-up" ? signUp : signIn,
    initialState
  )
  const label = mode === "sign-up" ? "Create account" : "Sign in"

  return (
    <form action={formAction} className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="email" className="font-semibold">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          // React resets the form after the action; keep the email on error.
          defaultValue={state.email}
          required
          className="h-12 px-3"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="password" className="font-semibold">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={
            mode === "sign-up" ? "new-password" : "current-password"
          }
          minLength={mode === "sign-up" ? 8 : undefined}
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "auth-error" : undefined}
          className="h-12 px-3"
        />
      </div>
      <p
        id="auth-error"
        aria-live="polite"
        className="text-sm text-destructive empty:hidden"
      >
        {state.error}
      </p>
      <Button
        type="submit"
        disabled={pending}
        className="mt-auto h-12 w-full text-base font-bold md:mt-2"
      >
        {label}
      </Button>
    </form>
  )
}
