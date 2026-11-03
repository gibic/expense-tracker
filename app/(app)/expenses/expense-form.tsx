"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { CalendarDays, CircleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ExpenseValues } from "@/lib/expense-input"
import { groupRupiah } from "@/lib/money"

import type { ExpenseFormState } from "./actions"

type Props = {
  action: (
    prev: ExpenseFormState,
    formData: FormData
  ) => Promise<ExpenseFormState>
  categories: { id: string; name: string }[]
  initial: ExpenseValues
  /** Present when editing. */
  expenseId?: string
  submitLabel: string
  /** Where the desktop Cancel button goes. */
  cancelHref: string
}

export function ExpenseForm({
  action,
  categories,
  initial,
  expenseId,
  submitLabel,
  cancelHref,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {
    error: null,
    errors: {},
    values: initial,
  })
  // React resets the form after the action; echo the submitted values back.
  const { values, errors } = state

  // Controlled so the Select follows each echoed state, not only its first
  // defaultValue. Re-sync during render when a new action state arrives.
  const [categoryId, setCategoryId] = useState<string | null>(
    values.categoryId || null
  )
  const [amount, setAmount] = useState(values.amount)
  const [syncedState, setSyncedState] = useState(state)
  if (syncedState !== state) {
    setSyncedState(state)
    setCategoryId(state.values.categoryId || null)
    setAmount(state.values.amount)
  }

  // Group thousands while typing; non-digits are dropped.
  function onAmountChange(raw: string) {
    const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "")
    setAmount(digits === "" ? "" : groupRupiah(Number(digits)))
  }

  return (
    <form
      action={formAction}
      className="flex flex-1 flex-col gap-4 md:flex-none md:rounded-lg md:border md:p-6"
    >
      {expenseId ? <input type="hidden" name="id" value={expenseId} /> : null}

      <Field
        id="amount"
        label="Amount"
        error={errors.amount}
        hint="Whole rupiah, no decimals"
      >
        <div
          className={`flex h-12 items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-3 focus-within:ring-ring/50 ${
            errors.amount
              ? "border-2 border-foreground px-[11px]"
              : "border-input"
          }`}
        >
          <span
            aria-hidden
            className="text-xl font-semibold text-muted-foreground"
          >
            Rp
          </span>
          <input
            id="amount"
            name="amount"
            inputMode="numeric"
            autoComplete="off"
            placeholder="25.000"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            aria-invalid={errors.amount ? true : undefined}
            aria-describedby={errors.amount ? "amount-error" : undefined}
            className="h-11 min-w-0 flex-1 bg-transparent text-xl font-semibold outline-none placeholder:text-muted-foreground"
          />
        </div>
      </Field>

      <Field id="date" label="Date" error={errors.date}>
        <div className="relative">
          <CalendarDays
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2"
          />
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={values.date}
            aria-invalid={errors.date ? true : undefined}
            aria-describedby={errors.date ? "date-error" : undefined}
            className={`h-12 pr-3 pl-10 ${errors.date ? "border-2 border-foreground" : ""}`}
          />
        </div>
      </Field>

      <Field id="categoryId" label="Category" error={errors.categoryId}>
        <Select
          name="categoryId"
          value={categoryId}
          onValueChange={(value) => setCategoryId(value)}
          items={categories.map((c) => ({ value: c.id, label: c.name }))}
        >
          <SelectTrigger
            id="categoryId"
            aria-invalid={errors.categoryId ? true : undefined}
            aria-describedby={
              errors.categoryId ? "categoryId-error" : undefined
            }
            className={`h-12 w-full px-3 ${errors.categoryId ? "border-2 border-foreground" : ""}`}
          >
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field id="note" label="Note (optional)">
        <Input
          id="note"
          name="note"
          autoComplete="off"
          placeholder="e.g. Lunch at warung"
          defaultValue={values.note}
          className="h-12 px-3"
        />
      </Field>

      <p aria-live="polite" className="text-sm font-bold empty:hidden">
        {state.error}
      </p>

      <div className="mt-auto flex flex-col gap-2 md:mt-2 md:flex-row-reverse">
        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full text-base font-bold md:w-auto md:px-6"
        >
          {submitLabel}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={cancelHref} />}
          className="hidden h-12 px-6 text-base font-bold md:inline-flex"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} className="font-semibold">
        {label}
      </Label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1 text-sm font-bold"
        >
          <CircleAlert aria-hidden className="size-4" />
          {error}
        </p>
      ) : null}
    </div>
  )
}
