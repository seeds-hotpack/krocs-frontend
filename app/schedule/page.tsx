import type { Metadata } from "next"
import SchedulePageClient from "./schedule-page-client"

export const metadata: Metadata = {
  title: "일정 관리",
}

export default function SchedulePage() {
  return <SchedulePageClient />
}
