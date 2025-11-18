import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "접근 제한",
}

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#EEF5F7] flex flex-col items-center justify-center px-6 text-center text-[#0F1C21]">
      <div className="max-w-lg space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#5D6E72]">403</p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          접근 권한이 필요합니다.
        </h1>
        <p className="text-base text-[#5D6E72]">
          로그인 세션이 만료되었거나 권한이 없는 페이지에 접근하셨어요. 다시 로그인하면 계속 이용하실 수 있습니다.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild className="px-8 py-6 rounded-full bg-[#ff7b5f] hover:bg-[#ff6a4a]">
            <Link href="/login">다시 로그인하기</Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="px-8 py-6 rounded-full border-[#D3E6ED] text-[#0F1C21] hover:bg-white"
          >
            <Link href="/landing">랜딩 페이지 보기</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
