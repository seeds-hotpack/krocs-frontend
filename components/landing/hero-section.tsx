import { Button } from "@/components/landing/ui/button"
import { PhoneMockup } from "@/components/landing/phone-mockup"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#ffd4c8] via-background to-[#c8e3ea]">
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium">
              계획의 루프를 완성하는 시간 코치
            </p>

            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight break-keep">
                <span className="block">시간을 계획하는 게 아니라,</span>
                <span className="block">
                  <span className="text-[#ff8b6b]">조율하는 것</span>부터 시작하세요.
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
                <span className="inline-block">계획과 현실을 연결하는 시간 루프 코치, Krocs</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="text-xs sm:text-sm px-6 sm:px-8 py-5 sm:py-6 rounded-full bg-[#ff8b6b] hover:bg-[#ff7a56] text-white"
              >
                지금 내 루틴 기록하기
              </Button>
            </div>
          </div>

          <div className="hidden lg:flex justify-center">
            <PhoneMockup imageSrc="/landing/images/app-calendar.png" />
          </div>
        </div>
      </div>
    </section>
  )
}
