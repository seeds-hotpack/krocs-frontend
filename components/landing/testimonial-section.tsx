"use client"

import { Card, CardContent } from "@/components/landing/ui/card"
import { useState, useEffect } from "react"

const testimonials = [
  {
    text: "계획이 자꾸 무너졌는데, 이제 복기 루틴이 생겼어요.",
    author: "김민지",
    role: "대학생",
  },
  {
    text: "오늘 왜 실패했는지 적어보니, 다음 날이 훨씬 수월해졌습니다.",
    author: "이준호",
    role: "프리랜서",
  },
  {
    text: '"괜찮아요" 문구 하나에 다시 시작할 힘이 났어요.',
    author: "박서연",
    role: "직장인",
  },
]

export function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">실패가 덜 무섭고, 하루가 눈에 보여요.</h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-2 shadow-xl">
            <CardContent className="p-12">
              <div className="space-y-6 text-center">
                <p className="text-2xl md:text-3xl font-medium leading-relaxed text-pretty">
                  "{testimonials[currentIndex].text}"
                </p>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">{testimonials[currentIndex].author}</p>
                  <p className="text-muted-foreground">{testimonials[currentIndex].role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? "bg-primary w-8" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
