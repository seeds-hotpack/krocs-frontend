"use client"

import { Goal } from "@/api/goals"
import { RetrospectiveFactor, RetrospectiveOutcome } from "@/api/retrospectives"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useMemo } from "react"

const OUTCOME_LABELS: Record<RetrospectiveOutcome, string> = {
  COMPLETE_SUCCESS: "성공",
  COMPLETE_FAILURE: "실패",
  RETRY_FAILURE: "재시도",
}

const OUTCOME_DESCRIPTIONS: Record<RetrospectiveOutcome, string> = {
  COMPLETE_SUCCESS: "이번 목표를 성공으로 마무리합니다.",
  COMPLETE_FAILURE: "이번 목표를 실패로 기록합니다.",
  RETRY_FAILURE: "기간을 연장하고 다시 도전합니다.",
}

interface RetrospectiveModalProps {
  goal: Goal
  isOpen: boolean
  allowedOutcomes: RetrospectiveOutcome[]
  outcome: RetrospectiveOutcome
  onOutcomeChange: (value: RetrospectiveOutcome) => void
  successFactors: RetrospectiveFactor[]
  failureFactors: RetrospectiveFactor[]
  selectedFactors: string[]
  onToggleFactor: (factorKey: string) => void
  selectionError?: string | null
  factorError?: string | null
  isLoadingFactors: boolean
  subtitle: string
  infoMessage?: string
  contextValue: string
  contextEnabled: boolean
  onContextChange: (value: string) => void
  contextError?: string | null
  onSubmit: () => void
  onCancel: () => void
  onRequestClose: () => void
  primaryLabel: string
  isSubmitting: boolean
  disablePrimary: boolean
  generalError?: string | null
}

export function RetrospectiveModal({
  goal,
  isOpen,
  allowedOutcomes,
  outcome,
  onOutcomeChange,
  successFactors,
  failureFactors,
  selectedFactors,
  onToggleFactor,
  selectionError,
  factorError,
  isLoadingFactors,
  subtitle,
  infoMessage,
  contextValue,
  contextEnabled,
  onContextChange,
  contextError,
  onSubmit,
  onCancel,
  onRequestClose,
  primaryLabel,
  isSubmitting,
  disablePrimary,
  generalError,
}: RetrospectiveModalProps) {
  const factorList = outcome === "COMPLETE_SUCCESS" ? successFactors : failureFactors
  const showOutcomeSelector = allowedOutcomes.length > 1
  const maxSelection = 3

  const goalPeriodLabel = useMemo(() => {
    const start = new Date(goal.startDate)
    const end = new Date(goal.endDate)
    const startLabel = start.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
    const endLabel = end.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
    return `${startLabel} - ${endLabel}`
  }, [goal.startDate, goal.endDate])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#D3E6ED] bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5D6E72]">대목표 완료</p>
            <h2 className="mt-1 text-xl font-semibold text-[#0F1C21]">이번 목표를 어떻게 마무리할까요?</h2>
            <p className="mt-1 text-xs text-[#5D6E72]">{goal.title} · {goalPeriodLabel}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRequestClose}
            className="h-9 w-9 rounded-full border border-[#99C6D6] bg-white text-[#0F1C21] shadow-sm hover:bg-white/80"
            aria-label="회고 닫기"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5">
          {showOutcomeSelector ? (
            <div>
              <p className="text-sm font-semibold text-[#0F1C21]">완료 상태 선택</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {allowedOutcomes.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onOutcomeChange(value)}
                    className={`rounded-2xl border-2 px-4 py-3 text-left transition-all ${
                      outcome === value
                        ? "border-[#5D6E72] bg-[#5D6E72] text-white shadow-md"
                        : "border-[#D3E6ED] bg-[#EEF5F7] text-[#0F1C21] hover:border-[#5D6E72]/50"
                    }`}
                  >
                    <p className="text-sm font-semibold">{OUTCOME_LABELS[value]}</p>
                    <p className="mt-1 text-xs opacity-80">{OUTCOME_DESCRIPTIONS[value]}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            infoMessage && (
              <div className="rounded-2xl border border-[#BBDCE5] bg-[#EEF5F7] px-4 py-3 text-sm text-[#0F1C21]">
                {infoMessage}
              </div>
            )
          )}

          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#0F1C21]">{subtitle}</p>
              <span className="text-xs text-[#5D6E72]">{selectedFactors.length}/{maxSelection}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {isLoadingFactors ? (
                <p className="text-sm text-[#5D6E72]">요인을 불러오는 중...</p>
              ) : factorError ? (
                <p className="text-sm text-red-500">{factorError}</p>
              ) : factorList.length === 0 ? (
                <p className="text-sm text-[#5D6E72]">선택할 수 있는 요인이 없어요.</p>
              ) : (
                factorList.map((factor) => {
                  const isSelected = selectedFactors.includes(factor.key)
                  const disabled = !isSelected && selectedFactors.length >= maxSelection
                  return (
                    <button
                      key={factor.key}
                      type="button"
                      onClick={() => onToggleFactor(factor.key)}
                      disabled={disabled}
                      className={`rounded-full border px-4 py-2 text-sm transition-all ${
                        isSelected
                          ? "border-[#5D6E72] bg-[#5D6E72] text-white shadow-sm"
                          : "border-[#D3E6ED] bg-[#EEF5F7] text-[#0F1C21] hover:border-[#5D6E72]/50"
                      } ${disabled ? "opacity-60" : ""}`}
                    >
                      {factor.description}
                    </button>
                  )
                })
              )}
            </div>
            {selectionError && (
              <p className="mt-2 text-xs font-semibold text-red-500">{selectionError}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#0F1C21]">직접 입력 (선택)</p>
              {!contextEnabled && <span className="text-xs text-[#5D6E72]">ETC 선택 시 활성화</span>}
            </div>
            <textarea
              value={contextValue}
              onChange={(e) => onContextChange(e.target.value)}
              disabled={!contextEnabled}
              placeholder={contextEnabled ? "선택한 이유를 기록해 주세요." : "ETC 요인을 선택하면 입력할 수 있어요."}
              className={`mt-2 min-h-[120px] w-full rounded-2xl border p-3 text-sm text-[#0F1C21] placeholder:text-[#5D6E72] focus:outline-none ${
                contextEnabled
                  ? "border-[#D3E6ED] bg-[#EEF5F7] focus:border-[#5D6E72]"
                  : "border-dashed border-[#D3E6ED] bg-[#F5F7F8] text-[#5D6E72]/70"
              }`}
            />
            {contextError && (
              <p className="mt-2 text-xs font-semibold text-red-500">{contextError}</p>
            )}
          </div>

          {generalError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
              {generalError}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="rounded-full border border-[#99C6D6] bg-white px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-white/80"
          >
            취소
          </Button>
          <Button
            onClick={onSubmit}
            disabled={disablePrimary}
            className="rounded-full bg-[#5D6E72] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#48575b] disabled:opacity-50"
          >
            {isSubmitting ? "처리 중..." : primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
