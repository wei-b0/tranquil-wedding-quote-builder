"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react"

import { PdfExportLink } from "@/components/pdf-export-link"
import { ToastOnMount } from "@/components/toast-on-mount"
import { Button } from "@/components/ui/button"
import {
  resolveAmountInWords,
  resolveInvoiceBalanceDue,
  resolveInvoiceCurrentAmount,
  resolveInvoicePackageTotal,
} from "@/lib/invoices/presentation"
import { parseAmount } from "@/lib/quotes/format"
import type {
  InvoiceInstallmentRow,
  InvoicePaymentMilestone,
  InvoiceRecord,
} from "@/lib/invoices/types"

type InvoiceEditorProps = {
  initialInvoice: InvoiceRecord
  saveAction: (formData: FormData) => void
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-2 text-sm text-[#5e5a54]">
      <span className="font-medium text-[#39362f]">{label}</span>
      {children}
    </label>
  )
}

function inputClassName() {
  return "w-full rounded-2xl border border-[#ddd7cc] bg-white px-4 py-3 text-sm text-[#39362f] outline-none transition focus:border-[#f3c747]"
}

function sectionCardClassName() {
  return "rounded-[1.85rem] border border-[#ddd7cc] bg-[linear-gradient(180deg,#ffffff,#fcfaf5)] p-5 shadow-[0_18px_45px_rgba(72,60,39,0.05)]"
}

function addButtonClassName() {
  return "rounded-full bg-[#6f7f68] px-4 py-2 text-sm font-medium text-white hover:bg-[#65755e] hover:text-white"
}

function syncInvoiceSummary(
  invoice: InvoiceRecord,
  updates: Partial<InvoiceRecord>
): InvoiceRecord {
  const next = { ...invoice, ...updates }
  const balanceDue = String(
    Math.max(parseAmount(next.packageTotal) - parseAmount(next.currentInvoiceAmount), 0)
  )

  return {
    ...next,
    balanceDue,
  }
}

function InstallmentEditor({
  installment,
  onChange,
  onRemove,
  canRemove,
}: {
  installment: InvoiceInstallmentRow
  onChange: (installment: InvoiceInstallmentRow) => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <div className="rounded-[1.45rem] border border-[#ddd7cc] bg-[#f9f7f2] p-4">
      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.6fr] xl:grid-cols-[1.4fr_0.9fr_0.7fr]">
        <Field label="Installment label">
          <input
            className={inputClassName()}
            value={installment.label}
            onChange={(event) =>
              onChange({ ...installment, label: event.target.value })
            }
          />
        </Field>
        <Field label="Event date">
          <input
            type="date"
            className={inputClassName()}
            value={installment.eventDate}
            onChange={(event) =>
              onChange({ ...installment, eventDate: event.target.value })
            }
          />
        </Field>
        <Field label="Amount">
          <input
            inputMode="numeric"
            className={inputClassName()}
            value={installment.amount}
            onChange={(event) =>
              onChange({ ...installment, amount: event.target.value })
            }
          />
        </Field>
      </div>
      {canRemove ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="text-sm text-[#857a63]"
            onClick={onRemove}
          >
            Remove installment
          </button>
        </div>
      ) : null}
    </div>
  )
}

function PaymentMilestoneEditor({
  term,
  onChange,
  onRemove,
  canRemove,
}: {
  term: InvoicePaymentMilestone
  onChange: (term: InvoicePaymentMilestone) => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <div className="grid gap-4 rounded-[1.45rem] border border-[#ddd7cc] bg-[#f9f7f2] p-4 md:grid-cols-[1fr_130px]">
      <div className="space-y-4">
        <Field label="Label">
          <input
            className={inputClassName()}
            value={term.label}
            onChange={(event) =>
              onChange({ ...term, label: event.target.value })
            }
          />
        </Field>
        <Field label="Description">
          <input
            className={inputClassName()}
            value={term.description}
            onChange={(event) =>
              onChange({ ...term, description: event.target.value })
            }
          />
        </Field>
      </div>
      <div className="space-y-4">
        <Field label="Percent">
          <input
            type="number"
            className={inputClassName()}
            value={term.percentage}
            onChange={(event) =>
              onChange({ ...term, percentage: Number(event.target.value || 0) })
            }
          />
        </Field>
        {canRemove ? (
          <button
            type="button"
            className="text-sm text-[#857a63]"
            onClick={onRemove}
          >
            Remove milestone
          </button>
        ) : null}
      </div>
    </div>
  )
}

function RowsEditor({
  label,
  values,
  onChange,
  addLabel,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  addLabel: string
}) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[#39362f]">{label}</span>
        <button
          type="button"
          className={addButtonClassName()}
          onClick={() => onChange([...values, ""])}
        >
          {addLabel}
        </button>
      </div>
      {values.map((value, index) => (
        <div
          key={`${label}-${index}`}
          className="grid gap-3 rounded-[1.45rem] border border-[#ddd7cc] bg-[#f9f7f2] p-4"
        >
          <textarea
            className={`${inputClassName()} min-h-28`}
            value={value}
            onChange={(event) =>
              onChange(
                values.map((entry, entryIndex) =>
                  entryIndex === index ? event.target.value : entry
                )
              )
            }
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-[#857a63]"
              onClick={() =>
                onChange(
                  values.length > 1
                    ? values.filter((_, entryIndex) => entryIndex !== index)
                    : values
                )
              }
            >
              Remove row
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function SaveActions({
  invoiceId,
  onOpenPreview,
}: {
  invoiceId: string
  onOpenPreview: () => void
}) {
  const { pending } = useFormStatus()

  return (
    <section className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-[#ddd7cc] bg-white/90 p-4 shadow-[0_18px_45px_rgba(48,32,20,0.12)] backdrop-blur">
      <Button
        type="submit"
        disabled={pending}
        className="bg-[#6f7f68] text-white hover:bg-[#65755e] hover:text-white"
      >
        {pending ? <Loader2 className="animate-spin" /> : null}
        Save draft
      </Button>
      <Button
        type="button"
        variant="outline"
        className="hover:text-[#39362f]"
        onClick={onOpenPreview}
      >
        Preview PDF
      </Button>
      <PdfExportLink
        href={`/api/invoices/${invoiceId}/pdf`}
        className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap text-foreground transition-all hover:bg-muted hover:text-foreground"
      >
        Open PDF
      </PdfExportLink>
    </section>
  )
}

export function InvoiceEditor({
  initialInvoice,
  saveAction,
}: InvoiceEditorProps) {
  const [invoice, setInvoice] = useState<InvoiceRecord>(initialInvoice)
  const [isStudioOpen, setIsStudioOpen] = useState(false)
  const [isBankOpen, setIsBankOpen] = useState(false)
  const [isSignatoryOpen, setIsSignatoryOpen] = useState(false)
  const [isLegalOpen, setIsLegalOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [showSavedToast] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("saved") === "1"
  )
  const packageTotal = resolveInvoicePackageTotal(invoice)
  const currentInvoiceAmount = resolveInvoiceCurrentAmount(invoice)
  const balanceDue = resolveInvoiceBalanceDue(invoice)
  const amountInWords = resolveAmountInWords(invoice)

  return (
    <div className="min-w-0">
      <form action={saveAction} className="space-y-5">
        <input
          type="hidden"
          name="payload"
          value={JSON.stringify(invoice)}
          readOnly
        />
        <input type="hidden" name="intent" value="draft" readOnly />

        <section className={sectionCardClassName()}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] text-[#7b776f] uppercase">
                Client & Invoice
              </p>
              <h2 className="mt-2 font-serif text-2xl text-[#39362f]">
                Set the client and invoice header
              </h2>
            </div>
            <div className="text-xs tracking-[0.22em] text-[#7b776f] uppercase">
              {invoice.status}
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Client name">
              <input
                className={inputClassName()}
                value={invoice.clientName}
                onChange={(event) =>
                  setInvoice((current) => ({
                    ...current,
                    clientName: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Invoice title">
              <input
                className={inputClassName()}
                value={invoice.invoiceTitle}
                onChange={(event) =>
                  setInvoice((current) => ({
                    ...current,
                    invoiceTitle: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Invoice date">
              <input
                type="date"
                className={inputClassName()}
                value={invoice.invoiceDate}
                onChange={(event) =>
                  setInvoice((current) => ({
                    ...current,
                    invoiceDate: event.target.value,
                  }))
                }
              />
            </Field>
          </div>
        </section>

        <section className={sectionCardClassName()}>
          <p className="text-xs tracking-[0.3em] text-[#7b776f] uppercase">
            Billing Summary
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[#39362f]">
            Record the package total and received payments
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field label="Package total">
              <input
                className={inputClassName()}
                inputMode="numeric"
                value={invoice.packageTotal}
                onChange={(event) =>
                  setInvoice((current) =>
                    syncInvoiceSummary(current, {
                      packageTotal: event.target.value,
                    })
                  )
                }
                placeholder={String(packageTotal)}
              />
            </Field>
            <Field label="Payment received">
              <input
                className={inputClassName()}
                inputMode="numeric"
                value={invoice.currentInvoiceAmount}
                onChange={(event) =>
                  setInvoice((current) =>
                    syncInvoiceSummary(current, {
                      currentInvoiceAmount: event.target.value,
                      subtotal: event.target.value,
                      total: event.target.value,
                    })
                  )
                }
                placeholder={String(currentInvoiceAmount)}
              />
            </Field>
            <Field label="Balance due">
              <input
                className={`${inputClassName()} bg-[#f4f1ea] text-[#6b665b]`}
                value={invoice.balanceDue}
                placeholder={String(balanceDue)}
                readOnly
              />
            </Field>
          </div>
        </section>

        <section className={sectionCardClassName()}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] text-[#7b776f] uppercase">
                Payment Schedule
              </p>
              <h2 className="mt-2 font-serif text-2xl text-[#39362f]">
                Build the payment distribution context
              </h2>
            </div>
            <button
              type="button"
              className={addButtonClassName()}
              onClick={() =>
                setInvoice((current) => ({
                  ...current,
                  installments: [
                    ...current.installments,
                    {
                      id: crypto.randomUUID(),
                      label: "New installment",
                      eventDate: "",
                      amount: "",
                    },
                  ],
                }))
              }
            >
              Add installment
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {invoice.installments.map((installment) => (
              <InstallmentEditor
                key={installment.id}
                installment={installment}
                canRemove={invoice.installments.length > 1}
                onChange={(nextInstallment) =>
                  setInvoice((current) => ({
                    ...current,
                    installments: current.installments.map((entry) =>
                      entry.id === installment.id ? nextInstallment : entry
                    ),
                  }))
                }
                onRemove={() =>
                  setInvoice((current) => ({
                    ...current,
                    installments: current.installments.filter(
                      (entry) => entry.id !== installment.id
                    ),
                  }))
                }
              />
            ))}
          </div>
        </section>

        <section className={sectionCardClassName()}>
          <p className="text-xs tracking-[0.3em] text-[#7b776f] uppercase">
            Amount In Words
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[#39362f]">
            Describe the payment received
          </h2>
          <div className="mt-4">
            <Field label="Amount in words">
              <textarea
                className={`${inputClassName()} min-h-28`}
                value={invoice.amountInWords}
                onChange={(event) =>
                  setInvoice((current) => ({
                    ...current,
                    amountInWords: event.target.value,
                  }))
                }
                placeholder={amountInWords}
              />
            </Field>
          </div>
        </section>

        <section className={sectionCardClassName()}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] text-[#7b776f] uppercase">
                Milestones & Terms
              </p>
              <h2 className="mt-2 font-serif text-2xl text-[#39362f]">
                Second-page payment and legal details
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              className="hover:text-[#39362f]"
              onClick={() => setIsLegalOpen((current) => !current)}
            >
              {isLegalOpen ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
              {isLegalOpen ? "Close" : "Edit"}
            </Button>
          </div>
          {isLegalOpen ? (
            <div className="mt-5 grid gap-5">
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[#39362f]">
                    Payment milestones
                  </span>
                  <button
                    type="button"
                    className={addButtonClassName()}
                    onClick={() =>
                      setInvoice((current) => ({
                        ...current,
                        paymentTerms: [
                          ...current.paymentTerms,
                          {
                            id: crypto.randomUUID(),
                            label: "New milestone",
                            percentage: 0,
                            description: "",
                          },
                        ],
                      }))
                    }
                  >
                    Add milestone
                  </button>
                </div>
                {invoice.paymentTerms.map((term) => (
                  <PaymentMilestoneEditor
                    key={term.id}
                    term={term}
                    canRemove={invoice.paymentTerms.length > 1}
                    onChange={(nextTerm) =>
                      setInvoice((current) => ({
                        ...current,
                        paymentTerms: current.paymentTerms.map((entry) =>
                          entry.id === term.id ? nextTerm : entry
                        ),
                      }))
                    }
                    onRemove={() =>
                      setInvoice((current) => ({
                        ...current,
                        paymentTerms:
                          current.paymentTerms.length > 1
                            ? current.paymentTerms.filter(
                                (entry) => entry.id !== term.id
                              )
                            : current.paymentTerms,
                      }))
                    }
                  />
                ))}
              </div>
              <RowsEditor
                label="Terms & Conditions"
                values={invoice.terms}
                onChange={(terms) =>
                  setInvoice((current) => ({ ...current, terms }))
                }
                addLabel="Add term"
              />
              <RowsEditor
                label="Additional policy points"
                values={invoice.privacyPolicy}
                onChange={(privacyPolicy) =>
                  setInvoice((current) => ({ ...current, privacyPolicy }))
                }
                addLabel="Add policy point"
              />
            </div>
          ) : null}
        </section>

        <section className={sectionCardClassName()}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] text-[#7b776f] uppercase">
                Studio Details
              </p>
              <h2 className="mt-2 font-serif text-2xl text-[#39362f]">
                Branding, address, and footer contact
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              className="hover:text-[#39362f]"
              onClick={() => setIsStudioOpen((current) => !current)}
            >
              {isStudioOpen ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
              {isStudioOpen ? "Close" : "Edit"}
            </Button>
          </div>
          {isStudioOpen ? (
            <div className="mt-5 grid gap-4">
              <Field label="Studio name">
                <input
                  className={inputClassName()}
                  value={invoice.studio.name}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      studio: { ...current.studio, name: event.target.value },
                    }))
                  }
                />
              </Field>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Address line 1">
                  <input
                    className={inputClassName()}
                    value={invoice.studio.addressLines[0] ?? ""}
                    onChange={(event) =>
                      setInvoice((current) => ({
                        ...current,
                        studio: {
                          ...current.studio,
                          addressLines: [
                            event.target.value,
                            current.studio.addressLines[1] ?? "",
                            current.studio.addressLines[2] ?? "",
                          ],
                        },
                      }))
                    }
                  />
                </Field>
                <Field label="Address line 2">
                  <input
                    className={inputClassName()}
                    value={invoice.studio.addressLines[1] ?? ""}
                    onChange={(event) =>
                      setInvoice((current) => ({
                        ...current,
                        studio: {
                          ...current.studio,
                          addressLines: [
                            current.studio.addressLines[0] ?? "",
                            event.target.value,
                            current.studio.addressLines[2] ?? "",
                          ],
                        },
                      }))
                    }
                  />
                </Field>
                <Field label="Address line 3">
                  <input
                    className={inputClassName()}
                    value={invoice.studio.addressLines[2] ?? ""}
                    onChange={(event) =>
                      setInvoice((current) => ({
                        ...current,
                        studio: {
                          ...current.studio,
                          addressLines: [
                            current.studio.addressLines[0] ?? "",
                            current.studio.addressLines[1] ?? "",
                            event.target.value,
                          ],
                        },
                      }))
                    }
                  />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Footer website">
                  <input
                    className={inputClassName()}
                    value={invoice.footerContact.website}
                    onChange={(event) =>
                      setInvoice((current) => ({
                        ...current,
                        footerContact: {
                          ...current.footerContact,
                          website: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>
                <Field label="Footer phone">
                  <input
                    className={inputClassName()}
                    value={invoice.footerContact.phone}
                    onChange={(event) =>
                      setInvoice((current) => ({
                        ...current,
                        footerContact: {
                          ...current.footerContact,
                          phone: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>
                <Field label="Footer email">
                  <input
                    className={inputClassName()}
                    value={invoice.footerContact.email}
                    onChange={(event) =>
                      setInvoice((current) => ({
                        ...current,
                        footerContact: {
                          ...current.footerContact,
                          email: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>
              </div>
            </div>
          ) : null}
        </section>

        <section className={sectionCardClassName()}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] text-[#7b776f] uppercase">
                Bank Details
              </p>
              <h2 className="mt-2 font-serif text-2xl text-[#39362f]">
                Payment destination
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              className="hover:text-[#39362f]"
              onClick={() => setIsBankOpen((current) => !current)}
            >
              {isBankOpen ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
              {isBankOpen ? "Close" : "Edit"}
            </Button>
          </div>
          {isBankOpen ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Bank name">
                <input
                  className={inputClassName()}
                  value={invoice.bankDetails.bankName}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      bankDetails: {
                        ...current.bankDetails,
                        bankName: event.target.value,
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Account holder name">
                <input
                  className={inputClassName()}
                  value={invoice.bankDetails.accountHolderName}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      bankDetails: {
                        ...current.bankDetails,
                        accountHolderName: event.target.value,
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Branch address">
                <input
                  className={inputClassName()}
                  value={invoice.bankDetails.branchAddress}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      bankDetails: {
                        ...current.bankDetails,
                        branchAddress: event.target.value,
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Account number">
                <input
                  className={inputClassName()}
                  value={invoice.bankDetails.accountNumber}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      bankDetails: {
                        ...current.bankDetails,
                        accountNumber: event.target.value,
                      },
                    }))
                  }
                />
              </Field>
              <Field label="IFSC">
                <input
                  className={inputClassName()}
                  value={invoice.bankDetails.ifsc}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      bankDetails: {
                        ...current.bankDetails,
                        ifsc: event.target.value,
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Account type">
                <input
                  className={inputClassName()}
                  value={invoice.bankDetails.accountType}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      bankDetails: {
                        ...current.bankDetails,
                        accountType: event.target.value,
                      },
                    }))
                  }
                />
              </Field>
            </div>
          ) : null}
        </section>

        <section className={sectionCardClassName()}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] text-[#7b776f] uppercase">
                Signatory
              </p>
              <h2 className="mt-2 font-serif text-2xl text-[#39362f]">
                Authorized signatory block
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              className="hover:text-[#39362f]"
              onClick={() => setIsSignatoryOpen((current) => !current)}
            >
              {isSignatoryOpen ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
              {isSignatoryOpen ? "Close" : "Edit"}
            </Button>
          </div>
          {isSignatoryOpen ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Signatory label">
                <input
                  className={inputClassName()}
                  value={invoice.signatory.label}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      signatory: {
                        ...current.signatory,
                        label: event.target.value,
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Signatory name">
                <input
                  className={inputClassName()}
                  value={invoice.signatory.name}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      signatory: {
                        ...current.signatory,
                        name: event.target.value,
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Signatory title">
                <input
                  className={inputClassName()}
                  value={invoice.signatory.title}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      signatory: {
                        ...current.signatory,
                        title: event.target.value,
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Signature image path">
                <input
                  className={inputClassName()}
                  value={invoice.signatory.signatureImagePath}
                  onChange={(event) =>
                    setInvoice((current) => ({
                      ...current,
                      signatory: {
                        ...current.signatory,
                        signatureImagePath: event.target.value,
                      },
                    }))
                  }
                />
              </Field>
            </div>
          ) : null}
        </section>

        <SaveActions
          invoiceId={invoice.id}
          onOpenPreview={() => setIsPreviewOpen(true)}
        />
      </form>

      {showSavedToast ? <ToastOnMount message="Invoice saved." /> : null}

      {isPreviewOpen ? (
        <div className="fixed inset-0 z-50 bg-black/55 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[1.75rem] border border-[#ddd7cc] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#e6e0d5] px-5 py-4">
              <div>
                <p className="text-xs tracking-[0.22em] text-[#857a63] uppercase">
                  PDF Preview
                </p>
                <h2 className="mt-1 font-serif text-2xl text-[#39362f]">
                  Current invoice preview
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <PdfExportLink
                  href={`/api/invoices/${invoice.id}/pdf`}
                  className="rounded-full border border-[#ddd7cc] px-4 py-2 text-sm text-[#5e5a54] transition hover:border-[#c8c0b2] hover:bg-[#f6f1e8] hover:text-[#5e5a54]"
                >
                  Open in new tab
                </PdfExportLink>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 bg-[#f4efe6] p-4">
              <iframe
                title="Invoice PDF Preview"
                src={`/api/invoices/${invoice.id}/pdf`}
                className="h-full w-full rounded-[1.25rem] border border-[#ddd7cc] bg-white"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
