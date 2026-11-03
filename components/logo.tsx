import { cn } from "@/lib/utils"

/** App wordmark in the logo typeface (Bricolage Grotesque). */
export function Logo({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "font-logo text-xl leading-7 font-extrabold tracking-tight",
        className
      )}
    >
      Expense tracker
    </p>
  )
}
