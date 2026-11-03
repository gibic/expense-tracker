// Years 1000-9999 only: always 4 digits, so shiftMonth can step past either
// end and produce a string that isMonth rejects.
const MONTH_RE = /^([1-9]\d{3})-(0[1-9]|1[0-2])$/

/** True for a valid "YYYY-MM" with a year in 1000-9999. */
export function isMonth(value: string): boolean {
  return MONTH_RE.test(value)
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

// The user is in WIB (Asia/Jakarta, UTC+7, no DST). Servers run in UTC, so
// "today" must be computed in WIB, not from the server's local time.
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

function wib(now: Date): Date {
  return new Date(now.getTime() + WIB_OFFSET_MS)
}

/** Current month in WIB as "YYYY-MM". */
export function currentMonth(now = new Date()): string {
  const d = wib(now)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`
}

/** Today in WIB as "YYYY-MM-DD". */
export function today(now = new Date()): string {
  return `${currentMonth(now)}-${pad(wib(now).getUTCDate())}`
}

/** Valid "YYYY-MM" or the fallback (default: current month). */
export function parseMonth(
  value: string | undefined,
  fallback = currentMonth()
): string {
  return value && isMonth(value) ? value : fallback
}

/** Month `delta` months away. The result can be out of range: check isMonth. */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number)
  const index = y * 12 + (m - 1) + delta
  const year = String(Math.floor(index / 12)).padStart(4, "0")
  return `${year}-${pad((index % 12) + 1)}`
}

/** Half-open range [first of month, first of next month) as date strings. */
export function monthRange(month: string): { from: string; to: string } {
  return { from: `${month}-01`, to: `${shiftMonth(month, 1)}-01` }
}
