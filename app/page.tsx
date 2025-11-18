import type { Metadata } from "next"
import LandingPage from "./landing/page"

export const metadata: Metadata = {
  title: "홈",
}

export default function HomePage() {
  return <LandingPage />
}
