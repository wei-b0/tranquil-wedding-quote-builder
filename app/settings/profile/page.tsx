import Link from "next/link"

import { saveSalesProfileAction } from "@/app/actions"
import { DashboardShell } from "@/components/dashboard-shell"
import { SubmitButton } from "@/components/submit-button"
import { ToastOnMount } from "@/components/toast-on-mount"
import { buttonVariants } from "@/components/ui/button"
import { requireSession } from "@/lib/auth"
import {
  buildSalesProfileDraft,
  getSalesProfileStore,
} from "@/lib/sales-profiles/store"

function inputClassName() {
  return "w-full rounded-2xl border border-[#ddd7cc] bg-white px-4 py-3 text-sm text-[#39362f] outline-none transition focus:border-[#f3c747]"
}

export default async function SalesProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; required?: string; next?: string }>
}) {
  const session = await requireSession()
  const params = await searchParams
  const profileStore = getSalesProfileStore()
  const profile = buildSalesProfileDraft(
    session,
    await profileStore.getProfile(session)
  )
  const next = params.next ?? "/dashboard?profile=1"

  return (
    <DashboardShell
      session={session}
      title="Sales Profile"
      subtitle="Set the direct contact details that appear in Reserve Now and WhatsApp CTAs across every quote you create."
      activeSection="profile"
    >
      {params.saved ? <ToastOnMount message="Sales profile saved." /> : null}
      {params.required ? (
        <ToastOnMount
          message="Complete your sales profile before creating a quote."
          type="error"
        />
      ) : null}

      <section className="rounded-[2rem] border border-stone-200 bg-white/85 p-6 shadow-[0_18px_45px_rgba(48,32,20,0.06)]">
        <form action={saveSalesProfileAction} className="grid gap-6">
          <input type="hidden" name="next" value={next} />
          <div>
            <p className="text-xs tracking-[0.3em] text-stone-500 uppercase">
              Quote owner identity
            </p>
            <h2 className="mt-2 font-serif text-3xl text-stone-900">
              This is the person clients will contact
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
              Keep this simple. The quote footer will only show your name, your
              role line, and WhatsApp CTAs.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-[#5e5a54]">
              <span className="font-medium text-[#39362f]">Display name</span>
              <input
                name="displayName"
                defaultValue={profile.displayName}
                className={inputClassName()}
                required
              />
            </label>
            <label className="grid gap-2 text-sm text-[#5e5a54]">
              <span className="font-medium text-[#39362f]">Role / title</span>
              <input
                name="title"
                defaultValue={profile.title}
                className={inputClassName()}
                required
              />
            </label>
            <label className="grid gap-2 text-sm text-[#5e5a54]">
              <span className="font-medium text-[#39362f]">WhatsApp</span>
              <input
                name="whatsapp"
                defaultValue={profile.whatsapp}
                className={inputClassName()}
                required
              />
            </label>
            <label className="grid gap-2 text-sm text-[#5e5a54]">
              <span className="font-medium text-[#39362f]">
                Profile photo URL
              </span>
              <input
                name="avatarUrl"
                defaultValue={profile.avatarUrl ?? ""}
                className={inputClassName()}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <SubmitButton
              size="lg"
              pendingText="Saving…"
              className="rounded-full bg-stone-900 px-5 text-white hover:bg-stone-800 hover:text-white"
            >
              Save profile
            </SubmitButton>
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </DashboardShell>
  )
}
