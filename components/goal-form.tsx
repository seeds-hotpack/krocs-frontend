"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface Goal {
  goalId: number
  title: string
  priority: "LOW" | "MEDIUM" | "HIGH"
  startDate: string
  endDate: string
  duration: number
  completed: boolean
  subGoals: any[]
  createdAt: string
  updatedAt: string
  color: string
}

interface GoalFormProps {
  goal?: Goal | null
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function GoalForm({ goal, onSubmit, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState({
    title: goal?.title || "",
    priority: goal?.priority || "MEDIUM",
    startDate: goal?.startDate || new Date().toISOString().split("T")[0],
    endDate: goal?.endDate || new Date().toISOString().split("T")[0],
    duration: goal?.duration || 0,
    color: goal?.color || "#bbdefb",
  })

  const goalColors = [
    { name: "GOAL_BLUE", color: "#bbdefb" },
    { name: "GOAL_RED", color: "#ffcdd2" },
    { name: "GOAL_GREEN", color: "#c8e6c9" },
    { name: "GOAL_PURPLE", color: "#e1bee7" },
    { name: "GOAL_ORANGE", color: "#ffe0b2" },
    { name: "GOAL_PINK", color: "#f8bbd0" },
    { name: "GOAL_YELLOW", color: "#fff9c4" },
    { name: "GOAL_NAVY", color: "#BDBDBD" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Calculate duration if not provided
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const calculatedDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    onSubmit({
      ...formData,
      duration: calculatedDuration,
    })
  }

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    const newFormData = { ...formData, [field]: value }

    // Auto-calculate duration when dates change
    if (newFormData.startDate && newFormData.endDate) {
      const start = new Date(newFormData.startDate)
      const end = new Date(newFormData.endDate)
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      newFormData.duration = Math.max(0, duration)
    }

    setFormData(newFormData)
  }

  return (
    <Card className="w-full border border-[#D3E6ED] bg-white/95 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#D3E6ED] bg-[#EEF5F7] px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5D6E72]">
            {goal ? "목표 수정" : "새 목표"}
          </p>
          <CardTitle className="mt-1 text-2xl font-semibold text-[#0F1C21]">
            {goal ? "목표 내용을 업데이트할게요" : "어떤 목표를 세울까요?"}
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-9 w-9 rounded-full border border-[#99C6D6] bg-white text-[#0F1C21] shadow-sm hover:bg-white/80"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-[#0F1C21]">
              목표 이름
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: 매일 아침 20분 스트레칭"
              className="h-11 rounded-xl border-[#D3E6ED] bg-[#EEF5F7] text-sm text-[#0F1C21] placeholder:text-[#5D6E72] focus:border-[#99C6D6] focus:ring-[#99C6D6]"
              required
              onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity("목표 이름을 입력해 주세요.")}
              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold text-[#0F1C21]">
                중요도
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="h-11 rounded-xl border-[#D3E6ED] bg-[#EEF5F7] text-sm text-[#0F1C21] focus:border-[#99C6D6] focus:ring-[#99C6D6]">
                  <SelectValue placeholder="중요도를 선택하세요" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-[#D3E6ED] bg-white text-[#0F1C21]">
                  <SelectItem value="HIGH">높음</SelectItem>
                  <SelectItem value="MEDIUM">보통</SelectItem>
                  <SelectItem value="LOW">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#0F1C21]">카드 컬러</Label>
              <div className="flex flex-wrap gap-2">
                {goalColors.map(({ name, color }) => {
                  const isSelected = formData.color === color
                  return (
                    <button
                      key={name}
                      type="button"
                      className={`h-9 w-9 rounded-full border-2 transition ${
                        isSelected ? "border-[#0F1C21] shadow-sm" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                      aria-label={`${name} 선택`}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-semibold text-[#0F1C21]">
                시작일
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                className="h-11 rounded-xl border-[#D3E6ED] bg-[#EEF5F7] text-sm text-[#0F1C21] focus:border-[#99C6D6] focus:ring-[#99C6D6]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-semibold text-[#0F1C21]">
                종료일
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                min={formData.startDate}
                className="h-11 rounded-xl border-[#D3E6ED] bg-[#EEF5F7] text-sm text-[#0F1C21] focus:border-[#99C6D6] focus:ring-[#99C6D6]"
                required
              />
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-[#D3E6ED] bg-[#EEF5F7] px-4 py-3 text-sm text-[#5D6E72]">
            선택한 기간은 총 <span className="font-semibold text-[#0F1C21]">{formData.duration}</span>일이에요.
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button
              type="submit"
              className="flex-1 rounded-full bg-[#BBDCE5] px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-[#BBDCE5]/80"
            >
              {goal ? "목표 수정하기" : "목표 만들기"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="flex-1 rounded-full border border-[#99C6D6] bg-white px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-white/80"
            >
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
