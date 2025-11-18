import type { Metadata } from "next"
import GoalPageClient from "./goal-page-client"

export const metadata: Metadata = {
  title: "목표 관리",
}

export default function GoalPage() {
  return <GoalPageClient />
}
