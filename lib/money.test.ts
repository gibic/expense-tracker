import { describe, expect, it } from "vitest"

import { formatRupiah, groupRupiah, parseRupiah } from "./money"

describe("formatRupiah", () => {
  it.each([
    [0, "Rp 0"],
    [999, "Rp 999"],
    [1000, "Rp 1.000"],
    [2557000, "Rp 2.557.000"],
  ])("formats %i", (amount, expected) => {
    expect(formatRupiah(amount)).toBe(expected)
  })
})

describe("groupRupiah", () => {
  it.each([
    [0, "0"],
    [999, "999"],
    [2557000, "2.557.000"],
  ])("groups %i and parses back", (amount, expected) => {
    expect(groupRupiah(amount)).toBe(expected)
    expect(parseRupiah(groupRupiah(amount))).toBe(amount)
  })
})

describe("parseRupiah", () => {
  it.each([
    ["25000", 25000],
    ["2.557.000", 2557000],
    ["Rp 25.000", 25000],
    [" 100 ", 100],
    ["rp25.000", 25000],
    ["999", 999],
  ])("parses %j", (input, expected) => {
    expect(parseRupiah(input)).toBe(expected)
  })

  it.each([
    [""],
    ["abc"],
    ["-5"],
    ["12,5"],
    ["1e3"],
    ["99999999999999999999"],
    ["25.00"],
    ["1.5"],
    ["2.55.7000"],
    ["1000.000"],
    [".500"],
    ["500."],
    ["2 557 000"],
  ])("rejects %j", (input) => {
    expect(parseRupiah(input)).toBeNull()
  })
})
