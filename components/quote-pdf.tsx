import path from "node:path"
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"
import type { DocumentProps } from "@react-pdf/renderer"
import type { ReactElement } from "react"

import {
  computePackagePricing,
  formatCurrency,
  formatDateLabel,
  quoteHeadline,
} from "@/lib/quotes/format"
import {
  getQuoteImageSlots,
  getQuoteSummaryRows,
  quoteTheme,
} from "@/lib/quotes/presentation"
import type { QuoteEvent, QuotePackage, QuoteRecord } from "@/lib/quotes/types"

const fontBasePath = path.join(process.cwd(), "public", "fonts")

Font.register({
  family: "QuoteDisplay",
  fonts: [
    {
      src: path.join(fontBasePath, "CormorantGaramond-Variable.ttf"),
      fontWeight: 400,
    },
    {
      src: path.join(fontBasePath, "CormorantGaramond-Variable.ttf"),
      fontWeight: 500,
    },
    {
      src: path.join(fontBasePath, "CormorantGaramond-Variable.ttf"),
      fontWeight: 700,
    },
    {
      src: path.join(fontBasePath, "CormorantGaramond-Italic-Variable.ttf"),
      fontStyle: "italic",
      fontWeight: 400,
    },
  ],
})

Font.register({
  family: "QuoteBody",
  fonts: [
    { src: path.join(fontBasePath, "Jost-Variable.ttf"), fontWeight: 300 },
    { src: path.join(fontBasePath, "Jost-Variable.ttf"), fontWeight: 400 },
    { src: path.join(fontBasePath, "Jost-Variable.ttf"), fontWeight: 500 },
    { src: path.join(fontBasePath, "Jost-Variable.ttf"), fontWeight: 700 },
  ],
})

Font.register({
  family: "QuoteAccent",
  src: path.join(fontBasePath, "Parisienne-Regular.ttf"),
})

Font.registerHyphenationCallback((word) => [word])

const studioStats = [
  { value: "500+", label: "events captured" },
  { value: "1200+", label: "films and galleries delivered" },
  { value: "24 hr", label: "teaser turnaround on select edits" },
]

const pdfLineColor = "#D9D3CB"
const pdfLineColorStrong = "#B9C2A8"
const pdfLightDivider = "#E8E1DA"
const pdfDarkDivider = "#44594F"
const pdfStripDivider = "#50655B"

function pdfImageSource(src: string) {
  if (src.startsWith("/")) {
    return path.join(process.cwd(), "public", src.replace(/^\//, ""))
  }

  return src
}

function chunkArray<T>(items: T[], size: number) {
  const groups: T[][] = []

  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size))
  }

  return groups
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: quoteTheme.colors.ivory,
    color: quoteTheme.colors.text,
    fontFamily: "QuoteBody",
    fontSize: 9,
    paddingTop: 0,
    paddingRight: 28,
    paddingBottom: 28,
    paddingLeft: 28,
  },
  pageBody: {
    paddingTop: 24,
  },
  chapterPageBody: {
    paddingTop: 56,
  },
  centeredPageBody: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: 10,
  },
  lastPageBody: {
    flexGrow: 1,
    justifyContent: "center",
  },
  lastPageTop: {},

  ribbon: {
    marginHorizontal: -28,
    paddingVertical: 9,
    backgroundColor: quoteTheme.colors.forest,
    color: quoteTheme.colors.ivory,
    textAlign: "center",
    fontSize: 7.2,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  masthead: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 20,
  },
  logoRing: {
    width: 56,
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: quoteTheme.colors.sage,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: quoteTheme.colors.forest,
    overflow: "hidden",
  },
  logoImage: {
    width: "62%",
    height: "62%",
    objectFit: "contain",
  },
  brandName: {
    marginTop: 12,
    fontSize: 10.8,
    letterSpacing: 2.8,
    textTransform: "uppercase",
    color: quoteTheme.colors.forest,
  },
  coverHead: {
    alignItems: "center",
    paddingBottom: 18,
  },
  coverEyebrow: {
    fontSize: 7.2,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  coverAccent: {
    marginTop: 14,
    fontFamily: "QuoteAccent",
    fontSize: 28,
    color: quoteTheme.colors.blush,
  },
  coverHero: {
    marginTop: 18,
    width: "100%",
    height: 332,
    objectFit: "cover",
  },
  summaryStrip: {
    marginHorizontal: -28,
    flexDirection: "row",
    backgroundColor: quoteTheme.colors.forest,
  },
  summaryCell: {
    width: "33.333%",
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: pdfStripDivider,
  },
  summaryCellLast: {
    borderRightWidth: 0,
  },
  summaryLabel: {
    fontSize: 6.7,
    letterSpacing: 1.7,
    textTransform: "uppercase",
    color: quoteTheme.colors.blush,
  },
  summaryValue: {
    marginTop: 5,
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 15,
    lineHeight: 1.2,
    textAlign: "center",
    color: quoteTheme.colors.ivory,
  },

  sectionHead: { alignItems: "center" },
  sectionKicker: {
    fontSize: 6.8,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  sectionTitle: {
    marginTop: 8,
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 22,
    color: quoteTheme.colors.forest,
    textAlign: "center",
  },
  divider: {
    marginTop: 12,
    width: 54,
    height: 1,
    backgroundColor: quoteTheme.colors.sage,
  },

  studioGrid: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  studioImage: {
    width: "42%",
    height: 352,
    objectFit: "cover",
    borderRadius: 3,
  },
  studioCopy: {
    width: "53%",
    marginLeft: "5%",
  },
  studioBody: {
    fontSize: 10.3,
    lineHeight: 1.74,
    color: quoteTheme.colors.text,
  },
  statsRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    width: "31%",
    paddingTop: 10,
    paddingRight: 8,
    borderTopWidth: 2,
    borderTopColor: quoteTheme.colors.blush,
  },
  statValue: {
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 24,
    color: quoteTheme.colors.forest,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 7.1,
    lineHeight: 1.3,
    color: quoteTheme.colors.supportText,
  },
  studioNote: {
    marginTop: 22,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: quoteTheme.colors.forest,
    borderRadius: 2,
  },
  studioNoteText: {
    fontFamily: "QuoteDisplay",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    color: quoteTheme.colors.ivory,
  },

  eventWrap: {
    marginTop: 24,
    position: "relative",
    paddingTop: 4,
  },
  eventLine: {
    position: "absolute",
    top: 8,
    bottom: 8,
    left: "50%",
    width: 1,
    backgroundColor: quoteTheme.colors.sage,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  eventCardWrap: {
    width: "44%",
  },
  eventCardWrapRight: {
    marginLeft: "12%",
  },
  eventSpacer: {
    width: "44%",
  },
  eventNodeCol: {
    width: "12%",
    alignItems: "center",
    paddingTop: 12,
  },
  eventNode: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: quoteTheme.colors.sage,
    backgroundColor: quoteTheme.colors.ivory,
    alignItems: "center",
    justifyContent: "center",
  },
  eventNodeText: {
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 14,
    color: quoteTheme.colors.forest,
  },
  eventCard: {
    width: "100%",
    height: 288,
    backgroundColor: quoteTheme.colors.white,
    borderRadius: 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: pdfLineColor,
  },
  eventImageWrap: {
    width: "100%",
    height: 150,
  },
  eventImage: {
    width: "100%",
    height: 150,
    objectFit: "cover",
  },
  eventBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },
  eventDate: {
    fontSize: 6.7,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  eventTitle: {
    marginTop: 7,
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 18,
    color: quoteTheme.colors.forest,
  },
  eventMeta: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  eventMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 6,
  },
  eventMetaDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: quoteTheme.colors.blush,
    marginRight: 6,
  },
  eventMetaText: {
    fontSize: 7.4,
    color: quoteTheme.colors.text,
  },
  teamRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    maxHeight: 46,
    overflow: "hidden",
  },
  teamTag: {
    marginRight: 6,
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(166,178,139,0.12)",
    fontSize: 6.5,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: quoteTheme.colors.forestSoft,
  },

  preWeddingShell: {
    marginTop: 24,
    flexDirection: "row",
    backgroundColor: quoteTheme.colors.white,
    padding: 28,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: pdfLineColor,
  },
  preWeddingCopy: {
    width: "48%",
  },
  preWeddingDate: {
    marginBottom: 10,
    fontSize: 6.7,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  preWeddingVisual: {
    width: "47%",
    marginLeft: "5%",
  },
  preWeddingImage: {
    width: "100%",
    height: 372,
    objectFit: "cover",
    borderRadius: 2,
  },
  listRow: {
    flexDirection: "row",
    paddingBottom: 7,
    marginBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: pdfLightDivider,
  },
  listMark: {
    width: 12,
    fontSize: 8,
    color: quoteTheme.colors.sage,
  },
  listText: {
    flex: 1,
    fontSize: 8.2,
    lineHeight: 1.5,
    color: quoteTheme.colors.supportText,
  },

  packageHero: {
    marginTop: 18,
    width: "100%",
    height: 112,
    objectFit: "cover",
    borderRadius: 2,
  },
  packageGrid: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  packageCard: {
    width: "31.7%",
    backgroundColor: quoteTheme.colors.white,
    paddingTop: 14,
    paddingRight: 14,
    paddingBottom: 16,
    paddingLeft: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: pdfLineColor,
  },
  packageCardFeatured: {
    backgroundColor: quoteTheme.colors.surfaceSoft,
    borderColor: pdfLineColorStrong,
  },
  packageLabel: {
    fontSize: 6.2,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  packageHeader: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  packageName: {
    width: "70%",
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 11.4,
    color: quoteTheme.colors.forest,
  },
  packageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 5.4,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  packageBadgeDefault: {
    backgroundColor: quoteTheme.colors.blush,
    color: quoteTheme.colors.forest,
  },
  packageBadgeFeatured: {
    backgroundColor: quoteTheme.colors.forest,
    color: quoteTheme.colors.ivory,
  },
  packageSubtitle: {
    marginTop: 5,
    fontSize: 5.9,
    lineHeight: 1.28,
    color: quoteTheme.colors.supportText,
  },
  packagePriceBox: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: quoteTheme.colors.ivory,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: pdfLineColor,
  },
  packageOffer: {
    fontSize: 5.8,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textAlign: "center",
    color: quoteTheme.colors.sage,
  },
  packageOldPrice: {
    marginTop: 3,
    fontFamily: "QuoteDisplay",
    fontSize: 8.8,
    textAlign: "center",
    textDecoration: "line-through",
    color: quoteTheme.colors.mutedText,
  },
  packagePrice: {
    marginTop: 2,
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 17,
    textAlign: "center",
    color: quoteTheme.colors.forest,
  },
  packageTeamWrap: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  packageLine: {
    flexDirection: "row",
    paddingBottom: 6,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: pdfLightDivider,
  },
  packageLineText: {
    flex: 1,
    fontSize: 5.9,
    lineHeight: 1.25,
    color: quoteTheme.colors.supportText,
  },
  featureBox: {
    marginTop: 10,
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    backgroundColor: quoteTheme.colors.ivory,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: pdfLineColor,
  },
  featureLabel: {
    fontSize: 5.8,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  featureText: {
    marginTop: 4,
    fontSize: 5.7,
    lineHeight: 1.24,
    color: quoteTheme.colors.supportText,
  },

  stackedInfo: {
    marginTop: 24,
    gap: 16,
  },
  infoBlock: {
    width: "100%",
  },
  infoCard: {
    backgroundColor: quoteTheme.colors.white,
    padding: 28,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: pdfLineColor,
  },
  darkCard: {
    backgroundColor: quoteTheme.colors.forest,
    borderWidth: 0,
  },
  cardTitle: {
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 20,
    color: quoteTheme.colors.forest,
  },
  cardTitleDark: {
    color: quoteTheme.colors.ivory,
  },
  paymentItem: {
    marginTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 0.75,
    borderBottomColor: pdfDarkDivider,
    flexDirection: "row",
    alignItems: "center",
  },
  paymentPct: {
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 26,
    color: quoteTheme.colors.blush,
    width: 54,
  },
  paymentBody: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 6.2,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  paymentName: {
    marginTop: 2,
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 14,
    color: quoteTheme.colors.ivory,
  },
  paymentText: {
    marginTop: 4,
    fontSize: 7.3,
    lineHeight: 1.42,
    color: "rgba(249,246,243,0.78)",
  },

  numberGrid: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  numberCol: {
    width: "48.6%",
  },
  numberItem: {
    marginBottom: 12,
  },
  numberHead: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  numberValue: {
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 18,
    lineHeight: 1,
    color: quoteTheme.colors.blush,
  },
  numberText: {
    marginTop: 3,
    fontSize: 6.8,
    lineHeight: 1.36,
    color: quoteTheme.colors.text,
  },

  closingShell: {
    flexDirection: "row",
    backgroundColor: quoteTheme.colors.forest,
    overflow: "hidden",
  },
  closingImageWrap: {
    width: "39%",
    height: 372,
  },
  closingImage: {
    width: "100%",
    height: 372,
    objectFit: "cover",
  },
  closingBody: {
    width: "61%",
    paddingHorizontal: 28,
    paddingVertical: 34,
  },
  closingKicker: {
    fontSize: 7.1,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  closingAccent: {
    marginTop: 12,
    fontFamily: "QuoteAccent",
    fontSize: 35,
    color: quoteTheme.colors.blush,
  },
  closingText: {
    marginTop: 14,
    fontSize: 8.5,
    lineHeight: 1.6,
    color: "rgba(249,246,243,0.8)",
  },
  contactGrid: {
    marginTop: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  contactRow: {
    width: "48.5%",
    paddingBottom: 10,
    marginBottom: 10,
    fontSize: 7.9,
    color: quoteTheme.colors.ivory,
    borderBottomWidth: 1,
    borderBottomColor: pdfDarkDivider,
  },
})

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionKicker}>{kicker}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.divider} />
    </View>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item) => (
        <View key={item} style={styles.listRow}>
          <Text style={styles.listMark}>✦</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  )
}

type NumberedItem = {
  number: number
  text: string
}

const MAX_VISIBLE_EVENT_TAGS = 5

function EventChapter({
  event,
  image,
  index,
  quote,
}: {
  event: QuoteEvent
  image: string
  index: number
  quote: QuoteRecord
}) {
  const meta = [
    event.location || quote.location || "Location",
    event.guestCount || "Guest count TBD",
    event.timing || "Timing TBD",
  ]

  const visibleTeam = event.team.slice(0, MAX_VISIBLE_EVENT_TAGS)
  const hiddenTeamCount = event.team.length - visibleTeam.length

  const card = (
    <View style={styles.eventCard}>
      <View style={styles.eventImageWrap}>
        <Image src={image} style={styles.eventImage} />
      </View>
      <View style={styles.eventBody}>
        <Text style={styles.eventDate}>
          {`Day ${index + 1} • ${formatDateLabel(event.date)}`}
        </Text>
        <Text style={styles.eventTitle}>{event.title || "Event title"}</Text>
        <View style={styles.eventMeta}>
          {meta.map((item) => (
            <View key={item} style={styles.eventMetaItem}>
              <View style={styles.eventMetaDot} />
              <Text style={styles.eventMetaText}>{item}</Text>
            </View>
          ))}
        </View>
        <View style={styles.teamRow}>
          {visibleTeam.map((member) => (
            <Text key={member} style={styles.teamTag}>
              {member}
            </Text>
          ))}
          {hiddenTeamCount > 0 ? (
            <Text style={styles.teamTag}>{`+${hiddenTeamCount}`}</Text>
          ) : null}
        </View>
      </View>
    </View>
  )

  return (
    <View style={styles.eventRow} wrap={false}>
      {index % 2 === 0 ? (
        <>
          <View style={styles.eventCardWrap}>{card}</View>
          <View style={styles.eventNodeCol}>
            <View style={styles.eventNode}>
              <Text style={styles.eventNodeText}>{index + 1}</Text>
            </View>
          </View>
          <View style={styles.eventSpacer} />
        </>
      ) : (
        <>
          <View style={styles.eventSpacer} />
          <View style={styles.eventNodeCol}>
            <View style={styles.eventNode}>
              <Text style={styles.eventNodeText}>{index + 1}</Text>
            </View>
          </View>
          <View style={[styles.eventCardWrap, styles.eventCardWrapRight]}>
            {card}
          </View>
        </>
      )}
    </View>
  )
}

function PackageCard({ pkg }: { pkg: QuotePackage }) {
  const pricing = computePackagePricing(pkg)

  return (
    <View
      style={[
        styles.packageCard,
        ...(pkg.recommended ? [styles.packageCardFeatured] : []),
      ]}
      wrap={false}
    >
      <Text style={styles.packageLabel}>
        {pkg.recommended ? "Recommended" : "Package"}
      </Text>
      <View style={styles.packageHeader}>
        <Text style={styles.packageName}>{pkg.name}</Text>
        <Text
          style={
            pkg.recommended
              ? [styles.packageBadge, styles.packageBadgeFeatured]
              : [styles.packageBadge, styles.packageBadgeDefault]
          }
        >
          {pkg.badge}
        </Text>
      </View>
      <Text style={styles.packageSubtitle}>{pkg.subtitle}</Text>

      <View style={styles.packagePriceBox}>
        {pricing.applied ? (
          <Text style={styles.packageOffer}>
            {pkg.offerLabel || "Special offer"}
          </Text>
        ) : null}
        {pricing.applied ? (
          <Text style={styles.packageOldPrice}>
            {formatCurrency(pricing.base)}
          </Text>
        ) : null}
        <Text style={styles.packagePrice}>
          {formatCurrency(pricing.applied ? pricing.final : pkg.basePrice)}
        </Text>
      </View>

      <View style={styles.packageTeamWrap}>
        {pkg.team.map((member) => (
          <Text key={member} style={styles.teamTag}>
            {member}
          </Text>
        ))}
      </View>

      <View style={{ marginTop: 8 }}>
        {pkg.items.map((item) => (
          <View key={item} style={styles.packageLine}>
            <Text style={styles.listMark}>✦</Text>
            <Text style={styles.packageLineText}>{item}</Text>
          </View>
        ))}
      </View>

      {pkg.specialFeatures.length ? (
        <View style={styles.featureBox}>
          <Text style={styles.featureLabel}>Special features</Text>
          <Text style={styles.featureText}>
            {pkg.specialFeatures.join(" • ")}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

function NumberedColumn({ items }: { items: NumberedItem[] }) {
  return (
    <View>
      {items.map((item) => (
        <View key={`${item.number}-${item.text}`} style={styles.numberItem}>
          <View style={styles.numberHead}>
            <Text style={styles.numberValue}>
              {String(item.number).padStart(2, "0")}
            </Text>
          </View>
          <Text style={styles.numberText}>{item.text}</Text>
        </View>
      ))}
    </View>
  )
}

export function buildQuotePdfDocument(
  quote: QuoteRecord
): ReactElement<DocumentProps> {
  const imageSlots = getQuoteImageSlots(quote)
  const summaryRows = getQuoteSummaryRows(quote)
  const eventGroups = chunkArray(quote.events, 2)
  const policyItems = [...quote.terms, ...quote.privacyPolicy]
  const policyPages = chunkArray(policyItems, 18)

  return (
    <Document title={quoteHeadline(quote)}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.ribbon}>Photography & Videography Quotation</Text>
        <View style={styles.masthead}>
          <View style={styles.logoRing}>
            <Image
              src={pdfImageSource("/brand/logo.png")}
              style={styles.logoImage}
            />
          </View>
          <Text style={styles.brandName}>The Tranquil Wedding</Text>
        </View>

        <View style={styles.coverHead}>
          <Text style={styles.coverEyebrow}>Curated quotation</Text>
          <Text style={styles.coverAccent}>wedding story</Text>
          <Image
            src={pdfImageSource(imageSlots.hero)}
            style={styles.coverHero}
          />
        </View>

        <View style={styles.summaryStrip}>
          {summaryRows.slice(0, 3).map((row, index) => (
            <View
              key={row.label}
              style={[
                styles.summaryCell,
                ...(index === 2 ? [styles.summaryCellLast] : []),
              ]}
            >
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={styles.summaryValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.pageBody}>
          <SectionHead kicker="Studio note" title={quote.aboutTitle} />
          <View style={styles.studioGrid}>
            <Image
              src={pdfImageSource(imageSlots.about)}
              style={styles.studioImage}
            />
            <View style={styles.studioCopy}>
              <Text style={styles.studioBody}>{quote.aboutBody}</Text>
              <View style={styles.statsRow}>
                {studioStats.map((stat) => (
                  <View key={stat.label} style={styles.statCard}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.studioNote}>
                <Text style={styles.studioNoteText}>
                  Crafted to read beautifully on screen and export cleanly in
                  PDF.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      {eventGroups.map((events, groupIndex) => (
        <Page key={`events-${groupIndex}`} size="A4" style={styles.page}>
          <View style={styles.centeredPageBody}>
            <SectionHead
              kicker="Event flow"
              title="Every function gets its own visual chapter"
            />
            <View style={styles.eventWrap}>
              <View style={styles.eventLine} />
              {events.map((event, index) => (
                <EventChapter
                  key={event.id}
                  event={event}
                  image={pdfImageSource(
                    imageSlots.eventImages[groupIndex * 2 + index] ||
                    imageSlots.hero
                  )}
                  index={groupIndex * 2 + index}
                  quote={quote}
                />
              ))}
            </View>
          </View>
        </Page>
      ))}

      {quote.includePreWedding ? (
        <Page size="A4" style={styles.page}>
          <View style={styles.chapterPageBody}>
            <SectionHead
              kicker="Pre wedding"
              title={quote.preWeddingLabel || "Pre wedding editorial"}
            />
            <View style={styles.preWeddingShell}>
              <View style={styles.preWeddingCopy}>
                <Text style={styles.preWeddingDate}>
                  {quote.preWeddingDate ? formatDateLabel(quote.preWeddingDate) : "Date to be decided"}
                </Text>
                <BulletList items={quote.preWeddingDeliverables} />
                <View style={styles.teamRow}>
                  {quote.preWeddingTeam.map((member) => (
                    <Text key={member} style={styles.teamTag}>
                      {member}
                    </Text>
                  ))}
                </View>
              </View>
              <View style={styles.preWeddingVisual}>
                <Image
                  src={pdfImageSource(imageSlots.preWedding)}
                  style={styles.preWeddingImage}
                />
              </View>
            </View>
          </View>
        </Page>
      ) : null}

      <Page size="A4" style={styles.page}>
        <View style={styles.chapterPageBody}>
          <SectionHead
            kicker="Package comparison"
            title="Compare your options side by side"
          />
          <Image
            src={pdfImageSource(imageSlots.packageHero)}
            style={styles.packageHero}
          />
          <View style={styles.packageGrid} wrap={false}>
            {quote.packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.chapterPageBody}>
          <SectionHead
            kicker="Deliverables"
            title="Coverage, promises and booking structure"
          />
          <View style={styles.stackedInfo}>
            <View style={styles.infoBlock}>
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Deliverables</Text>
                <View style={{ marginTop: 10 }}>
                  <BulletList items={quote.deliverables} />
                </View>
              </View>
            </View>
            <View style={styles.infoBlock}>
              <View style={[styles.infoCard, styles.darkCard]}>
                <Text style={[styles.cardTitle, styles.cardTitleDark]}>
                  Payment milestones
                </Text>
                {quote.paymentTerms.map((term, index) => (
                  <View key={term.id} style={styles.paymentItem}>
                    <Text style={styles.paymentPct}>{term.percentage}%</Text>
                    <View style={styles.paymentBody}>
                      <Text style={styles.paymentLabel}>
                        Milestone {index + 1}
                      </Text>
                      <Text style={styles.paymentName}>{term.label}</Text>
                      <Text style={styles.paymentText}>{term.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Page>

      {policyPages.map((items, pageIndex) => {
        const numberedItems = items.map((text, index) => ({
          number: pageIndex * 18 + index + 1,
          text,
        }))
        const leftColumn = numberedItems.filter((_, index) => index % 2 === 0)
        const rightColumn = numberedItems.filter((_, index) => index % 2 === 1)

        return (
          <Page key={`terms-${pageIndex}`} size="A4" style={styles.page}>
            <View style={styles.centeredPageBody}>
              <SectionHead
                kicker="Terms"
                title="Important details before booking"
              />
              <View style={styles.numberGrid}>
                <View style={styles.numberCol}>
                  <NumberedColumn items={leftColumn} />
                </View>
                <View style={styles.numberCol}>
                  <NumberedColumn items={rightColumn} />
                </View>
              </View>
            </View>
          </Page>
        )
      })}

      <Page size="A4" style={styles.page}>
        <View style={styles.lastPageBody}>
          <View style={styles.closingShell} wrap={false}>
            <View style={styles.closingImageWrap}>
              <Image
                src={pdfImageSource(imageSlots.closing)}
                style={styles.closingImage}
              />
            </View>
            <View style={styles.closingBody}>
              <Text style={styles.closingKicker}>Closing note</Text>
              <Text style={styles.closingAccent}>
                Ready to reserve your date?
              </Text>
              <Text style={styles.closingText}>
                If this direction feels right, the dates can be locked and the
                coverage can be refined around your exact celebration rhythm.
              </Text>
              <View style={styles.contactGrid}>
                <Text style={styles.contactRow}>{quote.contact.email}</Text>
                <Text style={styles.contactRow}>{quote.contact.website}</Text>
                <Text style={styles.contactRow}>
                  {quote.contact.phones.join(" | ")}
                </Text>
                <Text style={styles.contactRow}>
                  WhatsApp: {quote.contact.whatsapp}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
