"use client"

import { Goal } from "@/api/goals"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

interface GoalRetryExtensionModalProps {
  goal: Goal
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  onSubmit: (extensionDays: number, newEndDate: string) => void
  isSubmitting: boolean
  errorMessage?: string | null
}

const QUICK_OPTIONS = [
  { label: "+1일", days: 1 },
  { label: "+3일", days: 3 },
  { label: "+7일", days: 7 },
  { label: "+30일", days: 30 },
]

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
}

const addDays = (dateString: string, days: number) => {
  const date = new Date(dateString)
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function GoalRetryExtensionModal({
  goal,
  isOpen,
  onClose,
  onBack,
  onSubmit,
  isSubmitting,
  errorMessage,
}: GoalRetryExtensionModalProps) {
  const [selectedDays, setSelectedDays] = useState<number | null>(null)
  const [isCustom, setIsCustom] = useState(false)
  const [customDays, setCustomDays] = useState("")
  const [selectionError, setSelectionError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setSelectedDays(null)
      setCustomDays("")
      setIsCustom(false)
      setSelectionError(null)
    }
  }, [isOpen])

  const newEndDate = useMemo(() => {
    if (!selectedDays || selectedDays <= 0) return null
    return addDays(goal.endDate, selectedDays)
  }, [goal.endDate, selectedDays])

  const handleQuickSelect = (days: number) => {
    setIsCustom(false)
    setCustomDays("")
    setSelectedDays(days)
    setSelectionError(null)
  }

  const handleCustomFocus = () => {
    setIsCustom(true)
    setSelectedDays(customDays ? Number(customDays) : null)
  }

  const handleCustomChange = (value: string) => {
    if (!/^\d*$/.test(value)) return
    setCustomDays(value)
    const numeric = value ? Number(value) : null
    setSelectedDays(numeric)
    if (!numeric || numeric <= 0) {
      setSelectionError("연장 일수는 1일 이상이어야 해요.")
    } else {
      setSelectionError(null)
    }
  }

  const handleSubmit = () => {
    if (!selectedDays || selectedDays <= 0 || !newEndDate) {
      setSelectionError("연장 일수를 선택해 주세요.")
      return
    }
    onSubmit(selectedDays, newEndDate)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#D3E6ED] bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5D6E72]">재시도 준비</p>
            <h2 className="mt-1 text-xl font-semibold text-[#0F1C21]">기간을 얼마나 연장할까요?</h2>
            <p className="mt-1 text-xs text-[#5D6E72]">기존 마감일을 기준으로 연장 일수를 선택하세요.</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full border border-[#99C6D6] bg-white text-[#0F1C21] shadow-sm hover:bg-white/80"
            aria-label="연장 모달 닫기"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-[#0F1C21]">연장 일수 선택</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {QUICK_OPTIONS.map((option) => {
                const isSelected = !isCustom && selectedDays === option.days
                return (
                  <button
                    key={option.days}
                    type="button"
                    onClick={() => handleQuickSelect(option.days)}
                    className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                      isSelected
                        ? "border-[#5D6E72] bg-[#5D6E72] text-white shadow-sm"
                        : "border-[#D3E6ED] bg-[#EEF5F7] text-[#0F1C21] hover:border-[#5D6E72]/50"
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={handleCustomFocus}
                className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                  isCustom
                    ? "border-[#5D6E72] bg-[#5D6E72] text-white shadow-sm"
                    : "border-[#D3E6ED] bg-[#EEF5F7] text-[#0F1C21] hover:border-[#5D6E72]/50"
                }`}
              >
                + 직접 입력
              </button>
            </div>
            {isCustom && (
              <input
                type="text"
                inputMode="numeric"
                value={customDays}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="연장 일수를 숫자로 입력해 주세요"
                className="mt-3 w-full rounded-2xl border border-[#D3E6ED] bg-[#EEF5F7] p-3 text-sm text-[#0F1C21] focus:border-[#5D6E72] focus:outline-none"
              />
            )}
            {selectionError && (
              <p className="mt-2 text-xs font-semibold text-red-500">{selectionError}</p>
            )}
          </div>

          <div className="rounded-2xl border border-[#D3E6ED] bg-[#EEF5F7] px-4 py-3 text-sm text-[#0F1C21]">
            <div className="flex items-center justify-between">
              <span className="text-[#5D6E72]">기존 마감일</span>
              <span className="font-semibold">{formatDate(goal.endDate)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[#5D6E72]">연장 후 마감일</span>
              <span className="font-semibold">
                {newEndDate ? formatDate(newEndDate) : "연장 일수를 선택해 주세요"}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={onBack}
            className="rounded-full border border-[#99C6D6] bg-white px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-white/80"
          >
            뒤로
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDays || selectedDays <= 0 || isSubmitting}
            className="rounded-full bg-[#5D6E72] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#48575b] disabled:opacity-50"
          >
            {isSubmitting ? "처리 중..." : "완료"}
          </Button>
        </div>
      </div>
    </div>
  )
}
