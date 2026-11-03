import { beforeEach, describe, expect, it, vi } from "vitest"

const { createCategory, renameCategory, deleteCategory, revalidatePath } =
  vi.hoisted(() => ({
    createCategory: vi.fn(),
    renameCategory: vi.fn(),
    deleteCategory: vi.fn(),
    revalidatePath: vi.fn(),
  }))

vi.mock("@/lib/category-data", () => ({
  createCategory,
  renameCategory,
  deleteCategory,
}))
vi.mock("next/cache", () => ({ revalidatePath }))

import {
  createCategoryAction,
  deleteCategoryAction,
  renameCategoryAction,
  type CategoryFormState,
  type DeleteCategoryState,
} from "./actions"

function form(fields: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}

const empty: CategoryFormState = { ok: false, error: null, name: "" }
const noDelete: DeleteCategoryState = { blocked: null, error: null }
const id = "11111111-1111-1111-1111-111111111111"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("createCategoryAction", () => {
  it("rejects a blank name without touching the DB", async () => {
    const result = await createCategoryAction(empty, form({ name: "   " }))
    expect(result).toEqual({
      ok: false,
      error: "Enter a category name.",
      name: "   ",
    })
    expect(createCategory).not.toHaveBeenCalled()
  })

  it("saves the normalized name and clears the field", async () => {
    createCategory.mockResolvedValue("ok")
    const result = await createCategoryAction(
      empty,
      form({ name: "  Pet   care " })
    )
    expect(createCategory).toHaveBeenCalledWith("Pet care")
    expect(result).toEqual({ ok: true, error: null, name: "" })
    expect(revalidatePath).toHaveBeenCalledWith("/categories")
  })

  it("reports a duplicate and keeps the typed name", async () => {
    createCategory.mockResolvedValue("duplicate")
    const result = await createCategoryAction(
      empty,
      form({ name: "transport" })
    )
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/already have/)
    expect(result.name).toBe("transport")
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe("renameCategoryAction", () => {
  it("renames and revalidates", async () => {
    renameCategory.mockResolvedValue("ok")
    const result = await renameCategoryAction(
      empty,
      form({ id, name: "Commute" })
    )
    expect(renameCategory).toHaveBeenCalledWith(id, "Commute")
    expect(result.ok).toBe(true)
    expect(revalidatePath).toHaveBeenCalledWith("/categories")
  })

  it("reports duplicate and not-found", async () => {
    renameCategory.mockResolvedValueOnce("duplicate")
    const dup = await renameCategoryAction(empty, form({ id, name: "Health" }))
    expect(dup.error).toMatch(/already have/)

    renameCategory.mockResolvedValueOnce("not-found")
    const gone = await renameCategoryAction(empty, form({ id, name: "Health" }))
    expect(gone.error).toMatch(/not found/i)
  })

  it("rejects an invalid name without touching the DB", async () => {
    const result = await renameCategoryAction(empty, form({ id, name: "" }))
    expect(result.ok).toBe(false)
    expect(renameCategory).not.toHaveBeenCalled()
  })
})

describe("deleteCategoryAction", () => {
  it("deletes an unused category", async () => {
    deleteCategory.mockResolvedValue({ status: "ok" })
    const result = await deleteCategoryAction(noDelete, form({ id }))
    expect(deleteCategory).toHaveBeenCalledWith(id)
    expect(result).toEqual({ blocked: null, error: null })
    expect(revalidatePath).toHaveBeenCalledWith("/categories")
  })

  it("blocks a category that expenses still use", async () => {
    deleteCategory.mockResolvedValue({ status: "in-use", expenseCount: 2 })
    const result = await deleteCategoryAction(noDelete, form({ id }))
    expect(result).toEqual({ blocked: { id, expenseCount: 2 }, error: null })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it("reports a category that is already gone", async () => {
    deleteCategory.mockResolvedValue({ status: "not-found" })
    const result = await deleteCategoryAction(noDelete, form({ id }))
    expect(result.error).toMatch(/not found/i)
  })
})
