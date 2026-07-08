import { loginAction } from "@/app/actions"
import { SubmitButton } from "@/components/submit-button"
import { ToastOnMount } from "@/components/toast-on-mount"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; loggedout?: string }>
}) {
  const { error, loggedout } = await searchParams

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,201,147,0.35),transparent_28%),linear-gradient(180deg,#2a1a13_0%,#6c4831_48%,#f7efe4_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2.5rem] border border-white/10 bg-white/10 p-8 text-white shadow-[0_30px_80px_rgba(24,13,7,0.28)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-100">The Tranquil Wedding</p>
          <h1 className="mt-4 max-w-xl font-serif text-5xl leading-tight">
            Build premium wedding quotations without editing documents manually.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-100">
            Create a structured quote, present three strong package options with the center package highlighted,
            publish a client-ready share page, and export a polished PDF from the same quote.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <p className="text-sm font-medium">Dashboard</p>
              <p className="mt-2 text-sm text-stone-200">Search, duplicate, delete, restore, and manage quotes.</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <p className="text-sm font-medium">Builder</p>
              <p className="mt-2 text-sm text-stone-200">Edit schedule, packages, deliverables, and terms.</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <p className="text-sm font-medium">Share + PDF</p>
              <p className="mt-2 text-sm text-stone-200">Send a public link or download a branded proposal.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-stone-200 bg-[#fffdf9] p-8 shadow-[0_30px_80px_rgba(24,13,7,0.16)]">
          <h2 className="font-serif text-3xl text-stone-900">Sales team sign in</h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Sign in with your team account. Contact your admin if you need access.
          </p>

          {error ? (
            <div className="mt-6 rounded-[1.75rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {error}
            </div>
          ) : null}
          {error ? <ToastOnMount message={error} type="error" /> : null}
          {loggedout ? <ToastOnMount message="Signed out." /> : null}

          <form action={loginAction} className="mt-8 grid gap-4">
            <label className="grid gap-2 text-sm text-stone-700">
              <span className="font-medium text-stone-900">Email</span>
              <input
                name="email"
                type="email"
                required
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                placeholder="sales@thetranquilwedding.com"
              />
            </label>
            <label className="grid gap-2 text-sm text-stone-700">
              <span className="font-medium text-stone-900">Password</span>
              <input
                name="password"
                type="password"
                required
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
                placeholder="••••••••"
              />
            </label>
            <SubmitButton
              size="lg"
              pendingText="Signing in…"
              className="mt-2 h-12 rounded-full bg-stone-900 px-6 text-white hover:bg-stone-800"
            >
              Enter quote builder
            </SubmitButton>
          </form>
        </section>
      </div>
    </div>
  )
}
