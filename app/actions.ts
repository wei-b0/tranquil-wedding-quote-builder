"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireSession } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { quotePayloadSchema } from "@/lib/quotes/schema"
import { getQuoteStore, setQuoteStatus } from "@/lib/quotes/store"

function parsePayload(formData: FormData) {
  const raw = String(formData.get("payload") ?? "")
  const parsed = JSON.parse(raw)
  return quotePayloadSchema.parse(parsed)
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Email and password are required.")}`)
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
  redirect("/login")
}

export async function createQuoteAction(formData: FormData) {
  void formData
  const session = await requireSession()
  const store = getQuoteStore()
  const quote = await store.createQuote(session)
  redirect(`/quotes/${quote.id}/edit`)
}

export async function saveQuoteAction(formData: FormData) {
  const session = await requireSession()
  const store = getQuoteStore()
  const quote = parsePayload(formData)
  const intent = String(formData.get("intent") ?? "draft")
  const status = intent === "share" ? "shared" : quote.status
  const saved = await store.saveQuote(session, setQuoteStatus(quote, status))
  revalidatePath("/dashboard")
  revalidatePath(`/quotes/${saved.id}`)
  revalidatePath(`/quotes/${saved.id}/edit`)
  revalidatePath(`/q/${saved.slug}`)
  redirect(intent === "preview" ? `/quotes/${saved.id}` : `/quotes/${saved.id}/edit?saved=1`)
}

export async function duplicateQuoteAction(formData: FormData) {
  const session = await requireSession()
  const id = String(formData.get("id") ?? "")
  const store = getQuoteStore()
  const duplicated = await store.duplicateQuote(session, id)
  revalidatePath("/dashboard")
  if (!duplicated) {
    redirect("/dashboard")
  }
  redirect(`/quotes/${duplicated.id}/edit`)
}

export async function trashQuoteAction(formData: FormData) {
  const session = await requireSession()
  const id = String(formData.get("id") ?? "")
  const store = getQuoteStore()
  await store.trashQuote(session, id)
  revalidatePath("/dashboard")
  revalidatePath("/trash")
  redirect("/dashboard")
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
  redirect("/trash")
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
  redirect("/trash")
}
