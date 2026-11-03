import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { listCategories } from "@/lib/category-data"
import { today } from "@/lib/month"

import { createExpenseAction } from "../actions"
import { ExpenseForm } from "../expense-form"

export default async function NewExpensePage() {
  const categories = await listCategories()
  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-6 md:mx-0">
      <header className="flex items-center gap-2">
        <Link
          href="/expenses"
          aria-label="Back to expenses"
          className="grid size-11 place-items-center rounded-lg border border-input md:hidden"
        >
          <ArrowLeft aria-hidden className="size-5" />
        </Link>
        <h1 className="text-xl font-bold">Add expense</h1>
      </header>
      <ExpenseForm
        action={createExpenseAction}
        categories={categories}
        initial={{ amount: "", date: today(), categoryId: "", note: "" }}
        submitLabel="Save expense"
        cancelHref="/expenses"
      />
    </div>
  )
}
