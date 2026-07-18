import Image from "next/image"

import {
  formatInvoiceCurrency,
  formatInvoiceHeaderDate,
  formatInvoiceRowDate,
  invoiceTheme,
  resolveAmountInWords,
  resolveInvoiceBalanceDue,
  resolveInvoiceCurrentAmount,
  resolveInvoicePackageTotal,
} from "@/lib/invoices/presentation"
import type { InvoiceRecord } from "@/lib/invoices/types"
import { cn } from "@/lib/utils"

type InvoicePreviewProps = {
  invoice: InvoiceRecord
  className?: string
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-[#e8e8e8] py-4 text-lg">
      <span className={cn("text-[#202020]", strong && "font-semibold")}>
        {label}
      </span>
      <span
        className={cn("text-right text-[#202020]", strong && "font-semibold")}
      >
        {value}
      </span>
    </div>
  )
}

function SignatureBlock({ invoice }: { invoice: InvoiceRecord }) {
  const hasSignature = invoice.signatory.signatureImagePath.trim()

  return (
    <div className="flex flex-col items-end">
      {hasSignature ? (
        <div className="relative h-20 w-48">
          <Image
            src={invoice.signatory.signatureImagePath}
            alt={invoice.signatory.name || invoice.signatory.label}
            fill
            className="object-contain object-right"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex h-20 w-48 items-center justify-center border-b border-dashed border-[#97a29a] text-sm text-[#54655a] italic">
          Signature placeholder
        </div>
      )}
      <div className="mt-4 text-right">
        {invoice.signatory.name ? (
          <div className="text-sm font-semibold tracking-[0.14em] text-[#31453b] uppercase">
            {invoice.signatory.name}
          </div>
        ) : null}
        {invoice.signatory.title ? (
          <div className="mt-1 text-sm text-[#31453b]">
            {invoice.signatory.title}
          </div>
        ) : null}
        <div className="mt-3 text-[1.05rem] font-semibold tracking-[0.12em] text-[#111111] uppercase">
          {invoice.signatory.label}
        </div>
      </div>
    </div>
  )
}

function TermsPagePreview({ invoice }: { invoice: InvoiceRecord }) {
  const policyItems = [...invoice.terms, ...invoice.privacyPolicy]
  const leftColumn = policyItems.filter((_, index) => index % 2 === 0)
  const rightColumn = policyItems.filter((_, index) => index % 2 === 1)

  return (
      <div className="mt-8 overflow-hidden bg-white shadow-[0_28px_80px_rgba(29,45,34,0.08)]">
      <div className="aspect-[0.7727] w-full bg-white px-8 py-6 md:px-12 md:py-8">
        <div className="text-center">
          <div className="text-[0.68rem] tracking-[0.18em] text-[#666666] uppercase">
            Terms
          </div>
          <h2 className="mt-2 font-serif text-4xl text-[#1E542A]">
            Payment milestones and conditions
          </h2>
        </div>

        <div className="mt-5 rounded-[1.25rem] bg-[#1E542A] px-4 py-4 text-white">
          <h3 className="font-serif text-2xl">Payment milestones</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {invoice.paymentTerms.map((term, index) => (
              <div
                key={term.id}
                className="rounded-xl bg-white/6 px-3 py-3"
              >
                <div className="font-serif text-2xl text-[#D7B448]">
                  {term.percentage}%
                </div>
                <div className="mt-1">
                  <div className="text-[0.6rem] tracking-[0.14em] text-[#b9c9bb] uppercase">
                    Milestone {index + 1}
                  </div>
                  <div className="mt-1 font-serif text-lg">{term.label}</div>
                  <div className="mt-1 text-[0.72rem] leading-4 text-white/80">
                    {term.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {[leftColumn, rightColumn].map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-2">
              {column.map((term, index) => {
                const number = columnIndex + index * 2 + 1
                return (
                  <div key={`${term}-${number}`}>
                    <div className="flex items-baseline gap-2 text-[0.72rem] font-semibold tracking-[0.08em] text-[#1E542A] uppercase">
                      <span className="font-serif text-2xl text-[#D7B448]">
                        {String(number).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[0.78rem] leading-4 text-[#202020]">
                      {term}
                    </p>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function InvoicePreview({ invoice, className }: InvoicePreviewProps) {
  const packageTotal = resolveInvoicePackageTotal(invoice)
  const currentInvoiceAmount = resolveInvoiceCurrentAmount(invoice)
  const balanceDue = resolveInvoiceBalanceDue(invoice)
  const amountInWords = resolveAmountInWords(invoice)
  const address = invoice.studio.addressLines.filter(Boolean)

  return (
    <div
      className={cn(
        "overflow-hidden bg-transparent",
        className
      )}
      style={{
        color: invoiceTheme.colors.text,
      }}
    >
      <div className="overflow-hidden bg-white shadow-[0_28px_80px_rgba(29,45,34,0.08)]">
        <div className="aspect-[0.7727] w-full bg-white px-10 py-8 md:px-14 md:py-10">
        <div className="flex items-start justify-between gap-8">
          <div className="max-w-[19rem]">
            <h1 className="max-w-[13rem] text-5xl leading-[0.95] font-semibold text-[#1E542A]">
              {invoice.studio.name}
            </h1>
            <div className="mt-8 space-y-1 text-[1.1rem] leading-8 text-[#202020]">
              {address.map((line, index) => (
                <div key={`${line}-${index}`}>{line}</div>
              ))}
            </div>
          </div>
          <div className="relative h-40 w-40 overflow-hidden rounded-[2rem] bg-[#1E542A] p-4">
            <Image
              src={invoice.studio.logoPath || "/brand/logo.png"}
              alt={invoice.studio.name}
              fill
              className="object-contain p-4"
              unoptimized
            />
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-8">
          <div>
            <div className="text-[0.95rem] tracking-[0.22em] text-[#666666] uppercase">
              Bill To
            </div>
            <div className="mt-3 text-4xl leading-tight font-semibold text-[#101010]">
              {invoice.clientName || "Client name"}
            </div>
          </div>
          <div className="text-right">
            <div className="font-serif text-6xl tracking-[0.08em] text-[#121212]">
              INVOICE / RECEIPT
            </div>
            <div className="mt-8 text-[1.35rem] text-[#202020]">
              Date: {formatInvoiceHeaderDate(invoice.invoiceDate)}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-[1.8fr_0.8fr_0.7fr] gap-6 border-b border-[#d8d8d8] pb-4 text-lg font-semibold text-[#101010]">
            <div>Payment Distribution</div>
            <div className="text-center">Event Date</div>
            <div className="text-right">Installment</div>
          </div>
          <div>
            {invoice.installments.map((installment, index) => {
              const highlighted = index === 0 || installment.amount.trim()

              return (
                <div
                  key={installment.id}
                  className="grid grid-cols-[1.8fr_0.8fr_0.7fr] gap-6 border-b border-[#ececec] py-5"
                >
                  <div
                    className={cn(
                      "text-[1.2rem] text-[#202020]",
                      highlighted && "text-2xl font-semibold uppercase"
                    )}
                  >
                    {installment.label || "Installment label"}
                  </div>
                  <div className="text-center text-[1.2rem] text-[#202020]">
                    {formatInvoiceRowDate(installment.eventDate)}
                  </div>
                  <div
                    className={cn(
                      "text-right text-[1.2rem] text-[#202020]",
                      installment.amount.trim() && "font-semibold"
                    )}
                  >
                    {formatInvoiceCurrency(installment.amount, "-")}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-[1.7fr_0.95fr] gap-12">
          <div>
            <div className="border-t border-[#eeeeee] pt-4">
              <div className="text-[1.35rem] leading-8 text-[#202020]">
                <span className="font-semibold">Amount in words :</span>{" "}
                {amountInWords}
              </div>
            </div>

            <div className="mt-12">
              <div className="text-[1.2rem] font-semibold uppercase underline underline-offset-4">
                Bank Account Details:
              </div>
              <div className="mt-5 grid grid-cols-[1fr_1.5fr] gap-x-10 gap-y-2 text-[1.12rem] leading-8 text-[#202020]">
                <div>BANK NAME</div>
                <div>{invoice.bankDetails.bankName}</div>
                <div>ACC. HOLDER NAME</div>
                <div>{invoice.bankDetails.accountHolderName}</div>
                <div>BRANCH ADDRESS</div>
                <div>{invoice.bankDetails.branchAddress}</div>
                <div>ACCOUNT NO.</div>
                <div>{invoice.bankDetails.accountNumber}</div>
                <div>IFSC</div>
                <div>{invoice.bankDetails.ifsc}</div>
                <div>ACCOUNT TYPE</div>
                <div>{invoice.bankDetails.accountType}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div className="ml-auto w-full max-w-[18rem]">
              <SummaryRow
                label="Package Total"
                value={formatInvoiceCurrency(packageTotal, "Rs. 0")}
                strong
              />
              <SummaryRow
                label="Payment Received"
                value={formatInvoiceCurrency(currentInvoiceAmount, "Rs. 0")}
              />
              <SummaryRow
                label="Balance Due"
                value={formatInvoiceCurrency(balanceDue, "Rs. 0")}
              />
            </div>
            <div className="mt-12">
              <SignatureBlock invoice={invoice} />
            </div>
          </div>
        </div>
        </div>

        <div className="grid grid-cols-3 gap-6 bg-[#1E542A] px-8 py-5 text-center text-[1.05rem] tracking-[0.14em] text-white md:px-14">
          <div>{invoice.footerContact.website}</div>
          <div>{invoice.footerContact.phone}</div>
          <div>{invoice.footerContact.email}</div>
        </div>
      </div>
      <TermsPagePreview invoice={invoice} />
    </div>
  )
}
