"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import krocsLogo from "@/assets/krocslogo.png"
import { logout } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AppNavigationBarProps {
  className?: string
  contentClassName?: string
}

export function AppNavigationBar({ className, contentClassName }: AppNavigationBarProps) {
  const router = useRouter()
  const [isProcessingLogout, setIsProcessingLogout] = useState(false)

  const handleLogout = async () => {
    if (isProcessingLogout) return
    setIsProcessingLogout(true)
    try {
      await logout()
      alert("로그아웃 되었습니다.")
      router.push("/login")
    } catch (error) {
      console.error(error)
      alert("로그아웃에 실패했습니다.")
    } finally {
      setIsProcessingLogout(false)
    }
  }

  return (
    <div className={cn("border-b border-[#D3E6ED] bg-[#EEF5F7]/95 backdrop-blur", className)}>
      <div className={cn("mx-auto flex h-16 items-center justify-between px-5", contentClassName)}>
        <Link href="/" className="flex items-center gap-2">
          <Image src={krocsLogo} alt="Krocs" width={120} height={120} className="h-10 w-auto object-contain" />
        </Link>
        <nav className="flex items-center gap-4 text-sm font-semibold text-[#0F1C21]">
          <Link href="/goal" className="transition-colors hover:text-[#ff8b6b]">
            목표
          </Link>
          <Link href="/schedule" className="transition-colors hover:text-[#ff8b6b]">
            일정
          </Link>
          <Link href="/templates" className="transition-colors hover:text-[#ff8b6b]">
            템플릿
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="rounded-full bg-[#ff8b6b] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#ff7a56]"
            disabled={isProcessingLogout}
          >
            로그아웃
          </Button>
        </nav>
      </div>
    </div>
  )
}
