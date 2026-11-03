"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { deleteExpenseAction } from "./actions"

export function DeleteButton({ id }: { id: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" className="h-12 w-full text-destructive" />
        }
      >
        Delete expense
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
          <AlertDialogDescription>
            This is permanent. There is no undo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={deleteExpenseAction}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="destructive">
              Delete
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
