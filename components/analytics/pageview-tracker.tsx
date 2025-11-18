"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || ""

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_ID || typeof window === "undefined" || typeof window.gtag !== "function") {
      return
    }

    const query = searchParams.toString()
    const page_path = query ? `${pathname}?${query}` : pathname

    window.gtag("config", GA_ID, {
      page_path,
    })
  }, [pathname, searchParams])

  return null
}
