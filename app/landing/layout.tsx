import type { ReactNode } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { LandingLayoutClient } from "./landing-layout-client"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export default function LandingLayout({ children }: { children: ReactNode }) {
  return <LandingLayoutClient>{children}</LandingLayoutClient>
}
