import { HeroSection } from "@/components/hero-section"
import { ProblemSection } from "@/components/problem-section"
import { SolutionSection } from "@/components/solution-section"
import { FeatureSection } from "@/components/feature-section"
import { DifferentiationSection } from "@/components/differentiation-section"
import { TestimonialSection } from "@/components/testimonial-section"
import { AboutSection } from "@/components/about-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"

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
