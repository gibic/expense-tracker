"use server"

import { revalidatePath } from "next/cache"

import {
  createCategory,
  deleteCategory,
  renameCategory,
} from "@/lib/category-data"
import { validateCategoryName } from "@/lib/category-input"

export type CategoryFormState = {
  ok: boolean
  error: string | null
  /** Submitted name, echoed back so a failed form keeps what was typed. */
  name: string
}

export type DeleteCategoryState = {
  /** Set when expenses still use the category. */
  blocked: { id: string; expenseCount: number } | null
  error: string | null
}

const NOT_FOUND = "Category not found. It may have been deleted."

function duplicate(name: string) {
  return `You already have a category called "${name}".`
}

function readName(formData: FormData) {
  return String(formData.get("name") ?? "")
}

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const raw = readName(formData)
  const result = validateCategoryName(raw)
  if (!result.ok) return { ok: false, error: result.error, name: raw }

  const outcome = await createCategory(result.name)
  if (outcome === "duplicate") {
    return { ok: false, error: duplicate(result.name), name: raw }
  }

  revalidatePath("/categories")
  return { ok: true, error: null, name: "" }
}

export async function renameCategoryAction(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const id = String(formData.get("id") ?? "")
  const raw = readName(formData)
  const result = validateCategoryName(raw)
  if (!result.ok) return { ok: false, error: result.error, name: raw }

  const outcome = await renameCategory(id, result.name)
  if (outcome === "duplicate") {
    return { ok: false, error: duplicate(result.name), name: raw }
  }
  if (outcome === "not-found") return { ok: false, error: NOT_FOUND, name: raw }

  revalidatePath("/categories")
  return { ok: true, error: null, name: result.name }
}

export async function deleteCategoryAction(
  _prev: DeleteCategoryState,
  formData: FormData
): Promise<DeleteCategoryState> {
  const id = String(formData.get("id") ?? "")
  const result = await deleteCategory(id)

  if (result.status === "in-use") {
    return { blocked: { id, expenseCount: result.expenseCount }, error: null }
  }
  if (result.status === "not-found") {
    revalidatePath("/categories")
    return { blocked: null, error: NOT_FOUND }
  }

  revalidatePath("/categories")
  return { blocked: null, error: null }
}
