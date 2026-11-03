import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

const stepClass =
  "grid size-11 shrink-0 place-items-center rounded-lg border border-input outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

function Step({
  href,
  label,
  children,
}: {
  href: string | null
  label: string
  children: React.ReactNode
}) {
  if (!href) {
    return (
      <span aria-hidden className={cn(stepClass, "opacity-40")}>
        {children}
      </span>
    )
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(stepClass, "hover:bg-muted")}
    >
      {children}
    </Link>
  )
}

/**
 * Previous button, month label, next button. Renders no wrapper: the caller
 * owns the group element, its label and spacing. Pass null for a step that
 * falls outside the supported month range.
 */
export function MonthSwitcher({
  label,
  prevHref,
  nextHref,
  labelClassName,
}: {
  label: string
  prevHref: string | null
  nextHref: string | null
  labelClassName?: string
}) {
  return (
    <>
      <Step href={prevHref} label="Previous month">
        <ChevronLeft aria-hidden className="size-5" />
      </Step>
      <span
        aria-live="polite"
        className={cn("text-center font-semibold", labelClassName)}
      >
        {label}
      </span>
      <Step href={nextHref} label="Next month">
        <ChevronRight aria-hidden className="size-5" />
      </Step>
    </>
  )
}
