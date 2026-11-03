import { LogOut, User } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { getSession } from "@/lib/session"

import { signOut } from "./actions"

export default async function AccountPage() {
  const session = await getSession()
  const user = session?.user

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 md:mx-0 md:flex-none">
      <h1 className="text-xl font-bold">Account</h1>
      <section
        aria-label="Signed-in user"
        className="flex items-center gap-4 rounded-lg border p-4"
      >
        <span
          aria-hidden
          className="grid size-14 shrink-0 place-items-center rounded-full bg-muted"
        >
          <User className="size-7" strokeWidth={1.75} />
        </span>
        <span className="flex min-w-0 flex-col">
          {user?.name && user.name !== user.email ? (
            <span className="truncate font-bold">{user.name}</span>
          ) : null}
          <span className="truncate text-sm text-muted-foreground">
            {user?.email}
          </span>
        </span>
      </section>
      {/* Desktop has the toggle in the sidebar. */}
      <ThemeToggle className="justify-center rounded-lg border px-4 font-semibold hover:bg-muted md:hidden" />
      <form action={signOut} className="mt-auto md:mt-4">
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-foreground font-bold outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <LogOut aria-hidden className="size-5" />
          Sign out
        </button>
      </form>
    </div>
  )
}
