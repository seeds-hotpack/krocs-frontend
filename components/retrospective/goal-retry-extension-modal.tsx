"use client"

import { Goal } from "@/api/goals"
import { Button } from "@/components/ui/button"
import { Sparkles, X } from "lucide-react"
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-3 py-4 backdrop-blur-sm sm:px-6">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/95 text-[#0F1C21] shadow-[0_18px_60px_rgba(22,33,38,0.2)]">
        <div className="relative bg-gradient-to-br from-[#ff8b6b] via-[#ff774f] to-[#ff6b47] px-5 py-5 text-white sm:px-8 sm:py-6">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 top-0 h-32 w-32 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-black/15 blur-3xl" />
          </div>
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/75">
                <Sparkles className="h-3.5 w-3.5" />
                재시도 준비
              </p>
              <h2 className="mt-2 text-xl font-bold leading-snug text-white break-keep text-balance sm:text-2xl">
                기간을 얼마나 연장할까요?
              </h2>
              <p className="mt-2 text-xs text-white/80 break-words">
                기존 마감일을 기준으로 연장 일수를 선택하세요.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-2xl border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
              aria-label="연장 모달 닫기"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F9FCFE] px-5 py-5 space-y-4 sm:px-8 sm:py-8 sm:space-y-6">
          <div className="rounded-2xl border border-[#E2EEF3] bg-white/95 p-3 shadow-sm sm:p-4">
            <p className="text-sm font-semibold text-[#0F1C21]">연장 일수 선택</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {QUICK_OPTIONS.map((option) => {
                const isSelected = !isCustom && selectedDays === option.days
                return (
                  <button
                    key={option.days}
                    type="button"
                    onClick={() => handleQuickSelect(option.days)}
                    className={`rounded-2xl border-2 px-3 py-3 text-sm font-semibold transition-all sm:px-4 sm:py-3 ${
                      isSelected
                        ? "border-transparent bg-gradient-to-r from-[#5D6E72] to-[#3f4c52] text-white shadow"
                        : "border-[#D3E6ED] bg-[#F6FBFD] text-[#0F1C21] hover:border-[#5D6E72]/50"
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={handleCustomFocus}
                className={`rounded-2xl border-2 px-3 py-3 text-sm font-semibold transition-all sm:px-4 sm:py-3 ${
                  isCustom
                    ? "border-transparent bg-gradient-to-r from-[#5D6E72] to-[#3f4c52] text-white shadow"
                    : "border-[#D3E6ED] bg-[#F6FBFD] text-[#0F1C21] hover:border-[#5D6E72]/50"
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
                className="mt-3 w-full rounded-2xl border border-[#D3E6ED] bg-[#F6FBFD] p-3 text-sm text-[#0F1C21] placeholder:text-[#94A3AB] focus:border-[#5D6E72] focus:outline-none"
              />
            )}
            {selectionError && (
              <p className="mt-2 text-xs font-semibold text-red-500">{selectionError}</p>
            )}
          </div>

          <div className="rounded-2xl border border-[#E2EEF3] bg-white/95 p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#5D6E72]">기존 마감일</span>
              <span className="font-semibold text-[#0F1C21]">{formatDate(goal.endDate)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-[#5D6E72]">연장 후 마감일</span>
              <span className="font-semibold text-[#0F1C21]">
                {newEndDate ? formatDate(newEndDate) : "연장 일수를 선택해 주세요"}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 shadow-sm">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#E7EDF1] bg-white/95 px-5 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8 sm:py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex-1 h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-sm font-semibold text-[#5D6E72] hover:bg-[#F5FAFD] transition-all"
          >
            뒤로
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDays || selectedDays <= 0 || isSubmitting}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#5D6E72] to-[#3f4c52] text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "처리 중..." : "완료"}
          </Button>
        </div>
      </div>
    </div>
  )
}
