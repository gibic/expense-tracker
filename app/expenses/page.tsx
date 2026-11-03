import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"

import { isUuid, listExpenses, monthSummary } from "@/lib/expenses"
import { formatRupiah } from "@/lib/money"
import { isMonth, parseMonth, shiftMonth } from "@/lib/month"

const monthFormat = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

function href(month: string, categoryId?: string) {
  const params = new URLSearchParams({ month })
  if (categoryId) params.set("category", categoryId)
  return `/expenses?${params}`
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; category?: string }>
}) {
  const sp = await searchParams
  const month = parseMonth(sp.month)
  const categoryId =
    sp.category && isUuid(sp.category) ? sp.category : undefined

  const [rows, summary] = await Promise.all([
    listExpenses({ month, categoryId }),
    monthSummary(month),
  ])
  // The summary already carries category names; no extra query needed. A
  // category with no expenses this month has no name here, so the filter
  // line falls back to a generic label (it still needs a Clear link).
  const activeCategoryName = summary.byCategory.find(
    (c) => c.categoryId === categoryId
  )?.categoryName
  const label = monthFormat.format(new Date(`${month}-01T00:00:00Z`))
  const prevMonth = shiftMonth(month, -1)
  const nextMonth = shiftMonth(month, 1)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-6 p-4">
      <header className="flex items-center justify-between">
        {isMonth(prevMonth) ? (
          <Link href={href(prevMonth, categoryId)} aria-label="Previous month">
            <ChevronLeft />
          </Link>
        ) : (
          <span className="size-6" />
        )}
        <h1 className="text-xl font-bold">{label}</h1>
        {isMonth(nextMonth) ? (
          <Link href={href(nextMonth, categoryId)} aria-label="Next month">
            <ChevronRight />
          </Link>
        ) : (
          <span className="size-6" />
        )}
      </header>

      <section aria-label="Month summary" className="flex flex-col gap-2">
        <p className="text-3xl font-bold">{formatRupiah(summary.total)}</p>
        <ul className="flex flex-col gap-1 text-sm">
          {summary.byCategory.map((c) => (
            <li key={c.categoryId} className="flex justify-between">
              <Link href={href(month, c.categoryId)} className="underline">
                {c.categoryName}
              </Link>
              <span>{formatRupiah(c.total)}</span>
            </li>
          ))}
        </ul>
      </section>

      {categoryId ? (
        <p className="text-sm">
          {activeCategoryName ? (
            <>
              Category: <strong>{activeCategoryName}</strong>
            </>
          ) : (
            "Filtered by category"
          )}{" "}
          <Link href={href(month)} className="underline">
            Clear
          </Link>
        </p>
      ) : null}

      <section aria-label="Expenses" className="flex flex-col">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No expenses this month.
          </p>
        ) : (
          <ul className="divide-y">
            {rows.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/expenses/${e.id}`}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold">
                      {e.note || e.categoryName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {e.date} · {e.categoryName}
                    </span>
                  </span>
                  <span className="font-semibold">
                    {formatRupiah(e.amount)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/expenses/new"
        className="mt-auto flex h-12 items-center justify-center gap-2 rounded-lg bg-primary font-bold text-primary-foreground"
      >
        <Plus /> Add expense
      </Link>
    </main>
  )
}
