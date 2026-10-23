// Safe to import from client components: no server dependencies.

/** Fallback category every user gets. */
export const OTHER_CATEGORY = "Other"

export const DEFAULT_CATEGORIES = [
  "Food & drinks",
  "Transport",
  "Bills & utilities",
  "Shopping",
  "Health",
  "Entertainment",
  OTHER_CATEGORY,
] as const
