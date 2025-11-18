import type { Metadata } from "next"
import LandingPageClient from "./landing-page-client"

export const metadata: Metadata = {
  title: "랜딩",
}

export default function LandingPage() {
  return <LandingPageClient />
}
