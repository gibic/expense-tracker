import Link from "next/link"
import { notFound } from "next/navigation"

import { getExpense, listCategories } from "@/lib/expenses"
import { groupRupiah } from "@/lib/money"

import { updateExpenseAction } from "../actions"
import { DeleteButton } from "../delete-button"
import { ExpenseForm } from "../expense-form"

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [expense, categories] = await Promise.all([
    getExpense(id),
    listCategories(),
  ])
  if (!expense) notFound()

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-6 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Edit expense</h1>
        <Link
          href={`/expenses?month=${expense.date.slice(0, 7)}`}
          className="text-sm underline"
        >
          Cancel
        </Link>
      </header>
      <ExpenseForm
        action={updateExpenseAction}
        categories={categories}
        expenseId={expense.id}
        initial={{
          amount: groupRupiah(expense.amount),
          date: expense.date,
          categoryId: expense.categoryId,
          note: expense.note ?? "",
        }}
        submitLabel="Save changes"
      />
      <DeleteButton id={expense.id} />
    </main>
  )
}
