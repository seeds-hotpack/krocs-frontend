"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const navItems = [
  { label: "문제", href: "#problem" },
  { label: "솔루션", href: "#solution" },
  { label: "기능", href: "#features" },
  { label: "차별점", href: "#differentiation" },
  { label: "후기", href: "#testimonials" },
  { label: "소개", href: "#about" },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setMobileMenuOpen(false)
    }
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/80 backdrop-blur-lg shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image src="/landing/images/krocs-logo.png" alt="Krocs" width={120} height={40} className="h-10 w-auto" />
            </Link>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/80"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* CTA Button */}
            <button
              onClick={() => scrollToSection("#cta")}
              className="hidden md:block px-6 py-2 bg-[var(--landing-primary)] text-white rounded-full text-sm font-medium hover:bg-[var(--landing-primary-hover)] transition-all shadow-md"
            >
              시작하기
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-x-0 bottom-0 top-16 bg-background/95 backdrop-blur-lg px-4 pt-6">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="w-full text-left px-6 py-4 text-lg font-medium text-foreground hover:bg-white/60 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  scrollToSection("#cta")
                  setMobileMenuOpen(false)
                }}
                className="w-full mt-4 px-6 py-4 bg-[var(--landing-primary)] text-white rounded-full text-lg font-medium hover:bg-[var(--landing-primary-hover)] transition-all shadow-md"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
