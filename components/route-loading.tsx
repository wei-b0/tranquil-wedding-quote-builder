import { FileText, ReceiptText, Settings2, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"

function Skeleton({
  className,
}: {
  className?: string
}) {
  return <div className={cn("animate-pulse rounded-[999px] bg-stone-200/80", className)} />
}

function LoadingCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-stone-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(48,32,20,0.06)]",
        className
      )}
    >
      {children}
    </div>
  )
}

function DashboardNavItem({
  active,
  icon: Icon,
}: {
  active?: boolean
  icon: typeof FileText
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[1.2rem] px-4 py-3",
        active ? "bg-stone-900 text-white shadow-[0_16px_30px_rgba(28,22,16,0.16)]" : "bg-transparent text-stone-600"
      )}
    >
      <Icon className="size-4" />
      <Skeleton className={cn("h-3.5", active ? "bg-white/30" : "bg-stone-200")} />
    </div>
  )
}

export function DashboardRouteLoadingShell({
  activeSection,
  children,
  headerActions = 2,
}: {
  activeSection: "quotes" | "invoices" | "profile" | "trash"
  children: React.ReactNode
  headerActions?: number
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5ede2_0%,#fbf8f1_18%,#fffdf9_100%)] text-stone-900">
      <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-stone-200 bg-white/90 p-6 shadow-[0_24px_60px_rgba(48,32,20,0.08)] backdrop-blur lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:self-start">
            <div className="flex h-full flex-col">
              <Skeleton className="h-3 w-32 bg-stone-200" />

              <nav className="mt-8 space-y-2">
                <DashboardNavItem
                  icon={FileText}
                  active={activeSection === "quotes"}
                />
                <DashboardNavItem
                  icon={ReceiptText}
                  active={activeSection === "invoices"}
                />
              </nav>

              <div className="mt-8 border-t border-stone-200 pt-6">
                <Skeleton className="mb-3 h-3 w-20 bg-stone-200" />
                <div className="space-y-2">
                  <DashboardNavItem
                    icon={Settings2}
                    active={activeSection === "profile"}
                  />
                  <DashboardNavItem
                    icon={Trash2}
                    active={activeSection === "trash"}
                  />
                </div>
              </div>

              <div className="mt-auto pt-6">
                <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-4">
                  <Skeleton className="h-4 w-32 bg-stone-200" />
                  <Skeleton className="mt-3 h-3.5 w-40 bg-stone-200" />
                </div>
                <Skeleton className="mt-4 h-9 w-full rounded-full bg-stone-200" />
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <header className="rounded-[2rem] border border-stone-200 bg-white/85 p-6 shadow-[0_24px_60px_rgba(48,32,20,0.08)] backdrop-blur">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="w-full max-w-2xl">
                  <Skeleton className="h-12 w-64 rounded-[1rem] bg-stone-200" />
                  <Skeleton className="mt-4 h-3.5 w-full max-w-xl bg-stone-200" />
                  <Skeleton className="mt-3 h-3.5 w-4/5 bg-stone-200" />
                </div>
                {headerActions ? (
                  <div className="flex flex-wrap items-center gap-3">
                    {Array.from({ length: headerActions }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="h-9 w-28 rounded-full bg-stone-200"
                      />
                    ))}
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

export function DashboardListLoading({
  activeSection,
  itemCount = 3,
}: {
  activeSection: "quotes" | "invoices" | "trash"
  itemCount?: number
}) {
  return (
    <DashboardRouteLoadingShell activeSection={activeSection} headerActions={1}>
      <LoadingCard>
        <div className="flex flex-col gap-3 md:flex-row">
          <Skeleton className="h-12 flex-1 rounded-full bg-stone-200" />
          <Skeleton className="h-12 w-32 rounded-full bg-stone-200" />
        </div>
      </LoadingCard>

      <section className="mt-6 grid gap-4">
        {Array.from({ length: itemCount }).map((_, index) => (
          <LoadingCard key={index}>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Skeleton className="h-7 w-20 bg-stone-200" />
                  <Skeleton className="h-3.5 w-36 bg-stone-200" />
                </div>
                <Skeleton className="h-10 w-56 rounded-[1rem] bg-stone-200" />
                <Skeleton className="h-3.5 w-72 bg-stone-200" />
                <Skeleton className="h-3.5 w-40 bg-stone-200" />
              </div>
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 4 }).map((_, actionIndex) => (
                  <Skeleton
                    key={actionIndex}
                    className="h-9 w-24 rounded-full bg-stone-200"
                  />
                ))}
              </div>
            </div>
          </LoadingCard>
        ))}
      </section>
    </DashboardRouteLoadingShell>
  )
}

export function DashboardProfileLoading() {
  return (
    <DashboardRouteLoadingShell activeSection="profile" headerActions={0}>
      <LoadingCard className="p-6">
        <Skeleton className="h-3 w-32 bg-stone-200" />
        <Skeleton className="mt-4 h-10 w-72 rounded-[1rem] bg-stone-200" />
        <Skeleton className="mt-3 h-3.5 w-full max-w-2xl bg-stone-200" />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-3.5 w-24 bg-stone-200" />
              <Skeleton className="mt-3 h-12 w-full rounded-2xl bg-stone-200" />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Skeleton className="h-9 w-32 rounded-full bg-stone-200" />
          <Skeleton className="h-9 w-24 rounded-full bg-stone-200" />
        </div>
      </LoadingCard>
    </DashboardRouteLoadingShell>
  )
}

export function DashboardPreviewLoading({
  activeSection,
}: {
  activeSection: "quotes" | "invoices"
}) {
  return (
    <DashboardRouteLoadingShell activeSection={activeSection} headerActions={3}>
      <LoadingCard className="p-6">
        <Skeleton className="h-3 w-28 bg-stone-200" />
        <Skeleton className="mt-4 h-4 w-40 bg-stone-200" />
        <Skeleton className="mt-3 h-[560px] w-full rounded-[1.5rem] bg-stone-100" />
      </LoadingCard>
    </DashboardRouteLoadingShell>
  )
}

export function DashboardEditorLoading({
  activeSection,
}: {
  activeSection: "quotes" | "invoices"
}) {
  return (
    <DashboardRouteLoadingShell activeSection={activeSection} headerActions={1}>
      <div className="grid gap-6">
        <LoadingCard className="p-6">
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-3.5 w-24 bg-stone-200" />
                <Skeleton className="mt-3 h-12 w-full rounded-2xl bg-stone-200" />
              </div>
            ))}
          </div>
        </LoadingCard>

        <LoadingCard className="p-6">
          <Skeleton className="h-3 w-32 bg-stone-200" />
          <Skeleton className="mt-4 h-10 w-56 rounded-[1rem] bg-stone-200" />
          <div className="mt-5 grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className={cn(
                  "w-full rounded-[1.25rem] bg-stone-100",
                  index === 0 ? "h-28" : "h-20"
                )}
              />
            ))}
          </div>
        </LoadingCard>

        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-32 rounded-full bg-stone-200" />
          <Skeleton className="h-10 w-28 rounded-full bg-stone-900/15" />
        </div>
      </div>
    </DashboardRouteLoadingShell>
  )
}

export function PublicQuoteLoading() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6efe6_0%,#fffaf3_20%,#fffdf9_100%)] px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-stone-200 bg-white/85 p-6 shadow-[0_24px_60px_rgba(48,32,20,0.08)]">
        <Skeleton className="h-4 w-32 bg-stone-200" />
        <Skeleton className="mt-5 h-14 w-3/4 rounded-[1rem] bg-stone-200" />
        <Skeleton className="mt-4 h-4 w-full max-w-3xl bg-stone-200" />
        <div className="mt-8 grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
          <Skeleton className="h-[680px] w-full rounded-[1.75rem] bg-stone-100" />
          <div className="grid gap-4">
            <Skeleton className="h-32 w-full rounded-[1.5rem] bg-stone-100" />
            <Skeleton className="h-44 w-full rounded-[1.5rem] bg-stone-100" />
            <Skeleton className="h-14 w-full rounded-full bg-stone-200" />
            <Skeleton className="h-14 w-full rounded-full bg-stone-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoginRouteLoading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,201,147,0.35),transparent_28%),linear-gradient(180deg,#2a1a13_0%,#6c4831_48%,#f7efe4_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2.5rem] border border-white/10 bg-white/10 p-8 shadow-[0_30px_80px_rgba(24,13,7,0.28)] backdrop-blur">
          <Skeleton className="h-3 w-40 bg-white/20" />
          <Skeleton className="mt-5 h-16 w-full max-w-xl rounded-[1rem] bg-white/20" />
          <Skeleton className="mt-4 h-4 w-full max-w-2xl bg-white/15" />
          <Skeleton className="mt-3 h-4 w-5/6 bg-white/15" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4"
              >
                <Skeleton className="h-4 w-24 bg-white/20" />
                <Skeleton className="mt-4 h-3.5 w-full bg-white/15" />
                <Skeleton className="mt-3 h-3.5 w-4/5 bg-white/15" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-stone-200 bg-[#fffdf9] p-8 shadow-[0_30px_80px_rgba(24,13,7,0.16)]">
          <Skeleton className="h-10 w-56 rounded-[1rem] bg-stone-200" />
          <Skeleton className="mt-4 h-3.5 w-full max-w-sm bg-stone-200" />
          <div className="mt-8 grid gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-3.5 w-20 bg-stone-200" />
                <Skeleton className="mt-3 h-12 w-full rounded-2xl bg-stone-200" />
              </div>
            ))}
            <Skeleton className="mt-2 h-12 w-full rounded-full bg-stone-900/15" />
          </div>
        </section>
      </div>
    </div>
  )
}

export function RootRedirectLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(244,201,147,0.35),transparent_28%),linear-gradient(180deg,#2a1a13_0%,#6c4831_48%,#f7efe4_100%)] px-4">
      <div className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-white/12 p-8 shadow-[0_30px_80px_rgba(24,13,7,0.28)] backdrop-blur">
        <Skeleton className="h-3 w-36 bg-white/20" />
        <Skeleton className="mt-5 h-12 w-56 rounded-[1rem] bg-white/20" />
        <Skeleton className="mt-4 h-3.5 w-full bg-white/15" />
        <Skeleton className="mt-3 h-3.5 w-4/5 bg-white/15" />
      </div>
    </div>
  )
}
