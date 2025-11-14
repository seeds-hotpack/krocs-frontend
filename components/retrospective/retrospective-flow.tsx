"use client"

import { useEffect, useMemo, useState } from "react"
import { Goal } from "@/api/goals"
import {
  RetrospectiveFactor,
  RetrospectiveOutcome,
  createGoalRetrospective,
  getRetrospectiveFactors,
} from "@/api/retrospectives"
import { update_Goal, type UpdateGoalRequest } from "@/api/updateGoal"
import { RetrospectiveModal } from "./retrospective-modal"
import { GoalRetryExtensionModal } from "./goal-retry-extension-modal"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

const CONTEXT_MAX_LENGTH = 250

interface RetrospectiveFlowProps {
  goal: Goal | null
  isOpen: boolean
  onClose: () => void
  onCompleted?: () => void | Promise<void>
  userId?: number
}

const determineAllowedOutcomes = (goal?: Goal | null): RetrospectiveOutcome[] => {
  if (!goal) return ["COMPLETE_SUCCESS", "COMPLETE_FAILURE"]
  const subGoalCount = goal.subGoals?.length ?? 0
  if (subGoalCount === 0) return ["COMPLETE_SUCCESS", "COMPLETE_FAILURE"]

  const completedCount = goal.subGoals.filter((sg) => sg.completed).length
  if (completedCount === subGoalCount && subGoalCount > 0) {
    return ["COMPLETE_SUCCESS"]
  }
  return ["RETRY_FAILURE", "COMPLETE_FAILURE"]
}

export function RetrospectiveFlow({ goal, isOpen, onClose, onCompleted, userId = 1 }: RetrospectiveFlowProps) {
  const [outcome, setOutcome] = useState<RetrospectiveOutcome>("COMPLETE_SUCCESS")
  const [selectedFactors, setSelectedFactors] = useState<string[]>([])
  const [contextValue, setContextValue] = useState("")
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const [contextError, setContextError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [retryError, setRetryError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRetrySubmitting, setIsRetrySubmitting] = useState(false)
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [factors, setFactors] = useState<{ successFactors: RetrospectiveFactor[]; failureFactors: RetrospectiveFactor[] }>({
    successFactors: [],
    failureFactors: [],
  })
  const [isLoadingFactors, setIsLoadingFactors] = useState(false)
  const [factorError, setFactorError] = useState<string | null>(null)

  const allowedOutcomes = useMemo(() => determineAllowedOutcomes(goal), [goal])
  const infoMessage =
    allowedOutcomes.length === 1 && allowedOutcomes[0] === "COMPLETE_SUCCESS"
      ? "소목표가 모두 완료되어 자동으로 성공 처리됩니다."
      : undefined

  useEffect(() => {
    if (!isOpen) return

    setSelectionError(null)
    setContextError(null)
    setSubmitError(null)
    setRetryError(null)
    setIsRetryModalOpen(false)

    const initialOutcome = allowedOutcomes[0] ?? "COMPLETE_SUCCESS"
    setOutcome(initialOutcome)
    setSelectedFactors([])
    setContextValue("")

    let isMounted = true
    setIsLoadingFactors(true)
    setFactorError(null)

    getRetrospectiveFactors()
      .then((data) => {
        if (!isMounted) return
        setFactors({
          successFactors: data.successFactors ?? [],
          failureFactors: data.failureFactors ?? [],
        })
      })
      .catch((error) => {
        if (!isMounted) return
        console.error("Failed to fetch retrospective factors", error)
        setFactorError(error?.response?.data?.message || "회고 요인을 불러오지 못했습니다.")
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingFactors(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, allowedOutcomes])

  const etcSelected = selectedFactors.includes("ETC")

  useEffect(() => {
    setSelectedFactors([])
    setSelectionError(null)
    setContextValue("")
    setContextError(null)
  }, [outcome])

  useEffect(() => {
    if (!etcSelected) {
      setContextValue("")
      setContextError(null)
    }
  }, [etcSelected])

  const handleContextChange = (rawValue: string) => {
    const nextValue = rawValue.slice(0, CONTEXT_MAX_LENGTH)
    setContextValue(nextValue)
    if (nextValue.trim().length > 0) {
      setContextError(null)
    }
  }

  const maxReached = selectedFactors.length >= 3
  const requiresFactors = outcome !== "RETRY_FAILURE"
  const hasValidFactorSelection = requiresFactors ? selectedFactors.length >= 1 : true

  const contextValid = !etcSelected || contextValue.trim().length > 0

  const disablePrimary =
    isSubmitting ||
    !goal ||
    !hasValidFactorSelection ||
    (etcSelected && !contextValid) ||
    isLoadingFactors

  const subtitle =
    outcome === "COMPLETE_SUCCESS"
      ? "어떤 요인이 성공에 가장 도움이 되었나요?"
      : "어떤 요인이 계획을 방해했나요?"

  const closeFlow = () => {
    setIsRetryModalOpen(false)
    setShowExitConfirm(false)
    setSelectedFactors([])
    setContextValue("")
    setSelectionError(null)
    setContextError(null)
    setSubmitError(null)
    setRetryError(null)
    onClose()
  }

  const handleToggleFactor = (key: string) => {
    setSelectionError(null)
    setSubmitError(null)
    setContextError(null)
    if (selectedFactors.includes(key)) {
      setSelectedFactors((prev) => prev.filter((value) => value !== key))
      return
    }
    if (maxReached) {
      setSelectionError("최대 3개까지 선택할 수 있어요.")
      return
    }
    setSelectedFactors((prev) => [...prev, key])
  }

  const buildPayload = () => {
    const payload: { outcome: RetrospectiveOutcome; factors: string[]; context?: string } = {
      outcome,
      factors: selectedFactors,
    }
    if (etcSelected) {
      payload.context = contextValue.trim()
    }
    return payload
  }

  const createGoalUpdatePayload = (overrides?: Partial<UpdateGoalRequest>): UpdateGoalRequest => ({
    title: goal!.title,
    priority: goal!.priority,
    startDate: goal!.startDate,
    endDate: overrides?.endDate ?? goal!.endDate,
    isCompleted: overrides?.isCompleted ?? goal!.completed,
    color: goal!.color,
  })

  const handleSubmit = async () => {
    if (!goal) return

    if (!hasValidFactorSelection) {
      setSelectionError("최소 1개의 요인을 선택해 주세요.")
      return
    }

    if (!contextValid) {
      setContextError("직접 입력을 선택한 경우 내용을 입력해야 합니다.")
      return
    }

    if (outcome === "RETRY_FAILURE") {
      setIsRetryModalOpen(true)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await createGoalRetrospective(goal.goalId, buildPayload())
      await update_Goal(goal.goalId, userId, createGoalUpdatePayload({ isCompleted: true }))
      if (onCompleted) {
        await onCompleted()
      }
      closeFlow()
    } catch (error: any) {
      console.error("Failed to submit retrospective", error)
      setSubmitError(error?.response?.data?.message || "회고 저장에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetrySubmit = async (extensionDays: number, newEndDate: string) => {
    if (!goal) return
    setRetryError(null)
    setIsRetrySubmitting(true)
    const payload = createGoalUpdatePayload({
      endDate: newEndDate,
      isCompleted: false,
    })

    try {
      await update_Goal(goal.goalId, userId, payload)
      await createGoalRetrospective(goal.goalId, buildPayload())
      if (onCompleted) {
        await onCompleted()
      }
      closeFlow()
    } catch (error: any) {
      console.error("Failed to process retry flow", error)
      setRetryError(error?.response?.data?.message || "재시도 설정에 실패했습니다.")
    } finally {
      setIsRetrySubmitting(false)
    }
  }

  if (!goal || !isOpen) return null

  return (
    <>
      <RetrospectiveModal
        goal={goal}
        isOpen={isOpen && !isRetryModalOpen}
        allowedOutcomes={allowedOutcomes}
        outcome={outcome}
        onOutcomeChange={setOutcome}
        successFactors={factors.successFactors}
        failureFactors={factors.failureFactors}
        selectedFactors={selectedFactors}
        onToggleFactor={handleToggleFactor}
        selectionError={selectionError}
        factorError={factorError}
        isLoadingFactors={isLoadingFactors}
        subtitle={subtitle}
        infoMessage={infoMessage}
        contextValue={contextValue}
        contextEnabled={etcSelected}
        onContextChange={handleContextChange}
        contextMaxLength={CONTEXT_MAX_LENGTH}
        contextError={contextError}
        onSubmit={handleSubmit}
        onCancel={() => setShowExitConfirm(true)}
        onRequestClose={() => setShowExitConfirm(true)}
        primaryLabel={outcome === "RETRY_FAILURE" ? "다음" : "완료"}
        isSubmitting={isSubmitting}
        disablePrimary={disablePrimary}
        generalError={submitError}
      />

      <GoalRetryExtensionModal
        goal={goal}
        isOpen={isRetryModalOpen}
        onClose={() => setIsRetryModalOpen(false)}
        onBack={() => setIsRetryModalOpen(false)}
        onSubmit={handleRetrySubmit}
        isSubmitting={isRetrySubmitting}
        errorMessage={retryError}
      />

      <ConfirmationModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={closeFlow}
        title="회고를 종료하시겠습니까?"
        message="회고를 작성하지 않고 목표 완료를 취소합니다."
        confirmText="종료"
        cancelText="계속 작성"
      />
    </>
  )
}
