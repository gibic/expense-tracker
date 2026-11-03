import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

import { isUuid, listCategories, listExpenses } from "@/lib/expenses"
import { formatRupiah } from "@/lib/money"
import { isMonth, parseMonth, shiftMonth } from "@/lib/month"
import { cn } from "@/lib/utils"

import { CategoryFilter } from "./category-filter"
import { expensesHref } from "./href"

const monthFormat = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

/** "2026-10-23" -> "23 Oct". The month is already on screen. */
function shortDate(date: string) {
  return dayFormat.format(new Date(`${date}T00:00:00Z`))
}

const monthButton =
  "grid size-11 place-items-center rounded-lg border border-input outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

function MonthLink({
  month,
  categoryId,
  label,
  children,
}: {
  month: string
  categoryId: string | undefined
  label: string
  children: React.ReactNode
}) {
  if (!isMonth(month)) {
    return (
      <span aria-hidden className={cn(monthButton, "opacity-40")}>
        {children}
      </span>
    )
  }
  return (
    <Link
      href={expensesHref(month, categoryId)}
      aria-label={label}
      className={cn(monthButton, "hover:bg-muted")}
    >
      {children}
    </Link>
  )
}

function CategoryChip({ name }: { name: string }) {
  return (
    <span className="inline-block shrink-0 rounded-md border border-input bg-muted px-2 py-0.5 text-xs font-semibold">
      {name}
    </span>
  )
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

  const [rows, categories] = await Promise.all([
    listExpenses({ month, categoryId }),
    listCategories(),
  ])
  const total = rows.reduce((sum, e) => sum + e.amount, 0)
  const label = monthFormat.format(new Date(`${month}-01T00:00:00Z`))

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 md:mx-0 md:max-w-[1100px] md:gap-6">
      <h1 className="text-xl font-bold">Expenses</h1>

      <div className="flex flex-wrap items-end gap-2 md:gap-4">
        <div
          role="group"
          aria-labelledby="month-label"
          className="flex flex-col gap-1"
        >
          <span id="month-label" className="text-sm font-semibold">
            Month
          </span>
          <div className="flex items-center gap-1 md:gap-2">
            <MonthLink
              month={shiftMonth(month, -1)}
              categoryId={categoryId}
              label="Previous month"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </MonthLink>
            <span
              aria-live="polite"
              className="min-w-18 text-center font-semibold md:min-w-30"
            >
              {label}
            </span>
            <MonthLink
              month={shiftMonth(month, 1)}
              categoryId={categoryId}
              label="Next month"
            >
              <ChevronRight aria-hidden className="size-5" />
            </MonthLink>
          </div>
        </div>

        <CategoryFilter
          month={month}
          categoryId={categoryId}
          categories={categories}
        />

        <p className="w-full text-sm font-semibold md:ml-auto md:w-auto md:self-center">
          {rows.length} {rows.length === 1 ? "expense" : "expenses"} ·{" "}
          {formatRupiah(total)}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {categoryId
            ? "No expenses in this category this month."
            : "No expenses this month."}
        </p>
      ) : (
        <>
          {/* Mobile: two-line rows. */}
          <ul className="border-t md:hidden">
            {rows.map((e) => (
              <li key={e.id} className="border-b">
                <Link
                  href={`/expenses/${e.id}`}
                  className="flex min-h-18 flex-col gap-1 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-bold">{formatRupiah(e.amount)}</span>
                    <span className="text-sm text-muted-foreground">
                      {shortDate(e.date)}
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "min-w-0 truncate text-sm",
                        !e.note && "text-muted-foreground"
                      )}
                    >
                      {e.note || "No note"}
                    </span>
                    <CategoryChip name={e.categoryName} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: table. */}
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <table className="w-full min-w-140 border-collapse text-sm">
              <thead>
                <tr className="bg-muted text-left">
                  <th scope="col" className="w-30 px-4 py-3 font-bold">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Note
                  </th>
                  <th scope="col" className="w-50 px-4 py-3 font-bold">
                    Category
                  </th>
                  <th
                    scope="col"
                    className="w-40 px-4 py-3 text-right font-bold"
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className="border-t hover:bg-muted/50">
                    <td className="h-13 px-4 whitespace-nowrap text-muted-foreground">
                      {shortDate(e.date)}
                    </td>
                    <td className="px-4">
                      <Link
                        href={`/expenses/${e.id}`}
                        className={cn(
                          "flex min-h-11 items-center underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
                          !e.note && "text-muted-foreground"
                        )}
                      >
                        {e.note || "No note"}
                      </Link>
                    </td>
                    <td className="px-4">
                      <CategoryChip name={e.categoryName} />
                    </td>
                    <td className="px-4 text-right text-base font-bold whitespace-nowrap">
                      {formatRupiah(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
