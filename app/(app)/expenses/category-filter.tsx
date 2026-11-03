"use client"

import { useRouter } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { expensesHref } from "./href"

const ALL = "all"

/** Category dropdown for the expense list. Changing it navigates. */
export function CategoryFilter({
  month,
  categoryId,
  categories,
}: {
  month: string
  categoryId: string | undefined
  categories: { id: string; name: string }[]
}) {
  const router = useRouter()
  const items = [
    { value: ALL, label: "All categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 md:w-60 md:flex-none">
      <label htmlFor="category-filter" className="text-sm font-semibold">
        Category
      </label>
      <Select
        value={categoryId ?? ALL}
        items={items}
        onValueChange={(value) =>
          router.push(
            expensesHref(month, value && value !== ALL ? value : undefined)
          )
        }
      >
        <SelectTrigger id="category-filter" className="h-11 w-full px-3">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
