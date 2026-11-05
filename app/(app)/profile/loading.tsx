import { LoadingPage } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

/** Account loading screen. Same layout as `page.tsx`. */
export default function AccountLoading() {
  return (
    <LoadingPage
      label="account"
      className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 md:mx-0 md:flex-none"
    >
      <h1 className="text-xl font-bold">Account</h1>
      <section className="flex items-center gap-4 rounded-lg border p-4">
        <Skeleton className="size-14 shrink-0 rounded-full" />
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </span>
      </section>
    </LoadingPage>
  )
}
