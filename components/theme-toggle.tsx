"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

/**
 * Switches between light and dark. The theme is unknown during server render,
 * so both labels are rendered and CSS (`dark:`) shows the right one. That
 * avoids a hydration mismatch and a flash of the wrong label.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "flex min-h-11 items-center gap-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <span className="contents dark:hidden">
        <Moon aria-hidden className="size-5" strokeWidth={1.75} />
        Use dark theme
      </span>
      <span className="hidden dark:contents">
        <Sun aria-hidden className="size-5" strokeWidth={1.75} />
        Use light theme
      </span>
    </button>
  )
}
