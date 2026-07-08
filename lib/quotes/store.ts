import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAnonClient } from "@/lib/supabase/public"
import { applyCoverageDefaults, createDefaultQuote, normalizeDiscountType } from "@/lib/quotes/defaults"
import { syncPackagePricing } from "@/lib/quotes/format"
import type {
  ActiveQuoteStatus,
  ContactBlock,
  PaymentMilestone,
  QuoteEvent,
  QuoteListItem,
  QuotePackage,
  QuoteRecord,
  QuoteSession,
  QuoteStatus,
} from "@/lib/quotes/types"

type QuoteStore = {
  listQuotes(session: QuoteSession, search?: string): Promise<QuoteListItem[]>
  listTrash(session: QuoteSession, search?: string): Promise<QuoteListItem[]>
  getQuoteById(session: QuoteSession, id: string): Promise<QuoteRecord | null>
  getQuoteBySlug(slug: string): Promise<QuoteRecord | null>
  saveQuote(session: QuoteSession, quote: QuoteRecord): Promise<QuoteRecord>
  duplicateQuote(session: QuoteSession, id: string): Promise<QuoteRecord | null>
  trashQuote(session: QuoteSession, id: string): Promise<void>
  restoreQuote(session: QuoteSession, id: string): Promise<QuoteRecord | null>
  deleteQuotePermanently(session: QuoteSession, id: string): Promise<void>
  createQuote(session: QuoteSession): Promise<QuoteRecord>
}

type QuoteRow = {
  id: string
  slug: string
  owner_id: string
  status: QuoteStatus
  last_active_status: ActiveQuoteStatus
  client_name: string
  partner_name: string
  quote_title: string
  location: string
  trashed_at: string | null
  expires_at: string | null
  payload: QuoteRecord
}

function toRow(quote: QuoteRecord, ownerId: string) {
  return {
    id: quote.id,
    slug: quote.slug,
    owner_id: ownerId,
    status: quote.status,
    last_active_status: quote.lastActiveStatus,
    client_name: quote.clientName,
    partner_name: quote.partnerName,
    quote_title: quote.quoteTitle,
    location: quote.location,
    trashed_at: quote.trashedAt,
    expires_at: quote.expiresAt,
    payload: quote,
  }
}

function fromRow(row: Pick<QuoteRow, "payload">): QuoteRecord {
  return normalizeQuote(row.payload)
}

function normalizeLegacyRoleLabel(value: string) {
  return value
    .replaceAll("Traditional Photography", "Photography")
    .replaceAll("Traditional Videography", "Videography")
    .replaceAll("Traditional Photographer", "Photographer")
    .replaceAll("Traditional Videographer", "Videographer")
    .replaceAll("traditional wedding film", "wedding film")
}

const TRASH_RETENTION_DAYS = 30

function addDays(value: string, days: number) {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function normalizeStoredStatus(value: unknown): QuoteStatus {
  if (value === "shared") return "shared"
  if (value === "trashed" || value === "archived") return "trashed"
  return "draft"
}

function normalizeActiveStatus(value: unknown): ActiveQuoteStatus {
  return value === "shared" ? "shared" : "draft"
}

function normalizeEvent(input: Partial<QuoteEvent> | undefined, fallback: QuoteEvent): QuoteEvent {
  return {
    id: input?.id || fallback.id,
    date: input?.date || "",
    title: input?.title || fallback.title,
    location: input?.location || "",
    coverage: input?.coverage || fallback.coverage,
    guestCount: input?.guestCount || "",
    timing: input?.timing || fallback.timing,
    team: Array.isArray(input?.team)
      ? input!.team.filter(Boolean).map(normalizeLegacyRoleLabel)
      : fallback.team,
  }
}

function normalizePackage(input: Partial<QuotePackage> | undefined, fallback: QuotePackage): QuotePackage {
  const rawPrice = input?.basePrice ?? (input as { price?: string } | undefined)?.price ?? fallback.basePrice

  return syncPackagePricing({
    id: input?.id || fallback.id,
    name: input?.name || fallback.name,
    subtitle: input?.subtitle || fallback.subtitle,
    badge: input?.badge || fallback.badge,
    recommended: typeof input?.recommended === "boolean" ? input.recommended : fallback.recommended,
    basePrice: rawPrice,
    discountType: normalizeDiscountType(input?.discountType),
    discountValue: input?.discountValue || "",
    finalPrice: input?.finalPrice || rawPrice,
    offerLabel: input?.offerLabel || fallback.offerLabel,
    team: Array.isArray(input?.team)
      ? input!.team.filter(Boolean).map(normalizeLegacyRoleLabel)
      : fallback.team,
    items: Array.isArray(input?.items)
      ? input!.items.filter(Boolean).map(normalizeLegacyRoleLabel)
      : fallback.items,
    specialFeatures: Array.isArray(input?.specialFeatures)
      ? input!.specialFeatures.filter(Boolean).map(normalizeLegacyRoleLabel)
      : fallback.specialFeatures,
  })
}

function normalizePaymentTerm(input: Partial<PaymentMilestone> | undefined, fallback: PaymentMilestone) {
  return {
    id: input?.id || fallback.id,
    label: input?.label || fallback.label,
    percentage: typeof input?.percentage === "number" ? input.percentage : fallback.percentage,
    description: input?.description || fallback.description,
  }
}

function normalizeContact(input: Partial<ContactBlock> | undefined, fallback: ContactBlock): ContactBlock {
  return {
    email: input?.email || fallback.email,
    website: input?.website || fallback.website,
    phones: Array.isArray(input?.phones) && input.phones.length ? input.phones.filter(Boolean) : fallback.phones,
    whatsapp: input?.whatsapp || fallback.whatsapp,
  }
}

export function normalizeQuote(input: QuoteRecord): QuoteRecord {
  const status = normalizeStoredStatus((input as { status?: unknown }).status)
  const fallback = createDefaultQuote(input.ownerEmail || "sales@thetranquilwedding.com")
  const lastActiveStatus =
    normalizeActiveStatus((input as { lastActiveStatus?: unknown }).lastActiveStatus) ||
    (status === "shared" ? "shared" : "draft")
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

  return applyCoverageDefaults({
    ...fallback,
    ...input,
    status,
    lastActiveStatus: status === "shared" ? "shared" : status === "draft" ? "draft" : lastActiveStatus,
    trashedAt,
    expiresAt,
    events: (input.events?.length ? input.events : fallback.events).map((event, index) =>
      normalizeEvent(event, fallback.events[Math.min(index, fallback.events.length - 1)])
    ),
    packages: fallback.packages.map((pkg, index) =>
      normalizePackage(input.packages?.[index], pkg)
    ),
    paymentTerms: fallback.paymentTerms.map((term, index) =>
      normalizePaymentTerm(input.paymentTerms?.[index], term)
    ),
    deliverables:
      Array.isArray(input.deliverables) && input.deliverables.length ? input.deliverables.filter(Boolean) : fallback.deliverables,
    terms: Array.isArray(input.terms) && input.terms.length ? input.terms.filter(Boolean) : fallback.terms,
    privacyPolicy:
      Array.isArray(input.privacyPolicy) && input.privacyPolicy.length
        ? input.privacyPolicy.filter(Boolean)
        : fallback.privacyPolicy,
    preWeddingTeam:
      Array.isArray(input.preWeddingTeam) && input.preWeddingTeam.length
        ? input.preWeddingTeam.filter(Boolean).map(normalizeLegacyRoleLabel)
        : fallback.preWeddingTeam,
    preWeddingDeliverables:
      Array.isArray(input.preWeddingDeliverables) && input.preWeddingDeliverables.length
        ? input.preWeddingDeliverables.filter(Boolean)
        : fallback.preWeddingDeliverables,
    contact: normalizeContact(input.contact, fallback.contact),
  })
}

async function purgeExpiredTrash(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  ownerId: string
) {
  await supabase
    .from("quotes")
    .delete()
    .eq("owner_id", ownerId)
    .eq("status", "trashed")
    .lt("expires_at", new Date().toISOString())
}

function toListItem(quote: QuoteRecord): QuoteListItem {
  return {
    id: quote.id,
    slug: quote.slug,
    status: quote.status,
    lastActiveStatus: quote.lastActiveStatus,
    trashedAt: quote.trashedAt,
    expiresAt: quote.expiresAt,
    clientName: quote.clientName,
    partnerName: quote.partnerName,
    quoteTitle: quote.quoteTitle,
    location: quote.location,
    updatedAt: quote.updatedAt,
  }
}

function createSlug() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 18)
}

function copyQuoteForDuplicate(source: QuoteRecord, ownerEmail: string): QuoteRecord {
  const now = new Date().toISOString()

  return {
    ...structuredClone(source),
    id: crypto.randomUUID(),
    slug: createSlug(),
    status: "draft",
    lastActiveStatus: "draft",
    trashedAt: null,
    expiresAt: null,
    ownerEmail,
    createdAt: now,
    updatedAt: now,
  }
}

function applySearchAndSort(quotes: QuoteRecord[], search?: string): QuoteRecord[] {
  const normalizedSearch = search?.trim().toLowerCase()

  return quotes
    .filter((quote) => {
      if (!normalizedSearch) return true
      return [quote.clientName, quote.partnerName, quote.location, quote.quoteTitle, quote.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

const supabaseStore: QuoteStore = {
  async listQuotes(session, search) {
    const supabase = await createSupabaseServerClient()
    await purgeExpiredTrash(supabase, session.userId)
    const { data, error } = await supabase.from("quotes").select("payload").neq("status", "trashed")
    if (error) throw error

    const quotes = (data ?? []).map((row) => fromRow(row as Pick<QuoteRow, "payload">))
    return applySearchAndSort(quotes, search).map(toListItem)
  },

  async listTrash(session, search) {
    const supabase = await createSupabaseServerClient()
    await purgeExpiredTrash(supabase, session.userId)
    const { data, error } = await supabase.from("quotes").select("payload").eq("status", "trashed")
    if (error) throw error

    const quotes = (data ?? []).map((row) => fromRow(row as Pick<QuoteRow, "payload">))
    return applySearchAndSort(quotes, search).map(toListItem)
  },

  async getQuoteById(session, id) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.from("quotes").select("payload").eq("id", id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data as Pick<QuoteRow, "payload">) : null
  },

  async getQuoteBySlug(slug) {
    const supabase = createSupabaseAnonClient()
    const { data, error } = await supabase.rpc("get_shared_quote", { p_slug: slug })
    if (error) throw error
    return data ? normalizeQuote(data as QuoteRecord) : null
  },

  async saveQuote(session, quote) {
    const nextQuote = normalizeQuote({
      ...quote,
      ownerEmail: session.email,
      updatedAt: new Date().toISOString(),
    })
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("quotes")
      .upsert(toRow(nextQuote, session.userId))
      .select("payload")
      .single()
    if (error) throw error
    return fromRow(data as Pick<QuoteRow, "payload">)
  },

  async duplicateQuote(session, id) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("quotes")
      .select("payload")
      .eq("id", id)
      .neq("status", "trashed")
      .maybeSingle()
    if (error) throw error
    if (!data) return null

    const source = fromRow(data as Pick<QuoteRow, "payload">)
    const duplicated = copyQuoteForDuplicate(source, session.email)
    const { error: insertError } = await supabase.from("quotes").insert(toRow(duplicated, session.userId))
    if (insertError) throw insertError
    return duplicated
  },

  async trashQuote(session, id) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.from("quotes").select("payload").eq("id", id).maybeSingle()
    if (error) throw error
    if (!data) return

    const quote = fromRow(data as Pick<QuoteRow, "payload">)
    const now = new Date().toISOString()
    const nextQuote: QuoteRecord = {
      ...quote,
      lastActiveStatus: quote.status === "shared" ? "shared" : "draft",
      status: "trashed",
      trashedAt: now,
      expiresAt: addDays(now, TRASH_RETENTION_DAYS),
      updatedAt: now,
    }

    const { error: updateError } = await supabase
      .from("quotes")
      .update(toRow(nextQuote, session.userId))
      .eq("id", id)
    if (updateError) throw updateError
  },

  async restoreQuote(session, id) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.from("quotes").select("payload").eq("id", id).maybeSingle()
    if (error) throw error
    if (!data) return null

    const quote = fromRow(data as Pick<QuoteRow, "payload">)
    if (quote.status !== "trashed") return null

    const nextQuote: QuoteRecord = {
      ...quote,
      status: quote.lastActiveStatus,
      trashedAt: null,
      expiresAt: null,
      updatedAt: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from("quotes")
      .update(toRow(nextQuote, session.userId))
      .eq("id", id)
    if (updateError) throw updateError
    return nextQuote
  },

  async deleteQuotePermanently(session, id) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.from("quotes").delete().eq("id", id).eq("status", "trashed")
    if (error) throw error
  },

  async createQuote(session) {
    const quote = createDefaultQuote(session.email)
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("quotes")
      .insert(toRow(quote, session.userId))
      .select("payload")
      .single()
    if (error) throw error
    return fromRow(data as Pick<QuoteRow, "payload">)
  },
}

export function getQuoteStore(): QuoteStore {
  return supabaseStore
}

export function setQuoteStatus(quote: QuoteRecord, status: QuoteStatus) {
  return {
    ...quote,
    status,
    lastActiveStatus: status === "shared" ? "shared" : status === "draft" ? "draft" : quote.lastActiveStatus,
    trashedAt: status === "trashed" ? quote.trashedAt : null,
    expiresAt: status === "trashed" ? quote.expiresAt : null,
    updatedAt: new Date().toISOString(),
  }
}
