"use client"
import React, { useEffect } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { GoogleAnalytics } from "@next/third-parties/google"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const myGaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || ""
const shouldLoadGA = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_ANALYTICS === "true" && Boolean(myGaId)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  useEffect(() => {
    document.documentElement.classList.remove("dark")
  }, [])

  return (
    <>
      {children}
      {shouldLoadGA && <GoogleAnalytics gaId={myGaId} />}
    </>
  )
}
