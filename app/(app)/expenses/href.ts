/** Expense list URL for a month, optionally filtered to one category. */
export function expensesHref(month: string, categoryId?: string) {
  const params = new URLSearchParams({ month })
  if (categoryId) params.set("category", categoryId)
  return `/expenses?${params}`
}
