import { notFound } from "next/navigation"

import { saveInvoiceAction } from "@/app/actions"
import { DashboardShell } from "@/components/dashboard-shell"
import { InvoiceEditor } from "@/components/invoice-editor"
import { PdfExportLink } from "@/components/pdf-export-link"
import { buttonVariants } from "@/components/ui/button"
import { requireSession } from "@/lib/auth"
import { getInvoiceStore } from "@/lib/invoices/store"

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireSession()
  const { id } = await params
  const store = getInvoiceStore()
  const invoice = await store.getInvoiceById(session, id)

  if (!invoice || invoice.status === "trashed") {
    notFound()
  }

  return (
    <DashboardShell
      session={session}
      title="Invoice Builder"
      subtitle="Adjust installment rows, bank details, signatory details, and the final invoice presentation in one place."
      activeSection="invoices"
      actions={
        <PdfExportLink
          href={`/api/invoices/${invoice.id}/pdf`}
          className={buttonVariants({
            variant: "outline",
            className: "hover:text-stone-900",
          })}
        >
          Export PDF
        </PdfExportLink>
      }
    >
      <InvoiceEditor initialInvoice={invoice} saveAction={saveInvoiceAction} />
    </DashboardShell>
  )
}
