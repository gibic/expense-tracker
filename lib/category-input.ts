// Safe to import from client components: no server dependencies.

export const CATEGORY_NAME_MAX = 40

export type CategoryNameValidation =
  { ok: true; name: string } | { ok: false; error: string }

/** Trim and collapse runs of whitespace, so "  Food   court " is "Food court". */
export function normalizeCategoryName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ")
}

export function validateCategoryName(raw: string): CategoryNameValidation {
  const name = normalizeCategoryName(raw)
  if (name === "") return { ok: false, error: "Enter a category name." }
  if (name.length > CATEGORY_NAME_MAX) {
    return {
      ok: false,
      error: `Use ${CATEGORY_NAME_MAX} characters or fewer.`,
    }
  }
  return { ok: true, name }
}
