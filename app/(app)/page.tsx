import { ChevronRight, ReceiptText } from "lucide-react"
import Link from "next/link"

import { MonthSwitcher } from "@/components/month-switcher"
import { Button } from "@/components/ui/button"
import { monthSummary } from "@/lib/expenses"
import { formatRupiah } from "@/lib/money"
import { isMonth, parseMonth, shiftMonth } from "@/lib/month"
import { NAV, ADD_EXPENSE } from "@/lib/nav"
import { formatShare, type CategoryTotal } from "@/lib/summary"

import { expensesHref } from "./expenses/href"

const monthYearFormat = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

const monthNameFormat = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  timeZone: "UTC",
})

function dashboardHref(month: string) {
  return `${NAV.dashboard.href}?${new URLSearchParams({ month })}`
}

function CategoryRow({ month, item }: { month: string; item: CategoryTotal }) {
  // A tiny share still gets a visible sliver of bar.
  const width = Math.max(item.share, 1)
  return (
    <li>
      <Link
        href={expensesHref(month, item.categoryId)}
        className="flex min-h-14 flex-col gap-2 rounded-lg border px-3 py-2 outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate">{item.categoryName}</span>
          <span className="flex shrink-0 items-center gap-1 font-semibold">
            {formatRupiah(item.total)}
            <span className="sr-only">
              , {formatShare(item.share)} of total
            </span>
            <ChevronRight aria-hidden className="size-4" />
          </span>
        </span>
        <span aria-hidden className="block h-1.5 rounded-full bg-border">
          <span
            className="block h-1.5 rounded-full bg-muted-foreground"
            style={{ width: `${width}%` }}
          />
        </span>
      </Link>
    </li>
  )
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const month = parseMonth((await searchParams).month)
  const { total, count, byCategory } = await monthSummary(month)

  const first = new Date(`${month}-01T00:00:00Z`)
  const label = monthYearFormat.format(first)
  const monthName = monthNameFormat.format(first)
  const stepHref = (delta: number) => {
    const target = shiftMonth(month, delta)
    return isMonth(target) ? dashboardHref(target) : null
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 md:mx-0 md:max-w-[1100px] md:flex-none md:gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div
          role="group"
          aria-label="Month"
          className="flex items-center justify-between md:justify-start md:gap-2"
        >
          <MonthSwitcher
            label={label}
            prevHref={stepHref(-1)}
            nextHref={stepHref(1)}
            labelClassName="md:min-w-36"
          />
        </div>
      </header>

      <section
        aria-label="Month total"
        className="flex flex-col gap-1 rounded-lg border p-4 md:p-6"
      >
        <p className="text-sm text-muted-foreground">
          Total spent in {monthName}
        </p>
        <p className="text-4xl leading-tight font-bold wrap-break-word md:text-[2.5rem]">
          {formatRupiah(total)}
        </p>
        <p className="text-sm text-muted-foreground">
          {count} {count === 1 ? "expense" : "expenses"}
        </p>
      </section>

      {count === 0 ? (
        <section
          aria-labelledby="empty-title"
          className="flex min-h-64 flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input p-6 text-center md:flex-none"
        >
          <ReceiptText aria-hidden className="size-10" strokeWidth={1.75} />
          <h2 id="empty-title" className="font-bold">
            No expenses in {label}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Add an expense to see this month&apos;s total and category
            breakdown.
          </p>
          <Button
            nativeButton={false}
            render={<Link href={ADD_EXPENSE.href} />}
            className="h-12 w-full text-base font-bold md:w-auto md:px-6"
          >
            {ADD_EXPENSE.label}
          </Button>
        </section>
      ) : (
        <section aria-labelledby="by-category" className="flex flex-col gap-2">
          <h2 id="by-category" className="font-bold">
            By category
          </h2>
          <ul className="grid gap-2 md:grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] md:gap-4">
            {byCategory.map((item) => (
              <CategoryRow key={item.categoryId} month={month} item={item} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
