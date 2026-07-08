import type { DiscountType, QuotePackage, QuoteRecord } from "@/lib/quotes/types"

function parseAmount(value: string) {
  const numeric = Number(value.replace(/[^\d.]/g, ""))
  if (Number.isNaN(numeric) || numeric < 0) {
    return 0
  }
  return numeric
}

export function formatCurrency(value: string | number) {
  const numeric = typeof value === "number" ? value : parseAmount(value)
  if (!numeric || numeric <= 0) {
    return typeof value === "string" && value ? `Rs. ${value}` : "Price on request"
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric)
}

export function formatDateLabel(value: string) {
  if (!value) return "Date to be confirmed"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

export function quoteHeadline(quote: QuoteRecord) {
  const names = [quote.clientName, quote.partnerName].filter(Boolean).join(" & ")
  if (!names) return quote.quoteTitle
  return `${names} ${quote.quoteTitle}`
}

export function applyDiscount(basePrice: string, discountType: DiscountType, discountValue: string) {
  const base = parseAmount(basePrice)
  const amount = parseAmount(discountValue)

  if (!base || discountType === "none" || !amount) {
    return {
      base,
      final: base,
      applied: false,
      savings: 0,
    }
  }

  const savings = discountType === "percentage" ? Math.min(base, Math.round((base * amount) / 100)) : Math.min(base, amount)
  const final = Math.max(0, base - savings)

  return {
    base,
    final,
    applied: savings > 0,
    savings,
  }
}

export function computePackagePricing(pkg: QuotePackage) {
  const discount = applyDiscount(pkg.basePrice, pkg.discountType, pkg.discountValue)
  return {
    ...discount,
    finalPrice: String(discount.final),
  }
}

export function syncPackagePricing<T extends QuotePackage>(pkg: T): T {
  const pricing = computePackagePricing(pkg)
  return {
    ...pkg,
    finalPrice: pricing.finalPrice,
  }
}
