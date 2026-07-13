import Link from "next/link"
import { notFound } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { InvoicePreview } from "@/components/invoice-preview"
import { PdfExportLink } from "@/components/pdf-export-link"
import { ToastOnMount } from "@/components/toast-on-mount"
import { buttonVariants } from "@/components/ui/button"
import { requireSession } from "@/lib/auth"
import { getInvoiceStore } from "@/lib/invoices/store"

export default async function InvoicePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}) {
  const session = await requireSession()
  const { id } = await params
  const { saved } = await searchParams
  const store = getInvoiceStore()
  const invoiceView = await store.getInvoiceViewById(session, id)

  if (!invoiceView || invoiceView.invoice.status === "trashed") {
    notFound()
  }

  const { invoice } = invoiceView

  return (
    <DashboardShell
      session={session}
      title="Invoice Preview"
      subtitle="Review the invoice layout before exporting the PDF or returning to the editor."
      activeSection="invoices"
      actions={
        <>
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className={buttonVariants({ variant: "outline" })}
          >
            Back to editor
          </Link>
          <PdfExportLink
            href={`/api/invoices/${invoice.id}/pdf`}
            className={buttonVariants({
              variant: "default",
              className: "hover:text-primary-foreground",
            })}
          >
            Export PDF
          </PdfExportLink>
        </>
      }
    >
      {saved ? <ToastOnMount message="Invoice saved." /> : null}
      <div className="mx-auto max-w-6xl">
        <InvoicePreview invoice={invoice} className="rounded-[2rem]" />
      </div>
    </DashboardShell>
  )
}
