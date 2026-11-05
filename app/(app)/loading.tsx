import { LoadingPage, MonthSwitcherSkeleton } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

/** Dashboard loading screen. Same layout as `page.tsx`. */
export default function DashboardLoading() {
  return (
    <LoadingPage
      label="dashboard"
      className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 md:mx-0 md:max-w-[1100px] md:flex-none md:gap-6"
    >
      <header className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex items-center justify-between md:justify-start md:gap-2">
          <MonthSwitcherSkeleton labelClassName="w-32 md:w-36" />
        </div>
      </header>

      <section className="flex flex-col gap-1 rounded-lg border p-4 md:p-6">
        <Skeleton className="my-0.5 h-4 w-40" />
        <Skeleton className="my-1 h-9 w-56 md:h-10" />
        <Skeleton className="my-0.5 h-4 w-20" />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-bold">By category</h2>
        <ul className="grid gap-2 md:grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] md:gap-4">
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="flex min-h-14 flex-col gap-2 rounded-lg border px-3 py-2"
            >
              <span className="flex items-center justify-between gap-2">
                <Skeleton className="my-0.5 h-5 w-24" />
                <Skeleton className="my-0.5 h-5 w-28" />
              </span>
              <Skeleton className="h-1.5 rounded-full" />
            </li>
          ))}
        </ul>
      </section>
    </LoadingPage>
  )
}
