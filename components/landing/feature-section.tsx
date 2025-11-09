"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, RefreshCw, Calendar, Bookmark, Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const features = [
  {
    icon: MessageSquare,
    title: "복기 카드",
    description: "일정 종료 후 자동 피드백",
    image: "/landing/images/app-feed.png",
  },
  {
    icon: RefreshCw,
    title: "회복 루프",
    description: "일정 실패 시 즉시 대안 제시",
    image: "/landing/images/app-routine.png",
  },
  {
    icon: Calendar,
    title: "리듬 기반 추천",
    description: "집중 패턴 분석 후 시간 블록 제안",
    image: "/landing/images/app-calendar.png",
  },
  {
    icon: Bookmark,
    title: "루틴 추적",
    description: "연속 실행일·감정 기록으로 지속성 강화",
    image: "/landing/images/app-routine.png",
  },
  {
    icon: Users,
    title: "공유 기능",
    description: "친구와 루틴 공유, 소셜 책임감 형성",
    image: "/landing/images/app-settings.png",
  },
]

export function FeatureSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const autoScroll = () => {
      const cardWidth = scrollContainer.querySelector(".feature-card")?.clientWidth || 300
      const gap = 24 // gap-6
      const scrollAmount = cardWidth + gap
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth
      const currentScroll = scrollContainer.scrollLeft

      if (currentScroll >= maxScroll - 10) {
        scrollContainer.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        scrollContainer.scrollTo({ left: currentScroll + scrollAmount, behavior: "smooth" })
      }
    }

    const interval = setInterval(autoScroll, 7000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 overflow-hidden">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            Krocs가 제공하는 시간 루프 기능
          </h2>
        </div>

        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing flex justify-start"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex gap-4 md:gap-6 px-[15vw] md:px-8 pb-4">
            {features.map((feature, index) => {
              return (
                <Card
                  key={index}
                  className="feature-card bg-white w-[70vw] sm:w-[260px] md:w-[300px] flex-shrink-0 shadow-sm border border-gray-100"
                >
                  <CardContent className="p-3 md:p-4 space-y-2">
                    <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={feature.image || "/placeholder.svg"}
                        alt={feature.title}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <h3 className="text-sm md:text-base font-bold pt-1">{feature.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
