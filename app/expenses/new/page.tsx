import Link from "next/link"

import { listCategories } from "@/lib/expenses"
import { today } from "@/lib/month"

import { createExpenseAction } from "../actions"
import { ExpenseForm } from "../expense-form"

export default async function NewExpensePage() {
  const categories = await listCategories()
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-6 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Add expense</h1>
        <Link href="/expenses" className="text-sm underline">
          Cancel
        </Link>
      </header>
      <ExpenseForm
        action={createExpenseAction}
        categories={categories}
        initial={{ amount: "", date: today(), categoryId: "", note: "" }}
        submitLabel="Save"
      />
    </main>
  )
}
