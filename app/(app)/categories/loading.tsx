import { LoadingPage } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

/** Categories loading screen. Same layout as `page.tsx` and CategoryManager. */
export default function CategoriesLoading() {
  return (
    <LoadingPage
      label="categories"
      className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 md:mx-0 md:max-w-none md:flex-none"
    >
      <h1 className="text-xl font-bold">Categories</h1>
      <div className="grid flex-1 grid-rows-[auto_1fr] gap-4 md:max-w-[1100px] md:flex-none md:grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] md:grid-rows-none md:items-start md:gap-6">
        <ul className="flex flex-col gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-lg border py-1 pr-1 pl-3"
            >
              <Skeleton className="h-5 w-28" />
              <span className="flex shrink-0 gap-2">
                <Skeleton className="size-11 rounded-lg" />
                <Skeleton className="size-11 rounded-lg" />
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-1 self-end md:self-start md:rounded-lg md:border md:p-6">
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 w-22 rounded-lg" />
          </div>
        </div>
      </div>
    </LoadingPage>
  )
}
