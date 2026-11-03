import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { listCategories } from "@/lib/category-data"
import { getExpense } from "@/lib/expenses"
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
    <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-6 md:mx-0">
      <header className="flex items-center gap-2">
        <Link
          href={`/expenses?month=${expense.date.slice(0, 7)}`}
          aria-label="Back to expenses"
          className="grid size-11 place-items-center rounded-lg border border-input md:hidden"
        >
          <ArrowLeft aria-hidden className="size-5" />
        </Link>
        <h1 className="text-xl font-bold">Edit expense</h1>
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
        cancelHref={`/expenses?month=${expense.date.slice(0, 7)}`}
      />
      <DeleteButton id={expense.id} />
    </div>
  )
}
