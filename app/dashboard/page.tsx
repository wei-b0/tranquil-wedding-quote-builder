import Link from "next/link"

import { createQuoteAction, duplicateQuoteAction, trashQuoteAction } from "@/app/actions"
import { DashboardShell } from "@/components/dashboard-shell"
import { PdfExportLink } from "@/components/pdf-export-link"
import { SubmitButton } from "@/components/submit-button"
import { ToastOnMount } from "@/components/toast-on-mount"
import { buttonVariants } from "@/components/ui/button"
import { requireSession } from "@/lib/auth"
import { formatDateLabel } from "@/lib/quotes/format"
import { getQuoteStore } from "@/lib/quotes/store"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; trashed?: string; error?: string }>
}) {
  const session = await requireSession()
  const params = await searchParams
  const search = params.search ?? ""
  const store = getQuoteStore()
  const quotes = await store.listQuotes(session, search)

  return (
    <DashboardShell
      session={session}
      title="Quotation Dashboard"
      subtitle="Create, search, duplicate, share, delete, and export premium wedding proposals from one internal workflow."
      actions={
        <>
          <form action={createQuoteAction}>
            <SubmitButton
              size="lg"
              pendingText="Creating…"
              className="rounded-full bg-stone-900 px-5 text-white hover:bg-stone-800 hover:text-white"
            >
              New quotation
            </SubmitButton>
          </form>
        </>
      }
    >
      {params.trashed ? <ToastOnMount message="Quote moved to trash." /> : null}
      {params.error ? <ToastOnMount message={params.error} type="error" /> : null}

      <section className="rounded-[2rem] border border-stone-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(48,32,20,0.06)]">
        <form className="flex flex-col gap-3 md:flex-row">
          <input
            name="search"
            defaultValue={search}
            className="h-12 flex-1 rounded-full border border-stone-200 bg-stone-50 px-5 text-sm text-stone-900 outline-none transition focus:border-amber-500"
            placeholder="Search client, title, location, or status"
          />
          <SubmitButton variant="outline" size="lg" pendingText="Searching…" className="h-12 rounded-full px-5">
            Search
          </SubmitButton>
        </form>
      </section>

      <section className="mt-6 grid gap-4">
        {quotes.length ? (
          quotes.map((quote) => (
            <article
              key={quote.id}
              className="rounded-[2rem] border border-stone-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(48,32,20,0.06)]"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-stone-600">
                      {quote.status}
                    </span>
                    <span className="text-sm text-stone-500">
                      Last updated {formatDateLabel(quote.updatedAt)}
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
                  <div className="text-sm text-stone-500">Public link slug: {quote.slug}</div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href={`/quotes/${quote.id}`} className={buttonVariants({ variant: "outline" })}>
                    Preview
                  </Link>
                  <Link href={`/quotes/${quote.id}/edit`} className={buttonVariants({ variant: "outline" })}>
                    Edit
                  </Link>
                  <Link
                    href={`/q/${quote.slug}`}
                    target="_blank"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Share page
                  </Link>
                  <PdfExportLink
                    href={`/api/quotes/${quote.id}/pdf`}
                    className={buttonVariants({ variant: "outline", className: "hover:text-stone-900" })}
                  >
                    Export PDF
                  </PdfExportLink>
                  <form action={duplicateQuoteAction}>
                    <input type="hidden" name="id" value={quote.id} />
                    <SubmitButton variant="secondary" pendingText="Duplicating…">
                      Duplicate
                    </SubmitButton>
                  </form>
                  <form action={trashQuoteAction}>
                    <input type="hidden" name="id" value={quote.id} />
                    <SubmitButton variant="ghost" pendingText="Deleting…">
                      Delete
                    </SubmitButton>
                  </form>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/70 p-12 text-center">
            <h2 className="font-serif text-3xl text-stone-900">No quotations yet</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Create your first structured quotation and stop editing PDF files manually.
            </p>
          </div>
        )}
      </section>
    </DashboardShell>
  )
}
