import { ExpenseFormSkeleton, LoadingPage } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

/** Add-expense loading screen. Same layout as `page.tsx`. */
export default function NewExpenseLoading() {
  return (
    <LoadingPage
      label="form"
      className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-6 md:mx-0"
    >
      <header className="flex items-center gap-2">
        <Skeleton className="size-11 rounded-lg md:hidden" />
        <h1 className="text-xl font-bold">Add expense</h1>
      </header>
      <ExpenseFormSkeleton />
    </LoadingPage>
  )
}
