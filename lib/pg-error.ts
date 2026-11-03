/** Postgres SQLSTATE codes the data layer handles. */
export const FOREIGN_KEY_VIOLATION = "23503"
export const UNIQUE_VIOLATION = "23505"

/**
 * True when `error`, or any error in its cause chain, carries the given
 * Postgres error code. Drizzle wraps driver errors in DrizzleQueryError, so
 * the code sits on a cause rather than on the thrown error.
 */
export function hasPgCode(error: unknown, code: string): boolean {
  for (let e = error; e instanceof Error; e = e.cause) {
    if ((e as { code?: unknown }).code === code) return true
  }
  return false
}
