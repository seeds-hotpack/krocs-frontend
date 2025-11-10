import { landingColors, landingGradients } from "@/components/landing/landing-theme"

export function AboutSection() {
  return (
    <section
      id="about"
      className="py-24 relative overflow-hidden"
      style={{ backgroundImage: landingGradients.aboutBackground }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute bottom-0 left-0 w-full h-64 opacity-10" viewBox="0 0 1440 320">
          <path
            fill="url(#aboutGradient)"
            d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,138.7C960,117,1056,107,1152,112C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          <defs>
            <linearGradient id="aboutGradient" x1="0" y1="0" x2="1440" y2="0">
              <stop offset="0%" stopColor={landingColors.accent} />
              <stop offset="100%" stopColor={landingColors.accentDark} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
              <span className="inline-block">Krocs,</span>
            </h2>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
              <span className="inline-block">
                시간의 신 <span className="text-[var(--landing-accent-dark)]">Chronos</span>에서 온 이름
              </span>
            </h2>
          </div>
          <div className="space-y-2">
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed">
              <span className="inline-block">Krocs는 단순히 시간을 관리하는 도구가 아니라,</span>
            </p>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed">
              <span className="inline-block">시간을 이해하고 함께 살아가는 방법을 제시합니다.</span>
            </p>
          </div>

          <div className="pt-8">
            <svg className="w-48 h-48 mx-auto" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="chronosGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={landingColors.accent} />
                  <stop offset="100%" stopColor={landingColors.accentDark} />
                </linearGradient>
              </defs>
              <path
                d="M100 20 Q150 50 150 100 Q150 150 100 180 Q50 150 50 100 Q50 50 100 20"
                fill="none"
                stroke="url(#chronosGradient)"
                strokeWidth="3"
                className="animate-pulse"
              />
              <circle cx="100" cy="100" r="40" fill="url(#chronosGradient)" opacity="0.2" />
              <circle cx="100" cy="100" r="8" fill="url(#chronosGradient)" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
