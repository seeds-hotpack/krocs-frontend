"use client"

import { Button } from "@/components/landing/ui/button"
import { landingGradients } from "@/components/landing/landing-theme"

export function CTASection() {
  return (
    <section
      id="cta"
      className="py-32 relative overflow-hidden"
      style={{ backgroundImage: landingGradients.ctaBackground }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: "var(--landing-cta-overlay)" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              <span className="inline-block">지금, 당신의 시간 루프를</span>
            </h2>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              <span className="inline-block">다시 설계해보세요.</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 rounded-xl font-semibold bg-white text-[var(--landing-accent-dark)] hover:bg-white/90"
              onClick={() => {
                window.location.href = "/"
              }}
            >
              시작하기
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
