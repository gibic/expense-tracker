import { describe, expect, it } from "vitest"

import { readExpenseValues, validateExpense } from "./expense-input"

const valid = {
  amount: "25.000",
  date: "2026-11-03",
  categoryId: "cat-1",
  note: "lunch",
}

describe("validateExpense", () => {
  it("accepts valid input", () => {
    expect(validateExpense(valid)).toEqual({
      ok: true,
      value: {
        amount: 25000,
        date: "2026-11-03",
        categoryId: "cat-1",
        note: "lunch",
      },
    })
  })

  it("turns blank note into null", () => {
    const result = validateExpense({ ...valid, note: "" })
    expect(result.ok && result.value.note).toBeNull()
  })

  it("rejects missing amount", () => {
    expect(validateExpense({ ...valid, amount: "" })).toEqual({
      ok: false,
      errors: { amount: "Enter an amount." },
    })
  })

  it("rejects zero amount", () => {
    const result = validateExpense({ ...valid, amount: "0" })
    expect(!result.ok && result.errors.amount).toBe(
      "Amount must be more than 0."
    )
  })

  it("rejects non-digit amount", () => {
    const result = validateExpense({ ...valid, amount: "12,5" })
    expect(!result.ok && result.errors.amount).toBeDefined()
  })

  it("rejects missing category", () => {
    const result = validateExpense({ ...valid, categoryId: "" })
    expect(!result.ok && result.errors.categoryId).toBe("Pick a category.")
  })

  it.each([[""], ["2026-02-30"], ["03-11-2026"], ["2026-13-01"]])(
    "rejects date %j",
    (date) => {
      const result = validateExpense({ ...valid, date })
      expect(!result.ok && result.errors.date).toBe("Pick a valid date.")
    }
  )

  it("reports all errors at once", () => {
    const result = validateExpense({
      amount: "",
      date: "",
      categoryId: "",
      note: "",
    })
    expect(!result.ok && Object.keys(result.errors)).toHaveLength(3)
  })
})

describe("readExpenseValues", () => {
  it("trims and defaults missing fields", () => {
    const data = new FormData()
    data.set("amount", " 100 ")
    expect(readExpenseValues(data)).toEqual({
      amount: "100",
      date: "",
      categoryId: "",
      note: "",
    })
  })
})
