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
  formatInvoiceCurrency,
  formatInvoiceHeaderDate,
  formatInvoiceRowDate,
  resolveAmountInWords,
  resolveInvoiceBalanceDue,
  resolveInvoiceCurrentAmount,
  resolveInvoicePackageTotal,
} from "@/lib/invoices/presentation"
import type { InvoiceRecord } from "@/lib/invoices/types"

const fontBasePath = path.join(process.cwd(), "public", "fonts")

Font.register({
  family: "InvoiceDisplay",
  fonts: [
    {
      src: path.join(fontBasePath, "CormorantGaramond-Variable.ttf"),
      fontWeight: 500,
    },
    {
      src: path.join(fontBasePath, "CormorantGaramond-Variable.ttf"),
      fontWeight: 700,
    },
  ],
})

Font.register({
  family: "InvoiceBody",
  fonts: [
    { src: path.join(fontBasePath, "Jost-Variable.ttf"), fontWeight: 400 },
    { src: path.join(fontBasePath, "Jost-Variable.ttf"), fontWeight: 500 },
    { src: path.join(fontBasePath, "Jost-Variable.ttf"), fontWeight: 700 },
  ],
})

Font.registerHyphenationCallback((word) => [word])

function pdfImageSource(src: string) {
  if (src.startsWith("/")) {
    return path.join(process.cwd(), "public", src.replace(/^\//, ""))
  }
  return src
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    paddingTop: 24,
    paddingRight: 28,
    paddingBottom: 0,
    paddingLeft: 28,
    color: "#151515",
    fontFamily: "InvoiceBody",
    fontSize: 10,
  },
  pageBody: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  studioBlock: {
    width: 220,
  },
  studioName: {
    fontSize: 27,
    fontWeight: 700,
    lineHeight: 0.96,
    color: "#1E542A",
  },
  studioAddress: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 1.4,
  },
  logoWrap: {
    width: 92,
    height: 92,
    borderRadius: 16,
    backgroundColor: "#1E542A",
    padding: 12,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  headingRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  billToLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#666666",
  },
  clientName: {
    marginTop: 8,
    fontSize: 21,
    fontWeight: 700,
    lineHeight: 1.18,
  },
  invoiceHeading: {
    fontFamily: "InvoiceDisplay",
    fontSize: 34,
    letterSpacing: 3,
    textAlign: "right",
  },
  invoiceDate: {
    marginTop: 18,
    fontSize: 12,
    textAlign: "right",
  },
  table: {
    marginTop: 18,
  },
  tableHead: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#D8D8D8",
    fontSize: 11.5,
    fontWeight: 700,
  },
  columnLabel: {
    flexGrow: 1.8,
    flexBasis: 0,
  },
  columnDate: {
    flexGrow: 0.8,
    flexBasis: 0,
    textAlign: "center",
  },
  columnAmount: {
    flexGrow: 0.7,
    flexBasis: 0,
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    alignItems: "center",
  },
  tableLabel: {
    flexGrow: 1.8,
    flexBasis: 0,
    fontSize: 12.5,
  },
  tableLabelStrong: {
    fontSize: 16.5,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  tableDate: {
    flexGrow: 0.8,
    flexBasis: 0,
    fontSize: 12.5,
    textAlign: "center",
  },
  tableAmount: {
    flexGrow: 0.7,
    flexBasis: 0,
    fontSize: 12.5,
    textAlign: "right",
  },
  tableAmountStrong: {
    fontWeight: 700,
  },
  lowerGrid: {
    marginTop: 18,
    flexDirection: "row",
    gap: 18,
    flexShrink: 1,
  },
  leftLower: {
    flexGrow: 1.7,
    flexBasis: 0,
  },
  rightLower: {
    flexGrow: 0.95,
    flexBasis: 0,
    justifyContent: "space-between",
  },
  amountWordsWrap: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 8,
  },
  amountWords: {
    fontSize: 12,
    lineHeight: 1.45,
  },
  bankHeading: {
    marginTop: 18,
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    textDecoration: "underline",
  },
  bankGrid: {
    marginTop: 10,
    gap: 3,
  },
  bankRow: {
    flexDirection: "row",
  },
  bankKey: {
    width: "41%",
    fontSize: 10.8,
  },
  bankValue: {
    width: "59%",
    fontSize: 10.8,
  },
  totalsWrap: {
    width: "100%",
    marginLeft: "auto",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  totalLabel: {
    fontSize: 13,
  },
  totalLabelStrong: {
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 13,
    textAlign: "right",
  },
  totalValueStrong: {
    fontWeight: 700,
  },
  signatoryWrap: {
    marginTop: 18,
    alignItems: "flex-end",
  },
  signaturePlaceholder: {
    width: 112,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#97A29A",
    borderBottomStyle: "dashed",
    fontSize: 8.5,
    color: "#54655A",
  },
  signatureImageWrap: {
    width: 112,
    height: 40,
  },
  signatureImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  signatoryName: {
    marginTop: 8,
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#31453B",
  },
  signatoryTitle: {
    marginTop: 2,
    fontSize: 9,
    color: "#31453B",
  },
  signatoryLabel: {
    marginTop: 6,
    fontSize: 11.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  footer: {
    marginTop: 14,
    marginHorizontal: -28,
    backgroundColor: "#1E542A",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 8.8,
    letterSpacing: 1.1,
  },
  termsPageBody: {
    paddingTop: 18,
  },
  termsKicker: {
    fontSize: 7.8,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: "#666666",
    textAlign: "center",
  },
  termsTitle: {
    marginTop: 6,
    fontFamily: "InvoiceDisplay",
    fontSize: 22,
    textAlign: "center",
    color: "#1E542A",
  },
  legalMilestoneCard: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "#1E542A",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  legalMilestoneHeading: {
    fontFamily: "InvoiceDisplay",
    fontSize: 16,
    color: "#FFFFFF",
  },
  legalMilestoneGrid: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  legalMilestoneItem: {
    flexGrow: 1,
    flexBasis: 0,
    minHeight: 74,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  legalMilestonePct: {
    fontFamily: "InvoiceDisplay",
    fontSize: 17,
    color: "#D7B448",
  },
  legalMilestoneBody: {
    marginTop: 2,
  },
  legalMilestoneLabel: {
    fontSize: 6.4,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#B8C8BA",
  },
  legalMilestoneName: {
    marginTop: 1,
    fontSize: 10.2,
    color: "#FFFFFF",
  },
  legalMilestoneText: {
    marginTop: 1,
    fontSize: 7.3,
    lineHeight: 1.22,
    color: "rgba(255,255,255,0.8)",
  },
  termsGrid: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },
  termsCol: {
    flexGrow: 1,
    flexBasis: 0,
  },
  termItem: {
    marginBottom: 6,
  },
  termNumber: {
    fontFamily: "InvoiceDisplay",
    fontSize: 13,
    color: "#D7B448",
  },
  termText: {
    marginTop: 0,
    fontSize: 7,
    lineHeight: 1.16,
  },
})

export function buildInvoicePdfDocument(
  invoice: InvoiceRecord,
  options?: Omit<DocumentProps, "children">
): ReactElement<DocumentProps> {
  const packageTotal = resolveInvoicePackageTotal(invoice)
  const currentInvoiceAmount = resolveInvoiceCurrentAmount(invoice)
  const balanceDue = resolveInvoiceBalanceDue(invoice)
  const amountInWords = resolveAmountInWords(invoice)
  const policyItems = [...invoice.terms, ...invoice.privacyPolicy]

  return (
    <Document title={invoice.invoiceTitle} {...options}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageBody}>
          <View>
            <View style={styles.topRow}>
              <View style={styles.studioBlock}>
                <Text style={styles.studioName}>{invoice.studio.name}</Text>
                <View style={styles.studioAddress}>
                  {invoice.studio.addressLines
                    .filter(Boolean)
                    .map((line, index) => (
                      <Text key={`${line}-${index}`}>{line}</Text>
                    ))}
                </View>
              </View>
              <View style={styles.logoWrap}>
                <Image
                  src={pdfImageSource(
                    invoice.studio.logoPath || "/brand/logo.png"
                  )}
                  style={styles.logoImage}
                />
              </View>
            </View>

            <View style={styles.headingRow}>
              <View>
                <Text style={styles.billToLabel}>Bill To</Text>
                <Text style={styles.clientName}>
                  {invoice.clientName || "Client name"}
                </Text>
              </View>
              <View>
                <Text style={styles.invoiceHeading}>INVOICE / RECEIPT</Text>
                <Text style={styles.invoiceDate}>
                  Date: {formatInvoiceHeaderDate(invoice.invoiceDate)}
                </Text>
              </View>
            </View>

            <View style={styles.table}>
              <View style={styles.tableHead}>
                <Text style={styles.columnLabel}>Payment Distribution</Text>
                <Text style={styles.columnDate}>Event Date</Text>
                <Text style={styles.columnAmount}>Installment</Text>
              </View>
              {invoice.installments.map((installment, index) => {
                const highlighted = index === 0 || installment.amount.trim()

                return (
                  <View key={installment.id} style={styles.tableRow}>
                    <Text
                      style={
                        highlighted
                          ? [styles.tableLabel, styles.tableLabelStrong]
                          : styles.tableLabel
                      }
                    >
                      {installment.label || "Installment label"}
                    </Text>
                    <Text style={styles.tableDate}>
                      {formatInvoiceRowDate(installment.eventDate)}
                    </Text>
                    <Text
                      style={
                        installment.amount.trim()
                          ? [styles.tableAmount, styles.tableAmountStrong]
                          : styles.tableAmount
                      }
                    >
                      {formatInvoiceCurrency(installment.amount, "-")}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>

          <View>
            <View style={styles.lowerGrid}>
              <View style={styles.leftLower}>
                <View style={styles.amountWordsWrap}>
                  <Text style={styles.amountWords}>
                    Amount in words : {amountInWords}
                  </Text>
                </View>
                <Text style={styles.bankHeading}>Bank Account Details:</Text>
                <View style={styles.bankGrid}>
                  {[
                    ["BANK NAME", invoice.bankDetails.bankName],
                    ["ACC. HOLDER NAME", invoice.bankDetails.accountHolderName],
                    ["BRANCH ADDRESS", invoice.bankDetails.branchAddress],
                    ["ACCOUNT NO.", invoice.bankDetails.accountNumber],
                    ["IFSC", invoice.bankDetails.ifsc],
                    ["ACCOUNT TYPE", invoice.bankDetails.accountType],
                  ].map(([label, value]) => (
                    <View key={label} style={styles.bankRow}>
                      <Text style={styles.bankKey}>{label}</Text>
                      <Text style={styles.bankValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.rightLower}>
                <View style={styles.totalsWrap}>
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, styles.totalLabelStrong]}>
                      Package Total
                    </Text>
                    <Text style={styles.totalValue}>
                      {formatInvoiceCurrency(packageTotal, "Rs. 0")}
                    </Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Payment Received</Text>
                    <Text style={styles.totalValue}>
                      {formatInvoiceCurrency(currentInvoiceAmount, "Rs. 0")}
                    </Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, styles.totalLabelStrong]}>
                      Balance Due
                    </Text>
                    <Text style={[styles.totalValue, styles.totalValueStrong]}>
                      {formatInvoiceCurrency(balanceDue, "Rs. 0")}
                    </Text>
                  </View>
                </View>
                <View style={styles.signatoryWrap}>
                  {invoice.signatory.signatureImagePath.trim() ? (
                    <View style={styles.signatureImageWrap}>
                      <Image
                        src={pdfImageSource(
                          invoice.signatory.signatureImagePath
                        )}
                        style={styles.signatureImage}
                      />
                    </View>
                  ) : (
                    <View style={styles.signaturePlaceholder}>
                      <Text>Signature placeholder</Text>
                    </View>
                  )}
                  {invoice.signatory.name ? (
                    <Text style={styles.signatoryName}>
                      {invoice.signatory.name}
                    </Text>
                  ) : null}
                  {invoice.signatory.title ? (
                    <Text style={styles.signatoryTitle}>
                      {invoice.signatory.title}
                    </Text>
                  ) : null}
                  <Text style={styles.signatoryLabel}>
                    {invoice.signatory.label}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.footer}>
              <Text>{invoice.footerContact.website}</Text>
              <Text>{invoice.footerContact.phone}</Text>
              <Text>{invoice.footerContact.email}</Text>
            </View>
          </View>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page}>
        <View style={styles.termsPageBody}>
          <Text style={styles.termsKicker}>Terms</Text>
          <Text style={styles.termsTitle}>
            Payment milestones and conditions
          </Text>

          <View style={styles.legalMilestoneCard} wrap={false}>
            <Text style={styles.legalMilestoneHeading}>Payment milestones</Text>
            <View style={styles.legalMilestoneGrid}>
              {invoice.paymentTerms.map((term, index) => (
                <View key={term.id} style={styles.legalMilestoneItem}>
                  <Text style={styles.legalMilestonePct}>
                    {term.percentage}%
                  </Text>
                  <View style={styles.legalMilestoneBody}>
                    <Text style={styles.legalMilestoneLabel}>
                      Milestone {index + 1}
                    </Text>
                    <Text style={styles.legalMilestoneName}>{term.label}</Text>
                    <Text style={styles.legalMilestoneText}>
                      {term.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.termsGrid}>
            {[0, 1].map((columnIndex) => (
              <View key={columnIndex} style={styles.termsCol}>
                {policyItems
                  .filter((_, index) => index % 2 === columnIndex)
                  .map((term, index) => {
                    const number = columnIndex + index * 2 + 1
                    return (
                      <View key={`${term}-${number}`} style={styles.termItem}>
                        <Text style={styles.termNumber}>
                          {String(number).padStart(2, "0")}
                        </Text>
                        <Text style={styles.termText}>{term}</Text>
                      </View>
                    )
                  })}
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  )
}
