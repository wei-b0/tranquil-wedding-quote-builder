import "./globals.css"
import { quoteAccentFont, quoteBodyFont, quoteDisplayFont } from "@/app/fonts"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        quoteDisplayFont.variable,
        quoteBodyFont.variable,
        quoteAccentFont.variable
      )}
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
