import path from "node:path"
import {
  Document,
  Font,
  Image,
  Link,
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
  formatTeamLabel,
  quoteHeadline,
} from "@/lib/quotes/format"
import {
  getCeremonyArrangementLabel,
  getEventImageObjectPosition,
  getPackageDeliverables,
  getQuoteImageSlots,
  getSalesProfileInitials,
  getSalesProfileRoleLine,
  getQuoteSummaryRows,
  getQuoteWhatsAppMessageHref,
  quoteTheme,
} from "@/lib/quotes/presentation"
import type { QuoteEvent, QuotePackage, QuoteRecord, SalesProfile } from "@/lib/quotes/types"

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
  compactChapterPageBody: {
    paddingTop: 34,
  },
  eventPageBody: {
    paddingTop: 48,
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
    flexGrow: 1,
    flexBasis: 0,
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
    height: 300,
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
  },
  teamTag: {
    marginRight: 4,
    marginBottom: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(166,178,139,0.12)",
    fontSize: 5.6,
    letterSpacing: 0.45,
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
  preWeddingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  preWeddingDate: {
    marginBottom: 10,
    fontSize: 6.7,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  preWeddingLocation: {
    marginBottom: 10,
    fontSize: 9,
    color: quoteTheme.colors.forestSoft,
  },
  preWeddingStamp: {
    width: 76,
    minHeight: 76,
    marginTop: -2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: quoteTheme.colors.blush,
    backgroundColor: "rgba(245,201,176,0.08)",
    alignItems: "center",
    justifyContent: "center",
    transform: "rotate(-8deg)",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  preWeddingStampLabel: {
    fontSize: 5.4,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#9b7c63",
    textAlign: "center",
  },
  preWeddingStampValue: {
    marginTop: 3,
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 14,
    color: quoteTheme.colors.forest,
    textAlign: "center",
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
    marginTop: 14,
    width: "100%",
    height: 108,
    objectFit: "cover",
    borderRadius: 2,
  },
  packageRecommendation: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: quoteTheme.colors.forest,
    backgroundColor: quoteTheme.colors.forest,
    textAlign: "center",
  },
  packageRecommendationLabel: {
    fontSize: 6.2,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: quoteTheme.colors.blush,
  },
  packageRecommendationValue: {
    marginTop: 5,
    fontFamily: "QuoteDisplay",
    fontSize: 13,
    fontWeight: 700,
    color: quoteTheme.colors.ivory,
  },
  packageRecommendationTravel: {
    marginTop: 7,
    fontSize: 7.2,
    lineHeight: 1.35,
    color: "rgba(249,246,243,0.82)",
  },
  packageCoverageNote: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: pdfLineColor,
    backgroundColor: quoteTheme.colors.surfaceSoft,
    fontSize: 7.8,
    lineHeight: 1.35,
    color: quoteTheme.colors.supportText,
    textAlign: "center",
  },
  packageGrid: {
    marginTop: 10,
  },
  packageCard: {
    width: "100%",
    marginBottom: 8,
    backgroundColor: quoteTheme.colors.white,
    padding: 15,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: pdfLineColor,
    flexDirection: "row",
    alignItems: "center",
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
  packageIdentity: {
    width: "24%",
  },
  packageName: {
    marginTop: 5,
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 15,
    color: quoteTheme.colors.forest,
  },
  packageBadge: {
    alignSelf: "flex-start",
    flexShrink: 0,
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 5.4,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    textAlign: "center",
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
    width: "46%",
    paddingHorizontal: 14,
    fontSize: 7,
    lineHeight: 1.4,
    color: quoteTheme.colors.supportText,
  },
  packagePriceBox: {
    width: "30%",
    paddingLeft: 14,
    borderLeftWidth: 1,
    borderLeftColor: pdfLineColor,
    alignItems: "flex-end",
  },
  packagePriceLabel: {
    fontSize: 5.6,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  packageOffer: {
    marginTop: 4,
    fontSize: 5.4,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  packageOldPrice: {
    marginTop: 2,
    fontFamily: "QuoteDisplay",
    fontSize: 7.5,
    textDecoration: "line-through",
    color: quoteTheme.colors.mutedText,
  },
  packagePrice: {
    marginTop: 4,
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 17,
    textAlign: "right",
    color: quoteTheme.colors.forest,
  },
  deliverableContext: {
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: pdfLineColor,
  },
  deliverableContextLabel: {
    fontSize: 5.8,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  deliverableContextText: {
    marginTop: 3,
    fontSize: 6.2,
    lineHeight: 1.3,
    color: quoteTheme.colors.supportText,
  },

  stackedInfo: {
    marginTop: 24,
    gap: 16,
  },
  deliverablePackageGrid: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deliverablePackageCard: {
    width: "31.7%",
    backgroundColor: quoteTheme.colors.white,
    padding: 18,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: pdfLineColor,
  },
  deliverablePackageCardFeatured: {
    backgroundColor: quoteTheme.colors.surfaceSoft,
    borderColor: pdfLineColorStrong,
  },
  deliverablePackageLabel: {
    fontSize: 6.2,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  deliverablePackageTitle: {
    marginTop: 5,
    fontFamily: "QuoteDisplay",
    fontWeight: 700,
    fontSize: 16,
    color: quoteTheme.colors.forest,
  },
  deliverablePackageSubtitle: {
    marginTop: 6,
    fontSize: 7.1,
    lineHeight: 1.45,
    color: quoteTheme.colors.supportText,
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
  paymentPageCard: {
    marginTop: 24,
    backgroundColor: quoteTheme.colors.forest,
    padding: 28,
    borderRadius: 2,
  },
  paymentTravelNote: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(249,246,243,0.08)",
  },
  paymentTravelNoteLabel: {
    fontSize: 6.6,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  paymentTravelNoteText: {
    marginTop: 5,
    fontSize: 7.4,
    lineHeight: 1.45,
    color: "rgba(249,246,243,0.82)",
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
  closingProfileCard: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(249,246,243,0.08)",
  },
  closingAvatar: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(249,246,243,0.14)",
  },
  closingAvatarText: {
    fontSize: 10.5,
    color: quoteTheme.colors.blush,
  },
  closingProfileName: {
    fontFamily: "QuoteDisplay",
    fontSize: 16,
    color: quoteTheme.colors.ivory,
  },
  closingProfileTitle: {
    marginTop: 2,
    fontSize: 7.3,
    color: "rgba(249,246,243,0.74)",
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
  closingCtaStack: {
    marginTop: 18,
    gap: 9,
  },
  closingCtaPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#f3c747",
  },
  closingCtaSecondary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(249,246,243,0.08)",
  },
  closingCtaLabel: {
    fontSize: 7,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: quoteTheme.colors.forest,
  },
  closingCtaPrimaryText: {
    marginTop: 4,
    fontSize: 8.2,
    lineHeight: 1.5,
    color: quoteTheme.colors.forest,
  },
  closingCtaSecondaryLabel: {
    fontSize: 7,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: quoteTheme.colors.sage,
  },
  closingCtaSecondaryText: {
    marginTop: 4,
    fontSize: 8.2,
    lineHeight: 1.5,
    color: quoteTheme.colors.ivory,
  },
  closingBrandLine: {
    marginTop: 16,
    fontSize: 7,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "rgba(249,246,243,0.56)",
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
    ...[getCeremonyArrangementLabel(event.coverage)].filter(
      (label): label is string => label !== null
    ),
  ]

  const card = (
    <View style={styles.eventCard}>
      <View style={styles.eventImageWrap}>
        <Image
          src={image}
          style={[
            styles.eventImage,
            { objectPosition: getEventImageObjectPosition(event) },
          ]}
        />
      </View>
      <View style={styles.eventBody}>
        <Text style={styles.eventDate}>
          {`Event ${index + 1} • ${formatDateLabel(event.date)}`}
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
          {event.team.map((member) => (
            <Text key={member} style={styles.teamTag}>
              {member}
            </Text>
          ))}
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
      <View style={styles.packageIdentity}>
        <Text style={styles.packageLabel}>
          {pkg.recommended ? "Recommended package" : "Package"}
        </Text>
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
        <Text style={styles.packagePriceLabel}>Package price</Text>
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
  quote: QuoteRecord,
  salesProfile: SalesProfile | null = null
): ReactElement<DocumentProps> {
  const imageSlots = getQuoteImageSlots(quote)
  const summaryRows = getQuoteSummaryRows(quote)
  const recommendedPackage = quote.packages.find((pkg) => pkg.recommended)
  const recommendedPricing = recommendedPackage
    ? computePackagePricing(recommendedPackage)
    : null
  const eventGroups = chunkArray(quote.events, 2)
  const policyItems = [...quote.terms, ...quote.privacyPolicy]
  const policyPages = chunkArray(policyItems, 18)
  const whatsappNumber = salesProfile?.whatsapp?.trim() || ""
  const initials = getSalesProfileInitials(salesProfile)

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
          {summaryRows.map((row, index) => (
            <View
              key={row.label}
              style={[
                styles.summaryCell,
                ...(index === summaryRows.length - 1 ? [styles.summaryCellLast] : []),
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
          <View style={styles.eventPageBody}>
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
                <View style={styles.preWeddingTop}>
                  <View>
                    <Text style={styles.preWeddingDate}>
                      {quote.preWeddingDate ? formatDateLabel(quote.preWeddingDate) : "Date to be decided"}
                    </Text>
                    <Text style={styles.preWeddingLocation}>
                      {quote.preWeddingLocation || quote.location || "Location to be decided"}
                    </Text>
                  </View>
                  <View style={styles.preWeddingStamp}>
                    <Text style={styles.preWeddingStampValue}>
                      ₹ {quote.preWeddingPriceLabel || "Priced separately"}
                    </Text>
                  </View>
                </View>
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
        <View style={styles.centeredPageBody}>
          <SectionHead
            kicker="Package comparison"
            title="Compare your options"
          />
          <Image
            src={pdfImageSource(imageSlots.packageHero)}
            style={styles.packageHero}
          />
          {recommendedPackage && recommendedPricing ? (
            <View style={styles.packageRecommendation}>
              <Text style={styles.packageRecommendationLabel}>
                Recommended package
              </Text>
              <Text style={styles.packageRecommendationValue}>
                {recommendedPackage.name} — {formatCurrency(
                  recommendedPricing.applied
                    ? recommendedPricing.final
                    : recommendedPackage.basePrice
                )}
              </Text>
              <Text style={styles.packageRecommendationTravel}>
                For events outside Delhi NCR, the client will arrange and cover
                the photography team&apos;s travel and accommodation.
              </Text>
            </View>
          ) : null}
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
            title="Package-wise deliverables and booking structure"
          />
          <View style={styles.stackedInfo}>
            <View style={styles.infoBlock}>
              <View style={styles.deliverablePackageGrid} wrap={false}>
                {quote.packages.map((pkg) => (
                  <View
                    key={pkg.id}
                    style={[
                      styles.deliverablePackageCard,
                      ...(pkg.recommended
                        ? [styles.deliverablePackageCardFeatured]
                        : []),
                    ]}
                  >
                    <Text style={styles.deliverablePackageLabel}>
                      {pkg.recommended
                        ? "Recommended collection"
                        : "Collection details"}
                    </Text>
                    <Text style={styles.deliverablePackageTitle}>
                      {pkg.name}
                    </Text>
                    <Text style={styles.deliverablePackageSubtitle}>
                      {pkg.subtitle}
                    </Text>
                    <View style={{ marginTop: 10 }}>
                      <BulletList items={getPackageDeliverables(pkg)} />
                    </View>
                    <View style={styles.deliverableContext}>
                      <Text style={styles.deliverableContextLabel}>Team</Text>
                      <Text style={styles.deliverableContextText}>
                        {pkg.team.map(formatTeamLabel).join(" · ")}
                      </Text>
                      {pkg.specialFeatures.length ? (
                        <View style={{ marginTop: 7 }}>
                          <Text style={styles.deliverableContextLabel}>
                            Special features
                          </Text>
                          <Text style={styles.deliverableContextText}>
                            {pkg.specialFeatures.join(" · ")}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.chapterPageBody}>
          <SectionHead
            kicker="Payments"
            title="Payment milestones"
          />
          <View style={styles.paymentPageCard} wrap={false}>
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
            <View style={styles.paymentTravelNote}>
              <Text style={styles.paymentTravelNoteLabel}>
                Travel and stay
              </Text>
              <Text style={styles.paymentTravelNoteText}>
                For celebrations taking place outside Delhi NCR, comfortable
                travel and stay arrangements for the coverage team are to be
                arranged by the client so the crew can deliver the experience
                smoothly across all scheduled events.
              </Text>
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
                If this direction feels right, your quote consultant can help reserve the date, guide the next payment step, and refine the package over WhatsApp.
              </Text>
              <View style={styles.closingProfileCard}>
                <View style={styles.closingAvatar}>
                  <Text style={styles.closingAvatarText}>{initials}</Text>
                </View>
                <View>
                  <Text style={styles.closingProfileName}>
                    {salesProfile?.displayName || "The Tranquil Wedding"}
                  </Text>
                  <Text style={styles.closingProfileTitle}>
                    {getSalesProfileRoleLine(salesProfile)}
                  </Text>
                </View>
              </View>
              <View style={styles.closingCtaStack}>
                {whatsappNumber ? (
                  <Link src={getQuoteWhatsAppMessageHref(whatsappNumber, "We'd like to reserve our date. Please guide us with the next step.")} style={styles.closingCtaPrimary}>
                    <Text style={styles.closingCtaLabel}>Reserve Now</Text>
                    <Text style={styles.closingCtaPrimaryText}>
                      Open WhatsApp chat to reserve your date
                    </Text>
                  </Link>
                ) : null}
                {whatsappNumber ? (
                  <Link src={getQuoteWhatsAppMessageHref(whatsappNumber, "We reviewed the quotation and want to discuss the package.")} style={styles.closingCtaSecondary}>
                    <Text style={styles.closingCtaSecondaryLabel}>Chat on WhatsApp</Text>
                    <Text style={styles.closingCtaSecondaryText}>
                      WhatsApp: {whatsappNumber}
                    </Text>
                  </Link>
                ) : null}
              </View>
              <Text style={styles.closingBrandLine}>
                The Tranquil Wedding · {quote.contact.website}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
