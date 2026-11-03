import { describe, expect, it } from "vitest"

import {
  CATEGORY_NAME_MAX,
  normalizeCategoryName,
  validateCategoryName,
} from "./category-input"

describe("normalizeCategoryName", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeCategoryName("  Food \t  court \n")).toBe("Food court")
  })
})

describe("validateCategoryName", () => {
  it("accepts a normal name and returns it normalized", () => {
    expect(validateCategoryName(" Education ")).toEqual({
      ok: true,
      name: "Education",
    })
  })

  it("rejects a blank name", () => {
    expect(validateCategoryName("   ")).toEqual({
      ok: false,
      error: "Enter a category name.",
    })
  })

  it("accepts the max length and rejects one more", () => {
    expect(validateCategoryName("a".repeat(CATEGORY_NAME_MAX)).ok).toBe(true)
    expect(validateCategoryName("a".repeat(CATEGORY_NAME_MAX + 1)).ok).toBe(
      false
    )
  })
})
