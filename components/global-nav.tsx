"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, LayoutTemplate, Target } from "lucide-react"

import { logout } from "@/api/auth"
import krocsLogo from "@/assets/krocslogo.png"

const navItems = [
  { href: "/goal", label: "목표", icon: Target },
  { href: "/schedule", label: "일정", icon: Calendar },
  { href: "/templates", label: "탬플릿", icon: LayoutTemplate },
]

export function GlobalNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      alert("로그아웃에 실패했습니다.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const isActivePath = (href: string) => {
    if (href === "/goal") {
      return pathname === "/" || pathname?.startsWith("/goal")
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#D3E6ED] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-6">
          <Link href="/goal" className="flex items-center gap-3">
            <Image
              src={krocsLogo}
              alt="Krocs 로고"
              width={130}
              height={36}
              priority
              className="h-8 w-auto md:h-10"
            />
          </Link>
          <div className="flex items-center gap-4 md:gap-6">
            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActivePath(item.href) ? "page" : undefined}
                  className={`text-sm font-semibold transition-colors ${
                    isActivePath(item.href) ? "text-[#ff7b5f]" : "text-[#5D6E72] hover:text-[#0F1C21]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-[100px] bg-[#ff7b5f] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#ff6a4a] disabled:cursor-not-allowed disabled:opacity-80 md:px-6 md:py-2 md:text-sm"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D3E6ED] bg-white/95 px-4 pb-4 pt-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = isActivePath(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  isActive ? "text-[#ff7b5f]" : "text-[#5D6E72]"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#ff7b5f]" : "text-[#5D6E72]"}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
