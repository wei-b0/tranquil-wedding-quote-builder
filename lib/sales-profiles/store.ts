import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { SalesProfile, QuoteSession } from "@/lib/quotes/types"

type SalesProfileRow = {
  user_id: string
  display_name: string
  title: string
  email: string
  phone: string
  whatsapp: string
  avatar_url: string | null
}

type SalesProfileStore = {
  getProfile(session: QuoteSession): Promise<SalesProfile | null>
  getProfileByUserId(session: QuoteSession, userId: string): Promise<SalesProfile | null>
  upsertProfile(session: QuoteSession, profile: SalesProfile): Promise<SalesProfile>
}

function createDefaultSalesProfile(session: QuoteSession): SalesProfile {
  return {
    userId: session.userId,
    displayName: session.name,
    title: "Wedding Consultant",
    email: session.email,
    phone: "",
    whatsapp: "",
    avatarUrl: null,
  }
}

function normalizeValue(value: string | null | undefined) {
  return value?.trim() ?? ""
}

function normalizeSalesProfile(
  input: Partial<SalesProfile> | null | undefined,
  fallback: SalesProfile
): SalesProfile {
  return {
    userId: input?.userId || fallback.userId,
    displayName: normalizeValue(input?.displayName) || fallback.displayName,
    title: normalizeValue(input?.title) || fallback.title,
    email: normalizeValue(input?.email) || fallback.email,
    phone: normalizeValue(input?.phone),
    whatsapp: normalizeValue(input?.whatsapp),
    avatarUrl: normalizeValue(input?.avatarUrl ?? undefined) || null,
  }
}

function fromRow(row: SalesProfileRow, fallback: SalesProfile): SalesProfile {
  return normalizeSalesProfile(
    {
      userId: row.user_id,
      displayName: row.display_name,
      title: row.title,
      email: row.email,
      phone: row.phone,
      whatsapp: row.whatsapp,
      avatarUrl: row.avatar_url,
    },
    fallback
  )
}

function toRow(profile: SalesProfile): SalesProfileRow {
  return {
    user_id: profile.userId,
    display_name: profile.displayName,
    title: profile.title,
    email: profile.email,
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    avatar_url: profile.avatarUrl,
  }
}

const salesProfileStore: SalesProfileStore = {
  async getProfile(session) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("sales_profiles")
      .select("user_id, display_name, title, email, phone, whatsapp, avatar_url")
      .eq("user_id", session.userId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    return fromRow(data as SalesProfileRow, createDefaultSalesProfile(session))
  },

  async getProfileByUserId(session, userId) {
    if (userId !== session.userId) {
      return null
    }

    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("sales_profiles")
      .select("user_id, display_name, title, email, phone, whatsapp, avatar_url")
      .eq("user_id", userId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    return fromRow(data as SalesProfileRow, createDefaultSalesProfile(session))
  },

  async upsertProfile(session, profile) {
    const fallback = createDefaultSalesProfile(session)
    const nextProfile = normalizeSalesProfile(profile, fallback)
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("sales_profiles")
      .upsert(toRow(nextProfile))
      .select("user_id, display_name, title, email, phone, whatsapp, avatar_url")
      .single()

    if (error) throw error

    return fromRow(data as SalesProfileRow, fallback)
  },
}

export function getSalesProfileStore() {
  return salesProfileStore
}

export function buildSalesProfileDraft(session: QuoteSession, profile: SalesProfile | null) {
  return normalizeSalesProfile(profile, createDefaultSalesProfile(session))
}

export function isSalesProfileComplete(profile: SalesProfile | null) {
  return Boolean(
    profile &&
      profile.displayName.trim() &&
      profile.title.trim() &&
      profile.whatsapp.trim()
  )
}
