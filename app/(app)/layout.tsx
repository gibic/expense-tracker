import { BottomNav, SidebarNav } from "@/components/app-nav"
import { requireUserId } from "@/lib/session"

/**
 * Shell for every signed-in screen: sidebar from `md` up, bottom tab bar
 * below. Sign-in lives outside this group, so it gets no nav. Pages render
 * their content directly; this layout owns `<main>` and its padding.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Redirect before drawing nav for a signed-out visitor. Data functions still
  // check the session themselves; this is not the only guard.
  await requireUserId()

  return (
    <div className="flex min-h-svh">
      <SidebarNav />
      <main className="flex min-w-0 flex-1 flex-col p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:p-8">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
