import type {
  QuoteEvent,
  QuotePackage,
  QuoteRecord,
  SalesProfile,
} from "@/lib/quotes/types"
import { quoteHeadline } from "@/lib/quotes/format"

export const quoteTheme = {
  colors: {
    forest: "#1C352D",
    forestSoft: "#294A3F",
    sage: "#A6B28B",
    blush: "#F5C9B0",
    ivory: "#F9F6F3",
    white: "#FFFFFF",
    text: "#26302B",
    supportText: "#58635D",
    mutedText: "#7A847E",
    line: "rgba(28, 53, 45, 0.14)",
    lineStrong: "#B9C2A8",
    surface: "#FFFDFC",
    surfaceSoft: "#F3EEE7",
  },
  typography: {
    display: "var(--font-quote-display)",
    body: "var(--font-quote-body)",
    accent: "var(--font-quote-accent)",
  },
  spacing: {
    outerRadius: "2rem",
    sectionRadius: "1.4rem",
    cardRadius: "1rem",
  },
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

export function isCeremonyArrangementEvent(title: string) {
  const normalized = normalizeText(title)
  return normalized === "haldi" || normalized === "mehandi"
}

export function getCeremonyArrangementLabel(value: string) {
  if (value === "combined") return "Combined ceremony for bride and groom"
  if (value === "separate") return "Separate ceremonies for bride and groom"
  return null
}

function pluralize(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`
}

export function getQuoteCoverageStats(quote: QuoteRecord) {
  const eventCount = quote.events.length
  const datedEvents = quote.events.filter((event) => event.date.trim())
  const dayCount = new Set(datedEvents.map((event) => event.date.trim())).size

  return {
    eventCount,
    dayCount,
    hasCompleteDates: datedEvents.length === eventCount && dayCount > 0,
  }
}

export function getQuoteCoverageSummary(quote: QuoteRecord) {
  const { eventCount, dayCount, hasCompleteDates } =
    getQuoteCoverageStats(quote)

  if (!eventCount) {
    return "Coverage to be planned"
  }

  if (!dayCount) {
    return `${pluralize(eventCount, "event", "events")} • dates to be finalized`
  }

  if (!hasCompleteDates) {
    return `${pluralize(eventCount, "event", "events")} across ${pluralize(dayCount, "day", "days")} • dates to be finalized`
  }

  return `${pluralize(eventCount, "event", "events")} across ${pluralize(dayCount, "day", "days")}`
}

export function getPackageDeliverables(pkg: QuotePackage) {
  return pkg.items.filter((item) => item.trim())
}

export function getQuoteSummaryRows(quote: QuoteRecord) {
  return [
    {
      label: "Clients",
      value:
        [quote.clientName, quote.partnerName].filter(Boolean).join(" & ") ||
        "To be updated",
    },
    {
      label: "Location",
      value: quote.location || "Location to be updated",
    },
    {
      label: "Coverage",
      value: quote.coverage || "Both sides",
    },
    {
      label: "Coverage Plan",
      value: getQuoteCoverageSummary(quote),
    },
    {
      label: "Date Range",
      value: quote.eventRangeLabel || "Custom schedule",
    },
  ]
}

export function getQuoteWhatsAppHref(value: string) {
  return `https://wa.me/${value.replace(/[^\d]/g, "")}`
}

export function getQuoteWhatsAppMessageHref(value: string, message: string) {
  const phone = value.replace(/[^\d]/g, "")
  const query = new URLSearchParams({ text: message })
  return `https://wa.me/${phone}?${query.toString()}`
}

export function getQuoteReserveMessage(quote: QuoteRecord) {
  return `We'd like to reserve our date for ${quoteHeadline(quote)}. Please guide us with the next step.`
}

export function getQuoteDiscussionMessage(quote: QuoteRecord) {
  return `We reviewed the quotation for ${quoteHeadline(quote)} and want to discuss the package.`
}

export function getSalesProfileRoleLine(profile: SalesProfile | null) {
  const title = profile?.title.trim() || "Wedding Consultant"
  return `${title} @ The Tranquil Wedding`
}

export function getSalesProfileInitials(profile: SalesProfile | null) {
  const name = profile?.displayName.trim()
  if (!name) {
    return "TTW"
  }

  const tokens = name.split(/\s+/).filter(Boolean)
  return tokens
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("")
}

export function splitList(items: string[], size: number) {
  const groups: string[][] = []

  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size))
  }

  return groups
}

export function getEventImageObjectPosition(event: QuoteEvent) {
  if (event.image.source === "media") {
    return "center center"
  }

  const title = normalizeText(event.title)

  if (
    title.includes("reception") ||
    (event.image.source === "asset" &&
      event.image.assetKey === "event-reception")
  ) {
    return "center 30%"
  }

  if (
    title.includes("devgon") ||
    title.includes("dev gon") ||
    (event.image.source === "asset" && event.image.assetKey === "event-devgon")
  ) {
    return "center 18%"
  }

  if (
    title.includes("haldi") ||
    title.includes("mehendi") ||
    title.includes("mehandi")
  ) {
    return "center 35%"
  }

  if (
    title.includes("wedding") ||
    title.includes("phere") ||
    title.includes("phera")
  ) {
    return "center 42%"
  }

  if (title.includes("pre wedding") || title.includes("prewedding")) {
    return "center 30%"
  }

  return "center center"
}
