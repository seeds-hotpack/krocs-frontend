import { HeroSection } from "@/components/landing/hero-section"
import { ProblemSection } from "@/components/landing/problem-section"
import { SolutionSection } from "@/components/landing/solution-section"
import { FeatureSection } from "@/components/landing/feature-section"
import { DifferentiationSection } from "@/components/landing/differentiation-section"
import { TestimonialSection } from "@/components/landing/testimonial-section"
import { AboutSection } from "@/components/landing/about-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { Navigation } from "@/components/landing/navigation"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeatureSection />
      <DifferentiationSection />
      <TestimonialSection />
      <AboutSection />
      <CTASection />
      <Footer />
    </main>
  )
}
