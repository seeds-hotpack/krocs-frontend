"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { logout } from "@/api/auth"
import krocsLogo from "@/assets/krocslogo.png"

const navItems = [
  { href: "/goal", label: "목표" },
  { href: "/schedule", label: "일정" },
  { href: "/templates", label: "탬플릿" },
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

  return (
    <header className="sticky top-0 z-50 border-b border-[#D3E6ED] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/goal" className="flex items-center gap-3">
          <Image src={krocsLogo} alt="Krocs 로고" width={130} height={36} priority />
        </Link>
        <nav className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive =
              item.href === "/goal"
                ? pathname === "/" || pathname?.startsWith("/goal")
                : pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`text-sm font-semibold transition-colors ${
                  isActive ? "text-[#ff7b5f]" : "text-[#5D6E72] hover:text-[#0F1C21]"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-[100px] bg-[#ff7b5f] px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#ff6a4a] disabled:cursor-not-allowed disabled:opacity-80"
          >
            로그아웃
          </button>
        </nav>
      </div>
    </header>
  )
}
