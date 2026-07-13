export type ActiveInvoiceStatus = "draft"

export type InvoiceStatus = ActiveInvoiceStatus | "trashed"

export type InvoiceInstallmentRow = {
  id: string
  label: string
  eventDate: string
  amount: string
}

export type InvoicePaymentMilestone = {
  id: string
  label: string
  percentage: number
  description: string
}

export type InvoiceBankDetails = {
  bankName: string
  accountHolderName: string
  branchAddress: string
  accountNumber: string
  ifsc: string
  accountType: string
}

export type InvoiceSignatory = {
  label: string
  name: string
  title: string
  signatureImagePath: string
}

export type InvoiceStudioDetails = {
  name: string
  addressLines: string[]
  logoPath: string
}

export type InvoiceFooterContact = {
  website: string
  phone: string
  email: string
}

export type InvoiceRecord = {
  id: string
  slug: string
  status: InvoiceStatus
  lastActiveStatus: ActiveInvoiceStatus
  trashedAt: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  creatorUserId: string
  ownerEmail: string
  clientName: string
  invoiceTitle: string
  invoiceDate: string
  packageTotal: string
  amountReceived: string
  currentInvoiceAmount: string
  balanceDue: string
  studio: InvoiceStudioDetails
  installments: InvoiceInstallmentRow[]
  paymentTerms: InvoicePaymentMilestone[]
  terms: string[]
  privacyPolicy: string[]
  subtotal: string
  total: string
  amountInWords: string
  bankDetails: InvoiceBankDetails
  signatory: InvoiceSignatory
  footerContact: InvoiceFooterContact
}

export type InvoiceListItem = Pick<
  InvoiceRecord,
  | "id"
  | "slug"
  | "status"
  | "lastActiveStatus"
  | "trashedAt"
  | "expiresAt"
  | "clientName"
  | "invoiceTitle"
  | "invoiceDate"
  | "updatedAt"
>

export type InvoiceView = {
  invoice: InvoiceRecord
}
