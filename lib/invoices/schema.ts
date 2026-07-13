import { z } from "zod"

export const invoicePayloadSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(["draft", "trashed"]),
  lastActiveStatus: z.enum(["draft"]),
  trashedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  creatorUserId: z.string(),
  ownerEmail: z.string().email(),
  clientName: z.string(),
  invoiceTitle: z.string(),
  invoiceDate: z.string(),
  packageTotal: z.string(),
  amountReceived: z.string(),
  currentInvoiceAmount: z.string(),
  balanceDue: z.string(),
  studio: z.object({
    name: z.string(),
    addressLines: z.array(z.string()),
    logoPath: z.string(),
  }),
  installments: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      eventDate: z.string(),
      amount: z.string(),
    })
  ),
  paymentTerms: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      percentage: z.number(),
      description: z.string(),
    })
  ),
  terms: z.array(z.string()),
  privacyPolicy: z.array(z.string()),
  subtotal: z.string(),
  total: z.string(),
  amountInWords: z.string(),
  bankDetails: z.object({
    bankName: z.string(),
    accountHolderName: z.string(),
    branchAddress: z.string(),
    accountNumber: z.string(),
    ifsc: z.string(),
    accountType: z.string(),
  }),
  signatory: z.object({
    label: z.string(),
    name: z.string(),
    title: z.string(),
    signatureImagePath: z.string(),
  }),
  footerContact: z.object({
    website: z.string(),
    phone: z.string(),
    email: z.string(),
  }),
})
