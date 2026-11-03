import { describe, expect, it } from "vitest"

import {
  currentMonth,
  isMonth,
  monthRange,
  parseMonth,
  shiftMonth,
  today,
} from "./month"

describe("month helpers", () => {
  it("formats current month and today in WIB", () => {
    const d = new Date("2026-11-03T05:00:00Z")
    expect(currentMonth(d)).toBe("2026-11")
    expect(today(d)).toBe("2026-11-03")
  })

  it("uses WIB, not UTC, near midnight", () => {
    // 2026-11-30 23:30 UTC is 2026-12-01 06:30 WIB.
    const d = new Date("2026-11-30T23:30:00Z")
    expect(currentMonth(d)).toBe("2026-12")
    expect(today(d)).toBe("2026-12-01")
    // 2026-12-01 16:59 UTC is still 2026-12-01 23:59 WIB.
    expect(today(new Date("2026-12-01T16:59:00Z"))).toBe("2026-12-01")
    expect(today(new Date("2026-12-01T17:00:00Z"))).toBe("2026-12-02")
  })

  it("parseMonth accepts valid, falls back otherwise", () => {
    expect(parseMonth("2026-02", "x")).toBe("2026-02")
    expect(parseMonth("2026-13", "x")).toBe("x")
    expect(parseMonth("abc", "x")).toBe("x")
    expect(parseMonth(undefined, "x")).toBe("x")
    expect(parseMonth("0000-01", "x")).toBe("x")
    expect(parseMonth("0999-12", "x")).toBe("x")
    expect(parseMonth("10000-01", "x")).toBe("x")
  })

  it("shiftMonth past the supported range gives a non-month", () => {
    expect(shiftMonth("1000-01", -1)).toBe("0999-12")
    expect(isMonth(shiftMonth("1000-01", -1))).toBe(false)
    expect(isMonth(shiftMonth("9999-12", 1))).toBe(false)
    expect(isMonth(shiftMonth("1000-01", 1))).toBe(true)
  })

  it("shiftMonth crosses year boundaries", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01")
    expect(shiftMonth("2026-01", -1)).toBe("2025-12")
    expect(shiftMonth("2026-05", 0)).toBe("2026-05")
  })

  it("monthRange is half-open", () => {
    expect(monthRange("2026-12")).toEqual({
      from: "2026-12-01",
      to: "2027-01-01",
    })
  })
})
