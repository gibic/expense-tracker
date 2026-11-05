import { ExpenseFormSkeleton, LoadingPage } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

/** Edit-expense loading screen. Same layout as `page.tsx`. */
export default function EditExpenseLoading() {
  return (
    <LoadingPage
      label="expense"
      className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-6 md:mx-0"
    >
      <header className="flex items-center gap-2">
        <Skeleton className="size-11 rounded-lg md:hidden" />
        <h1 className="text-xl font-bold">Edit expense</h1>
      </header>
      <ExpenseFormSkeleton />
      <Skeleton className="h-12 rounded-lg" />
    </LoadingPage>
  )
}
