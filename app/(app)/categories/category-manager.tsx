"use client"

import { useActionState, useState } from "react"
import { CircleAlert, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CATEGORY_NAME_MAX } from "@/lib/category-input"
import { cn } from "@/lib/utils"

import {
  createCategoryAction,
  deleteCategoryAction,
  renameCategoryAction,
  type CategoryFormState,
  type DeleteCategoryState,
} from "./actions"

type Category = { id: string; name: string }

const iconButton = "size-11 [&_svg:not([class*='size-'])]:size-5"
const textButton = "h-11 px-4 text-sm font-bold"
const invalidInput = "border-2 border-foreground"

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  // Row whose Rename button gets focus back after the rename form closes.
  const [returnFocusId, setReturnFocusId] = useState<string | null>(null)

  const [deleteState, deleteAction, deleting] = useActionState<
    DeleteCategoryState,
    FormData
  >(deleteCategoryAction, { blocked: null, error: null })
  // Each action returns a new object, so a new attempt shows its alert again.
  const [dismissed, setDismissed] = useState<DeleteCategoryState | null>(null)
  const blocked = dismissed === deleteState ? null : deleteState.blocked

  function closeRename(id: string) {
    setEditingId(null)
    setReturnFocusId(id)
  }

  return (
    <div className="grid flex-1 grid-rows-[auto_1fr] gap-4 md:max-w-[1100px] md:flex-none md:grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] md:grid-rows-none md:items-start md:gap-6">
      <div className="flex flex-col gap-2">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No categories yet. Add one to start recording expenses.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {categories.map((c) => (
              <CategoryItem
                key={c.id}
                category={c}
                editing={editingId === c.id}
                focusRename={returnFocusId === c.id}
                deleting={deleting}
                deleteAction={deleteAction}
                onRename={() => setEditingId(c.id)}
                onRenameDone={() => closeRename(c.id)}
                blockedCount={
                  blocked?.id === c.id ? blocked.expenseCount : null
                }
                onDismiss={() => setDismissed(deleteState)}
              />
            ))}
          </ul>
        )}
        <p aria-live="polite" className="text-sm font-bold empty:hidden">
          {dismissed === deleteState ? null : deleteState.error}
        </p>
      </div>

      <NewCategoryForm />
    </div>
  )
}

function CategoryItem({
  category,
  editing,
  focusRename,
  deleting,
  deleteAction,
  onRename,
  onRenameDone,
  blockedCount,
  onDismiss,
}: {
  category: Category
  editing: boolean
  focusRename: boolean
  deleting: boolean
  deleteAction: (formData: FormData) => void
  onRename: () => void
  onRenameDone: () => void
  blockedCount: number | null
  onDismiss: () => void
}) {
  return (
    <>
      <li>
        {editing ? (
          <RenameForm category={category} onDone={onRenameDone} />
        ) : (
          <div className="flex items-center justify-between gap-2 rounded-lg border py-1 pr-1 pl-3">
            <span className="min-w-0 break-words">{category.name}</span>
            <span className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                className={iconButton}
                aria-label={`Rename ${category.name}`}
                autoFocus={focusRename}
                onClick={onRename}
              >
                <Pencil aria-hidden />
              </Button>
              <form action={deleteAction}>
                <input type="hidden" name="id" value={category.id} />
                <Button
                  type="submit"
                  variant="outline"
                  className={iconButton}
                  aria-label={`Delete ${category.name}`}
                  disabled={deleting}
                >
                  <Trash2 aria-hidden />
                </Button>
              </form>
            </span>
          </div>
        )}
      </li>
      {blockedCount !== null ? (
        <li
          role="alert"
          className="flex gap-3 rounded-lg border border-foreground bg-muted p-3"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <div className="flex flex-col items-start gap-1 text-sm">
            <p className="font-bold">Can&apos;t delete {category.name}</p>
            <p>
              {blockedCount}{" "}
              {blockedCount === 1 ? "expense uses" : "expenses use"} this
              category. Reassign them to another category first, then delete it.
            </p>
            <Button
              type="button"
              variant="outline"
              className={cn(textButton, "mt-1 border-foreground")}
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          </div>
        </li>
      ) : null}
    </>
  )
}

function RenameForm({
  category,
  onDone,
}: {
  category: Category
  onDone: () => void
}) {
  const [state, formAction, pending] = useActionState<
    CategoryFormState,
    FormData
  >(
    async (prev, formData) => {
      const next = await renameCategoryAction(prev, formData)
      if (next.ok) onDone()
      return next
    },
    { ok: false, error: null, name: category.name }
  )
  const inputId = `rename-${category.id}`
  const errorId = `${inputId}-error`

  return (
    <form
      action={formAction}
      className="flex flex-col gap-1 rounded-lg border-2 border-foreground p-[7px]"
    >
      <input type="hidden" name="id" value={category.id} />
      <Label htmlFor={inputId} className="font-semibold">
        Rename category
      </Label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          name="name"
          autoComplete="off"
          autoFocus
          maxLength={CATEGORY_NAME_MAX}
          defaultValue={state.name}
          onKeyDown={(e) => {
            if (e.key === "Escape") onDone()
          }}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? errorId : undefined}
          className={cn(
            "h-11 min-w-0 flex-1 px-3 text-base",
            state.error && invalidInput
          )}
        />
        <Button type="submit" disabled={pending} className={textButton}>
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          className={cn(textButton, "border-foreground")}
          onClick={onDone}
        >
          Cancel
        </Button>
      </div>
      <FieldError id={errorId} error={state.error} />
    </form>
  )
}

function NewCategoryForm() {
  const [state, formAction, pending] = useActionState<
    CategoryFormState,
    FormData
  >(createCategoryAction, { ok: false, error: null, name: "" })
  const errorId = "new-category-error"

  return (
    <form
      action={formAction}
      className="flex flex-col gap-1 self-end md:self-start md:rounded-lg md:border md:p-6"
    >
      <Label htmlFor="new-category" className="font-semibold">
        New category
      </Label>
      <div className="flex gap-2">
        <Input
          id="new-category"
          name="name"
          autoComplete="off"
          placeholder="e.g. Education"
          maxLength={CATEGORY_NAME_MAX}
          defaultValue={state.name}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? errorId : undefined}
          className={cn(
            "h-12 min-w-0 flex-1 px-3 text-base",
            state.error && invalidInput
          )}
        />
        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-22 text-base font-bold"
        >
          Add
        </Button>
      </div>
      <FieldError id={errorId} error={state.error} />
    </form>
  )
}

function FieldError({ id, error }: { id: string; error: string | null }) {
  if (!error) return null
  return (
    <p id={id} className="flex items-center gap-1 text-sm font-bold">
      <CircleAlert aria-hidden className="size-4 shrink-0" />
      {error}
    </p>
  )
}
