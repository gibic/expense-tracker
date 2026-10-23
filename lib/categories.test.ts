import { describe, expect, it } from "vitest"

import { DEFAULT_CATEGORIES, OTHER_CATEGORY } from "@/lib/categories"

describe("DEFAULT_CATEGORIES", () => {
  it("includes the fallback category", () => {
    expect(DEFAULT_CATEGORIES).toContain(OTHER_CATEGORY)
  })

  it("has no duplicates", () => {
    expect(new Set(DEFAULT_CATEGORIES).size).toBe(DEFAULT_CATEGORIES.length)
  })

  it("has no blank names", () => {
    for (const name of DEFAULT_CATEGORIES) {
      expect(name.trim()).toBe(name)
      expect(name.length).toBeGreaterThan(0)
    }
  })
})
