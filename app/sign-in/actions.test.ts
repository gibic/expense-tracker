import { beforeEach, describe, expect, it, vi } from "vitest"

const { handler, setCookie, redirect } = vi.hoisted(() => ({
  handler: vi.fn<(request: Request) => Promise<Response>>(),
  setCookie: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

vi.mock("@/lib/auth", () => ({ auth: { handler } }))
vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({
      origin: "https://expens.test",
      "x-forwarded-for": "203.0.113.7",
      "content-type": "multipart/form-data; boundary=x",
    }),
  cookies: async () => ({ set: setCookie }),
}))
vi.mock("next/navigation", () => ({ redirect }))

import { signIn, signUp } from "./actions"

function form(fields: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}

function respond(status: number, body: object = {}, init: HeadersInit = {}) {
  handler.mockResolvedValue(
    new Response(JSON.stringify(body), { status, headers: init })
  )
}

const empty = { error: null, email: "" }
const valid = { email: "a@b.co", password: "pw" }

beforeEach(() => {
  vi.clearAllMocks()
})

describe.each([
  ["signIn", signIn, "/api/auth/sign-in/email"],
  ["signUp", signUp, "/api/auth/sign-up/email"],
] as const)("%s", (_name, action, path) => {
  it("rejects missing email", async () => {
    const result = await action(empty, form({ password: "secret" }))
    expect(result.error).toBe("Enter your email and password.")
    expect(handler).not.toHaveBeenCalled()
  })

  it("rejects missing password and keeps the email", async () => {
    const result = await action(empty, form({ email: "a@b.co" }))
    expect(result).toEqual({
      error: "Enter your email and password.",
      email: "a@b.co",
    })
    expect(handler).not.toHaveBeenCalled()
  })

  it("rejects whitespace-only email", async () => {
    const result = await action(empty, form({ email: "   ", password: "x" }))
    expect(result.error).toBe("Enter your email and password.")
  })

  it("posts JSON to the Better Auth router with forwarded headers", async () => {
    respond(200)
    await expect(
      action(empty, form({ email: "  a@b.co ", password: " pw " }))
    ).rejects.toThrow("NEXT_REDIRECT:/")

    const request = handler.mock.calls[0][0]
    expect(request.method).toBe("POST")
    expect(request.url).toBe(`https://expens.test${path}`)
    expect(request.headers.get("content-type")).toBe("application/json")
    expect(request.headers.get("origin")).toBe("https://expens.test")
    expect(request.headers.get("x-forwarded-for")).toBe("203.0.113.7")
    const body = await request.json()
    expect(body.email).toBe("a@b.co")
    expect(body.password).toBe(" pw ")
  })

  it("copies response cookies and redirects to / on success", async () => {
    respond(
      200,
      {},
      { "set-cookie": "better-auth.session_token=abc; Path=/; HttpOnly" }
    )
    await expect(action(empty, form(valid))).rejects.toThrow("NEXT_REDIRECT:/")
    expect(setCookie).toHaveBeenCalledWith(
      "better-auth.session_token",
      "abc",
      expect.objectContaining({ path: "/", httpOnly: true })
    )
    expect(redirect).toHaveBeenCalledWith("/")
  })

  it("reports rate limiting", async () => {
    respond(429, { message: "Too many requests. Please try again later." })
    const result = await action(empty, form(valid))
    expect(result).toEqual({
      error: "Too many attempts. Wait a minute and try again.",
      email: "a@b.co",
    })
    expect(redirect).not.toHaveBeenCalled()
  })

  it("throws on server errors", async () => {
    respond(500)
    await expect(action(empty, form(valid))).rejects.toThrow("failed with 500")
  })
})

describe("signIn", () => {
  it("shows one message for every credential failure", async () => {
    respond(401, { code: "INVALID_EMAIL_OR_PASSWORD", message: "x" })
    const result = await signIn(empty, form(valid))
    expect(result.error).toBe("Invalid email or password.")
  })
})

describe("signUp", () => {
  it("uses email as name", async () => {
    respond(200)
    await expect(signUp(empty, form(valid))).rejects.toThrow("NEXT_REDIRECT")
    const body = await handler.mock.calls[0][0].json()
    expect(body.name).toBe("a@b.co")
  })

  it("hides whether the email is already registered", async () => {
    respond(422, {
      code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
      message: "User already exists. Use another email.",
    })
    const result = await signUp(empty, form(valid))
    expect(result.error).toBe("Couldn't create the account.")
  })

  it("says when sign-up is closed", async () => {
    respond(403, { code: "SIGN_UP_CLOSED", message: "Sign-up is closed." })
    const result = await signUp(empty, form(valid))
    expect(result.error).toBe("Sign-up is closed.")
  })

  it("explains a short password", async () => {
    respond(400, { code: "PASSWORD_TOO_SHORT", message: "Password too short" })
    const result = await signUp(empty, form(valid))
    expect(result.error).toBe("Password must be at least 8 characters.")
  })
})
