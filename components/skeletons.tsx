import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * Building blocks for the `loading.tsx` files. Each route's loading screen
 * keeps the page's outer box and real headings, and uses grey blocks only
 * where the data goes, so the swap to real content does not jump.
 */

/** Wraps a loading screen. Screen readers hear one "Loading …" message. */
export function LoadingPage({
  label,
  className,
  children,
}: {
  label: string
  className: string
  children: React.ReactNode
}) {
  return (
    <div aria-busy="true" className={className}>
      <p role="status" className="sr-only">
        Loading {label}…
      </p>
      {children}
    </div>
  )
}

/** Previous button, month label, next button: same sizes as MonthSwitcher. */
export function MonthSwitcherSkeleton({
  labelClassName,
}: {
  labelClassName?: string
}) {
  return (
    <>
      <Skeleton className="size-11 rounded-lg" />
      <Skeleton className={cn("h-5 rounded-md", labelClassName)} />
      <Skeleton className="size-11 rounded-lg" />
    </>
  )
}

/** Label plus input-height block, as one ExpenseForm field. */
function FieldSkeleton({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm leading-none font-semibold">{label}</span>
      <Skeleton className="h-12 rounded-lg" />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

/** Same outer box and fields as ExpenseForm. */
export function ExpenseFormSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:flex-none md:rounded-lg md:border md:p-6">
      <FieldSkeleton label="Amount" hint="Whole rupiah, no decimals" />
      <FieldSkeleton label="Date" />
      <FieldSkeleton label="Category" />
      <FieldSkeleton label="Note (optional)" />
      <div className="mt-auto flex flex-col gap-2 md:mt-2 md:flex-row-reverse">
        <Skeleton className="h-12 rounded-lg md:w-36" />
        <Skeleton className="hidden h-12 w-28 rounded-lg md:block" />
      </div>
    </div>
  )
}
