import type { InvoiceRecord } from "@/lib/invoices/types"

function createId() {
  return crypto.randomUUID()
}

function createSlug() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 18)
}

export function createDefaultInvoice(
  ownerEmail: string,
  creatorUserId = ""
): InvoiceRecord {
  const now = new Date().toISOString()

  return {
    id: createId(),
    slug: createSlug(),
    status: "draft",
    lastActiveStatus: "draft",
    trashedAt: null,
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
    creatorUserId,
    ownerEmail,
    clientName: "",
    invoiceTitle: "Wedding Coverage Invoice",
    invoiceDate: now.slice(0, 10),
    studio: {
      name: "The Tranquil Wedding",
      addressLines: [
        "Office no.415, 4th floor",
        "Paras Trinity, Sector 63",
        "Gurugram",
      ],
      logoPath: "/brand/logo.png",
    },
    installments: [
      {
        id: createId(),
        label: "Advance Payment",
        eventDate: now.slice(0, 10),
        amount: "10000",
      },
      {
        id: createId(),
        label: "Lagan",
        eventDate: "",
        amount: "",
      },
      {
        id: createId(),
        label: "Haldi, Mehendi & Bhaat",
        eventDate: "",
        amount: "",
      },
      {
        id: createId(),
        label: "Wedding",
        eventDate: "",
        amount: "71000",
      },
      {
        id: createId(),
        label: "After Work",
        eventDate: "",
        amount: "9000",
      },
    ],
    subtotal: "90000",
    total: "90000",
    amountInWords: "Ninety Thousand Rupees only/-",
    bankDetails: {
      bankName: "HDFC BANK",
      accountHolderName: "ARYAN MIDHA PHOTOGRAPHER",
      branchAddress: "PARAS TRINITY",
      accountNumber: "50200098470917",
      ifsc: "HDFC0006367",
      accountType: "CURRENT ACCOUNT",
    },
    signatory: {
      label: "Authorized Signatory",
      name: "Aryan",
      title: "Proprietor",
      signatureImagePath: "",
    },
    footerContact: {
      website: "www.thetranquilwedding.com",
      phone: "+91 8851610107",
      email: "thetranquilwedding@gmail.com",
    },
  }
}
