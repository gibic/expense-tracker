import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { listCategories } from "@/lib/expenses"
import { today } from "@/lib/month"

import { createExpenseAction } from "../actions"
import { ExpenseForm } from "../expense-form"

export default async function NewExpensePage() {
  const categories = await listCategories()
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col gap-6 p-4">
      <header className="flex items-center gap-2">
        <Link
          href="/expenses"
          aria-label="Back to expenses"
          className="grid size-11 place-items-center rounded-lg border border-input"
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
    </main>
  )
}
