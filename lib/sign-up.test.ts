import { describe, expect, it } from "vitest"

import { canSignUp } from "./sign-up"

const closed = {
  allowSignUp: false,
  ownerEmail: "owner@example.com",
  accountExists: false,
}

describe("canSignUp", () => {
  it("lets the owner create the first account", () => {
    expect(canSignUp("owner@example.com", closed)).toBe(true)
  })

  it("matches the owner email ignoring case and spaces", () => {
    expect(canSignUp(" Owner@Example.com ", closed)).toBe(true)
  })

  it("rejects anyone else before the first account exists", () => {
    expect(canSignUp("stranger@example.com", closed)).toBe(false)
  })

  it("rejects everyone when OWNER_EMAIL is unset", () => {
    expect(
      canSignUp("owner@example.com", { ...closed, ownerEmail: undefined })
    ).toBe(false)
  })

  it("rejects the owner once an account exists", () => {
    expect(
      canSignUp("owner@example.com", { ...closed, accountExists: true })
    ).toBe(false)
  })

  it("lets anyone sign up when ALLOW_SIGN_UP is on", () => {
    const open = { ...closed, allowSignUp: true, accountExists: true }
    expect(canSignUp("stranger@example.com", open)).toBe(true)
  })
})
