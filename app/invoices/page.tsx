import Link from "next/link"

import { createInvoiceAction, trashInvoiceAction } from "@/app/actions"
import { DashboardShell } from "@/components/dashboard-shell"
import { PdfExportLink } from "@/components/pdf-export-link"
import { SubmitButton } from "@/components/submit-button"
import { ToastOnMount } from "@/components/toast-on-mount"
import { buttonVariants } from "@/components/ui/button"
import { requireSession } from "@/lib/auth"
import { formatDateLabel } from "@/lib/quotes/format"
import { getInvoiceStore } from "@/lib/invoices/store"

export default async function InvoiceDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; trashed?: string }>
}) {
  const session = await requireSession()
  const params = await searchParams
  const search = params.search ?? ""
  const store = getInvoiceStore()
  const invoices = await store.listInvoices(session, search)

  return (
    <DashboardShell
      session={session}
      title="Invoice Dashboard"
      subtitle="Create, edit, export, and manage client invoices alongside your quote workflow."
      activeSection="invoices"
      actions={
        <form action={createInvoiceAction}>
          <SubmitButton
            size="lg"
            pendingText="Creating…"
            className="rounded-full bg-stone-900 px-5 text-white hover:bg-stone-800 hover:text-white"
          >
            New invoice
          </SubmitButton>
        </form>
      }
    >
      {params.trashed ? (
        <ToastOnMount message="Invoice moved to trash." />
      ) : null}

      <section className="rounded-[2rem] border border-stone-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(48,32,20,0.06)]">
        <form className="flex flex-col gap-3 md:flex-row">
          <input
            name="search"
            defaultValue={search}
            className="h-12 flex-1 rounded-full border border-stone-200 bg-stone-50 px-5 text-sm text-stone-900 transition outline-none focus:border-amber-500"
            placeholder="Search client, invoice title, date, or status"
          />
          <SubmitButton
            variant="outline"
            size="lg"
            pendingText="Searching…"
            className="h-12 rounded-full px-5"
          >
            Search
          </SubmitButton>
        </form>
      </section>

      <section className="mt-6 grid gap-4">
        {invoices.length ? (
          invoices.map((invoice) => (
            <article
              key={invoice.id}
              className="rounded-[2rem] border border-stone-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(48,32,20,0.06)]"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-[0.68rem] tracking-[0.24em] text-stone-600 uppercase">
                      {invoice.status}
                    </span>
                    <span className="text-sm text-stone-500">
                      Last updated {formatDateLabel(invoice.updatedAt)}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-serif text-3xl text-stone-900">
                      {invoice.clientName || "Untitled client"}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-stone-600">
                      {invoice.invoiceTitle} ·{" "}
                      {formatDateLabel(invoice.invoiceDate)}
                    </p>
                  </div>
                  <div className="text-sm text-stone-500">
                    Invoice slug: {invoice.slug}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Preview
                  </Link>
                  <Link
                    href={`/invoices/${invoice.id}/edit`}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Edit
                  </Link>
                  <PdfExportLink
                    href={`/api/invoices/${invoice.id}/pdf`}
                    className={buttonVariants({
                      variant: "outline",
                      className: "hover:text-stone-900",
                    })}
                  >
                    Export PDF
                  </PdfExportLink>
                  <form action={trashInvoiceAction}>
                    <input type="hidden" name="id" value={invoice.id} />
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
            <h2 className="font-serif text-3xl text-stone-900">
              No invoices yet
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Create your first invoice and export the same one-page layout
              straight to PDF.
            </p>
          </div>
        )}
      </section>
    </DashboardShell>
  )
}
