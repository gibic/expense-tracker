import {
  LayoutDashboard,
  List,
  Plus,
  Tag,
  User,
  type LucideIcon,
} from "lucide-react"

export type NavItem = { href: string; label: string; icon: LucideIcon }

export const ADD_EXPENSE: NavItem = {
  href: "/expenses/new",
  label: "Add expense",
  icon: Plus,
}

export const NAV = {
  dashboard: { href: "/", label: "Dashboard", icon: LayoutDashboard },
  expenses: { href: "/expenses", label: "Expenses", icon: List },
  categories: { href: "/categories", label: "Categories", icon: Tag },
  account: { href: "/profile", label: "Account", icon: User },
} satisfies Record<string, NavItem>

/**
 * Whether a nav item is the current section. Children count (an expense's
 * edit page sits under Expenses), except the add form, which has its own tab.
 */
export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  if (pathname === href) return true
  return pathname.startsWith(`${href}/`) && pathname !== ADD_EXPENSE.href
}
