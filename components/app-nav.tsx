"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { ADD_EXPENSE, isActive, NAV, type NavItem } from "@/lib/nav"
import { cn } from "@/lib/utils"

const focusRing = "outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

function useCurrent(href: string) {
  return isActive(usePathname(), href)
}

function SidebarLink({ item }: { item: NavItem }) {
  const current = useCurrent(item.href)
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-lg px-3",
        focusRing,
        current
          ? "bg-sidebar-accent font-bold text-sidebar-accent-foreground"
          : "font-medium text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
      )}
    >
      <Icon
        aria-hidden
        className="size-5"
        strokeWidth={current ? 2.25 : 1.75}
      />
      {item.label}
    </Link>
  )
}

/** Desktop: left sidebar, Add on top, Account pinned to the bottom. */
export function SidebarNav() {
  const addCurrent = useCurrent(ADD_EXPENSE.href)
  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col gap-2 overflow-y-auto border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground md:flex"
    >
      <Logo className="px-3 pt-1 pb-4" />
      <Link
        href={ADD_EXPENSE.href}
        aria-current={addCurrent ? "page" : undefined}
        className={cn(
          "mb-2 flex h-12 items-center justify-center gap-2 rounded-lg bg-primary font-bold text-primary-foreground hover:bg-primary/85",
          focusRing,
          addCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-sidebar"
        )}
      >
        <ADD_EXPENSE.icon aria-hidden className="size-5" strokeWidth={2.5} />
        {ADD_EXPENSE.label}
      </Link>
      <SidebarLink item={NAV.dashboard} />
      <SidebarLink item={NAV.expenses} />
      <SidebarLink item={NAV.categories} />
      <div className="mt-auto flex flex-col gap-2">
        <ThemeToggle className="rounded-lg px-3 font-medium text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground" />
        <SidebarLink item={NAV.account} />
      </div>
    </nav>
  )
}

function Tab({ item }: { item: NavItem }) {
  const current = useCurrent(item.href)
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex min-h-11 flex-col items-center justify-center gap-1 border-t-[3px] text-xs focus-visible:ring-inset",
        focusRing,
        current
          ? "border-foreground font-bold text-foreground"
          : "border-transparent font-medium text-muted-foreground"
      )}
    >
      <Icon aria-hidden className="size-6" strokeWidth={current ? 2.5 : 1.75} />
      {item.label}
    </Link>
  )
}

/** Mobile: fixed 5-tab bar, raised round Add button in the middle. */
export function BottomNav() {
  const addCurrent = useCurrent(ADD_EXPENSE.href)
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-input bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <Tab item={NAV.dashboard} />
      <Tab item={NAV.expenses} />
      <Link
        href={ADD_EXPENSE.href}
        aria-current={addCurrent ? "page" : undefined}
        className={cn(
          "flex h-20 flex-col items-center justify-center gap-1 text-xs font-bold focus-visible:ring-inset",
          focusRing
        )}
      >
        <span
          className={cn(
            "grid size-12 place-items-center rounded-full bg-primary text-primary-foreground",
            addCurrent &&
              "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
        >
          <ADD_EXPENSE.icon aria-hidden className="size-6" strokeWidth={2.5} />
        </span>
        Add
      </Link>
      <Tab item={NAV.categories} />
      <Tab item={NAV.account} />
    </nav>
  )
}
