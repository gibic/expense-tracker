import { describe, expect, it } from "vitest"

import { ADD_EXPENSE, isActive, NAV } from "./nav"

describe("isActive", () => {
  it("matches the dashboard only at the root", () => {
    expect(isActive("/", NAV.dashboard.href)).toBe(true)
    expect(isActive("/expenses", NAV.dashboard.href)).toBe(false)
  })

  it("keeps Expenses active on the list and on an expense's edit page", () => {
    expect(isActive("/expenses", NAV.expenses.href)).toBe(true)
    expect(isActive("/expenses/3f0c", NAV.expenses.href)).toBe(true)
  })

  it("gives the add form to the Add tab, not Expenses", () => {
    expect(isActive("/expenses/new", NAV.expenses.href)).toBe(false)
    expect(isActive("/expenses/new", ADD_EXPENSE.href)).toBe(true)
  })

  it("does not match a sibling route that shares a prefix", () => {
    expect(isActive("/expenses-archive", NAV.expenses.href)).toBe(false)
    expect(isActive("/categories", NAV.categories.href)).toBe(true)
  })
})
