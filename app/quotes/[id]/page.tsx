import Link from "next/link"
import { notFound } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { PdfExportLink } from "@/components/pdf-export-link"
import { QuotePreview } from "@/components/quote-preview"
import { ToastOnMount } from "@/components/toast-on-mount"
import { buttonVariants } from "@/components/ui/button"
import { requireSession } from "@/lib/auth"
import { getQuoteStore } from "@/lib/quotes/store"

export default async function QuotePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}) {
  const session = await requireSession()
  const { id } = await params
  const { saved } = await searchParams
  const store = getQuoteStore()
  const quoteView = await store.getQuoteViewById(session, id)

  if (!quoteView || quoteView.quote.status === "trashed") {
    notFound()
  }

  const { quote, salesProfile } = quoteView

  return (
    <DashboardShell
      session={session}
      title="Quotation Preview"
      subtitle="Review the same presentation the client will see before sharing the link or exporting the PDF."
      actions={
        <>
          <Link href={`/quotes/${quote.id}/edit`} className={buttonVariants({ variant: "outline" })}>
            Back to editor
          </Link>
          <a href={`/q/${quote.slug}`} target="_blank" className={buttonVariants({ variant: "outline" })}>
            Open public page
          </a>
          <PdfExportLink
            href={`/api/quotes/${quote.id}/pdf`}
            className={buttonVariants({ variant: "default", className: "hover:text-primary-foreground" })}
          >
            Export PDF
          </PdfExportLink>
        </>
      }
    >
      {saved ? <ToastOnMount message="Quote saved." /> : null}
      <QuotePreview quote={quote} salesProfile={salesProfile} />
    </DashboardShell>
  )
}
