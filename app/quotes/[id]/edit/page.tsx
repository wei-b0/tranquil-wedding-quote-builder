import { notFound } from "next/navigation"

import { saveQuoteAction } from "@/app/actions"
import { DashboardShell } from "@/components/dashboard-shell"
import { PdfExportLink } from "@/components/pdf-export-link"
import { QuoteEditor } from "@/components/quote-editor"
import { buttonVariants } from "@/components/ui/button"
import { requireSession } from "@/lib/auth"
import { getQuoteStore } from "@/lib/quotes/store"

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireSession()
  const { id } = await params
  const store = getQuoteStore()
  const quote = await store.getQuoteById(session, id)

  if (!quote || quote.status === "trashed") {
    notFound()
  }

  return (
    <DashboardShell
      session={session}
      title="Quotation Builder"
      subtitle="Adjust event details, package options, delivery promises, and contact information while keeping the client preview aligned in real time."
      actions={
        <PdfExportLink
          href={`/api/quotes/${quote.id}/pdf`}
          className={buttonVariants({ variant: "outline", className: "hover:text-stone-900" })}
        >
          Export PDF
        </PdfExportLink>
      }
    >
      <QuoteEditor initialQuote={quote} saveAction={saveQuoteAction} />
    </DashboardShell>
  )
}
