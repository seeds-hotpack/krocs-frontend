"use client"

import { useEffect } from "react"

export function LandingLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark")
  }, [])

  return <>{children}</>
}
