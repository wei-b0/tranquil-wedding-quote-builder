import Image from "next/image"

import {
  computePackagePricing,
  formatCurrency,
  formatDateLabel,
  formatTeamLabel,
} from "@/lib/quotes/format"
import {
  getCeremonyArrangementLabel,
  getQuoteImageSlots,
  getPackageDeliverables,
  getEventImageObjectPosition,
  getQuoteSummaryRows,
  getQuoteWhatsAppMessageHref,
  getSalesProfileInitials,
  getSalesProfileRoleLine,
  quoteTheme,
} from "@/lib/quotes/presentation"
import type { QuoteRecord, SalesProfile } from "@/lib/quotes/types"
import { cn } from "@/lib/utils"

type QuotePreviewProps = {
  quote: QuoteRecord
  salesProfile?: SalesProfile | null
  publicView?: boolean
}

const studioStats = [
  { value: "500+", label: "events captured" },
  { value: "1200+", label: "films and galleries delivered" },
  { value: "24 hr", label: "teaser turnaround on select edits" },
]

function SectionHead({
  kicker,
  title,
  center = true,
}: {
  kicker: string
  title: string
  center?: boolean
}) {
  return (
    <div className={cn("mb-10", center ? "text-center" : "text-left")}>
      <p
        className="text-[0.72rem] tracking-[0.3em] uppercase"
        style={{ color: quoteTheme.colors.sage }}
      >
        {kicker}
      </p>
      <h2
        className="mt-3 font-serif text-4xl leading-none md:text-5xl"
        style={{ color: quoteTheme.colors.forest }}
      >
        {title}
      </h2>
      <div
        className={cn("mt-5 h-px w-[4.5rem]", center ? "mx-auto" : "mx-0")}
        style={{ backgroundColor: quoteTheme.colors.sage }}
      />
    </div>
  )
}

function PackageCard({
  quote,
  packageIndex,
}: {
  quote: QuoteRecord
  packageIndex: number
}) {
  const pkg = quote.packages[packageIndex]
  const pricing = computePackagePricing(pkg)

  return (
    <article
      className={cn(
        "grid gap-5 rounded-[1.1rem] border p-6 md:grid-cols-[0.8fr_1.45fr_0.8fr] md:items-center",
        pkg.recommended && "shadow-[0_28px_50px_rgba(28,53,45,0.12)]"
      )}
      style={{
        backgroundColor: pkg.recommended
          ? quoteTheme.colors.surfaceSoft
          : quoteTheme.colors.white,
        borderColor: pkg.recommended
          ? quoteTheme.colors.lineStrong
          : quoteTheme.colors.line,
      }}
    >
      <div>
        <p
          className="text-[0.68rem] tracking-[0.24em] uppercase"
          style={{ color: quoteTheme.colors.sage }}
        >
          {pkg.recommended ? "Recommended package" : "Package"}
        </p>
        <h3
          className="mt-2 font-serif text-3xl leading-none"
          style={{ color: quoteTheme.colors.forest }}
        >
          {pkg.name}
        </h3>
        <span
          className="mt-4 inline-flex rounded-full px-3 py-1 text-[0.62rem] tracking-[0.18em] uppercase"
          style={{
            backgroundColor: pkg.recommended
              ? quoteTheme.colors.forest
              : quoteTheme.colors.blush,
            color: pkg.recommended
              ? quoteTheme.colors.ivory
              : quoteTheme.colors.forest,
          }}
        >
          {pkg.badge}
        </span>
      </div>

      <p
        className="text-sm leading-7"
        style={{ color: quoteTheme.colors.supportText }}
      >
        {pkg.subtitle}
      </p>

      <div
        className="border-t pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6"
        style={{ borderColor: quoteTheme.colors.line }}
      >
        <p
          className="text-[0.68rem] tracking-[0.2em] uppercase"
          style={{ color: quoteTheme.colors.sage }}
        >
          Package price
        </p>
        {pricing.applied ? (
          <p
            className="mt-2 text-xs tracking-[0.14em] uppercase"
            style={{ color: quoteTheme.colors.sage }}
          >
            {pkg.offerLabel || "Special offer"}
          </p>
        ) : null}
        {pricing.applied ? (
          <p
            className="mt-1 font-serif text-lg line-through"
            style={{ color: quoteTheme.colors.mutedText }}
          >
            {formatCurrency(pricing.base)}
          </p>
        ) : null}
        <p
          className="mt-2 font-serif text-3xl leading-none"
          style={{ color: quoteTheme.colors.forest }}
        >
          {formatCurrency(pricing.applied ? pricing.final : pkg.basePrice)}
        </p>
      </div>
    </article>
  )
}

export function QuotePreview({ quote, salesProfile = null, publicView = false }: QuotePreviewProps) {
  const imageSlots = getQuoteImageSlots(quote)
  const summaryRows = getQuoteSummaryRows(quote)
  const recommendedPackage = quote.packages.find((pkg) => pkg.recommended)
  const recommendedPricing = recommendedPackage
    ? computePackagePricing(recommendedPackage)
    : null
  const whatsappHref = salesProfile?.whatsapp
    ? getQuoteWhatsAppMessageHref(
      salesProfile.whatsapp,
      `We reviewed the quotation for ${[quote.clientName, quote.partnerName].filter(Boolean).join(" & ") || quote.quoteTitle} and want to connect.`
    )
    : null
  const initials = getSalesProfileInitials(salesProfile)

  return (
    <div
      className="overflow-hidden border shadow-[0_28px_80px_rgba(28,53,45,0.1)]"
      style={{
        borderRadius: quoteTheme.spacing.outerRadius,
        borderColor: quoteTheme.colors.line,
        backgroundColor: quoteTheme.colors.ivory,
        color: quoteTheme.colors.text,
      }}
    >
      <div
        className="px-6 py-3 text-center text-[0.68rem] tracking-[0.32em] uppercase md:px-10"
        style={{
          backgroundColor: quoteTheme.colors.forest,
          color: quoteTheme.colors.ivory,
        }}
      >
        Photography & Videography Quotation
      </div>

      <div className="px-6 pt-10 pb-8 md:px-10 md:pt-14">
        <div className="text-center">
          <div
            className="mx-auto flex h-19 w-19 items-center justify-center overflow-hidden rounded-full border"
            style={{
              borderColor: quoteTheme.colors.sage,
              backgroundColor: quoteTheme.colors.forest,
            }}
          >
            <img
              src="/brand/logo.png"
              alt="The Tranquil Wedding"
              className="h-[62%] w-[62%] object-contain"
            />
          </div>
          <p
            className="mt-4 text-[0.98rem] tracking-[0.34em] uppercase md:text-[1.05rem]"
            style={{ color: quoteTheme.colors.forest }}
          >
            The Tranquil Wedding
          </p>
        </div>

        <section className="pt-10">
          <div className="text-center">
            <p
              className="text-[0.72rem] tracking-[0.32em] uppercase"
              style={{ color: quoteTheme.colors.sage }}
            >
              Curated quotation
            </p>
            <p
              className="font-accent mt-5 text-4xl md:text-5xl"
              style={{ color: quoteTheme.colors.blush }}
            >
              wedding story
            </p>
          </div>

          <div className="relative mt-10 h-[18rem] overflow-hidden md:h-[28rem]">
            <Image
              src={imageSlots.hero}
              alt="Quotation hero"
              fill
              className="object-cover object-center"
            />
          </div>
        </section>
      </div>

      <section
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${summaryRows.length}, minmax(0, 1fr))`,
          backgroundColor: quoteTheme.colors.forest,
          color: quoteTheme.colors.ivory,
        }}
      >
        {summaryRows.map((row, index) => (
          <div
            key={row.label}
            className="px-6 py-7 text-center md:px-8"
            style={{
              borderLeftWidth: index === 0 ? 0 : 1,
              borderLeftColor: "rgba(249,246,243,0.16)",
            }}
          >
            <p
              className="text-[0.68rem] tracking-[0.24em] uppercase"
              style={{ color: quoteTheme.colors.blush }}
            >
              {row.label}
            </p>
            <p className="mt-2 font-serif text-3xl leading-tight">
              {row.value}
            </p>
          </div>
        ))}
      </section>

      <div className="px-6 py-14 md:px-10 md:py-20">
        <section>
          <SectionHead kicker="Studio note" title={quote.aboutTitle} />
          <div className="grid gap-10 xl:grid-cols-[0.9fr_1.1fr] xl:items-center">
            <div className="relative h-[26rem] overflow-hidden rounded-[0.2rem]">
              <Image
                src={imageSlots.about}
                alt="About placeholder"
                fill
                className="object-cover object-center"
              />
            </div>
            <div>
              <p
                className="text-base leading-8 md:text-lg"
                style={{ color: quoteTheme.colors.text }}
              >
                {quote.aboutBody}
              </p>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {studioStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="border-t-2 pt-3"
                    style={{ borderColor: quoteTheme.colors.blush }}
                  >
                    <strong
                      className="block font-serif text-4xl"
                      style={{ color: quoteTheme.colors.forest }}
                    >
                      {stat.value}
                    </strong>
                    <span
                      className="text-sm"
                      style={{ color: quoteTheme.colors.supportText }}
                    >
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className="mt-8 rounded-[0.2rem] px-6 py-5 font-serif text-2xl italic"
                style={{
                  backgroundColor: quoteTheme.colors.forest,
                  color: quoteTheme.colors.ivory,
                }}
              >
                Every frame is shot to be relived, not just remembered.
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <SectionHead
            kicker="Event flow"
            title="A closer look at each celebration"
          />
          <div
            className="relative overflow-hidden rounded-[0.35rem] px-4 py-6 md:px-7 md:py-8 lg:px-10"
            style={{
              background:
                "linear-gradient(180deg, #F9F6F3 0%, #F4EFE9 58%, #F9F6F3 100%)",
            }}
          >
            <div
              className="absolute top-8 bottom-8 left-1/2 hidden w-px -translate-x-1/2 lg:block"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, #A6B28B 0 7px, transparent 7px 14px)",
              }}
            />
            {quote.events.map((event, index) => (
              <div
                key={event.id}
                className="relative mb-10 last:mb-0 lg:grid lg:grid-cols-[1fr_4rem_1fr] lg:gap-x-7"
              >
                {index % 2 === 0 ? (
                  <>
                    <article
                      className="overflow-hidden rounded-[0.2rem] border bg-white"
                      style={{ borderColor: quoteTheme.colors.line }}
                    >
                      <div className="relative h-[16rem]">
                        <Image
                          src={imageSlots.eventImages[index] || imageSlots.hero}
                          alt={event.title || "Event image"}
                          fill
                          className="object-cover object-center"
                          style={{
                            objectPosition: getEventImageObjectPosition(event),
                          }}
                        />
                      </div>
                      <div className="px-6 py-6 lg:px-7">
                        <p
                          className="text-[0.68rem] tracking-[0.22em] uppercase"
                          style={{ color: quoteTheme.colors.sage }}
                        >
                          Event {index + 1} • {formatDateLabel(event.date)}
                        </p>
                        <h3
                          className="mt-3 font-serif text-4xl leading-none"
                          style={{ color: quoteTheme.colors.forest }}
                        >
                          {event.title || "Event title"}
                        </h3>
                        <div
                          className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm"
                          style={{ color: quoteTheme.colors.text }}
                        >
                          {[
                            event.location || quote.location || "Location",
                            event.guestCount || "Guest count TBD",
                            event.timing || "Timing TBD",
                            ...[getCeremonyArrangementLabel(event.coverage)].filter(
                              (label): label is string => label !== null
                            ),
                          ].map((meta) => (
                            <span
                              key={meta}
                              className="inline-flex items-center gap-2"
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  backgroundColor: quoteTheme.colors.blush,
                                }}
                              />
                              {meta}
                            </span>
                          ))}
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {event.team.map((member) => (
                            <span
                              key={member}
                              className="rounded-full border px-3 py-1 text-[0.68rem] tracking-[0.14em] uppercase"
                              style={{
                                borderColor: quoteTheme.colors.sage,
                                backgroundColor: "rgba(166,178,139,0.12)",
                                color: quoteTheme.colors.forestSoft,
                              }}
                            >
                              {member}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                    <div className="hidden items-start justify-center pt-4 lg:flex">
                      <span
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border bg-[#F9F6F3] font-serif text-xl"
                        style={{
                          borderColor: quoteTheme.colors.sage,
                          color: quoteTheme.colors.forest,
                        }}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <div className="hidden lg:block" />
                  </>
                ) : (
                  <>
                    <div className="hidden lg:block" />
                    <div className="hidden items-start justify-center pt-4 lg:flex">
                      <span
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border bg-[#F9F6F3] font-serif text-xl"
                        style={{
                          borderColor: quoteTheme.colors.sage,
                          color: quoteTheme.colors.forest,
                        }}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <article
                      className="overflow-hidden rounded-[0.2rem] border bg-white"
                      style={{ borderColor: quoteTheme.colors.line }}
                    >
                      <div className="relative h-[16rem]">
                        <Image
                          src={imageSlots.eventImages[index] || imageSlots.hero}
                          alt={event.title || "Event image"}
                          fill
                          className="object-cover object-center"
                          style={{
                            objectPosition: getEventImageObjectPosition(event),
                          }}
                        />
                      </div>
                      <div className="px-6 py-6 lg:px-7">
                        <p
                          className="text-[0.68rem] tracking-[0.22em] uppercase"
                          style={{ color: quoteTheme.colors.sage }}
                        >
                          Day {index + 1} • {formatDateLabel(event.date)}
                        </p>
                        <h3
                          className="mt-3 font-serif text-4xl leading-none"
                          style={{ color: quoteTheme.colors.forest }}
                        >
                          {event.title || "Event title"}
                        </h3>
                        <div
                          className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm"
                          style={{ color: quoteTheme.colors.text }}
                        >
                          {[
                            event.location || quote.location || "Location",
                            event.guestCount || "Guest count TBD",
                            event.timing || "Timing TBD",
                            ...[getCeremonyArrangementLabel(event.coverage)].filter(
                              (label): label is string => label !== null
                            ),
                          ].map((meta) => (
                            <span
                              key={meta}
                              className="inline-flex items-center gap-2"
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  backgroundColor: quoteTheme.colors.blush,
                                }}
                              />
                              {meta}
                            </span>
                          ))}
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {event.team.map((member) => (
                            <span
                              key={member}
                              className="rounded-full border px-3 py-1 text-[0.68rem] tracking-[0.14em] uppercase"
                              style={{
                                borderColor: quoteTheme.colors.sage,
                                backgroundColor: "rgba(166,178,139,0.12)",
                                color: quoteTheme.colors.forestSoft,
                              }}
                            >
                              {member}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  </>
                )}
                <div className="mt-4 flex justify-center lg:hidden">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-[#F9F6F3] font-serif text-lg"
                    style={{
                      borderColor: quoteTheme.colors.sage,
                      color: quoteTheme.colors.forest,
                    }}
                  >
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {quote.includePreWedding ? (
          <section className="mt-20">
            <SectionHead
              kicker="Pre wedding"
              title={quote.preWeddingLabel || "Pre wedding editorial"}
            />
            <div
              className="grid gap-8 rounded-[0.2rem] border bg-white p-6 xl:grid-cols-[0.98fr_1.02fr] xl:items-center"
              style={{ borderColor: quoteTheme.colors.line }}
            >
              <div className="rounded-[0.2rem] border bg-[#fcfaf6] p-6" style={{ borderColor: quoteTheme.colors.line }}>
                <div className="grid gap-4 sm:grid-cols-[1fr_170px]">
                  <div
                    className="rounded-[0.2rem] border px-5 py-5"
                    style={{
                      borderColor: quoteTheme.colors.line,
                      backgroundColor: quoteTheme.colors.white,
                    }}
                  >
                    <div>
                      <p
                        className="mt-3 font-serif text-3xl leading-none"
                        style={{ color: quoteTheme.colors.forest }}
                      >
                        {quote.preWeddingDate ? formatDateLabel(quote.preWeddingDate) : "Date to be decided"}
                      </p>
                      <p
                        className="mt-3 text-sm font-medium"
                        style={{ color: quoteTheme.colors.forestSoft }}
                      >
                        {quote.preWeddingLocation || quote.location || "Location to be decided"}
                      </p>
                      <p
                        className="mt-3 text-sm leading-7"
                        style={{ color: quoteTheme.colors.supportText }}
                      >
                        A dedicated couple shoot designed for announcement, countdown, and story-led social edits.
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex min-h-[10.5rem] items-center justify-center rounded-[0.2rem] border px-5 py-5 text-center"
                    style={{
                      borderColor: quoteTheme.colors.blush,
                      color: quoteTheme.colors.forest,
                      background:
                        "linear-gradient(180deg, rgba(245,201,176,0.14), rgba(245,201,176,0.04))",
                    }}
                  >
                    <div>
                      <p className="mt-2 font-serif text-4xl leading-none">
                        ₹ {quote.preWeddingPriceLabel || "Priced separately"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid gap-3">
                  {quote.preWeddingDeliverables.map((item) => (
                    <div
                      key={item}
                      className="flex gap-3 border-b pb-3 text-sm"
                      style={{
                        borderColor: quoteTheme.colors.line,
                        color: quoteTheme.colors.supportText,
                      }}
                    >
                      <span style={{ color: quoteTheme.colors.sage }}>✦</span>
                      <span className="leading-6">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {quote.preWeddingTeam.map((member) => (
                    <span
                      key={member}
                      className="rounded-full border px-3 py-1 text-[0.66rem] tracking-[0.14em] uppercase"
                      style={{
                        borderColor: quoteTheme.colors.sage,
                        backgroundColor: "rgba(166,178,139,0.12)",
                        color: quoteTheme.colors.forestSoft,
                      }}
                    >
                      {member}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative h-[24rem] overflow-hidden rounded-[0.2rem] md:h-[32rem]">
                <Image
                  src={imageSlots.preWedding}
                  alt="Pre wedding placeholder"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-20">
          <SectionHead
            kicker="Package comparison"
            title="Compare your options"
          />
          <div className="relative h-[18rem] overflow-hidden rounded-[0.2rem] md:h-[22rem]">
            <Image
              src={imageSlots.packageHero}
              alt="Package hero"
              fill
              className="object-cover object-center"
            />
          </div>
          {recommendedPackage && recommendedPricing ? (
            <div
              className="mt-4 rounded-[0.2rem] border px-6 py-5 text-center"
              style={{
                borderColor: quoteTheme.colors.forest,
                backgroundColor: quoteTheme.colors.forest,
              }}
            >
              <p
                className="text-xs tracking-[0.24em] uppercase"
                style={{ color: quoteTheme.colors.blush }}
              >
                Recommended package
              </p>
              <p
                className="mt-2 font-serif text-2xl font-semibold"
                style={{ color: quoteTheme.colors.ivory }}
              >
                {recommendedPackage.name} — {formatCurrency(
                  recommendedPricing.applied
                    ? recommendedPricing.final
                    : recommendedPackage.basePrice
                )}
              </p>
              <p
                className="mt-3 text-sm leading-6"
                style={{ color: "rgba(249,246,243,0.82)" }}
              >
                For events outside Delhi NCR, the client will arrange and cover
                the photography team&apos;s travel and accommodation.
              </p>
            </div>
          ) : null}
          <div className="mt-8 space-y-4">
            {quote.packages.map((pkg, packageIndex) => (
              <PackageCard
                key={pkg.id}
                quote={quote}
                packageIndex={packageIndex}
              />
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionHead
            kicker="Deliverables"
            title="Package-wise deliverables and booking structure"
          />
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-3 xl:items-stretch">
              {quote.packages.map((pkg) => {
                const deliverables = getPackageDeliverables(pkg)

                return (
                  <div
                    key={pkg.id}
                    className="rounded-[0.2rem] border p-8"
                    style={{
                      borderColor: pkg.recommended
                        ? quoteTheme.colors.lineStrong
                        : quoteTheme.colors.line,
                      backgroundColor: pkg.recommended
                        ? quoteTheme.colors.surfaceSoft
                        : quoteTheme.colors.white,
                    }}
                  >
                    <p
                      className="text-[0.68rem] tracking-[0.24em] uppercase"
                      style={{ color: quoteTheme.colors.sage }}
                    >
                      {pkg.recommended ? "Recommended collection" : "Collection details"}
                    </p>
                    <h3
                      className="mt-2 font-serif text-3xl"
                      style={{ color: quoteTheme.colors.forest }}
                    >
                      {pkg.name}
                    </h3>
                    <p
                      className="mt-3 text-sm leading-7"
                      style={{ color: quoteTheme.colors.supportText }}
                    >
                      {pkg.subtitle}
                    </p>
                    <div className="mt-5 space-y-3">
                      {deliverables.map((item) => (
                        <div
                          key={`${pkg.id}-${item}`}
                          className="flex gap-3 border-b pb-3 text-sm"
                          style={{
                            borderColor: quoteTheme.colors.line,
                            color: quoteTheme.colors.supportText,
                          }}
                        >
                          <span style={{ color: quoteTheme.colors.sage }}>✦</span>
                          <span className="leading-6">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div
                      className="mt-6 border-t pt-5"
                      style={{ borderColor: quoteTheme.colors.line }}
                    >
                      <p
                        className="text-[0.68rem] tracking-[0.2em] uppercase"
                        style={{ color: quoteTheme.colors.sage }}
                      >
                        Team
                      </p>
                      <p
                        className="mt-2 text-sm leading-6"
                        style={{ color: quoteTheme.colors.supportText }}
                      >
                        {pkg.team.map(formatTeamLabel).join(" · ")}
                      </p>
                      {pkg.specialFeatures.length ? (
                        <div className="mt-5">
                          <p
                            className="text-[0.68rem] tracking-[0.2em] uppercase"
                            style={{ color: quoteTheme.colors.sage }}
                          >
                            Special features
                          </p>
                          <p
                            className="mt-2 text-sm leading-6"
                            style={{ color: quoteTheme.colors.supportText }}
                          >
                            {pkg.specialFeatures.join(" · ")}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>

            <div
              className="rounded-[0.2rem] px-8 py-8"
              style={{
                backgroundColor: quoteTheme.colors.forest,
                color: quoteTheme.colors.ivory,
              }}
            >
              <h3 className="font-serif text-3xl">Payment milestones</h3>
              <div className="mt-5 space-y-4">
                {quote.paymentTerms.map((term, index) => (
                  <div
                    key={term.id}
                    className="grid grid-cols-[4.5rem_1fr] gap-4 border-b pb-4"
                    style={{ borderColor: "rgba(249,246,243,0.15)" }}
                  >
                    <div
                      className="font-serif text-4xl"
                      style={{ color: quoteTheme.colors.blush }}
                    >
                      {term.percentage}%
                    </div>
                    <div>
                      <p
                        className="text-[0.68rem] tracking-[0.18em] uppercase"
                        style={{ color: quoteTheme.colors.sage }}
                      >
                        Milestone {index + 1}
                      </p>
                      <p className="mt-1 font-serif text-2xl">{term.label}</p>
                      <p
                        className="mt-2 text-sm leading-7"
                        style={{ color: "rgba(249,246,243,0.78)" }}
                      >
                        {term.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="mt-6 rounded-[0.2rem] px-5 py-4"
                style={{ backgroundColor: "rgba(249,246,243,0.08)" }}
              >
                <p
                  className="text-[0.68rem] tracking-[0.18em] uppercase"
                  style={{ color: quoteTheme.colors.sage }}
                >
                  Travel and stay
                </p>
                <p
                  className="mt-2 text-sm leading-7"
                  style={{ color: "rgba(249,246,243,0.82)" }}
                >
                  For celebrations taking place outside Delhi NCR, comfortable
                  travel and stay arrangements for the coverage team are to be
                  arranged by the client so the crew can deliver the experience
                  smoothly across all scheduled events.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <SectionHead
            kicker="Terms"
            title="Important details before booking"
          />
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-6">
              {quote.terms.map((term, index) => (
                <div key={`${term}-${index}`} className="break-inside-avoid">
                  <h4
                    className="flex items-baseline gap-3 text-sm font-semibold tracking-[0.08em] uppercase"
                    style={{ color: quoteTheme.colors.forest }}
                  >
                    <span
                      className="font-serif text-3xl"
                      style={{ color: quoteTheme.colors.blush }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </h4>
                  <p
                    className="mt-2 text-sm leading-7"
                    style={{ color: quoteTheme.colors.text }}
                  >
                    {term}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              {quote.privacyPolicy.map((item, index) => (
                <div key={`${item}-${index}`} className="break-inside-avoid">
                  <h4
                    className="flex items-baseline gap-3 text-sm font-semibold tracking-[0.08em] uppercase"
                    style={{ color: quoteTheme.colors.forest }}
                  >
                    <span
                      className="font-serif text-3xl"
                      style={{ color: quoteTheme.colors.blush }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </h4>
                  <p
                    className="mt-2 text-sm leading-7"
                    style={{ color: quoteTheme.colors.text }}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <footer
        className="px-6 py-12 md:px-10"
        style={{
          backgroundColor: quoteTheme.colors.forest,
          color: quoteTheme.colors.ivory,
        }}
      >
        <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
          <div className="relative h-[18rem] overflow-hidden rounded-[0.2rem]">
            <Image
              src={imageSlots.closing}
              alt="Closing placeholder"
              fill
              className="object-cover object-center"
            />
          </div>
          <div>
            <p
              className="text-[0.72rem] tracking-[0.3em] uppercase"
              style={{ color: quoteTheme.colors.sage }}
            >
              Closing note
            </p>
            <p
              className="font-accent mt-3 text-5xl"
              style={{ color: quoteTheme.colors.blush }}
            >
              Ready to reserve your date?
            </p>
            <p
              className="mt-4 max-w-2xl text-sm leading-7"
              style={{ color: "rgba(249,246,243,0.8)" }}
            >
              If this feels right, your quote consultant can help reserve the date, guide the next payment step, and refine the package over WhatsApp.
            </p>
            <div
              className="mt-7 rounded-[1.4rem] border p-5"
              style={{
                borderColor: "rgba(249,246,243,0.18)",
                backgroundColor: "rgba(249,246,243,0.08)",
              }}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border text-xl font-semibold"
                  style={{
                    borderColor: quoteTheme.colors.sage,
                    backgroundColor: "rgba(249,246,243,0.14)",
                    color: quoteTheme.colors.blush,
                  }}
                >
                  {salesProfile?.avatarUrl ? (
                    <img
                      src={salesProfile.avatarUrl}
                      alt={salesProfile.displayName || "Quote consultant"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <p className="font-serif text-3xl" style={{ color: quoteTheme.colors.ivory }}>
                    {salesProfile?.displayName || "The Tranquil Wedding"}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "rgba(249,246,243,0.8)" }}>
                    {getSalesProfileRoleLine(salesProfile)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full px-6 py-3 text-sm font-semibold"
                  style={{
                    backgroundColor: "#f3c747",
                    color: quoteTheme.colors.forest,
                  }}
                >
                  Reserve Now
                </a>
              ) : null}
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border px-6 py-3 text-sm font-semibold"
                  style={{
                    borderColor: "rgba(249,246,243,0.22)",
                    backgroundColor: "rgba(249,246,243,0.08)",
                    color: quoteTheme.colors.ivory,
                  }}
                >
                  Chat on WhatsApp
                </a>
              ) : null}
            </div>
            <div className="mt-5 text-xs uppercase tracking-[0.24em]" style={{ color: "rgba(249,246,243,0.58)" }}>
              The Tranquil Wedding · {quote.contact.website}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
