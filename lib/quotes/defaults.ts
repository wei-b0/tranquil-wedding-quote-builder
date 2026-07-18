import type {
  DiscountType,
  QuotePackage,
  QuoteRecord,
} from "@/lib/quotes/types"

function createId() {
  return crypto.randomUUID()
}

function createSlug() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 18)
}

function createPackage(input: {
  name: string
  subtitle: string
  badge: string
  recommended: boolean
  basePrice: string
  team: string[]
  items: string[]
  specialFeatures: string[]
}): QuotePackage {
  return {
    id: createId(),
    name: input.name,
    subtitle: input.subtitle,
    badge: input.badge,
    recommended: input.recommended,
    basePrice: input.basePrice,
    discountType: "none",
    discountValue: "",
    finalPrice: input.basePrice,
    offerLabel: input.recommended ? "Preferred package" : "",
    team: input.team,
    items: input.items,
    specialFeatures: input.specialFeatures,
  }
}

function isBothSideCoverage(value: string) {
  return value.trim().toLowerCase() === "both sides"
}

function albumFeatureForCoverage(coverage: string) {
  return isBothSideCoverage(coverage) ? "2 albums included" : "1 album included"
}

function extraAlbumFeatureForCoverage(coverage: string) {
  return isBothSideCoverage(coverage)
    ? null
    : "Additional album available at extra charge"
}

function albumDeliverableForCoverage(coverage: string) {
  return isBothSideCoverage(coverage)
    ? "2 albums included for both-side wedding coverage"
    : "1 album included for single-side wedding coverage; additional album available at extra charge"
}

function syncAlbumFeatures(packages: QuotePackage[], coverage: string) {
  return packages.map((pkg) => {
    const nonAlbumFeatures = pkg.specialFeatures.filter(
      (feature) => !/album/i.test(feature) && !/additional album/i.test(feature)
    )
    const albumFeatures = [albumFeatureForCoverage(coverage)]
    const extraAlbumFeature = extraAlbumFeatureForCoverage(coverage)

    if (extraAlbumFeature) {
      albumFeatures.push(extraAlbumFeature)
    }

    return {
      ...pkg,
      specialFeatures: [...albumFeatures, ...nonAlbumFeatures],
    }
  })
}

export function applyCoverageDefaults(quote: QuoteRecord): QuoteRecord {
  const nextPackages = syncAlbumFeatures(quote.packages, quote.coverage)
  const nextDeliverables = [
    ...quote.deliverables.filter(
      (item) => !/album/i.test(item) || /photo selection/i.test(item)
    ),
  ]
  const albumDeliverable = albumDeliverableForCoverage(quote.coverage)
  const insertIndex = Math.min(5, nextDeliverables.length)

  nextDeliverables.splice(insertIndex, 0, albumDeliverable)

  return {
    ...quote,
    packages: nextPackages,
    deliverables: nextDeliverables,
  }
}

export function createDefaultQuote(
  ownerEmail: string,
  creatorUserId = ""
): QuoteRecord {
  const now = new Date().toISOString()

  return applyCoverageDefaults({
    id: createId(),
    slug: createSlug(),
    status: "draft",
    lastActiveStatus: "draft",
    trashedAt: null,
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
    creatorUserId,
    ownerEmail,
    clientName: "",
    partnerName: "",
    quoteTitle: "Photography & Videography",
    location: "",
    coverage: "Both sides",
    eventRangeLabel: "",
    aboutTitle: "Crafting timeless wedding memories",
    aboutBody:
      "At The Tranquil Wedding, we bring together artistry and expertise to capture moments that feel authentic, elegant, and emotionally lasting. From intimate family ceremonies to larger wedding celebrations, we build photo and film coverage that preserves your story with warmth, clarity, and timeless detail.",
    events: [
      {
        id: createId(),
        date: "",
        title: "",
        location: "",
        coverage: "",
        guestCount: "",
        timing: "Full day",
        team: ["Photography", "Videography"],
      },
    ],
    includePreWedding: true,
    preWeddingLabel: "Prewedding",
    preWeddingPriceLabel: "Priced separately",
    preWeddingDate: "",
    preWeddingLocation: "",
    preWeddingTeam: [
      "Photographer",
      "Videographer",
      "Candid",
      "Cinematographer",
      "Drone",
    ],
    preWeddingDeliverables: [
      "30 to 50 best selected photographs with polished edits",
      "All raw photos and video footage",
      "Pre-wedding teaser film",
      "Main video with a runtime of up to 5 minutes",
      "Save the date countdown film",
      "Up to 6 reels for social sharing",
    ],
    packages: [
      createPackage({
        name: "Classic",
        subtitle:
          "An elegant essentials package for couples who want the full story covered with polished simplicity",
        badge: "Essential",
        recommended: false,
        basePrice: "125000",
        team: [
          "Traditional Photographer",
          "Traditional Videographer",
          "Candid Photographer",
        ],
        items: [
          "All raw photos and videos from every covered function",
          "300 carefully selected photographs with refined edits",
          "A 60-second wedding teaser for a quick first reveal",
          "Main wedding film crafted for complete story coverage",
          "30-sheet premium wedding album",
          "Custom e-invite video",
          "2 to 3 short-form reels for social sharing",
        ],
        specialFeatures: ["Warm and timeless edit style"],
      }),
      createPackage({
        name: "Signature",
        subtitle:
          "Our most balanced storytelling package with stronger edits, richer delivery, and standout presentation",
        badge: "Recommended",
        recommended: true,
        basePrice: "175000",
        team: [
          "Traditional Photographer",
          "Traditional Videographer",
          "Cinematic Videographer",
          "Candid Photographer",
          "Drone Operator",
        ],
        items: [
          "All raw photos and videos from the full celebration",
          "600 selected photographs with premium edits",
          "Highlights film with a cinematic emotional arc",
          "Main wedding film with fuller event storytelling",
          "Drone coverage for elevated cinematic moments",
          "4 to 5 reels for Instagram-ready moments",
          "AI face gallery scanner for fast guest discovery",
          "Custom e-invite video",
          "50-sheet signature album",
          "Photo frames for display-worthy keepsakes",
        ],
        specialFeatures: ["Best-value package for most wedding journeys"],
      }),
      createPackage({
        name: "Luxury",
        subtitle:
          "A fuller luxury experience built for larger celebrations, faster delivery, and the most complete keepsake set",
        badge: "Premium",
        recommended: false,
        basePrice: "250000",
        team: [
          "Traditional Photographer",
          "Traditional Videographer",
          "Cinematic Videographer",
          "Candid Photographer",
          "Drone Operator",
        ],
        items: [
          "All raw photos and videos from the entire wedding journey",
          "Unlimited selected edited photographs",
          "Teaser film delivered within 24 hours",
          "Highlight video delivered within 24 hours",
          "Main wedding film with the longest narrative cut",
          "Drone coverage for grand venue and celebration sweeps",
          "60-sheet luxury album",
          "AI face scanner gallery access",
          "Custom e-invite video",
          "Up to 8 reels across key celebration moments",
          "One day pre-wedding shoot in Delhi NCR",
        ],
        specialFeatures: [
          "Priority turnaround for marquee moments",
          "Most complete keepsake collection",
        ],
      }),
    ],
    deliverables: [
      "All ultra super resolution raw photos",
      "Best selected edited pictures handpicked with premium editing",
      "Full event documentary coverage",
      "60-second teaser within 24 hours",
      "5 to 6 minute cinematic short film",
      "4 to 5 reels for social media",
      "AI face scanner where included",
      "E-invite video",
    ],
    paymentTerms: [
      {
        id: createId(),
        label: "Advance payment",
        percentage: 40,
        description: "To confirm the booking and block the event dates",
      },
      {
        id: createId(),
        label: "Shoot completion",
        percentage: 50,
        description: "To be cleared after all shoots are completed",
      },
      {
        id: createId(),
        label: "Final payment",
        percentage: 10,
        description: "After delivery of all final edited photos and videos",
      },
    ],
    terms: [
      "Delivery of Photographs: We will provide all raw photographs within 4 to 5 days after settlement of outstanding dues. A selection of the best edited photos will be shared within 1 month after your final function.",
      "Album Delivery: The custom album will be provided within 30 days of your design approval and payment completion. Collection of the album and any pending dues must be completed from our office when the album is ready.",
      "Payment Schedule: We accept payments via net banking, UPI, or cash. Timely payments help us maintain an efficient workflow and deliver your memories faster.",
      "Waiting Charges: Waiting charges become applicable after 1 hour. An additional Rs. 15,000 per hour will be added to the total cost.",
      "Album Photo Selection: Please select your preferred photos for the album within one month of receiving the photobook preview. Delays may postpone delivery.",
      "Wedding Film Delivery: All wedding films will be edited and delivered within 20 days following your approval of the soundtrack. The editing timeline starts from the date of song approval.",
      "Rights and Social Media: We reserve the right to feature your event photos and videos on our social media platforms and portfolio.",
      "Photo Sharing Process: Edited photos and videos will be shared with you via Google Drive.",
      "Data Backup Responsibility: Post-delivery, the responsibility of backing up the photos rests with you. We are not liable for lost data after delivery.",
      "Cancellation Policy: In case of event cancellation for unforeseen reasons, the quotation cannot be revised and the advance payment is non-refundable.",
      "Portfolio Shoot Time Allocation: A minimum of 40 to 45 minutes is required for the bride and groom portfolio shoot. This session is scheduled before the phere ceremony.",
      "Post-Vidai Ceremony: Our team will depart for the studio after the vidaai unless it is discussed and agreed beforehand.",
    ],
    privacyPolicy: [
      "Final photos and videos are delivered digitally through Google Drive links shared with the client.",
      "We retain event media internally for editing, quality checks, and final delivery fulfilment.",
      "Clients are responsible for maintaining their own backup once final delivery is completed.",
      "Selected photos or videos may be used for portfolio and social media promotion unless otherwise agreed in writing.",
      "Media may be shared only with editing or delivery partners when required to fulfil the booked service.",
    ],
    contact: {
      email: "thetranquilwedding@gmail.com",
      website: "www.thetranquilwedding.com",
      phones: ["+91 8851610107", "+91 8700973346"],
      whatsapp: "+918851610107",
    },
  })
}

export function normalizeDiscountType(value: unknown): DiscountType {
  if (value === "percentage" || value === "flat") {
    return value
  }
  return "none"
}
