"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireSession } from "@/lib/auth"
import { invoicePayloadSchema } from "@/lib/invoices/schema"
import { getInvoiceStore, setInvoiceStatus } from "@/lib/invoices/store"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { quotePayloadSchema } from "@/lib/quotes/schema"
import { getQuoteStore, setQuoteStatus } from "@/lib/quotes/store"
import {
  buildSalesProfileDraft,
  getSalesProfileStore,
  isSalesProfileComplete,
} from "@/lib/sales-profiles/store"
import type { SalesProfile } from "@/lib/quotes/types"

function parsePayload(formData: FormData) {
  const raw = String(formData.get("payload") ?? "")
  const parsed = JSON.parse(raw)
  return quotePayloadSchema.parse(parsed)
}

function parseInvoicePayload(formData: FormData) {
  const raw = String(formData.get("payload") ?? "")
  const parsed = JSON.parse(raw)
  return invoicePayloadSchema.parse(parsed)
}

function parseSalesProfile(formData: FormData, userId: string): SalesProfile {
  return {
    userId,
    displayName: String(formData.get("displayName") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    whatsapp: String(formData.get("whatsapp") ?? "").trim(),
    avatarUrl: String(formData.get("avatarUrl") ?? "").trim() || null,
  }
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    redirect(
      `/login?error=${encodeURIComponent("Email and password are required.")}`
    )
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent("Invalid email or password.")}`)
  }

  redirect("/dashboard")
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/login?loggedout=1")
}

export async function createQuoteAction(formData: FormData) {
  const session = await requireSession()
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard")
  const nextPath = redirectTo.includes("?")
    ? `${redirectTo}&profile=1`
    : `${redirectTo}?profile=1`
  const profileStore = getSalesProfileStore()
  const profile = await profileStore.getProfile(session)

  if (!isSalesProfileComplete(profile)) {
    redirect(
      `/settings/profile?required=1&next=${encodeURIComponent(nextPath)}`
    )
  }

  const store = getQuoteStore()
  const quote = await store.createQuote(session)
  redirect(`/quotes/${quote.id}/edit`)
}

export async function createInvoiceAction() {
  const session = await requireSession()
  const store = getInvoiceStore()
  const invoice = await store.createInvoice(session)
  redirect(`/invoices/${invoice.id}/edit`)
}

export async function saveQuoteAction(formData: FormData) {
  const session = await requireSession()
  const store = getQuoteStore()
  const quote = parsePayload(formData)
  const intent = String(formData.get("intent") ?? "save")
  const saved = await store.saveQuote(session, setQuoteStatus(quote, "shared"))
  revalidatePath("/dashboard")
  revalidatePath(`/quotes/${saved.id}`)
  revalidatePath(`/quotes/${saved.id}/edit`)
  revalidatePath(`/q/${saved.slug}`)
  if (intent === "web-preview") {
    redirect(`/q/${saved.slug}`)
  }
  redirect(
    intent === "pdf-preview"
      ? `/quotes/${saved.id}/edit?saved=1&preview=pdf`
      : `/quotes/${saved.id}/edit?saved=1`
  )
}

export async function duplicateQuoteAction(formData: FormData) {
  const session = await requireSession()
  const id = String(formData.get("id") ?? "")
  const store = getQuoteStore()
  const duplicated = await store.duplicateQuote(session, id)
  revalidatePath("/dashboard")
  if (!duplicated) {
    redirect("/dashboard?error=Quote+could+not+be+duplicated.")
  }
  redirect(`/quotes/${duplicated.id}/edit`)
}

export async function saveInvoiceAction(formData: FormData) {
  const session = await requireSession()
  const store = getInvoiceStore()
  const invoice = parseInvoicePayload(formData)
  const intent = String(formData.get("intent") ?? "draft")
  const saved = await store.saveInvoice(
    session,
    setInvoiceStatus(invoice, invoice.status)
  )
  revalidatePath("/invoices")
  revalidatePath(`/invoices/${saved.id}`)
  revalidatePath(`/invoices/${saved.id}/edit`)
  redirect(
    intent === "preview"
      ? `/invoices/${saved.id}?saved=1`
      : `/invoices/${saved.id}/edit?saved=1`
  )
}

export async function trashQuoteAction(formData: FormData) {
  const session = await requireSession()
  const id = String(formData.get("id") ?? "")
  const store = getQuoteStore()
  await store.trashQuote(session, id)
  revalidatePath("/dashboard")
  revalidatePath("/trash")
  redirect("/dashboard?trashed=1")
}

export async function trashInvoiceAction(formData: FormData) {
  const session = await requireSession()
  const id = String(formData.get("id") ?? "")
  const store = getInvoiceStore()
  await store.trashInvoice(session, id)
  revalidatePath("/invoices")
  revalidatePath("/trash")
  redirect("/invoices?trashed=1")
}

export async function restoreQuoteAction(formData: FormData) {
  const session = await requireSession()
  const id = String(formData.get("id") ?? "")
  const store = getQuoteStore()
  const quote = await store.restoreQuote(session, id)
  revalidatePath("/dashboard")
  revalidatePath("/trash")
  if (quote) {
    revalidatePath(`/q/${quote.slug}`)
  }
  redirect("/trash?restored=1")
}

export async function restoreInvoiceAction(formData: FormData) {
  const session = await requireSession()
  const id = String(formData.get("id") ?? "")
  const store = getInvoiceStore()
  await store.restoreInvoice(session, id)
  revalidatePath("/invoices")
  revalidatePath("/trash")
  redirect("/trash?restored=1")
}

export async function deleteQuotePermanentlyAction(formData: FormData) {
  const session = await requireSession()
  const id = String(formData.get("id") ?? "")
  const store = getQuoteStore()
  const quote = await store.getQuoteById(session, id)
  await store.deleteQuotePermanently(session, id)
  revalidatePath("/dashboard")
  revalidatePath("/trash")
  if (quote) {
    revalidatePath(`/q/${quote.slug}`)
  }
  redirect("/trash?deleted=1")
}

export async function deleteInvoicePermanentlyAction(formData: FormData) {
  const session = await requireSession()
  const id = String(formData.get("id") ?? "")
  const store = getInvoiceStore()
  await store.deleteInvoicePermanently(session, id)
  revalidatePath("/invoices")
  revalidatePath("/trash")
  redirect("/trash?deleted=1")
}

export async function saveSalesProfileAction(formData: FormData) {
  const session = await requireSession()
  const next = String(formData.get("next") ?? "").trim()
  const profileStore = getSalesProfileStore()
  const fallback = buildSalesProfileDraft(
    session,
    await profileStore.getProfile(session)
  )
  const profile = parseSalesProfile(formData, session.userId)
  await profileStore.upsertProfile(session, {
    ...fallback,
    ...profile,
    email: profile.email || fallback.email,
    phone: profile.phone || fallback.phone,
  })

  revalidatePath("/dashboard")
  revalidatePath("/settings/profile")
  redirect(next || "/settings/profile?saved=1")
}
