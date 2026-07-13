import { createDefaultInvoice } from "@/lib/invoices/defaults"
import type {
  ActiveInvoiceStatus,
  InvoiceBankDetails,
  InvoiceFooterContact,
  InvoiceInstallmentRow,
  InvoiceListItem,
  InvoicePaymentMilestone,
  InvoiceRecord,
  InvoiceSignatory,
  InvoiceStatus,
  InvoiceStudioDetails,
  InvoiceView,
} from "@/lib/invoices/types"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { QuoteSession } from "@/lib/quotes/types"
import { parseAmount } from "@/lib/quotes/format"

type InvoiceStore = {
  listInvoices(
    session: QuoteSession,
    search?: string
  ): Promise<InvoiceListItem[]>
  listTrash(session: QuoteSession, search?: string): Promise<InvoiceListItem[]>
  getInvoiceById(
    session: QuoteSession,
    id: string
  ): Promise<InvoiceRecord | null>
  getInvoiceViewById(
    session: QuoteSession,
    id: string
  ): Promise<InvoiceView | null>
  saveInvoice(
    session: QuoteSession,
    invoice: InvoiceRecord
  ): Promise<InvoiceRecord>
  trashInvoice(session: QuoteSession, id: string): Promise<void>
  restoreInvoice(
    session: QuoteSession,
    id: string
  ): Promise<InvoiceRecord | null>
  deleteInvoicePermanently(session: QuoteSession, id: string): Promise<void>
  createInvoice(session: QuoteSession): Promise<InvoiceRecord>
}

type InvoiceRow = {
  id: string
  slug: string
  owner_id: string
  status: InvoiceStatus
  last_active_status: ActiveInvoiceStatus
  client_name: string
  invoice_title: string
  invoice_date: string
  trashed_at: string | null
  expires_at: string | null
  payload: InvoiceRecord
}

const TRASH_RETENTION_DAYS = 30

function addDays(value: string, days: number) {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function normalizeStoredStatus(value: unknown): InvoiceStatus {
  return value === "trashed" ? "trashed" : "draft"
}

function normalizeStudio(
  input: Partial<InvoiceStudioDetails> | undefined,
  fallback: InvoiceStudioDetails
): InvoiceStudioDetails {
  return {
    name: input?.name || fallback.name,
    addressLines:
      Array.isArray(input?.addressLines) && input.addressLines.length
        ? input.addressLines.filter(Boolean)
        : fallback.addressLines,
    logoPath: input?.logoPath || fallback.logoPath,
  }
}

function normalizeInstallment(
  input: Partial<InvoiceInstallmentRow> | undefined,
  fallback: InvoiceInstallmentRow
): InvoiceInstallmentRow {
  return {
    id: input?.id || fallback.id,
    label: input?.label || fallback.label,
    eventDate: input?.eventDate || "",
    amount: input?.amount || "",
  }
}

function normalizeBankDetails(
  input: Partial<InvoiceBankDetails> | undefined,
  fallback: InvoiceBankDetails
): InvoiceBankDetails {
  return {
    bankName: input?.bankName || fallback.bankName,
    accountHolderName: input?.accountHolderName || fallback.accountHolderName,
    branchAddress: input?.branchAddress || fallback.branchAddress,
    accountNumber: input?.accountNumber || fallback.accountNumber,
    ifsc: input?.ifsc || fallback.ifsc,
    accountType: input?.accountType || fallback.accountType,
  }
}

function normalizePaymentTerm(
  input: Partial<InvoicePaymentMilestone> | undefined,
  fallback: InvoicePaymentMilestone
): InvoicePaymentMilestone {
  return {
    id: input?.id || fallback.id,
    label: input?.label || fallback.label,
    percentage:
      typeof input?.percentage === "number"
        ? input.percentage
        : fallback.percentage,
    description: input?.description || fallback.description,
  }
}

function normalizeSignatory(
  input: Partial<InvoiceSignatory> | undefined,
  fallback: InvoiceSignatory
): InvoiceSignatory {
  return {
    label: input?.label || fallback.label,
    name: input?.name || fallback.name,
    title: input?.title || fallback.title,
    signatureImagePath: input?.signatureImagePath || "",
  }
}

function normalizeFooterContact(
  input: Partial<InvoiceFooterContact> | undefined,
  fallback: InvoiceFooterContact
): InvoiceFooterContact {
  return {
    website: input?.website || fallback.website,
    phone: input?.phone || fallback.phone,
    email: input?.email || fallback.email,
  }
}

function normalizeMoneyString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

export function normalizeInvoice(input: InvoiceRecord): InvoiceRecord {
  const status = normalizeStoredStatus((input as { status?: unknown }).status)
  const fallback = createDefaultInvoice(
    input.ownerEmail || "sales@thetranquilwedding.com",
    input.creatorUserId || ""
  )
  const trashedAtRaw = (input as { trashedAt?: unknown }).trashedAt
  const expiresAtRaw = (input as { expiresAt?: unknown }).expiresAt
  const defaultTrashedAt = input.updatedAt || fallback.updatedAt
  const trashedAt =
    status === "trashed"
      ? typeof trashedAtRaw === "string" && trashedAtRaw
        ? trashedAtRaw
        : defaultTrashedAt
      : null
  const expiresAt =
    status === "trashed"
      ? typeof expiresAtRaw === "string" && expiresAtRaw
        ? expiresAtRaw
        : addDays(trashedAt ?? defaultTrashedAt, TRASH_RETENTION_DAYS)
      : null
  const subtotal = normalizeMoneyString((input as { subtotal?: unknown }).subtotal)
  const total = normalizeMoneyString((input as { total?: unknown }).total)
  const packageTotal = normalizeMoneyString(
    (input as { packageTotal?: unknown }).packageTotal,
    total || subtotal || fallback.packageTotal
  )
  const amountReceived = normalizeMoneyString(
    (input as { amountReceived?: unknown }).amountReceived,
    "0"
  )
  const currentInvoiceAmount = normalizeMoneyString(
    (input as { currentInvoiceAmount?: unknown }).currentInvoiceAmount,
    total || subtotal || fallback.currentInvoiceAmount
  )
  const balanceDue = String(
    Math.max(
      parseAmount(packageTotal) -
        parseAmount(amountReceived) -
        parseAmount(currentInvoiceAmount),
      0
    )
  )

  return {
    ...fallback,
    ...input,
    status,
    lastActiveStatus: "draft",
    trashedAt,
    expiresAt,
    creatorUserId: input.creatorUserId || fallback.creatorUserId,
    packageTotal,
    amountReceived,
    currentInvoiceAmount,
    balanceDue,
    studio: normalizeStudio(input.studio, fallback.studio),
    installments: (input.installments?.length
      ? input.installments
      : fallback.installments
    ).map((installment, index) =>
      normalizeInstallment(
        installment,
        fallback.installments[
          Math.min(index, fallback.installments.length - 1)
        ] || {
          id: crypto.randomUUID(),
          label: "",
          eventDate: "",
          amount: "",
        }
      )
    ),
    paymentTerms: (input.paymentTerms?.length
      ? input.paymentTerms
      : fallback.paymentTerms
    ).map((term, index) =>
      normalizePaymentTerm(
        term,
        fallback.paymentTerms[Math.min(index, fallback.paymentTerms.length - 1)]
      )
    ),
    terms:
      Array.isArray(input.terms) && input.terms.length
        ? input.terms.filter(Boolean)
        : fallback.terms,
    privacyPolicy:
      Array.isArray((input as { privacyPolicy?: unknown[] }).privacyPolicy) &&
      (input as { privacyPolicy?: string[] }).privacyPolicy?.length
        ? ((input as { privacyPolicy?: string[] }).privacyPolicy ?? []).filter(
            Boolean
          )
        : fallback.privacyPolicy,
    bankDetails: normalizeBankDetails(input.bankDetails, fallback.bankDetails),
    signatory: normalizeSignatory(input.signatory, fallback.signatory),
    footerContact: normalizeFooterContact(
      input.footerContact,
      fallback.footerContact
    ),
  }
}

function toRow(invoice: InvoiceRecord, ownerId: string) {
  return {
    id: invoice.id,
    slug: invoice.slug,
    owner_id: ownerId,
    status: invoice.status,
    last_active_status: invoice.lastActiveStatus,
    client_name: invoice.clientName,
    invoice_title: invoice.invoiceTitle,
    invoice_date: invoice.invoiceDate,
    trashed_at: invoice.trashedAt,
    expires_at: invoice.expiresAt,
    payload: invoice,
  }
}

function fromRow(row: Pick<InvoiceRow, "payload" | "owner_id">): InvoiceRecord {
  return normalizeInvoice({
    ...row.payload,
    creatorUserId: row.payload.creatorUserId || row.owner_id || "",
  })
}

async function purgeExpiredTrash(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  ownerId: string
) {
  await supabase
    .from("invoices")
    .delete()
    .eq("owner_id", ownerId)
    .eq("status", "trashed")
    .lt("expires_at", new Date().toISOString())
}

function toListItem(invoice: InvoiceRecord): InvoiceListItem {
  return {
    id: invoice.id,
    slug: invoice.slug,
    status: invoice.status,
    lastActiveStatus: invoice.lastActiveStatus,
    trashedAt: invoice.trashedAt,
    expiresAt: invoice.expiresAt,
    clientName: invoice.clientName,
    invoiceTitle: invoice.invoiceTitle,
    invoiceDate: invoice.invoiceDate,
    updatedAt: invoice.updatedAt,
  }
}

function applySearchAndSort(
  invoices: InvoiceRecord[],
  search?: string
): InvoiceRecord[] {
  const normalizedSearch = search?.trim().toLowerCase()

  return invoices
    .filter((invoice) => {
      if (!normalizedSearch) return true
      return [
        invoice.clientName,
        invoice.invoiceTitle,
        invoice.invoiceDate,
        invoice.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

const supabaseStore: InvoiceStore = {
  async listInvoices(session, search) {
    const supabase = await createSupabaseServerClient()
    await purgeExpiredTrash(supabase, session.userId)
    const { data, error } = await supabase
      .from("invoices")
      .select("payload, owner_id")
      .neq("status", "trashed")
    if (error) throw error

    const invoices = (data ?? []).map((row) =>
      fromRow(row as Pick<InvoiceRow, "payload" | "owner_id">)
    )
    return applySearchAndSort(invoices, search).map(toListItem)
  },

  async listTrash(session, search) {
    const supabase = await createSupabaseServerClient()
    await purgeExpiredTrash(supabase, session.userId)
    const { data, error } = await supabase
      .from("invoices")
      .select("payload, owner_id")
      .eq("status", "trashed")
    if (error) throw error

    const invoices = (data ?? []).map((row) =>
      fromRow(row as Pick<InvoiceRow, "payload" | "owner_id">)
    )
    return applySearchAndSort(invoices, search).map(toListItem)
  },

  async getInvoiceById(session, id) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("invoices")
      .select("payload, owner_id")
      .eq("id", id)
      .maybeSingle()
    if (error) throw error
    return data
      ? fromRow(data as Pick<InvoiceRow, "payload" | "owner_id">)
      : null
  },

  async getInvoiceViewById(session, id) {
    const invoice = await this.getInvoiceById(session, id)
    if (!invoice) return null
    return { invoice }
  },

  async saveInvoice(session, invoice) {
    const nextInvoice = normalizeInvoice({
      ...invoice,
      creatorUserId: invoice.creatorUserId || session.userId,
      ownerEmail: session.email,
      updatedAt: new Date().toISOString(),
    })
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("invoices")
      .upsert(toRow(nextInvoice, session.userId))
      .select("payload, owner_id")
      .single()
    if (error) throw error
    return fromRow(data as Pick<InvoiceRow, "payload" | "owner_id">)
  },

  async trashInvoice(session, id) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("invoices")
      .select("payload, owner_id")
      .eq("id", id)
      .maybeSingle()
    if (error) throw error
    if (!data) return

    const invoice = fromRow(data as Pick<InvoiceRow, "payload" | "owner_id">)
    const now = new Date().toISOString()
    const nextInvoice: InvoiceRecord = {
      ...invoice,
      status: "trashed",
      trashedAt: now,
      expiresAt: addDays(now, TRASH_RETENTION_DAYS),
      updatedAt: now,
    }

    const { error: updateError } = await supabase
      .from("invoices")
      .update(toRow(nextInvoice, session.userId))
      .eq("id", id)
    if (updateError) throw updateError
  },

  async restoreInvoice(session, id) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("invoices")
      .select("payload, owner_id")
      .eq("id", id)
      .maybeSingle()
    if (error) throw error
    if (!data) return null

    const invoice = fromRow(data as Pick<InvoiceRow, "payload" | "owner_id">)
    if (invoice.status !== "trashed") return null

    const nextInvoice: InvoiceRecord = {
      ...invoice,
      status: "draft",
      trashedAt: null,
      expiresAt: null,
      updatedAt: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from("invoices")
      .update(toRow(nextInvoice, session.userId))
      .eq("id", id)
    if (updateError) throw updateError
    return nextInvoice
  },

  async deleteInvoicePermanently(session, id) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id)
      .eq("status", "trashed")
    if (error) throw error
  },

  async createInvoice(session) {
    const invoice = createDefaultInvoice(session.email, session.userId)
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("invoices")
      .insert(toRow(invoice, session.userId))
      .select("payload, owner_id")
      .single()
    if (error) throw error
    return fromRow(data as Pick<InvoiceRow, "payload" | "owner_id">)
  },
}

export function getInvoiceStore(): InvoiceStore {
  return supabaseStore
}

export function setInvoiceStatus(
  invoice: InvoiceRecord,
  status: InvoiceStatus
) {
  return {
    ...invoice,
    status,
    lastActiveStatus: "draft" as const,
    trashedAt: status === "trashed" ? invoice.trashedAt : null,
    expiresAt: status === "trashed" ? invoice.expiresAt : null,
    updatedAt: new Date().toISOString(),
  }
}
