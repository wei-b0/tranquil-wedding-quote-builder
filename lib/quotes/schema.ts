import { z } from "zod"

export const quotePayloadSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(["draft", "shared", "trashed"]),
  lastActiveStatus: z.enum(["draft", "shared"]),
  trashedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  ownerEmail: z.string().email(),
  clientName: z.string(),
  partnerName: z.string(),
  quoteTitle: z.string(),
  location: z.string(),
  coverage: z.string(),
  eventRangeLabel: z.string(),
  aboutTitle: z.string(),
  aboutBody: z.string(),
  events: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      title: z.string(),
      location: z.string(),
      coverage: z.string(),
      guestCount: z.string(),
      timing: z.string(),
      team: z.array(z.string()),
    })
  ),
  includePreWedding: z.boolean(),
  preWeddingLabel: z.string(),
  preWeddingTeam: z.array(z.string()),
  preWeddingDeliverables: z.array(z.string()),
  packages: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        subtitle: z.string(),
        badge: z.string(),
        recommended: z.boolean(),
        basePrice: z.string(),
        discountType: z.enum(["none", "percentage", "flat"]),
        discountValue: z.string(),
        finalPrice: z.string(),
        offerLabel: z.string(),
        team: z.array(z.string()),
        items: z.array(z.string()),
        specialFeatures: z.array(z.string()),
      })
    )
    .length(3),
  deliverables: z.array(z.string()),
  paymentTerms: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      percentage: z.number(),
      description: z.string(),
    })
  ),
  terms: z.array(z.string()),
  privacyPolicy: z.array(z.string()),
  contact: z.object({
    email: z.string(),
    website: z.string(),
    phones: z.array(z.string()),
    whatsapp: z.string(),
  }),
})
