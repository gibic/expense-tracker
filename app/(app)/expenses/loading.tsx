import { LoadingPage, MonthSwitcherSkeleton } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

const ROWS = [0, 1, 2, 3, 4, 5]

/** Expense list loading screen. Same layout as `page.tsx`. */
export default function ExpensesLoading() {
  return (
    <LoadingPage
      label="expenses"
      className="mx-auto flex w-full max-w-md flex-col gap-4 md:mx-0 md:max-w-[1100px] md:gap-6"
    >
      <h1 className="text-xl font-bold">Expenses</h1>

      <div className="flex flex-wrap items-end gap-2 md:gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Month</span>
          <div className="flex items-center gap-1 md:gap-2">
            <MonthSwitcherSkeleton labelClassName="w-18 md:w-30" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1 md:w-60 md:flex-none">
          <span className="text-sm font-semibold">Category</span>
          <Skeleton className="h-11 rounded-lg" />
        </div>
        <Skeleton className="h-5 w-40 md:ml-auto md:self-center" />
      </div>

      {/* Mobile: two-line rows. */}
      <ul className="border-t md:hidden">
        {ROWS.map((i) => (
          <li key={i} className="flex min-h-18 flex-col gap-2 border-b py-3">
            <span className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-12" />
            </span>
            <span className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-16" />
            </span>
          </li>
        ))}
      </ul>

      {/* Desktop: table. */}
      <div className="hidden overflow-hidden rounded-lg border md:block">
        <div className="flex h-11 items-center bg-muted px-4 text-sm font-bold">
          <span className="w-30">Date</span>
          <span className="flex-1 px-4">Note</span>
          <span className="w-50 px-4">Category</span>
          <span className="w-40 text-right">Amount</span>
        </div>
        {ROWS.map((i) => (
          <div key={i} className="flex h-13 items-center border-t px-4">
            <span className="w-30">
              <Skeleton className="h-4 w-14" />
            </span>
            <span className="flex-1 px-4">
              <Skeleton className="h-4 w-48" />
            </span>
            <span className="w-50 px-4">
              <Skeleton className="h-5 w-20" />
            </span>
            <span className="flex w-40 justify-end">
              <Skeleton className="h-5 w-28" />
            </span>
          </div>
        ))}
      </div>
    </LoadingPage>
  )
}
