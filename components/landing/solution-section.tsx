"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/landing/ui/card"
import { landingGradients } from "@/components/landing/landing-theme"

const steps = [
  {
    title: "실행 → 복기 루프",
    description: "무엇이 계획과 달랐는지 기록하며 자기 인식 강화",
    file: "loop.png",
  },
  {
    title: "실행 실패 → 회복 루프",
    description: "계획이 틀어져도, 즉시 대안 제시로 복구",
    file: "recovery.png",
  },
  {
    title: "현실 감각 기반 계획",
    description: "패턴 분석으로 실제 가능한 계획 제안",
    file: "planning.png",
  },
  {
    title: "지속 동기 & 루틴 설계",
    description: "습관을 기록하고, 나만의 루틴으로 발전",
    file: "routine.png",
  },
]

export function SolutionSection() {
  return (
    <section
      id="solution"
      className="py-16 md:py-24"
      style={{ backgroundImage: landingGradients.ctaBackground }}
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white break-keep text-balance">
            계획의 루프를 완성하는 시간 코치
          </h2>
          <div className="space-y-2">
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 max-w-3xl mx-auto">
              <span className="inline-block">Krocs는 단순한 일정 관리 앱이 아니라,</span>
            </p>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 max-w-3xl mx-auto">
              <span className="inline-block">실행과 복기를 연결하는 루프 시스템입니다.</span>
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6 px-4 md:px-8">
          {steps.map((step, index) => (
            <Card key={index} className="border-none shadow-lg rounded-3xl bg-white overflow-hidden">
              <CardContent className="p-6 md:p-8 flex items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <h3 className="text-base md:text-xl lg:text-2xl font-bold text-foreground">{step.title}</h3>
                  <p className="text-xs md:text-sm lg:text-base text-muted-foreground leading-relaxed break-keep">
                    {step.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Image
                    src={`/landing/images/solution/${step.file}`}
                    alt={step.title}
                    width={100}
                    height={100}
                    className="object-contain w-[100px] h-[100px] hidden sm:block"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
