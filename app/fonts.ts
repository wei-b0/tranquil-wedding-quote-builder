import localFont from "next/font/local"

export const quoteDisplayFont = localFont({
  src: [
    {
      path: "../public/fonts/CormorantGaramond-Variable.ttf",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../public/fonts/CormorantGaramond-Italic-Variable.ttf",
      weight: "400 700",
      style: "italic",
    },
  ],
  variable: "--font-quote-display",
})

export const quoteBodyFont = localFont({
  src: [
    {
      path: "../public/fonts/Jost-Variable.ttf",
      weight: "300 700",
      style: "normal",
    },
  ],
  variable: "--font-quote-body",
})

export const quoteAccentFont = localFont({
  src: "../public/fonts/Parisienne-Regular.ttf",
  variable: "--font-quote-accent",
})
