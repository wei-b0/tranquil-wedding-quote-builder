import { notFound } from "next/navigation"

import { QuotePreview } from "@/components/quote-preview"
import { getQuoteStore } from "@/lib/quotes/store"

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const store = getQuoteStore()
  const quote = await store.getQuoteBySlug(slug)

  if (!quote) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6efe6_0%,#fffaf3_20%,#fffdf9_100%)] px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <QuotePreview quote={quote} publicView />
      </div>
    </div>
  )
}
