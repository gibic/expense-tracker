import { describe, expect, it } from "vitest"

import { formatShare, summarize } from "./summary"

describe("summarize", () => {
  it("parses string sums and counts, totals them and computes shares", () => {
    const result = summarize([
      { categoryId: "a", categoryName: "Bills", total: "750000", count: "3" },
      { categoryId: "b", categoryName: "Food", total: "250000", count: 5 },
    ])
    expect(result.total).toBe(1_000_000)
    expect(result.count).toBe(8)
    expect(result.byCategory).toEqual([
      {
        categoryId: "a",
        categoryName: "Bills",
        total: 750000,
        count: 3,
        share: 75,
      },
      {
        categoryId: "b",
        categoryName: "Food",
        total: 250000,
        count: 5,
        share: 25,
      },
    ])
  })

  it("returns zeros for an empty month", () => {
    expect(summarize([])).toEqual({ total: 0, count: 0, byCategory: [] })
  })

  it("keeps sums above 2^31 exact", () => {
    const { total } = summarize([
      { categoryId: "a", categoryName: "A", total: "3000000000", count: "1" },
      { categoryId: "b", categoryName: "B", total: "1", count: "1" },
    ])
    expect(total).toBe(3_000_000_001)
  })
})

describe("formatShare", () => {
  it("rounds to a whole percent", () => {
    expect(formatShare(37.15)).toBe("37%")
    expect(formatShare(12.5)).toBe("13%")
    expect(formatShare(100)).toBe("100%")
  })

  it("does not round a non-zero share to 0% or a partial share to 100%", () => {
    expect(formatShare(0.2)).toBe("<1%")
    expect(formatShare(99.6)).toBe(">99%")
  })
})
