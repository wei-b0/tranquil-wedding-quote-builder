import { redirect } from "next/navigation"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { QuoteSession } from "@/lib/quotes/types"

export async function getSession(): Promise<QuoteSession | null> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return null
  }

  return {
    userId: user.id,
    email: user.email,
    name: (user.user_metadata?.full_name as string | undefined) || user.email.split("@")[0],
  }
}

export async function requireSession(): Promise<QuoteSession> {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}
