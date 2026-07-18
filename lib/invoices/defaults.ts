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
    packageTotal: "0",
    currentInvoiceAmount: "0",
    balanceDue: "0",
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
        label: "",
        eventDate: "",
        amount: "",
      },
    ],
    paymentTerms: [
      {
        id: createId(),
        label: "Advance payment",
        percentage: 40,
        description: "To confirm the booking and block the event dates",
      },
      {
        id: createId(),
        label: "Shoot completion",
        percentage: 50,
        description: "To be cleared after all shoots are completed",
      },
      {
        id: createId(),
        label: "Final payment",
        percentage: 10,
        description: "After delivery of all final edited photos and videos",
      },
    ],
    terms: [
      "Delivery of Photographs: We will provide all raw photographs within 4 to 5 days after settlement of outstanding dues. A selection of the best edited photos will be shared within 1 month after your final function.",
      "Album Delivery: The custom album will be provided within 30 days of your design approval and payment completion. Collection of the album and any pending dues must be completed from our office when the album is ready.",
      "Payment Schedule: We accept payments via net banking, UPI, or cash. Timely payments help us maintain an efficient workflow and deliver your memories faster.",
      "Waiting Charges: Waiting charges become applicable after 1 hour. An additional Rs. 15,000 per hour will be added to the total cost.",
      "Album Photo Selection: Please select your preferred photos for the album within one month of receiving the photobook preview. Delays may postpone delivery.",
      "Wedding Film Delivery: All wedding films will be edited and delivered within 20 days following your approval of the soundtrack. The editing timeline starts from the date of song approval.",
      "Rights and Social Media: We reserve the right to feature your event photos and videos on our social media platforms and portfolio.",
      "Photo Sharing Process: Edited photos and videos will be shared with you via Google Drive.",
      "Data Backup Responsibility: Post-delivery, the responsibility of backing up the photos rests with you. We are not liable for lost data after delivery.",
      "Cancellation Policy: In case of event cancellation for unforeseen reasons, the quotation cannot be revised and the advance payment is non-refundable.",
      "Portfolio Shoot Time Allocation: A minimum of 40 to 45 minutes is required for the bride and groom portfolio shoot. This session is scheduled before the phere ceremony.",
      "Post-Vidai Ceremony: Our team will depart for the studio after the vidaai unless it is discussed and agreed beforehand.",
    ],
    privacyPolicy: [
      "Final photos and videos are delivered digitally through Google Drive links shared with the client.",
      "We retain event media internally for editing, quality checks, and final delivery fulfilment.",
      "Clients are responsible for maintaining their own backup once final delivery is completed.",
      "Selected photos or videos may be used for portfolio and social media promotion unless otherwise agreed in writing.",
      "Media may be shared only with editing or delivery partners when required to fulfil the booked service.",
    ],
    subtotal: "0",
    total: "0",
    amountInWords: "",
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
