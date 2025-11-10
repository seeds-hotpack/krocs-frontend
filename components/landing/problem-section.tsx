"use client"

import { Card, CardContent } from "@/components/landing/ui/card"
import { Brain, RotateCcw, Clock, Wind } from "lucide-react"

const problems = [
  {
    icon: Brain,
    title: "자기 인식 부족",
    description: "하루가 끝나도 무엇을 했는지 돌아보지 않음",
  },
  {
    icon: RotateCcw,
    title: "회복 메커니즘 부재",
    description: "일정이 틀어지면 포기하거나 미룸",
  },
  {
    icon: Clock,
    title: "현실과 계획 괴리",
    description: "실제 시간 사용과 계획의 차이를 체감 못함",
  },
  {
    icon: Wind,
    title: "지속 동기 부족",
    description: "계획은 세우지만 유지하지 못함",
  },
]

export function ProblemSection() {
  return (
    <section id="problem" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            계획은 있는데, 왜 자꾸 무너질까?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {problems.map((problem, index) => {
            const Icon = problem.icon
            return (
              <Card key={index} className="border-none shadow-none bg-white">
                <CardContent className="p-6 space-y-2 text-center">
                  <Icon className="mx-auto w-10 h-10 md:w-12 md:h-12 text-primary mb-3" />
                  <h3 className="text-lg md:text-xl font-semibold">{problem.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed break-words mt-1">
                    {problem.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
