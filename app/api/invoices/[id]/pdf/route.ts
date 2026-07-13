import { NextResponse } from "next/server"
import { renderToStream } from "@react-pdf/renderer"

import { buildInvoicePdfDocument } from "@/components/invoice-pdf"
import { requireSession } from "@/lib/auth"
import { getInvoiceStore } from "@/lib/invoices/store"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession()
  const { id } = await params
  const store = getInvoiceStore()
  const invoiceView = await store.getInvoiceViewById(session, id)

  if (!invoiceView || invoiceView.invoice.status === "trashed") {
    return new NextResponse("Not found", { status: 404 })
  }

  const { invoice } = invoiceView
  const stream = await renderToStream(buildInvoicePdfDocument(invoice))

  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.slug}.pdf"`,
    },
  })
}
