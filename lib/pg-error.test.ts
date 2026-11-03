import { describe, expect, it } from "vitest"

import { FOREIGN_KEY_VIOLATION, hasPgCode, UNIQUE_VIOLATION } from "./pg-error"

function pgError(code: string) {
  return Object.assign(new Error("db"), { code })
}

describe("hasPgCode", () => {
  it("matches a code on the error itself", () => {
    expect(hasPgCode(pgError(UNIQUE_VIOLATION), UNIQUE_VIOLATION)).toBe(true)
  })

  it("matches a code on a wrapped cause", () => {
    const wrapped = new Error("query failed", {
      cause: pgError(FOREIGN_KEY_VIOLATION),
    })
    expect(hasPgCode(wrapped, FOREIGN_KEY_VIOLATION)).toBe(true)
  })

  it("does not match another code or a non-error", () => {
    expect(hasPgCode(pgError(UNIQUE_VIOLATION), FOREIGN_KEY_VIOLATION)).toBe(
      false
    )
    expect(hasPgCode("23505", UNIQUE_VIOLATION)).toBe(false)
    expect(hasPgCode(undefined, UNIQUE_VIOLATION)).toBe(false)
  })
})
