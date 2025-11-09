"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Calendar, Flag, Palette, Sparkles } from "lucide-react"

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
  const initialStartDate = goal?.startDate || new Date().toISOString().split("T")[0]
  const initialEndDate = goal?.endDate || new Date().toISOString().split("T")[0]
  
  const calculateInitialDuration = () => {
    if (goal?.duration) return goal.duration
    const start = new Date(initialStartDate)
    const end = new Date(initialEndDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  const [formData, setFormData] = useState({
    title: goal?.title || "",
    priority: goal?.priority || "MEDIUM",
    startDate: initialStartDate,
    endDate: initialEndDate,
    duration: calculateInitialDuration(),
    color: goal?.color || "#bbdefb",
  })

  const goalColors = [
    { name: "블루", color: "#bbdefb" },
    { name: "레드", color: "#ffcdd2" },
    { name: "그린", color: "#c8e6c9" },
    { name: "퍼플", color: "#e1bee7" },
    { name: "오렌지", color: "#ffe0b2" },
    { name: "핑크", color: "#f8bbd0" },
    { name: "옐로우", color: "#fff9c4" },
    { name: "그레이", color: "#BDBDBD" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const calculatedDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    onSubmit({
      ...formData,
      duration: calculatedDuration,
    })
  }

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    const newFormData = { ...formData, [field]: value }

    if (newFormData.startDate && newFormData.endDate) {
      const start = new Date(newFormData.startDate)
      const end = new Date(newFormData.endDate)
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      newFormData.duration = Math.max(1, duration)
    }

    setFormData(newFormData)
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "HIGH": return "높음"
      case "MEDIUM": return "보통"
      case "LOW": return "낮음"
      default: return priority
    }
  }

  return (
    <div className="relative w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
      {/* Header with Gradient */}
      <div 
        className="relative px-6 py-5 bg-gradient-to-br from-[#ff8b6b] to-[#ff6b47] overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-white flex-shrink-0" />
            <h2 className="text-lg font-bold text-white">
              {goal ? "목표 수정" : "목표 생성"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-all flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold text-[#0F1C21] flex items-center gap-2">
            <span>목표 이름</span>
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="예: 매일 아침 명상하기"
            className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-base text-[#0F1C21] placeholder:text-[#5D6E72]/50 focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff8b6b]/20 transition-all"
            required
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity("목표 이름을 입력해 주세요.")}
            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
          />
        </div>

        {/* Priority Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[#0F1C21] flex items-center gap-2">
            <Flag className="h-4 w-4 text-[#5D6E72]" />
            <span>중요도</span>
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {["HIGH", "MEDIUM", "LOW"].map((priority) => {
              const isSelected = formData.priority === priority
              const colors = {
                HIGH: "from-[#5D6E72] to-[#3D4E52]",
                MEDIUM: "from-[#BBDCE5] to-[#99C6D6]",
                LOW: "from-[#DDEDF2] to-[#C8DCE6]"
              }
              return (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: priority as any })}
                  className={`h-12 rounded-2xl font-semibold text-sm transition-all ${
                    isSelected 
                      ? `bg-gradient-to-br ${colors[priority as keyof typeof colors]} text-white shadow-lg scale-105` 
                      : "bg-[#EEF5F7] text-[#5D6E72] hover:bg-[#E0EEF3]"
                  }`}
                >
                  {getPriorityLabel(priority)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[#0F1C21] flex items-center gap-2">
            <Palette className="h-4 w-4 text-[#5D6E72]" />
            <span>목표 컬러</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {goalColors.map(({ name, color }) => {
              const isSelected = formData.color === color
              return (
                <button
                  key={name}
                  type="button"
                  className={`relative h-11 w-11 rounded-2xl border-2 transition-all hover:scale-110 ${
                    isSelected ? "border-[#0F1C21] shadow-lg scale-110" : "border-white shadow-sm"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                  aria-label={`${name} 선택`}
                  title={name}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-3 w-3 bg-[#0F1C21] rounded-full"></div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[#0F1C21] flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#5D6E72]" />
            <span>기간 설정</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs text-[#5D6E72]">
                시작일
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff8b6b]/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs text-[#5D6E72]">
                종료일
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                min={formData.startDate}
                className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff8b6b]/20"
                required
              />
            </div>
          </div>
        </div>

        {/* Duration Display */}
        <div className="rounded-2xl bg-gradient-to-r from-[#EEF5F7] to-[#E0EEF3] px-5 py-4 border-l-4 border-[#ff8b6b]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#5D6E72]">선택한 기간</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#0F1C21]">{formData.duration}</span>
              <span className="text-sm font-semibold text-[#5D6E72]">일</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex-1 h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-[#5D6E72] font-semibold hover:bg-[#EEF5F7] transition-all"
          >
            취소
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#ff8b6b] to-[#ff6b47] text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            {goal ? "수정 완료" : "목표 만들기"}
          </Button>
        </div>
      </form>
    </div>
  )
}
