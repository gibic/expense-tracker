/** Whole non-negative rupiah -> "2.557.000" (no "Rp"), e.g. for input values. */
export function groupRupiah(amount: number): string {
  const digits = String(Math.abs(Math.trunc(amount)))
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

/** Whole rupiah -> "Rp 2.557.000". */
export function formatRupiah(amount: number): string {
  const sign = amount < 0 ? "-" : ""
  return `${sign}Rp ${groupRupiah(amount)}`
}

/**
 * Parse user input like "2.557.000", "Rp 25000" or "25000" into whole rupiah.
 * Dots are accepted only as thousands separators in groups of 3, so "25.00"
 * or "1.5" (decimal-style) are rejected rather than silently scaled up.
 * Returns null for empty, non-digit, badly grouped or unsafe-integer input.
 */
export function parseRupiah(input: string): number | null {
  const cleaned = input.trim().replace(/^rp\s*/i, "")
  if (!/^(\d+|\d{1,3}(\.\d{3})+)$/.test(cleaned)) return null
  const value = Number(cleaned.replaceAll(".", ""))
  return Number.isSafeInteger(value) ? value : null
}
