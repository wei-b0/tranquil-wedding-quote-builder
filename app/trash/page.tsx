import Link from "next/link"

import { deleteQuotePermanentlyAction, restoreQuoteAction } from "@/app/actions"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button, buttonVariants } from "@/components/ui/button"
import { requireSession } from "@/lib/auth"
import { formatDateLabel } from "@/lib/quotes/format"
import { getQuoteStore } from "@/lib/quotes/store"

function getDaysUntilExpiry(value: string | null) {
  if (!value) return null
  const expiry = new Date(value).getTime()
  if (Number.isNaN(expiry)) return null
  const diff = expiry - Date.now()
  if (diff <= 0) return 0
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default async function TrashPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const session = await requireSession()
  const params = await searchParams
  const search = params.search ?? ""
  const store = getQuoteStore()
  const quotes = await store.listTrash(session, search)

  return (
    <DashboardShell
      session={session}
      title="Trashbox"
      subtitle="Restore deleted quotations before they expire, or remove them permanently."
      actions={
        <Link href="/dashboard" className={buttonVariants({ variant: "primary" })}>
          Back to dashboard
        </Link>
      }
    >
      <section className="rounded-[2rem] border border-stone-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(48,32,20,0.06)]">
        <form className="flex flex-col gap-3 md:flex-row">
          <input
            name="search"
            defaultValue={search}
            className="h-12 flex-1 rounded-full border border-stone-200 bg-stone-50 px-5 text-sm text-stone-900 outline-none transition focus:border-amber-500"
            placeholder="Search deleted client, title, location, or status"
          />
          <Button type="submit" variant="outline" size="lg" className="h-12 rounded-full px-5">
            Search
          </Button>
        </form>
      </section>

      <section className="mt-6 grid gap-4">
        {quotes.length ? (
          quotes.map((quote) => {
            const daysUntilExpiry = getDaysUntilExpiry(quote.expiresAt)

            return (
              <article
                key={quote.id}
                className="rounded-[2rem] border border-stone-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(48,32,20,0.06)]"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-stone-600">
                        trashed
                      </span>
                      <span className="text-sm text-stone-500">
                        Deleted {formatDateLabel(quote.trashedAt || quote.updatedAt)}
                      </span>
                      <span className="text-sm text-stone-500">
                        Auto deletes {quote.expiresAt ? formatDateLabel(quote.expiresAt) : "soon"}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-serif text-3xl text-stone-900">
                        {[quote.clientName, quote.partnerName].filter(Boolean).join(" & ") || "Untitled couple"}
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        {quote.quoteTitle} · {quote.location || "Location to be updated"}
                      </p>
                    </div>
                    <div className="text-sm text-stone-500">
                      {daysUntilExpiry === null
                        ? "Expiry pending"
                        : daysUntilExpiry === 0
                          ? "Expires today"
                          : `${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"} remaining`}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/q/${quote.slug}`}
                      target="_blank"
                      className={buttonVariants({ variant: "outline" })}
                    >
                      Open public page
                    </Link>
                    <form action={restoreQuoteAction}>
                      <input type="hidden" name="id" value={quote.id} />
                      <Button type="submit" variant="secondary">
                        Restore
                      </Button>
                    </form>
                    <form action={deleteQuotePermanentlyAction}>
                      <input type="hidden" name="id" value={quote.id} />
                      <Button type="submit" variant="ghost">
                        Delete permanently
                      </Button>
                    </form>
                  </div>
                </div>
              </article>
            )
          })
        ) : (
          <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/70 p-12 text-center">
            <h2 className="font-serif text-3xl text-stone-900">Trashbox is empty</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Deleted quotations will appear here for 30 days before they are removed automatically.
            </p>
          </div>
        )}
      </section>
    </DashboardShell>
  )
}
