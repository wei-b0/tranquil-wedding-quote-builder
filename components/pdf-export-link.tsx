"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

export function PdfExportLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: React.ReactNode
}) {
  const [isOpening, setIsOpening] = useState(false)

  useEffect(() => {
    if (!isOpening) return

    const stop = () => setIsOpening(false)
    window.addEventListener("focus", stop)
    const timeout = window.setTimeout(stop, 8000)

    return () => {
      window.removeEventListener("focus", stop)
      window.clearTimeout(timeout)
    }
  }, [isOpening])

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(className)}
      aria-busy={isOpening}
      onClick={() => setIsOpening(true)}
    >
      {isOpening ? <Loader2 className="size-4 animate-spin" /> : null}
      {isOpening ? "Preparing PDF…" : children}
    </a>
  )
}
