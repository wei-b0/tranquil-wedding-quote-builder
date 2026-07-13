import Link from "next/link"
import { FileText, ReceiptText, Settings2, Trash2 } from "lucide-react"

import { logoutAction } from "@/app/actions"
import { SubmitButton } from "@/components/submit-button"
import type { QuoteSession } from "@/lib/quotes/types"
import { cn } from "@/lib/utils"

export function DashboardShell({
  session,
  title,
  subtitle,
  children,
  actions,
  activeSection,
}: {
  session: QuoteSession
  title: string
  subtitle: string
  children: React.ReactNode
  actions?: React.ReactNode
  activeSection: "quotes" | "invoices" | "profile" | "trash"
}) {
  const primaryNav = [
    {
      href: "/dashboard",
      label: "Quotes",
      section: "quotes" as const,
      icon: FileText,
    },
    {
      href: "/invoices",
      label: "Invoices",
      section: "invoices" as const,
      icon: ReceiptText,
    },
  ]

  const secondaryNav = [
    {
      href: "/settings/profile",
      label: "Profile",
      section: "profile" as const,
      icon: Settings2,
    },
    { href: "/trash", label: "Trash", section: "trash" as const, icon: Trash2 },
  ]

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5ede2_0%,#fbf8f1_18%,#fffdf9_100%)] text-stone-900">
      <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-stone-200 bg-white/90 p-6 shadow-[0_24px_60px_rgba(48,32,20,0.08)] backdrop-blur lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:self-start">
            <div className="flex h-full flex-col">
              <div>
                <Link
                  href="/dashboard"
                  className="text-xs tracking-[0.35em] text-stone-500 uppercase"
                >
                  The Tranquil Wedding
                </Link>
              </div>

              <nav className="mt-8 space-y-2">
                {primaryNav.map((item) => {
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-[1.2rem] px-4 py-3 text-sm transition",
                        activeSection === item.section
                          ? "bg-stone-900 text-white shadow-[0_16px_30px_rgba(28,22,16,0.16)]"
                          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                      )}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-8 border-t border-stone-200 pt-6">
                <div className="mb-3 text-xs tracking-[0.28em] text-stone-500 uppercase">
                  Workspace
                </div>
                <div className="space-y-2">
                  {secondaryNav.map((item) => {
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-[1.2rem] px-4 py-3 text-sm transition",
                          activeSection === item.section
                            ? "bg-stone-900 text-white shadow-[0_16px_30px_rgba(28,22,16,0.16)]"
                            : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                        )}
                      >
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="mt-auto pt-6">
                <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-700">
                  <div className="font-medium text-stone-900">
                    {session.name}
                  </div>
                  <div className="mt-1 text-stone-600">{session.email}</div>
                </div>
                <form action={logoutAction} className="mt-4">
                  <SubmitButton
                    variant="outline"
                    pendingText="Signing out…"
                    className="w-full"
                  >
                    Sign out
                  </SubmitButton>
                </form>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <header className="rounded-[2rem] border border-stone-200 bg-white/85 p-6 shadow-[0_24px_60px_rgba(48,32,20,0.08)] backdrop-blur">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="font-serif text-4xl md:text-5xl">{title}</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                    {subtitle}
                  </p>
                </div>
                {actions ? (
                  <div className="flex flex-wrap items-center gap-3">
                    {actions}
                  </div>
                ) : null}
              </div>
            </header>
            <main className="mt-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}
