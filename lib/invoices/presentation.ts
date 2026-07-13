import { formatDateLabel, parseAmount } from "@/lib/quotes/format"
import type { InvoiceRecord } from "@/lib/invoices/types"

export const invoiceTheme = {
  colors: {
    forest: "#1E542A",
    forestSoft: "#2C6535",
    gold: "#D7B448",
    text: "#161616",
    muted: "#666666",
    line: "#DCDCDC",
    page: "#FFFFFF",
    footer: "#1E542A",
  },
  fonts: {
    display: "var(--font-quote-display)",
    body: "var(--font-quote-body)",
  },
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatInvoiceCurrency(value: string | number, fallback = "-") {
  const numeric = typeof value === "number" ? value : parseAmount(value)
  if (!numeric) {
    return typeof value === "string" && value.trim()
      ? `Rs. ${value.trim()}`
      : fallback
  }
  return `Rs. ${formatNumber(numeric)}`
}

function ordinalSuffix(value: number) {
  const mod100 = value % 100
  if (mod100 >= 11 && mod100 <= 13) return "th"
  const mod10 = value % 10
  if (mod10 === 1) return "st"
  if (mod10 === 2) return "nd"
  if (mod10 === 3) return "rd"
  return "th"
}

export function formatInvoiceRowDate(value: string) {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  const day = parsed.getDate()
  const month = parsed.toLocaleString("en-IN", { month: "short" })
  return `${day}${ordinalSuffix(day)} ${month}`
}

export function formatInvoiceHeaderDate(value: string) {
  if (!value) return formatDateLabel(new Date().toISOString())
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

export function getInstallmentTotal(invoice: InvoiceRecord) {
  return invoice.installments.reduce(
    (sum, installment) => sum + parseAmount(installment.amount),
    0
  )
}

export function resolveInvoiceSubtotal(invoice: InvoiceRecord) {
  const explicit = parseAmount(invoice.subtotal)
  return explicit || getInstallmentTotal(invoice)
}

export function resolveInvoiceTotal(invoice: InvoiceRecord) {
  const explicit = parseAmount(invoice.total)
  return explicit || resolveInvoiceSubtotal(invoice)
}

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
]

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
]

function numberBelowThousandToWords(value: number) {
  const hundreds = Math.floor(value / 100)
  const remainder = value % 100
  const parts: string[] = []

  if (hundreds) {
    parts.push(`${ONES[hundreds]} Hundred`)
  }

  if (remainder < 20) {
    if (remainder) parts.push(ONES[remainder])
  } else {
    const tens = Math.floor(remainder / 10)
    const ones = remainder % 10
    parts.push(TENS[tens])
    if (ones) parts.push(ONES[ones])
  }

  return parts.join(" ").trim()
}

function numberToIndianWords(value: number) {
  if (!value) return "Zero"

  const units = [
    { value: 10000000, label: "Crore" },
    { value: 100000, label: "Lakh" },
    { value: 1000, label: "Thousand" },
  ]

  let remainder = Math.floor(value)
  const parts: string[] = []

  for (const unit of units) {
    if (remainder >= unit.value) {
      const unitCount = Math.floor(remainder / unit.value)
      parts.push(
        `${numberBelowThousandToWords(unitCount)} ${unit.label}`.trim()
      )
      remainder %= unit.value
    }
  }

  if (remainder) {
    parts.push(numberBelowThousandToWords(remainder))
  }

  return parts.join(" ").trim()
}

export function resolveAmountInWords(invoice: InvoiceRecord) {
  if (invoice.amountInWords.trim()) return invoice.amountInWords.trim()
  return `${numberToIndianWords(resolveInvoiceTotal(invoice))} Rupees only/-`
}
