"use client"

import Image from "next/image"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { Bookmark, Calendar, MessageSquare, RefreshCw } from "lucide-react"

type Feature = {
  icon: LucideIcon
  title: string
  description: string
  image: string
}

const features: Feature[] = [
  {
    icon: Bookmark,
    title: "목표 기능",
    description: "장·단기 목표를 한 곳에서 관리하고 진행도를 한눈에 확인",
    image: "/landing/images/goal.png",
  },
  {
    icon: Calendar,
    title: "일정 기능",
    description: "목표와 소목표를 일정 타임라인으로 연결해 실제 하루·주간 계획 수립",
    image: "/landing/images/plan.png",
  },
  {
    icon: RefreshCw,
    title: "템플릿 기능",
    description: "자주 쓰는 목표·일정을 템플릿으로 저장하고, 한 번에 새 목표로 생성",
    image: "/landing/images/template.png",
  },
  {
    icon: MessageSquare,
    title: "회고 기능",
    description: "하루·주간 회고로 실행 결과와 감정을 기록하고, 나만의 패턴을 분석",
    image: "/landing/images/mypage.png",
  },
]

export function FeatureSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeFeature = features[activeIndex]

  return (
    <section id="features" className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center md:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Krocs Features</p>
          <h2 className="mt-3 text-2xl font-bold leading-tight break-keep text-balance sm:text-3xl md:text-4xl lg:text-5xl">
            Krocs가 제공하는 시간 루프 기능
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            계획-실행-복기 흐름을 잇는 핵심 기능을 카드로 확인하고, 우측에서 실제 화면 미리보기를 살펴보세요.
          </p>
        </div>

        <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.55fr)] lg:gap-12">
          <div className="flex h-full flex-col space-y-3 lg:max-w-md">
            {features.map((feature, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={feature.title}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  className="w-full text-left"
                >
                  <Card
                    className={`flex flex-col gap-3 rounded-3xl border px-5 py-6 sm:py-7 transition-all duration-200 ${
                      isActive
                        ? "border-[var(--landing-primary)] bg-white shadow-lg"
                        : "border-transparent bg-white/70 hover:border-white hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-[var(--landing-primary)]/10 p-2 text-[var(--landing-primary)]">
                        <feature.icon className="size-4" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  </Card>
                </button>
              )
            })}
          </div>

          <div className="relative self-stretch">
            <div className="absolute inset-0 -z-10 rounded-[36px] bg-gradient-to-br from-white/80 via-white/30 to-transparent blur-3xl" />
            <Card className="flex h-full flex-col rounded-[32px] border border-white/60 bg-white/90 p-4 shadow-2xl backdrop-blur">
              <div className="flex flex-col gap-1.5 border-b border-border/60 pb-3 px-2 sm:px-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[var(--landing-primary)]/10 p-2 text-[var(--landing-primary)]">
                    <activeFeature.icon className="size-4" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold leading-snug text-foreground sm:text-xl">{activeFeature.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground sm:leading-snug">{activeFeature.description}</p>
              </div>

              <div className="relative mt-4 flex w-full flex-1 items-center justify-center overflow-hidden rounded-[24px] border border-border/60 bg-muted p-4 sm:p-6 min-h-[260px] sm:min-h-[340px]">
                <Image
                  src={activeFeature.image}
                  alt={activeFeature.title}
                  fill
                  sizes="(min-width: 1024px) 480px, 90vw"
                  className="object-cover"
                  priority
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
