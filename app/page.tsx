import type { Metadata } from "next"
import LandingPage from "./landing/page"

export const metadata: Metadata = {
  title: {
    absolute: "홈 | Krocs",
  },
}

export default function HomePage() {
  return <LandingPage />
}
