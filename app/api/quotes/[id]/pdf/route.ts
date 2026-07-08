import { Readable } from "node:stream"
import { renderToStream } from "@react-pdf/renderer"

import { buildQuotePdfDocument } from "@/components/quote-pdf"
import { requireSession } from "@/lib/auth"
import { getQuoteStore } from "@/lib/quotes/store"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession()
  const { id } = await params
  const store = getQuoteStore()
  const quote = await store.getQuoteById(session, id)

  if (!quote || quote.status === "trashed") {
    return new Response("Not found", { status: 404 })
  }

  const stream = await renderToStream(buildQuotePdfDocument(quote))
  const body = Readable.toWeb(stream as Readable)

  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.slug}.pdf"`,
    },
  })
}
