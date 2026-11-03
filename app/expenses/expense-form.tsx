"use client"

import { useActionState, useState } from "react"

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
import { Textarea } from "@/components/ui/textarea"
import type { ExpenseValues } from "@/lib/expense-input"

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
}

export function ExpenseForm({
  action,
  categories,
  initial,
  expenseId,
  submitLabel,
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
  const [syncedState, setSyncedState] = useState(state)
  if (syncedState !== state) {
    setSyncedState(state)
    setCategoryId(state.values.categoryId || null)
  }

  return (
    <form action={formAction} className="flex flex-1 flex-col gap-4">
      {expenseId ? <input type="hidden" name="id" value={expenseId} /> : null}

      <Field id="amount" label="Amount (Rp)" error={errors.amount}>
        <Input
          id="amount"
          name="amount"
          inputMode="numeric"
          autoComplete="off"
          placeholder="25.000"
          defaultValue={values.amount}
          aria-invalid={errors.amount ? true : undefined}
          aria-describedby={errors.amount ? "amount-error" : undefined}
          className="h-12 px-3"
        />
      </Field>

      <Field id="date" label="Date" error={errors.date}>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={values.date}
          aria-invalid={errors.date ? true : undefined}
          aria-describedby={errors.date ? "date-error" : undefined}
          className="h-12 px-3"
        />
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
            className="h-12 w-full px-3"
          >
            <SelectValue placeholder="Pick a category" />
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
        <Textarea
          id="note"
          name="note"
          rows={2}
          defaultValue={values.note}
          className="px-3"
        />
      </Field>

      <p aria-live="polite" className="text-sm text-destructive empty:hidden">
        {state.error}
      </p>

      <Button
        type="submit"
        disabled={pending}
        className="mt-auto h-12 w-full text-base font-bold md:mt-2"
      >
        {submitLabel}
      </Button>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} className="font-semibold">
        {label}
      </Label>
      {children}
      <p id={`${id}-error`} className="text-sm text-destructive empty:hidden">
        {error}
      </p>
    </div>
  )
}
