import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffc0a8] via-[#eef5f7] to-[#eef5f7] flex flex-col items-center justify-center px-6 text-center text-[#0F1C21]">
      <div className="max-w-xl space-y-6">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-[#ff7b5f]">404</p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight break-keep">
          찾으시는 페이지가{" "}
          <span className="text-[#ff7b5f]">사라졌어요.</span>
        </h1>
        <p className="text-sm sm:text-base text-[#5D6E72] break-keep">
          주소가 잘못되었거나 더 이상 제공되지 않는 페이지입니다. 필요한 정보를 다시 찾아볼 수 있도록 주요 페이지로 안내해 드릴게요.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            asChild
            className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 rounded-full bg-[#ff7b5f] hover:bg-[#ff6a4a]"
          >
            <Link href="/goal">목표 페이지로 이동</Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 rounded-full border-[#D3E6ED] text-[#0F1C21] hover:bg-white"
          >
            <Link href="/landing">랜딩 페이지 보기</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
