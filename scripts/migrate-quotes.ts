import { readFile } from "node:fs/promises"
import path from "node:path"

import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

import { normalizeQuote } from "@/lib/quotes/store"
import type { QuoteRecord } from "@/lib/quotes/types"

config({ path: path.join(process.cwd(), ".env.local") })

const DATA_FILE = path.join(process.cwd(), ".data", "quotes.json")

function randomPassword() {
  return crypto.randomUUID().replaceAll("-", "")
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!url || !secretKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set (in .env.local).")
  }

  const supabase = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const raw = await readFile(DATA_FILE, "utf8")
  const parsed = JSON.parse(raw) as { quotes: QuoteRecord[] }
  const quotes = Array.isArray(parsed.quotes) ? parsed.quotes : []

  const emails = [...new Set(quotes.map((quote) => quote.ownerEmail))]
  console.log(`Found ${quotes.length} quotes across ${emails.length} owner(s): ${emails.join(", ")}`)

  const emailToUserId = new Map<string, string>()

  for (const email of emails) {
    const { data: existing } = await supabase.auth.admin.listUsers()
    const existingUser = existing?.users.find((user) => user.email === email)

    if (existingUser) {
      emailToUserId.set(email, existingUser.id)
      console.log(`Using existing Supabase user for ${email} (${existingUser.id})`)
      continue
    }

    const password = randomPassword()
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: email.split("@")[0] },
    })

    if (error || !data.user) {
      throw new Error(`Failed to create Supabase user for ${email}: ${error?.message}`)
    }

    emailToUserId.set(email, data.user.id)
    console.log(`Created Supabase user for ${email} (${data.user.id}) — temporary password: ${password}`)
  }

  let migrated = 0
  for (const quote of quotes) {
    const ownerId = emailToUserId.get(quote.ownerEmail)
    if (!ownerId) {
      throw new Error(`No Supabase user resolved for owner email ${quote.ownerEmail} on quote ${quote.id}`)
    }

    const normalized = normalizeQuote(quote)
    const { error } = await supabase.from("quotes").insert({
      id: normalized.id,
      slug: normalized.slug,
      owner_id: ownerId,
      status: normalized.status,
      last_active_status: normalized.lastActiveStatus,
      client_name: normalized.clientName,
      partner_name: normalized.partnerName,
      quote_title: normalized.quoteTitle,
      location: normalized.location,
      trashed_at: normalized.trashedAt,
      expires_at: normalized.expiresAt,
      payload: normalized,
    })

    if (error) {
      throw new Error(`Failed to insert quote ${quote.id}: ${error.message}`)
    }

    migrated += 1
  }

  console.log(`Migrated ${migrated}/${quotes.length} quotes.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
