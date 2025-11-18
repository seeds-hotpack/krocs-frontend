import type { Metadata } from "next"
import TemplatesPageClient from "./templates-page-client"

export const metadata: Metadata = {
  title: "템플릿",
}

export default function TemplatesPage() {
  return <TemplatesPageClient />
}
