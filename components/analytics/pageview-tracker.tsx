"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { trackPageView } from "@/lib/analytics/gtag"

export function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const query = searchParams.toString()
    const page_path = query ? `${pathname}?${query}` : pathname

    trackPageView(page_path)
  }, [pathname, searchParams])

  return null
}
