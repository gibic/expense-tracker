import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  createExpense,
  updateExpense,
  deleteExpense,
  revalidatePath,
  redirect,
} = vi.hoisted(() => ({
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

vi.mock("@/lib/expenses", () => ({
  createExpense,
  updateExpense,
  deleteExpense,
}))
vi.mock("next/cache", () => ({ revalidatePath }))
vi.mock("next/navigation", () => ({ redirect }))

import {
  createExpenseAction,
  deleteExpenseAction,
  updateExpenseAction,
  type ExpenseFormState,
} from "./actions"

function form(fields: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}

const empty: ExpenseFormState = {
  error: null,
  errors: {},
  values: { amount: "", date: "", categoryId: "", note: "" },
}
const valid = {
  amount: "25.000",
  date: "2026-11-03",
  categoryId: "11111111-1111-1111-1111-111111111111",
  note: "lunch",
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("createExpenseAction", () => {
  it("returns field errors and skips the DB on invalid input", async () => {
    const result = await createExpenseAction(
      empty,
      form({ ...valid, amount: "0" })
    )
    expect(result.errors.amount).toBe("Amount must be more than 0.")
    expect(result.values.amount).toBe("0")
    expect(createExpense).not.toHaveBeenCalled()
  })

  it("rejects a category that is not the user's", async () => {
    createExpense.mockResolvedValue(false)
    const result = await createExpenseAction(empty, form(valid))
    expect(result.errors.categoryId).toBeDefined()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it("saves, revalidates, then redirects to the expense month", async () => {
    createExpense.mockResolvedValue(true)
    await expect(createExpenseAction(empty, form(valid))).rejects.toThrow(
      "NEXT_REDIRECT:/expenses?month=2026-11"
    )
    expect(createExpense).toHaveBeenCalledWith({
      amount: 25000,
      date: "2026-11-03",
      categoryId: valid.categoryId,
      note: "lunch",
    })
    expect(revalidatePath).toHaveBeenCalledWith("/expenses")
  })
})

describe("updateExpenseAction", () => {
  const id = "22222222-2222-2222-2222-222222222222"

  it("reports not-found", async () => {
    updateExpense.mockResolvedValue("not-found")
    const result = await updateExpenseAction(empty, form({ ...valid, id }))
    expect(result.error).toMatch(/not found/i)
  })

  it("reports bad category", async () => {
    updateExpense.mockResolvedValue("bad-category")
    const result = await updateExpenseAction(empty, form({ ...valid, id }))
    expect(result.errors.categoryId).toBeDefined()
  })

  it("updates and redirects", async () => {
    updateExpense.mockResolvedValue("ok")
    await expect(
      updateExpenseAction(empty, form({ ...valid, id }))
    ).rejects.toThrow("NEXT_REDIRECT:/expenses?month=2026-11")
    expect(updateExpense).toHaveBeenCalledWith(
      id,
      expect.objectContaining({ amount: 25000 })
    )
  })
})

describe("deleteExpenseAction", () => {
  it("deletes, revalidates, redirects to the deleted expense's month", async () => {
    deleteExpense.mockResolvedValueOnce("2026-03-15")
    await expect(deleteExpenseAction(form({ id: "abc" }))).rejects.toThrow(
      "NEXT_REDIRECT:/expenses?month=2026-03"
    )
    expect(deleteExpense).toHaveBeenCalledWith("abc")
    expect(revalidatePath).toHaveBeenCalledWith("/expenses")
  })

  it("redirects to the current month when nothing was deleted", async () => {
    deleteExpense.mockResolvedValueOnce(null)
    await expect(deleteExpenseAction(form({ id: "abc" }))).rejects.toThrow(
      /^NEXT_REDIRECT:\/expenses$/
    )
  })
})
