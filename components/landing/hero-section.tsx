"use client"

import { Button } from "@/components/landing/ui/button"
import { PhoneMockup } from "@/components/landing/phone-mockup"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#ffd4c8] via-background to-[#c8e3ea]">
      <div className="container mx-auto px-4 py-24 lg:py-32 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 xl:gap-12 items-center">
          <div className="space-y-8 lg:col-span-5 xl:col-span-6 max-w-2xl">
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium">
              계획의 루프를 완성하는 시간 코치
            </p>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-extrabold leading-tight break-keep max-w-[24ch]">
                <span className="block">시간을 계획하는 게 아니라,</span>
                <span className="block">
                  <span className="text-[var(--landing-primary)]">조율하는 것</span>부터 시작하세요.
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-[32ch]">
                <span className="inline-block">계획과 현실을 연결하는 시간 루프 코치, Krocs</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="text-xs sm:text-sm px-6 sm:px-8 py-5 sm:py-6 rounded-full bg-[var(--landing-primary)] hover:bg-[var(--landing-primary-hover)] text-white"
                onClick={() => {
                window.location.href = "/"
              }}
              >
                지금 내 루틴 기록하기
              </Button>
            </div>
          </div>

          <div className="relative hidden lg:flex lg:col-span-7 xl:col-span-6 justify-end">
            <div className="relative w-full max-w-[480px]">
              <div className="absolute -right-6 top-8 w-72 h-72 bg-white/40 blur-3xl rounded-full" />
              <div className="absolute -left-10 bottom-0 w-80 h-80 bg-[var(--landing-accent-light)]/70 blur-3xl rounded-full" />

              <div className="relative ml-auto flex justify-end">
                <PhoneMockup imageSrc="/landing/images/app-calendar.png" />

                <div className="absolute -left-6 top-10 flex flex-col gap-3">
                  <div className="relative rounded-3xl bg-white/85 backdrop-blur border border-white/50 px-4 py-3 shadow-lg text-left after:content-[''] after:absolute after:-bottom-2 after:left-8 after:size-3 after:bg-white/85 after:border after:border-white/30 after:rotate-45">
                    <p className="text-xs font-semibold text-foreground">회고 기록 +1</p>
                    <p className="text-[11px] text-muted-foreground">이유 태그 저장</p>
                  </div>
                  <div className="relative rounded-3xl bg-white/85 backdrop-blur border border-white/50 px-4 py-3 shadow-lg text-left after:content-[''] after:absolute after:-bottom-2 after:left-6 after:size-3 after:bg-white/85 after:border after:border-white/30 after:rotate-45">
                    <p className="text-xs font-semibold text-foreground">재도전 제안</p>
                    <p className="text-[11px] text-muted-foreground">블록 재배치</p>
                  </div>
                </div>

                <div className="absolute -right-6 top-8 rounded-3xl bg-white/85 backdrop-blur border border-white/50 px-4 py-3 shadow-lg text-left after:content-[''] after:absolute after:-bottom-2 after:right-10 after:size-3 after:bg-white/85 after:border after:border-white/30 after:rotate-45">
                  <p className="text-xs font-semibold text-foreground">일정 타임라인</p>
                  <p className="text-[11px] text-muted-foreground">20분 뒤 일정 대기</p>
                </div>

                <div className="absolute -right-8 bottom-14 rounded-3xl bg-white/85 backdrop-blur border border-white/50 px-4 py-3 shadow-lg text-left after:content-[''] after:absolute after:-top-2 after:right-8 after:size-3 after:bg-white/85 after:border after:border-white/30 after:rotate-45">
                  <p className="text-xs font-semibold text-foreground">오늘 일정 86%</p>
                  <p className="text-[11px] text-muted-foreground">3개의 목표 진행 중</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
