import Link from "next/link"
import { notFound } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { QuotePreview } from "@/components/quote-preview"
import { buttonVariants } from "@/components/ui/button"
import { requireSession } from "@/lib/auth"
import { getQuoteStore } from "@/lib/quotes/store"

export default async function QuotePreviewPage({
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
          <a
            href={`/api/quotes/${quote.id}/pdf`}
            target="_blank"
            className={buttonVariants({ variant: "default", className: "hover:text-primary-foreground" })}
          >
            Export PDF
          </a>
        </>
      }
    >
      <QuotePreview quote={quote} />
    </DashboardShell>
  )
}
