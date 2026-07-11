import Link from "next/link"

import { logoutAction } from "@/app/actions"
import { SubmitButton } from "@/components/submit-button"
import type { QuoteSession } from "@/lib/quotes/types"

export function DashboardShell({
  session,
  title,
  subtitle,
  children,
  actions,
}: {
  session: QuoteSession
  title: string
  subtitle: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5ede2_0%,#fbf8f1_18%,#fffdf9_100%)] text-stone-900">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <header className="rounded-[2rem] border border-stone-200 bg-white/85 p-6 shadow-[0_24px_60px_rgba(48,32,20,0.08)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link href="/dashboard" className="text-xs uppercase tracking-[0.35em] text-stone-500">
                The Tranquil Wedding
              </Link>
              <h1 className="mt-3 font-serif text-4xl md:text-5xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className="text-sm text-stone-600 transition hover:text-stone-900">
                Dashboard
              </Link>
              <Link href="/settings/profile" className="text-sm text-stone-600 transition hover:text-stone-900">
                Profile
              </Link>
              <Link href="/trash" className="text-sm text-stone-600 transition hover:text-stone-900">
                Trashbox
              </Link>
              {actions}
              <div className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700">
                {session.name} · {session.email}
              </div>
              <form action={logoutAction}>
                <SubmitButton variant="outline" pendingText="Signing out…">
                  Sign out
                </SubmitButton>
              </form>
            </div>
          </div>
        </header>
        <main className="mt-6">{children}</main>
      </div>
    </div>
  )
}
