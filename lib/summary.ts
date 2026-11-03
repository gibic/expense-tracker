export type CategoryTotal = {
  categoryId: string
  categoryName: string
  total: number
  count: number
  /** Share of the month total, 0-100, unrounded. */
  share: number
}

export type MonthSummary = {
  total: number
  count: number
  byCategory: CategoryTotal[]
}

/**
 * Turns the grouped month query into totals and per-category shares. Postgres
 * returns sum(bigint) and count(*) as strings; whole rupiah stays within the
 * safe integer range, so Number() is exact. Row order is kept.
 */
export function summarize(
  rows: {
    categoryId: string
    categoryName: string
    total: number | string
    count: number | string
  }[]
): MonthSummary {
  const parsed = rows.map((r) => ({
    categoryId: r.categoryId,
    categoryName: r.categoryName,
    total: Number(r.total),
    count: Number(r.count),
  }))
  const total = parsed.reduce((acc, r) => acc + r.total, 0)
  const count = parsed.reduce((acc, r) => acc + r.count, 0)
  const byCategory = parsed.map((r) => ({
    ...r,
    share: total > 0 ? (r.total / total) * 100 : 0,
  }))
  return { total, count, byCategory }
}

/**
 * Share as a whole percent for display. Never shows "0%" for a category that
 * has spending, or "100%" when other categories also have spending.
 */
export function formatShare(share: number): string {
  if (share > 0 && share < 1) return "<1%"
  if (share > 99 && share < 100) return ">99%"
  return `${Math.round(share)}%`
}
