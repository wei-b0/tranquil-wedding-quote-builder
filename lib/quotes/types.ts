export type ActiveQuoteStatus = "draft" | "shared"

export type QuoteStatus = ActiveQuoteStatus | "trashed"

export type DiscountType = "none" | "percentage" | "flat"

export type PaymentMilestone = {
  id: string
  label: string
  percentage: number
  description: string
}

export type QuoteEvent = {
  id: string
  date: string
  title: string
  location: string
  coverage: string
  guestCount: string
  timing: string
  team: string[]
}

export type QuotePackage = {
  id: string
  name: string
  subtitle: string
  badge: string
  recommended: boolean
  basePrice: string
  discountType: DiscountType
  discountValue: string
  finalPrice: string
  offerLabel: string
  team: string[]
  items: string[]
  specialFeatures: string[]
}

export type ContactBlock = {
  email: string
  website: string
  phones: string[]
  whatsapp: string
}

export type QuoteRecord = {
  id: string
  slug: string
  status: QuoteStatus
  lastActiveStatus: ActiveQuoteStatus
  trashedAt: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  ownerEmail: string
  clientName: string
  partnerName: string
  quoteTitle: string
  location: string
  coverage: string
  eventRangeLabel: string
  aboutTitle: string
  aboutBody: string
  events: QuoteEvent[]
  includePreWedding: boolean
  preWeddingLabel: string
  preWeddingTeam: string[]
  preWeddingDeliverables: string[]
  packages: QuotePackage[]
  deliverables: string[]
  paymentTerms: PaymentMilestone[]
  terms: string[]
  privacyPolicy: string[]
  contact: ContactBlock
}

export type QuoteListItem = Pick<
  QuoteRecord,
  | "id"
  | "slug"
  | "status"
  | "lastActiveStatus"
  | "trashedAt"
  | "expiresAt"
  | "clientName"
  | "partnerName"
  | "quoteTitle"
  | "location"
  | "updatedAt"
>

export type QuoteSession = {
  userId: string
  email: string
  name: string
}
