import { z } from "zod"

import { parseRupiah } from "@/lib/money"

export type ExpenseValues = {
  amount: string
  date: string
  categoryId: string
  note: string
}

export type ExpenseErrors = Partial<Record<keyof ExpenseValues, string>>

export type ExpenseValue = {
  amount: number
  date: string
  categoryId: string
  note: string | null
}

export type ExpenseValidation =
  { ok: true; value: ExpenseValue } | { ok: false; errors: ExpenseErrors }

const amountSchema = z
  .string()
  .trim()
  .min(1, { error: "Enter an amount.", abort: true })
  .transform((raw, ctx) => {
    const amount = parseRupiah(raw)
    if (amount === null) {
      ctx.issues.push({
        code: "custom",
        message: "Enter whole rupiah, digits only.",
        input: raw,
      })
      return z.NEVER
    }
    return amount
  })
  .pipe(z.number().int().positive("Amount must be more than 0."))

// z.iso.date() checks real calendar dates, leap years included.
const dateSchema = z.iso.date("Pick a valid date.")

// Category ids are Postgres uuids. z.guid() accepts any 8-4-4-4-12 hex, like
// Postgres and isUuid(); z.uuid() would also demand RFC version bits.
// Ownership is checked in the data layer.
const categoryIdSchema = z
  .string()
  .trim()
  .min(1, { error: "Pick a category.", abort: true })
  .pipe(z.guid("Pick one of your categories."))

const noteSchema = z
  .string()
  .trim()
  .transform((note) => (note === "" ? null : note))

export const expenseSchema = z.object({
  amount: amountSchema,
  date: dateSchema,
  categoryId: categoryIdSchema,
  note: noteSchema,
})

/** Read raw form fields as trimmed strings (also used to echo values back). */
export function readExpenseValues(formData: FormData): ExpenseValues {
  const get = (key: string) => String(formData.get(key) ?? "").trim()
  return {
    amount: get("amount"),
    date: get("date"),
    categoryId: get("categoryId"),
    note: get("note"),
  }
}

export function validateExpense(values: ExpenseValues): ExpenseValidation {
  const result = expenseSchema.safeParse(values)
  if (result.success) return { ok: true, value: result.data }

  // Show the first message per field, like the form's inline errors expect.
  const errors: ExpenseErrors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ExpenseValues
    errors[field] ??= issue.message
  }
  return { ok: false, errors }
}
