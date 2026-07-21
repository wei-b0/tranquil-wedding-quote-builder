"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"

import { PdfExportLink } from "@/components/pdf-export-link"
import { EventImagePicker } from "@/components/event-image-picker"
import { ToastOnMount } from "@/components/toast-on-mount"
import { Button } from "@/components/ui/button"
import { applyCoverageDefaults } from "@/lib/quotes/defaults"
import { syncPackagePricing } from "@/lib/quotes/format"
import { isCeremonyArrangementEvent } from "@/lib/quotes/presentation-shared"
import type { EventMedia, QuotePackage, QuoteRecord } from "@/lib/quotes/types"

type QuoteEditorProps = {
  initialQuote: QuoteRecord
  saveAction: (formData: FormData) => void
  openPdfPreview?: boolean
}

const eventPresets = [
  "Engagement",
  "Haldi",
  "Mehandi",
  "Sangeet",
  "Sagan",
  "Choora",
  "Bhaat",
  "Lagan",
  "Wedding",
  "Reception",
  "Cocktail",
  "Prewedding",
]

const teamPresets = [
  "Traditional Photographer",
  "Traditional Videographer",
  "Candid Photographer",
  "Cinematographer",
  "Drone Operator",
  "Editor",
]

const packageInclusionPresets = [
  "Complete raw photos and videos",
  "Unlimited professionally edited photos",
  "60-second teaser in 24 hours",
  "Highlight film",
  "Full wedding film",
  "Drone coverage",
  "4 to 5 reels",
  "AI face scanner",
  "E-invite video",
]

const specialFeaturePresets = [
  "Premium album",
  "Luxury album",
  "Custom frame",
  "Designer frame",
  "AI face scanner",
  "Drone coverage",
  "Free prewedding shoot",
]

const deliverablePresets = [
  "All ultra super resolution raw photos",
  "Best selected edited pictures",
  "Full event documentary coverage",
  "60-second teaser within 24 hours",
  "5 to 6 minute cinematic short film",
  "4 to 5 reels for social media",
  "E-invite video",
]

const timingOptions = ["Morning", "Afternoon", "Evening", "Full day"]

const teamPluralLabels: Record<string, string> = {
  "Traditional Photographer": "Traditional Photographers",
  "Traditional Videographer": "Traditional Videographers",
  "Candid Photographer": "Candid Photographers",
  Cinematographer: "Cinematographers",
  "Drone Operator": "Drone Operators",
  Editor: "Editors",
}

function normalizeTeamRole(value: string) {
  if (["Photography", "Photographer", "Photographers"].includes(value)) {
    return "Traditional Photographer"
  }
  if (["Videography", "Videographer", "Videographers"].includes(value)) {
    return "Traditional Videographer"
  }
  if (value === "Candid") return "Candid Photographer"
  if (value === "Cinematic Videographer") return "Cinematographer"
  if (value === "Drone") return "Drone Operator"
  return value
}

function teamCountsFromValues(values: string[]) {
  const counts = new Map<string, number>()

  for (const rawValue of values) {
    const value = rawValue.trim()
    if (!value) continue
    const match = value.match(/^(\d+)\s+(.+)$/)
    const count = match ? Number(match[1]) : 1
    const role = normalizeTeamRole(match ? match[2].replace(/s$/, "") : value)
    counts.set(role, (counts.get(role) ?? 0) + count)
  }

  return counts
}

function teamValuesFromCounts(counts: Map<string, number>) {
  return teamPresets
    .map((role) => {
      const count = counts.get(role) ?? 0
      if (count <= 0) return null
      if (count === 1) return role
      return `${count} ${teamPluralLabels[role] ?? `${role}s`}`
    })
    .filter((value): value is string => Boolean(value))
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

function syncPrimaryLocation(current: QuoteRecord, nextLocation: string): QuoteRecord {
  return {
    ...current,
    location: nextLocation,
    events: current.events.map((event) => ({
      ...event,
      location: !event.location || event.location === current.location ? nextLocation : event.location,
    })),
  }
}

function PresetButtons({
  items,
  onSelect,
}: {
  items: string[]
  onSelect: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className="rounded-full border border-[#d7e1d3] bg-[#f5faf3] px-3 py-1 text-xs font-medium tracking-[0.04em] text-[#5d6d58]"
          onClick={() => onSelect(item)}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

function RowsEditor({
  label,
  values,
  onChange,
  presets,
  addLabel,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  presets?: string[]
  addLabel?: string
}) {
  const nextValues = values.length ? values : [""]

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[#39362f]">{label}</span>
        <button
          type="button"
          className={addButtonClassName()}
          onClick={() => onChange([...nextValues, ""])}
        >
          {addLabel || "Add row"}
        </button>
      </div>
      {presets?.length ? <PresetButtons items={presets} onSelect={(value) => onChange([...nextValues, value])} /> : null}
      <div className="grid gap-3">
        {nextValues.map((value, index) => (
          <div key={`${label}-${index}`} className="flex items-center gap-3">
            <input
              className={inputClassName()}
              value={value}
              onChange={(event) =>
                onChange(nextValues.map((entry, entryIndex) => (entryIndex === index ? event.target.value : entry)))
              }
            />
            <button
              type="button"
              className="rounded-full border border-[#e2ddd2] px-3 py-2 text-xs text-[#7f776b]"
              onClick={() => {
                const filtered = nextValues.filter((_, entryIndex) => entryIndex !== index)
                onChange(filtered.length ? filtered : [""])
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function EventTeamEditor({
  values,
  onChange,
}: {
  values: string[]
  onChange: (values: string[]) => void
}) {
  const counts = teamCountsFromValues(values)

  function updateRole(role: string, nextCount: number) {
    const next = new Map(counts)
    if (nextCount <= 0) {
      next.delete(role)
    } else {
      next.set(role, nextCount)
    }
    onChange(teamValuesFromCounts(next))
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[#39362f]">Event team</span>
        <span className="text-xs uppercase tracking-[0.16em] text-[#857a63]">Use +/- to set counts</span>
      </div>
      <div className="grid gap-3">
        {teamPresets.map((role) => {
          const count = counts.get(role) ?? 0

          return (
            <div
              key={role}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[#ddd7cc] bg-white px-4 py-3"
            >
              <div className="text-sm text-[#39362f]">{role}</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-9 w-9 rounded-full border border-[#ddd7cc] text-lg text-[#6d675b]"
                  onClick={() => updateRole(role, count - 1)}
                >
                  -
                </button>
                <div className="min-w-10 text-center text-sm font-medium text-[#39362f]">{count}</div>
                <button
                  type="button"
                  className="h-9 w-9 rounded-full border border-[#d7e1d3] bg-[#f5faf3] text-lg text-[#5d6d58]"
                  onClick={() => updateRole(role, count + 1)}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PackageCard({
  pkg,
  onChange,
}: {
  pkg: QuotePackage
  onChange: (nextPackage: QuotePackage) => void
}) {
  const pricingPreview = syncPackagePricing(pkg)
  const [isTeamOpen, setIsTeamOpen] = useState(false)
  const [isDeliverablesOpen, setIsDeliverablesOpen] = useState(false)
  const [isSpecialFeaturesOpen, setIsSpecialFeaturesOpen] = useState(false)

  return (
    <div className="rounded-[1.55rem] border border-[#ddd7cc] bg-[#fbf9f4] p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Package name">
          <input className={inputClassName()} value={pkg.name} onChange={(event) => onChange({ ...pkg, name: event.target.value })} />
        </Field>
        <Field label="Badge">
          <input className={inputClassName()} value={pkg.badge} onChange={(event) => onChange({ ...pkg, badge: event.target.value })} />
        </Field>
        <Field label="Subtitle">
          <input
            className={inputClassName()}
            value={pkg.subtitle}
            onChange={(event) => onChange({ ...pkg, subtitle: event.target.value })}
          />
        </Field>
        <Field label="Base price">
          <input
            className={inputClassName()}
            inputMode="numeric"
            value={pkg.basePrice}
            onChange={(event) => onChange(syncPackagePricing({ ...pkg, basePrice: event.target.value }))}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
        <Field label="Discount type">
          <select
            className={inputClassName()}
            value={pkg.discountType}
            onChange={(event) =>
              onChange(syncPackagePricing({ ...pkg, discountType: event.target.value as QuotePackage["discountType"] }))
            }
          >
            <option value="none">No discount</option>
            <option value="percentage">Percentage</option>
            <option value="flat">Flat amount</option>
          </select>
        </Field>
        <Field label={pkg.discountType === "percentage" ? "Discount percent" : "Discount amount"}>
          <input
            className={inputClassName()}
            inputMode="numeric"
            value={pkg.discountValue}
            onChange={(event) => onChange(syncPackagePricing({ ...pkg, discountValue: event.target.value }))}
          />
        </Field>
        <Field label="Offer label">
          <input
            className={inputClassName()}
            value={pkg.offerLabel}
            onChange={(event) => onChange({ ...pkg, offerLabel: event.target.value })}
            placeholder="Special offer"
          />
        </Field>
      </div>

      <div className="mt-4 rounded-[1.3rem] border border-[#e7debc] bg-[#fff8ea] px-4 py-3 text-sm text-[#6c634e]">
        Price shown to client: {pricingPreview.finalPrice ? pricingPreview.finalPrice : pkg.basePrice}
      </div>

      <div className="mt-4 grid gap-4">
        <div className="rounded-[1.35rem] border border-[#ddd7cc] bg-white px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-[#39362f]">Team</div>
              <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[#857a63]">
                {pkg.team.length} role{pkg.team.length === 1 ? "" : "s"}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="hover:text-[#39362f]"
              onClick={() => setIsTeamOpen((current) => !current)}
            >
              {isTeamOpen ? "Close" : "Edit"}
            </Button>
          </div>
          {isTeamOpen ? (
            <div className="mt-4">
              <RowsEditor
                label="Team"
                values={pkg.team}
                onChange={(team) => onChange({ ...pkg, team })}
                presets={teamPresets}
                addLabel="Add team member"
              />
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {pkg.team.map((member) => (
                <span
                  key={`${pkg.id}-${member}`}
                  className="rounded-full border border-[#d7e1d3] bg-[#f5faf3] px-3 py-1 text-xs font-medium tracking-[0.04em] text-[#5d6d58]"
                >
                  {member}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-[1.35rem] border border-[#ddd7cc] bg-white px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-[#39362f]">Package deliverables</div>
              <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[#857a63]">
                {pkg.items.length} inclusion{pkg.items.length === 1 ? "" : "s"}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="hover:text-[#39362f]"
              onClick={() => setIsDeliverablesOpen((current) => !current)}
            >
              {isDeliverablesOpen ? "Close" : "Edit"}
            </Button>
          </div>
          {isDeliverablesOpen ? (
            <div className="mt-4">
              <RowsEditor
                label="Package deliverables"
                values={pkg.items}
                onChange={(items) => onChange({ ...pkg, items })}
                presets={packageInclusionPresets}
                addLabel="Add inclusion"
              />
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {pkg.items.map((item) => (
                <span
                  key={`${pkg.id}-${item}`}
                  className="rounded-full border border-[#d7e1d3] bg-[#f5faf3] px-3 py-1 text-xs font-medium tracking-[0.04em] text-[#5d6d58]"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-[1.35rem] border border-[#ddd7cc] bg-white px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-[#39362f]">Special features</div>
              <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[#857a63]">
                {pkg.specialFeatures.length} feature{pkg.specialFeatures.length === 1 ? "" : "s"}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="hover:text-[#39362f]"
              onClick={() => setIsSpecialFeaturesOpen((current) => !current)}
            >
              {isSpecialFeaturesOpen ? "Close" : "Edit"}
            </Button>
          </div>
          {isSpecialFeaturesOpen ? (
            <div className="mt-4">
              <RowsEditor
                label="Special features"
                values={pkg.specialFeatures}
                onChange={(specialFeatures) => onChange({ ...pkg, specialFeatures })}
                presets={specialFeaturePresets}
                addLabel="Add feature"
              />
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {pkg.specialFeatures.map((item) => (
                <span
                  key={`${pkg.id}-${item}`}
                  className="rounded-full border border-[#d7e1d3] bg-[#f5faf3] px-3 py-1 text-xs font-medium tracking-[0.04em] text-[#5d6d58]"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SaveActions({
  intent,
  onIntentChange,
}: {
  intent: "save" | "pdf-preview" | "web-preview"
  onIntentChange: (intent: "save" | "pdf-preview" | "web-preview") => void
}) {
  const { pending } = useFormStatus()

  return (
    <section className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-[#ddd7cc] bg-white/90 p-4 shadow-[0_18px_45px_rgba(48,32,20,0.12)] backdrop-blur">
      <Button
        type="submit"
        variant="secondary"
        disabled={pending}
        className="bg-[#f3c747] text-[#3d382f] hover:bg-[#ebc95d] hover:text-[#3d382f]"
        name="intent"
        value="save"
        onClick={() => onIntentChange("save")}
      >
        {pending && intent === "save" ? <Loader2 className="animate-spin" /> : null}
        Save
      </Button>
      <Button
        type="submit"
        disabled={pending}
        className="bg-[#6f7f68] text-white hover:bg-[#65755e] hover:text-white"
        name="intent"
        value="pdf-preview"
        onClick={() => onIntentChange("pdf-preview")}
      >
        {pending && intent === "pdf-preview" ? <Loader2 className="animate-spin" /> : null}
        Save and Preview
      </Button>
      <Button
        type="submit"
        variant="outline"
        disabled={pending}
        className="hover:text-[#39362f]"
        name="intent"
        value="web-preview"
        formTarget="_blank"
        onClick={() => onIntentChange("web-preview")}
      >
        {pending && intent === "web-preview" ? <Loader2 className="animate-spin" /> : null}
        Open Web Preview
      </Button>
    </section>
  )
}

export function QuoteEditor({
  initialQuote,
  saveAction,
  openPdfPreview = false,
}: QuoteEditorProps) {
  const [quote, setQuote] = useState<QuoteRecord>(initialQuote)
  const [intent, setIntent] = useState<"save" | "pdf-preview" | "web-preview">("save")
  const [isAboutSectionOpen, setIsAboutSectionOpen] = useState(false)
  const [isPreWeddingTeamOpen, setIsPreWeddingTeamOpen] = useState(false)
  const [isPreWeddingDeliverablesOpen, setIsPreWeddingDeliverablesOpen] = useState(false)
  const [isLegalSectionOpen, setIsLegalSectionOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(openPdfPreview)
  const [eventMedia, setEventMedia] = useState<EventMedia[]>([])
  const [eventMediaLoading, setEventMediaLoading] = useState(true)
  const [eventMediaError, setEventMediaError] = useState<string | null>(null)
  const [showSavedToast] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("saved") === "1"
  )
  useEffect(() => {
    let active = true

    async function loadEventMedia() {
      try {
        const response = await fetch("/api/event-media")
        const payload = (await response.json()) as {
          media?: EventMedia[]
          error?: string
        }

        if (!response.ok || !payload.media) {
          throw new Error(payload.error || "Could not load your media library.")
        }

        if (active) setEventMedia(payload.media)
      } catch (error) {
        if (active) {
          setEventMediaError(
            error instanceof Error
              ? error.message
              : "Could not load your media library."
          )
        }
      } finally {
        if (active) setEventMediaLoading(false)
      }
    }

    loadEventMedia()
    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      <form action={saveAction} className="space-y-5">
        <input type="hidden" name="payload" value={JSON.stringify(quote)} readOnly />

        <section className={sectionCardClassName()}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7b776f]">Client & Quote</p>
              <h2 className="mt-2 font-serif text-2xl text-[#39362f]">Start with the couple and the event overview</h2>
            </div>
            <div className="text-xs uppercase tracking-[0.22em] text-[#7b776f]">{quote.status}</div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Client name">
              <input className={inputClassName()} value={quote.clientName} onChange={(event) => setQuote((current) => ({ ...current, clientName: event.target.value }))} />
            </Field>
            <Field label="Partner name">
              <input className={inputClassName()} value={quote.partnerName} onChange={(event) => setQuote((current) => ({ ...current, partnerName: event.target.value }))} />
            </Field>
            <Field label="Quote title">
              <input className={inputClassName()} value={quote.quoteTitle} onChange={(event) => setQuote((current) => ({ ...current, quoteTitle: event.target.value }))} />
            </Field>
            <Field label="Coverage">
              <input
                className={inputClassName()}
                value={quote.coverage}
                onChange={(event) =>
                  setQuote((current) =>
                    applyCoverageDefaults({
                      ...current,
                      coverage: event.target.value,
                    })
                  )
                }
              />
            </Field>
            <Field label="Primary location">
              <input
                className={inputClassName()}
                value={quote.location}
                onChange={(event) => setQuote((current) => syncPrimaryLocation(current, event.target.value))}
              />
            </Field>
            <Field label="Date range label (optional)">
              <input
                className={inputClassName()}
                value={quote.eventRangeLabel}
                onChange={(event) => setQuote((current) => ({ ...current, eventRangeLabel: event.target.value }))}
                placeholder="19 Oct 2026 to 22 Oct 2026"
              />
            </Field>
          </div>
          <div className="mt-4 rounded-[1.35rem] border border-[#ddd7cc] bg-[#f9f7f2] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-[#39362f]">Studio introduction</div>
                <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[#857a63]">
                  About title and about section
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="hover:text-[#39362f]"
                onClick={() => setIsAboutSectionOpen((current) => !current)}
              >
                {isAboutSectionOpen ? "Close" : "Edit"}
              </Button>
            </div>
            {isAboutSectionOpen ? (
              <div className="mt-4 grid gap-4">
                <Field label="About title">
                  <input className={inputClassName()} value={quote.aboutTitle} onChange={(event) => setQuote((current) => ({ ...current, aboutTitle: event.target.value }))} />
                </Field>
                <Field label="About section">
                  <textarea
                    className={`${inputClassName()} min-h-32`}
                    value={quote.aboutBody}
                    onChange={(event) => setQuote((current) => ({ ...current, aboutBody: event.target.value }))}
                  />
                </Field>
              </div>
            ) : (
              <div className="mt-4 rounded-[1.2rem] border border-[#ebe4d8] bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#857a63]">{quote.aboutTitle}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-7 text-[#5e5a54]">{quote.aboutBody}</p>
              </div>
            )}
          </div>
        </section>

        <section className={sectionCardClassName()}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7b776f]">Events</p>
              <h2 className="mt-2 font-serif text-2xl text-[#39362f]">Add each celebration as an event</h2>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {quote.events.map((item, index) => (
              <div key={item.id} className="rounded-[1.55rem] border border-[#ddd7cc] bg-[#f9f7f2] p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="font-medium text-[#39362f]">Event {index + 1}</p>
                  {quote.events.length > 1 ? (
                    <button
                      type="button"
                      className="text-sm text-[#7f776b]"
                      onClick={() =>
                        setQuote((current) => ({
                          ...current,
                          events: current.events.filter((event) => event.id !== item.id),
                        }))
                      }
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <Field label="Event type">
                    <select
                      className={inputClassName()}
                      value={
                        eventPresets.includes(item.title)
                          ? item.title
                          : item.title
                            ? "__custom__"
                            : ""
                      }
                      onChange={(event) => {
                        const nextTitle =
                          event.target.value === "__custom__"
                            ? "Custom event"
                            : event.target.value

                        setQuote((current) => ({
                          ...current,
                          events: current.events.map((entry) =>
                            entry.id === item.id
                              ? {
                                  ...entry,
                                  title: nextTitle,
                                  image: { source: "auto" },
                                }
                              : entry
                          ),
                        }))
                      }}
                    >
                      <option value="">Select event</option>
                      {eventPresets.map((preset) => (
                        <option key={preset} value={preset}>
                          {preset}
                        </option>
                      ))}
                      <option value="__custom__">Custom event</option>
                    </select>
                </Field>
                {item.title ? (
                  <>
                    {!eventPresets.includes(item.title) ? (
                      <div className="mt-4">
                        <Field label="Custom event title">
                          <input
                            className={inputClassName()}
                            value={item.title}
                            onChange={(event) =>
                              setQuote((current) => ({
                                ...current,
                                events: current.events.map((entry) =>
                                  entry.id === item.id
                                    ? { ...entry, title: event.target.value, image: { source: "auto" } }
                                    : entry
                                ),
                              }))
                            }
                          />
                        </Field>
                      </div>
                    ) : null}
                    <div className="mt-4 border-t border-[#e3ddd2] pt-4">
                      <EventImagePicker
                        event={item}
                        media={eventMedia}
                        mediaLoading={eventMediaLoading}
                        mediaError={eventMediaError}
                        onChange={(image) =>
                          setQuote((current) => ({
                            ...current,
                            events: current.events.map((entry) =>
                              entry.id === item.id ? { ...entry, image } : entry
                            ),
                          }))
                        }
                        onMediaAdded={(media) =>
                          setEventMedia((current) => [
                            media,
                            ...current.filter((entry) => entry.id !== media.id),
                          ])
                        }
                      />
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <Field label="Date">
                        <input
                          type="date"
                          required
                          className={inputClassName()}
                          value={item.date}
                          onChange={(event) =>
                            setQuote((current) => ({
                              ...current,
                              events: current.events.map((entry) =>
                                entry.id === item.id ? { ...entry, date: event.target.value } : entry
                              ),
                            }))
                          }
                        />
                      </Field>
                      <Field label="Location">
                        <input
                          className={inputClassName()}
                          value={item.location || quote.location}
                          placeholder={quote.location ? "Uses primary location" : "Enter location"}
                          onChange={(event) =>
                            setQuote((current) => ({
                              ...current,
                              events: current.events.map((entry) =>
                                entry.id === item.id ? { ...entry, location: event.target.value } : entry
                              ),
                            }))
                          }
                        />
                      </Field>
                      <Field label="Guest count">
                        <input
                          className={inputClassName()}
                          value={item.guestCount}
                          onChange={(event) =>
                            setQuote((current) => ({
                              ...current,
                              events: current.events.map((entry) =>
                                entry.id === item.id ? { ...entry, guestCount: event.target.value } : entry
                              ),
                            }))
                          }
                        />
                      </Field>
                      <Field label="Timing">
                        <select
                          className={inputClassName()}
                          value={item.timing}
                          onChange={(event) =>
                            setQuote((current) => ({
                              ...current,
                              events: current.events.map((entry) =>
                                entry.id === item.id ? { ...entry, timing: event.target.value } : entry
                              ),
                            }))
                          }
                        >
                          {timingOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </Field>
                      {isCeremonyArrangementEvent(item.title) ? (
                        <Field label="Ceremony arrangement">
                          <select
                            className={inputClassName()}
                            value={
                              item.coverage === "combined" || item.coverage === "separate"
                                ? item.coverage
                                : ""
                            }
                            onChange={(event) =>
                              setQuote((current) => ({
                                ...current,
                                events: current.events.map((entry) =>
                                  entry.id === item.id
                                    ? { ...entry, coverage: event.target.value }
                                    : entry
                                ),
                              }))
                            }
                          >
                            <option value="">Select arrangement</option>
                            <option value="combined">Combined ceremony</option>
                            <option value="separate">Separate ceremonies</option>
                          </select>
                        </Field>
                      ) : null}
                    </div>
                    <div className="mt-4">
                      <EventTeamEditor
                        values={item.team}
                        onChange={(team) =>
                          setQuote((current) => ({
                            ...current,
                            events: current.events.map((entry) =>
                              entry.id === item.id ? { ...entry, team } : entry
                            ),
                          }))
                        }
                      />
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              className={`${addButtonClassName()} px-5`}
              onClick={() =>
                setQuote((current) => ({
                  ...current,
                  events: [
                    ...current.events,
                    {
                      id: crypto.randomUUID(),
                      date: "",
                      title: "",
                      location: current.location,
                      coverage: "",
                      guestCount: "",
                      timing: "Morning",
                      team: [
                        "Traditional Photographer",
                        "Traditional Videographer",
                      ],
                      image: { source: "auto" },
                    },
                  ],
                }))
              }
            >
              Add event
            </Button>
          </div>
        </section>

        <section className={sectionCardClassName()}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7b776f]">Prewedding</p>
              <h2 className="mt-2 font-serif text-2xl text-[#39362f]">Include Pre-Wedding Shoot</h2>
            </div>
            <label className="flex items-center gap-2 text-sm text-[#5e5a54]">
              <input
                type="checkbox"
                checked={quote.includePreWedding}
                onChange={(event) => setQuote((current) => ({ ...current, includePreWedding: event.target.checked }))}
              />
              Include
            </label>
          </div>
          {quote.includePreWedding ? (
            <div className="mt-5 grid gap-4">
              <Field label="Section title">
                <input className={inputClassName()} value={quote.preWeddingLabel} onChange={(event) => setQuote((current) => ({ ...current, preWeddingLabel: event.target.value }))} />
              </Field>
              <Field label="Price">
                <input
                  className={inputClassName()}
                  value={quote.preWeddingPriceLabel}
                  onChange={(event) => setQuote((current) => ({ ...current, preWeddingPriceLabel: event.target.value }))}
                  placeholder="Priced separately"
                />
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  className={inputClassName()}
                  value={quote.preWeddingDate}
                  onChange={(event) => setQuote((current) => ({ ...current, preWeddingDate: event.target.value }))}
                />
              </Field>
              <Field label="Location">
                <input
                  className={inputClassName()}
                  value={quote.preWeddingLocation}
                  onChange={(event) =>
                    setQuote((current) => ({ ...current, preWeddingLocation: event.target.value }))
                  }
                  placeholder="Venue or city"
                />
              </Field>
              <div className="rounded-[1.35rem] border border-[#ddd7cc] bg-[#f9f7f2] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-[#39362f]">Prewedding team</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[#857a63]">
                      {quote.preWeddingTeam.length} role{quote.preWeddingTeam.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="hover:text-[#39362f]"
                    onClick={() => setIsPreWeddingTeamOpen((current) => !current)}
                  >
                    {isPreWeddingTeamOpen ? "Close" : "Edit"}
                  </Button>
                </div>
                {isPreWeddingTeamOpen ? (
                  <div className="mt-4">
                    <RowsEditor
                      label="Prewedding team"
                      values={quote.preWeddingTeam}
                      onChange={(preWeddingTeam) => setQuote((current) => ({ ...current, preWeddingTeam }))}
                      presets={teamPresets}
                      addLabel="Add team member"
                    />
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {quote.preWeddingTeam.map((member) => (
                      <span
                        key={member}
                        className="rounded-full border border-[#d7e1d3] bg-[#f5faf3] px-3 py-1 text-xs font-medium tracking-[0.04em] text-[#5d6d58]"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-[1.35rem] border border-[#ddd7cc] bg-[#f9f7f2] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-[#39362f]">Prewedding deliverables</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[#857a63]">
                      {quote.preWeddingDeliverables.length} item{quote.preWeddingDeliverables.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="hover:text-[#39362f]"
                    onClick={() => setIsPreWeddingDeliverablesOpen((current) => !current)}
                  >
                    {isPreWeddingDeliverablesOpen ? "Close" : "Edit"}
                  </Button>
                </div>
                {isPreWeddingDeliverablesOpen ? (
                  <div className="mt-4">
                    <RowsEditor
                      label="Prewedding deliverables"
                      values={quote.preWeddingDeliverables}
                      onChange={(preWeddingDeliverables) => setQuote((current) => ({ ...current, preWeddingDeliverables }))}
                      presets={deliverablePresets}
                      addLabel="Add deliverable"
                    />
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {quote.preWeddingDeliverables.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[#d7e1d3] bg-[#f5faf3] px-3 py-1 text-xs font-medium tracking-[0.04em] text-[#5d6d58]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>

        <section className={sectionCardClassName()}>
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b776f]">Packages</p>
          <h2 className="mt-2 font-serif text-2xl text-[#39362f]">Three packages with negotiation built in</h2>
          <div className="mt-5 space-y-4">
            {quote.packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onChange={(nextPackage) =>
                  setQuote((current) => ({
                    ...current,
                    packages: current.packages.map((entry) => (entry.id === pkg.id ? nextPackage : entry)),
                  }))
                }
              />
            ))}
          </div>
        </section>

        <section className={sectionCardClassName()}>
          <p className="text-xs uppercase tracking-[0.3em] text-[#7b776f]">Deliverables & Payments</p>
          <h2 className="mt-2 font-serif text-2xl text-[#39362f]">Package deliverables live above, payment flow stays here</h2>
          <div className="mt-5 grid gap-5">
            <div className="rounded-[1.35rem] border border-[#ddd7cc] bg-[#f9f7f2] px-4 py-4 text-sm leading-7 text-[#5e5a54]">
              Each package now carries its own deliverables. Update Classic, Signature, and Luxury in the Packages section above, and the preview, share page, and PDF will reflect those package-specific promises automatically.
            </div>
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[#39362f]">Payment schedule</span>
                <button
                  type="button"
                  className={addButtonClassName()}
                  onClick={() =>
                    setQuote((current) => ({
                      ...current,
                      paymentTerms: [
                        ...current.paymentTerms,
                        { id: crypto.randomUUID(), label: "New milestone", percentage: 0, description: "" },
                      ],
                    }))
                  }
                >
                  Add milestone
                </button>
              </div>
              {quote.paymentTerms.map((term) => (
                <div key={term.id} className="grid gap-4 rounded-[1.45rem] border border-[#ddd7cc] bg-[#f9f7f2] p-4 md:grid-cols-[1fr_130px]">
                  <div className="space-y-4">
                    <Field label="Label">
                      <input
                        className={inputClassName()}
                        value={term.label}
                        onChange={(event) =>
                          setQuote((current) => ({
                            ...current,
                            paymentTerms: current.paymentTerms.map((entry) =>
                              entry.id === term.id ? { ...entry, label: event.target.value } : entry
                            ),
                          }))
                        }
                      />
                    </Field>
                    <Field label="Description">
                      <input
                        className={inputClassName()}
                        value={term.description}
                        onChange={(event) =>
                          setQuote((current) => ({
                            ...current,
                            paymentTerms: current.paymentTerms.map((entry) =>
                              entry.id === term.id ? { ...entry, description: event.target.value } : entry
                            ),
                          }))
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
                          setQuote((current) => ({
                            ...current,
                            paymentTerms: current.paymentTerms.map((entry) =>
                              entry.id === term.id ? { ...entry, percentage: Number(event.target.value || 0) } : entry
                            ),
                          }))
                        }
                      />
                    </Field>
                    <button
                      type="button"
                      className="text-sm text-[#857a63]"
                      onClick={() =>
                        setQuote((current) => ({
                          ...current,
                          paymentTerms:
                            current.paymentTerms.length > 1
                              ? current.paymentTerms.filter((entry) => entry.id !== term.id)
                              : current.paymentTerms,
                        }))
                      }
                    >
                      Remove milestone
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={sectionCardClassName()}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7b776f]">Legal & Contact</p>
              <h2 className="mt-2 font-serif text-2xl text-[#39362f]">Terms, privacy, and closing details</h2>
            </div>
            {!isLegalSectionOpen ? (
              <Button type="button" variant="outline" onClick={() => setIsLegalSectionOpen(true)}>
                Edit
              </Button>
            ) : null}
          </div>
          {isLegalSectionOpen ? (
            <div className="mt-5 grid gap-5">
              <RowsEditor
                label="Terms & Conditions"
                values={quote.terms}
                onChange={(terms) => setQuote((current) => ({ ...current, terms }))}
                addLabel="Add term"
              />
              <RowsEditor
                label="Privacy policy"
                values={quote.privacyPolicy}
                onChange={(privacyPolicy) => setQuote((current) => ({ ...current, privacyPolicy }))}
                addLabel="Add privacy point"
              />
              <div className="rounded-[1.35rem] border border-[#ddd7cc] bg-[#fcfaf5] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[#857a63]">Creator-led closing CTA</p>
                <p className="mt-2 text-sm leading-7 text-[#5e5a54]">
                  Reserve Now and WhatsApp contact details now come from the quote creator&apos;s sales profile instead of each quote.
                </p>
                <Link href="/settings/profile" className="mt-4 inline-flex rounded-full border border-[#d4c7a7] bg-[#f8edd0] px-4 py-2 text-sm font-medium text-[#5d4e2e] transition hover:border-[#c4b385] hover:bg-[#f3e2b2] hover:text-[#5d4e2e]">
                  Manage creator profile
                </Link>
              </div>
            </div>
          ) : null}
        </section>

        <SaveActions intent={intent} onIntentChange={setIntent} />
      </form>

      {showSavedToast ? <ToastOnMount message="Quote saved." /> : null}

      {isPreviewOpen ? (
        <div className="fixed inset-0 z-50 bg-black/55 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[1.75rem] border border-[#ddd7cc] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#e6e0d5] px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#857a63]">PDF Preview</p>
                <h2 className="mt-1 font-serif text-2xl text-[#39362f]">Current quotation preview</h2>
              </div>
              <div className="flex items-center gap-3">
                <PdfExportLink
                  href={`/api/quotes/${quote.id}/pdf?v=${encodeURIComponent(quote.updatedAt)}`}
                  className="rounded-full border border-[#ddd7cc] px-4 py-2 text-sm text-[#5e5a54] transition hover:border-[#c8c0b2] hover:bg-[#f6f1e8] hover:text-[#5e5a54]"
                >
                  Open in new tab
                </PdfExportLink>
                <Button type="button" variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 bg-[#f4efe6] p-4">
              <iframe
                title="Quotation PDF Preview"
                src={`/api/quotes/${quote.id}/pdf?v=${encodeURIComponent(quote.updatedAt)}`}
                className="h-full w-full rounded-[1.25rem] border border-[#ddd7cc] bg-white"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
