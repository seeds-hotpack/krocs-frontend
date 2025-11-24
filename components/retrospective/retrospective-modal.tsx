"use client"

import { Goal } from "@/api/goals"
import { RetrospectiveFactor, RetrospectiveOutcome } from "@/api/retrospectives"
import { Button } from "@/components/ui/button"
import { Sparkles, X } from "lucide-react"
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
  contextMaxLength?: number
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
  contextMaxLength = 250,
}: RetrospectiveModalProps) {
  const factorList = outcome === "COMPLETE_SUCCESS" ? successFactors : failureFactors
  const showOutcomeSelector = allowedOutcomes.length > 1
  const maxSelection = 3
  const contextLength = contextValue.length

  const goalPeriodLabel = useMemo(() => {
    const start = new Date(goal.startDate)
    const end = new Date(goal.endDate)
    const startLabel = start.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
    const endLabel = end.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
    return `${startLabel} - ${endLabel}`
  }, [goal.startDate, goal.endDate])

  const truncatedGoalTitle = useMemo(() => {
    return goal.title.length > 30 ? `${goal.title.slice(0, 30)}…` : goal.title
  }, [goal.title])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-3 py-4 backdrop-blur-sm sm:px-6">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/95 text-[#0F1C21] shadow-[0_18px_60px_rgba(22,33,38,0.2)]">
        <div className="relative bg-gradient-to-br from-[#ff8b6b] via-[#ff774f] to-[#ff6b47] px-5 py-5 text-white sm:px-8 sm:py-6">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 top-0 h-32 w-32 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-black/15 blur-3xl" />
          </div>
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                대목표 완료
              </p>
              <h2 className="mt-2 text-xl font-bold leading-snug text-white sm:text-2xl break-keep">
                이번 목표를 어떻게 마무리할까요?
              </h2>
              <p className="mt-2 text-xs text-white/80 break-words" title={goal.title}>
                {truncatedGoalTitle} · {goalPeriodLabel}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRequestClose}
              className="h-10 w-10 rounded-2xl border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
              aria-label="회고 닫기"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F9FCFE] px-5 py-5 space-y-4 sm:px-8 sm:py-8 sm:space-y-6">
          {showOutcomeSelector ? (
            <div className="rounded-2xl border border-[#E2EEF3] bg-white/90 p-3 shadow-sm sm:p-4">
              <p className="text-sm font-semibold text-[#0F1C21]">완료 상태 선택</p>
              <div className="mt-3 grid gap-2 grid-cols-2 sm:mt-4">
                {allowedOutcomes.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onOutcomeChange(value)}
                    className={`rounded-2xl border-2 px-3 py-3 text-left text-sm transition-all sm:px-4 sm:py-4 ${
                      outcome === value
                        ? "border-transparent bg-gradient-to-r from-[#5D6E72] to-[#3f4c52] text-white shadow-lg"
                        : "border-[#D3E6ED] bg-[#F6FBFD] text-[#0F1C21] hover:border-[#5D6E72]/50"
                    }`}
                  >
                    <p className="text-base font-semibold sm:text-lg break-keep text-balance">{OUTCOME_LABELS[value]}</p>
                    <p
                      className={`mt-1 text-[11px] sm:text-xs break-keep text-balance ${
                        outcome === value ? "text-white/90" : "text-[#5D6E72]"
                      }`}
                    >
                      {OUTCOME_DESCRIPTIONS[value]}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            infoMessage && (
              <div className="rounded-3xl border border-[#D3E6ED] bg-white/90 px-4 py-3 text-sm leading-relaxed text-[#0F1C21] shadow-sm">
                {infoMessage}
              </div>
            )
          )}

          <div className="rounded-2xl border border-[#E2EEF3] bg-white/90 p-3 shadow-sm sm:p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#0F1C21]">{subtitle}</p>
              <span className="text-xs text-[#5D6E72]">
                {selectedFactors.length}/{maxSelection}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
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
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
                        isSelected
                          ? "border-transparent bg-gradient-to-r from-[#5D6E72] to-[#3f4c52] text-white shadow"
                          : "border-[#D3E6ED] bg-[#F6FBFD] text-[#0F1C21] hover:border-[#5D6E72]/40"
                      } ${disabled ? "opacity-50" : ""}`}
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

          <div className="rounded-2xl border border-dashed border-[#DDE7ED] bg-white/70 p-3 shadow-sm sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#0F1C21]">직접 작성 (선택)</p>
                {!contextEnabled && (
                  <span className="text-xs text-[#5D6E72]">직접 작성 선택 시 활성화</span>
                )}
              </div>
              {contextEnabled && (
                <span className="text-xs text-[#5D6E72]">
                  {contextLength}/{contextMaxLength}
                </span>
              )}
            </div>
            <textarea
              value={contextValue}
              onChange={(e) => onContextChange(e.target.value)}
              disabled={!contextEnabled}
              placeholder={contextEnabled ? "선택한 이유를 기록해 주세요." : "직접 작성을 선택하면 입력할 수 있어요."}
              maxLength={contextMaxLength}
              className={`mt-3 min-h-[110px] w-full rounded-2xl border bg-white/90 p-3 text-sm leading-relaxed text-[#0F1C21] placeholder:text-[#8A999E] focus:outline-none sm:p-4 sm:min-h-[130px] ${
                contextEnabled
                  ? "border-[#D3E6ED] focus:border-[#5D6E72] focus:ring-1 focus:ring-[#5D6E72]/30"
                  : "border-dashed border-[#E2E8ED] text-[#94A3AB]"
              }`}
            />
            {contextError && (
              <p className="mt-2 text-xs font-semibold text-red-500">{contextError}</p>
            )}
          </div>

          {generalError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 shadow-sm">
              {generalError}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#E7EDF1] bg-white/95 px-5 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8 sm:py-6">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1 h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-sm font-semibold text-[#5D6E72] hover:bg-[#F5FAFD] transition-all"
          >
            취소
          </Button>
          <Button
            onClick={onSubmit}
            disabled={disablePrimary}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#5D6E72] to-[#3f4c52] text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "처리 중..." : primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
