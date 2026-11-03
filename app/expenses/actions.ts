"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  readExpenseValues,
  validateExpense,
  type ExpenseErrors,
  type ExpenseValues,
} from "@/lib/expense-input"
import { createExpense, deleteExpense, updateExpense } from "@/lib/expenses"

export type ExpenseFormState = {
  error: string | null
  errors: ExpenseErrors
  values: ExpenseValues
}

const CATEGORY_ERROR = "Pick one of your categories."

function fail(
  values: ExpenseValues,
  errors: ExpenseErrors,
  error: string | null = null
): ExpenseFormState {
  return { error, errors, values }
}

export async function createExpenseAction(
  _prev: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const values = readExpenseValues(formData)
  const result = validateExpense(values)
  if (!result.ok) return fail(values, result.errors)

  const created = await createExpense(result.value)
  if (!created) return fail(values, { categoryId: CATEGORY_ERROR })

  revalidatePath("/expenses")
  redirect(`/expenses?month=${result.value.date.slice(0, 7)}`)
}

export async function updateExpenseAction(
  _prev: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const id = String(formData.get("id") ?? "")
  const values = readExpenseValues(formData)
  const result = validateExpense(values)
  if (!result.ok) return fail(values, result.errors)

  const outcome = await updateExpense(id, result.value)
  if (outcome === "bad-category") {
    return fail(values, { categoryId: CATEGORY_ERROR })
  }
  if (outcome === "not-found") {
    return fail(values, {}, "Expense not found. It may have been deleted.")
  }

  revalidatePath("/expenses")
  redirect(`/expenses?month=${result.value.date.slice(0, 7)}`)
}

export async function deleteExpenseAction(formData: FormData) {
  const date = await deleteExpense(String(formData.get("id") ?? ""))
  revalidatePath("/expenses")
  // Back to the deleted expense's month so its updated totals show.
  redirect(date ? `/expenses?month=${date.slice(0, 7)}` : "/expenses")
}
