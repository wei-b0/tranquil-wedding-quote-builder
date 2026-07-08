"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

export function ToastOnMount({
  message,
  type = "success",
}: {
  message: string
  type?: "success" | "error"
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (type === "error") {
      toast.error(message)
    } else {
      toast.success(message)
    }
    router.replace(pathname, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
