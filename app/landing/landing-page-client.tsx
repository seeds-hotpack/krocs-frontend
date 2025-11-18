"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { landingColorVars } from "@/components/landing/landing-theme"
import { useAuth } from "@/components/auth/auth-provider"

export default function LandingPageClient() {
  const router = useRouter()
  const { status: authStatus } = useAuth()

  useEffect(() => {
    if (authStatus === "authenticated") {
      router.replace("/goal")
    }
  }, [authStatus, router])

  if (authStatus === "authenticated") {
    return null
  }

  return (
    <main className="min-h-screen" style={landingColorVars}>
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
