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

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

function isRealDate(value: string) {
  const match = DATE_RE.exec(value)
  if (!match) return false
  const [y, m, d] = match.slice(1).map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  )
}

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
  const errors: ExpenseErrors = {}

  const amount = parseRupiah(values.amount)
  if (values.amount === "") errors.amount = "Enter an amount."
  else if (amount === null) errors.amount = "Enter whole rupiah, digits only."
  else if (amount <= 0) errors.amount = "Amount must be more than 0."

  if (!isRealDate(values.date)) errors.date = "Pick a valid date."
  if (!values.categoryId) errors.categoryId = "Pick a category."

  if (Object.keys(errors).length > 0 || amount === null) {
    return { ok: false, errors }
  }
  return {
    ok: true,
    value: {
      amount,
      date: values.date,
      categoryId: values.categoryId,
      note: values.note === "" ? null : values.note,
    },
  }
}
