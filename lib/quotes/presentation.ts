import fs from "node:fs"
import path from "node:path"

import type { QuoteEvent, QuoteRecord } from "@/lib/quotes/types"
export {
  getEventImageObjectPosition,
  getCeremonyArrangementLabel,
  getPackageDeliverables,
  getQuoteCoverageStats,
  getQuoteCoverageSummary,
  getQuoteDiscussionMessage,
  getQuoteReserveMessage,
  getQuoteSummaryRows,
  getQuoteWhatsAppHref,
  getQuoteWhatsAppMessageHref,
  getSalesProfileInitials,
  getSalesProfileRoleLine,
  isCeremonyArrangementEvent,
  quoteTheme,
  splitList,
} from "@/lib/quotes/presentation-shared"

function picsum(seed: string, width: number, height: number) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

const quoteAssetsDir = path.join(process.cwd(), "public", "quote-assets")
const supportedExtensions = [".jpg", ".jpeg", ".png", ".webp"]

type QuoteAssetFile = {
  baseName: string
  fileName: string
}

function readQuoteAssetFiles() {
  if (!fs.existsSync(quoteAssetsDir)) {
    return []
  }

  return fs
    .readdirSync(quoteAssetsDir)
    .map((fileName) => {
      const extension = path.extname(fileName)

      if (!supportedExtensions.includes(extension.toLowerCase())) {
        return null
      }

      return {
        fileName,
        baseName: path.basename(fileName, extension).toLowerCase(),
      }
    })
    .filter((file): file is QuoteAssetFile => file !== null)
}

const quoteAssetFiles = readQuoteAssetFiles()

function resolveAsset(
  name: string,
  fallbackSeed: string,
  width: number,
  height: number
) {
  const matched = quoteAssetFiles.find(
    (file) => file.baseName === name.toLowerCase()
  )

  if (matched) {
    return `/quote-assets/${matched.fileName}`
  }

  return picsum(fallbackSeed, width, height)
}

export const quoteAssetNames = {
  fixed: [
    "hero",
    "about",
    "cover-secondary",
    "cover-detail",
    "package-hero",
    "prewedding",
    "closing",
    "gallery-1",
    "gallery-2",
    "gallery-3",
    "gallery-4",
    "gallery-5",
    "gallery-6",
  ],
  events: [
    "event-engagement",
    "event-haldi",
    "event-mehendi",
    "event-choora",
    "event-cocktail",
    "event-prewedding",
    "event-wedding",
    "event-bhaat",
    "event-paath",
  ],
} as const

const reservedAssetNames = new Set<string>([
  ...quoteAssetNames.fixed,
  ...quoteAssetNames.events,
])

const extraGalleryAssets = quoteAssetFiles
  .filter((file) => !reservedAssetNames.has(file.baseName))
  .map((file) => `/quote-assets/${file.fileName}`)

export const quoteImageConfig = {
  hero: resolveAsset("hero", "ttw-hero-cover", 1600, 1040),
  about: resolveAsset("about", "ttw-about-editorial", 1200, 1400),
  packageHero: resolveAsset("package-hero", "ttw-package-banner", 1400, 760),
  preWedding: resolveAsset("prewedding", "ttw-prewedding", 1200, 900),
  closing: resolveAsset("closing", "ttw-closing-frame", 1200, 900),
  coverSecondary: resolveAsset("cover-secondary", "ttw-gallery-2", 1000, 760),
  coverDetail: resolveAsset("cover-detail", "ttw-gallery-3", 1000, 760),
  gallery: [
    resolveAsset("gallery-1", "ttw-gallery-1", 1000, 760),
    resolveAsset("gallery-2", "ttw-gallery-2", 1000, 760),
    resolveAsset("gallery-3", "ttw-gallery-3", 1000, 760),
    extraGalleryAssets[0] ??
      resolveAsset("gallery-4", "ttw-gallery-4", 1000, 760),
    extraGalleryAssets[1] ??
      resolveAsset("gallery-5", "ttw-gallery-5", 1000, 760),
    extraGalleryAssets[2] ??
      resolveAsset("gallery-6", "ttw-gallery-6", 1000, 760),
  ],
  eventKeywordSeeds: [
    {
      keywords: ["paath", "path", "pat"],
      name: "event-paath",
      seed: "ttw-event-paath",
    },
    {
      keywords: ["engagement", "ring", "sagai"],
      name: "event-engagement",
      seed: "ttw-event-engagement",
    },
    {
      keywords: ["haldi", "maiyaa", "maiya"],
      name: "event-haldi",
      seed: "ttw-event-haldi",
    },
    {
      keywords: ["mehendi", "mehandi"],
      name: "event-mehendi",
      seed: "ttw-event-mehendi",
    },
    {
      keywords: ["choora", "chooda"],
      name: "event-choora",
      seed: "ttw-event-choora",
    },
    {
      keywords: ["cocktail", "sangeet"],
      name: "event-cocktail",
      seed: "ttw-event-cocktail",
    },
    {
      keywords: ["pre wedding", "prewedding", "couple"],
      name: "event-prewedding",
      seed: "ttw-event-prewedding",
    },
    {
      keywords: ["wedding", "phere", "phera", "anand karaj", "reception"],
      name: "event-wedding",
      seed: "ttw-event-wedding",
    },
    {
      keywords: ["bhaat", "lagan", "sagan"],
      name: "event-bhaat",
      seed: "ttw-event-bhaat",
    },
  ],
}

export function getEventImage(event: QuoteEvent, index: number) {
  const title = event.title.trim().toLowerCase()
  const matched = quoteImageConfig.eventKeywordSeeds.find((entry) =>
    entry.keywords.some((keyword) => title.includes(keyword))
  )

  if (matched) {
    return resolveAsset(matched.name, matched.seed, 1200, 900)
  }

  return quoteImageConfig.gallery[index % quoteImageConfig.gallery.length]
}

export function getQuoteImageSlots(quote: QuoteRecord) {
  const eventImages = quote.events.map((event, index) =>
    getEventImage(event, index)
  )

  return {
    hero: quoteImageConfig.hero,
    coverSecondary: quoteImageConfig.coverSecondary,
    coverDetail: quoteImageConfig.coverDetail,
    about: quoteImageConfig.about,
    packageHero: quoteImageConfig.packageHero,
    preWedding: quoteImageConfig.preWedding,
    closing: quoteImageConfig.closing,
    gallery: quoteImageConfig.gallery,
    eventImages,
  }
}
