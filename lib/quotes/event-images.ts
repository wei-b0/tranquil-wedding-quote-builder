import type { QuoteEvent, QuoteEventImage } from "@/lib/quotes/types"

export const quoteEventImageAssets = [
  {
    key: "event-engagement",
    label: "Engagement",
    src: "/quote-assets/event-engagement.jpg",
    keywords: ["engagement", "ring", "sagai"],
  },
  {
    key: "event-haldi",
    label: "Haldi",
    src: "/quote-assets/event-haldi.png",
    keywords: ["haldi", "maiyaa", "maiya"],
  },
  {
    key: "event-mehendi",
    label: "Mehendi",
    src: "/quote-assets/event-mehendi.png",
    keywords: ["mehendi", "mehandi"],
  },
  {
    key: "event-choora",
    label: "Choora",
    src: "/quote-assets/event-choora.jpg",
    keywords: ["choora", "chooda"],
  },
  {
    key: "event-cocktail",
    label: "Cocktail / Sangeet",
    src: "/quote-assets/event-cocktail.JPG",
    keywords: ["cocktail", "sangeet"],
  },
  {
    key: "event-prewedding",
    label: "Prewedding",
    src: "/quote-assets/event-prewedding.jpg",
    keywords: ["pre wedding", "prewedding", "couple"],
  },
  {
    key: "event-reception",
    label: "Reception",
    src: "/quote-assets/event-reception.jpg",
    keywords: ["reception"],
  },
  {
    key: "event-devgon",
    label: "Devgon",
    src: "/quote-assets/event-devgon.jpg",
    keywords: ["devgon", "dev gon"],
  },
  {
    key: "event-wedding",
    label: "Wedding",
    src: "/quote-assets/event-wedding.jpg",
    keywords: ["wedding", "phere", "phera", "anand karaj"],
  },
  {
    key: "event-bhaat",
    label: "Bhaat / Lagan",
    src: "/quote-assets/event-bhaat.jpg",
    keywords: ["bhaat", "lagan", "sagan"],
  },
  {
    key: "event-paath",
    label: "Paath",
    src: "/quote-assets/event-paath.jpg",
    keywords: ["paath", "path", "pat"],
  },
] as const

const quoteEventFallbackAssets = [
  { key: "event-fallback-5", src: "/quote-assets/5.jpg" },
  { key: "event-fallback-9", src: "/quote-assets/9.jpg" },
  { key: "event-fallback-10", src: "/quote-assets/10.jpg" },
  { key: "event-fallback-13", src: "/quote-assets/13.jpg" },
] as const

const matchingEventImageAssets = [
  quoteEventImageAssets.find((asset) => asset.key === "event-paath")!,
  ...quoteEventImageAssets.filter((asset) => asset.key !== "event-paath"),
]

function stableHash(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash
}

export function getAutomaticEventImage(
  event: Pick<QuoteEvent, "id" | "title">
) {
  const title = event.title.trim().toLowerCase()
  const matched = matchingEventImageAssets.find((asset) =>
    asset.keywords.some((keyword) => title.includes(keyword))
  )

  if (matched) {
    return matched.src
  }

  return quoteEventFallbackAssets[
    stableHash(event.id) % quoteEventFallbackAssets.length
  ].src
}

export function getEventImageAsset(assetKey: string) {
  return quoteEventImageAssets.find((asset) => asset.key === assetKey) ?? null
}

export function isAllowedEventMediaUrl(value: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  return Boolean(
    supabaseUrl &&
    value.startsWith(
      `${supabaseUrl}/storage/v1/object/public/quote-event-images/`
    )
  )
}

export function getEventImageSrc(
  event: Pick<QuoteEvent, "id" | "title" | "image">
) {
  if (event.image.source === "asset") {
    const asset = getEventImageAsset(event.image.assetKey)
    if (asset) return asset.src
  }

  if (
    event.image.source === "media" &&
    isAllowedEventMediaUrl(event.image.url)
  ) {
    return event.image.url
  }

  return getAutomaticEventImage(event)
}

export function normalizeEventImage(value: unknown): QuoteEventImage {
  if (!value || typeof value !== "object") return { source: "auto" }

  const image = value as Partial<QuoteEventImage> & {
    assetKey?: unknown
    mediaId?: unknown
    url?: unknown
  }

  if (
    image.source === "asset" &&
    typeof image.assetKey === "string" &&
    getEventImageAsset(image.assetKey)
  ) {
    return { source: "asset", assetKey: image.assetKey }
  }

  if (
    image.source === "media" &&
    typeof image.mediaId === "string" &&
    image.mediaId &&
    typeof image.url === "string" &&
    isAllowedEventMediaUrl(image.url)
  ) {
    return { source: "media", mediaId: image.mediaId, url: image.url }
  }

  return { source: "auto" }
}
