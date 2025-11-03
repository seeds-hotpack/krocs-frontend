"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import {
  getSubGoals,
  deleteSubGoal,
  updateSubGoal,
  SubGoal as APISubGoal,
} from "@/api/subgoals"
import { GoalForm } from "@/components/goal-form"
import { SubGoalModal } from "@/components/subgoal-modal"

interface SubGoal {
  sub_goal_id: number
  title: string
  completed: boolean
  is_time_selected: boolean
  start_date_time?: string | null
  end_date_time?: string | null
}

interface Goal {
  goalId: number
  title: string
  priority: "LOW" | "MEDIUM" | "HIGH"
  startDate: string
  endDate: string
  duration: number
  completed: boolean
  subGoals: SubGoal[]
  createdAt: string
  updatedAt: string
  color: string
}

interface GoalDetailProps {
  goal: Goal
  onBack: () => void
  onUpdate: (updatedGoal: Partial<Goal>) => Promise<void> | void
  onDelete: () => Promise<void> | void
}

export function GoalDetail({ goal, onBack, onUpdate, onDelete }: GoalDetailProps) {
  const [subGoals, setSubGoals] = useState<SubGoal[]>(goal.subGoals ?? [])
  const [loadingSubGoals, setLoadingSubGoals] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingSubGoalId, setEditingSubGoalId] = useState<number | null>(null)
  const [editingSubGoalTitle, setEditingSubGoalTitle] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false)

  const fetchSubGoals = useCallback(async () => {
    setLoadingSubGoals(true)
    setError(null)
    try {
      const res = await getSubGoals(goal.goalId)
      setSubGoals(
        res.result.subGoals
          .map((sg: APISubGoal) => ({
            sub_goal_id: sg.sub_goal_id,
            title: sg.title,
            completed: sg.is_completed,
            is_time_selected: Boolean(sg.is_time_selected),
            start_date_time: sg.start_date_time ?? null,
            end_date_time: sg.end_date_time ?? null,
          }))
          .sort((a, b) => a.sub_goal_id - b.sub_goal_id)
      )
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoadingSubGoals(false)
    }
  }, [goal.goalId])

  useEffect(() => {
    fetchSubGoals()
  }, [fetchSubGoals])

  useEffect(() => {
    setSubGoals(goal.subGoals ?? [])
  }, [goal.subGoals])

  const toggleSubGoal = async (sub_goal_id: number) => {
    const originalSubGoals = [...subGoals]
    const subGoalToUpdate = subGoals.find((sg) => sg.sub_goal_id === sub_goal_id)
    if (!subGoalToUpdate) return

    const newCompletedStatus = !subGoalToUpdate.completed
    setSubGoals((prev) =>
      prev.map((sg) =>
        sg.sub_goal_id === sub_goal_id ? { ...sg, completed: newCompletedStatus } : sg
      )
    )

    try {
      await updateSubGoal(goal.goalId, sub_goal_id, {
        title: subGoalToUpdate.title,
        is_completed: newCompletedStatus,
        is_time_selected: Boolean(subGoalToUpdate.is_time_selected),
        start_date_time: subGoalToUpdate.is_time_selected
          ? subGoalToUpdate.start_date_time ?? undefined
          : undefined,
        end_date_time: subGoalToUpdate.is_time_selected
          ? subGoalToUpdate.end_date_time ?? undefined
          : undefined,
      })
    } catch (e: any) {
      setSubGoals(originalSubGoals)
      setError(e.message)
    }
  }

  const handleDeleteSubGoal = async (sub_goal_id: number) => {
    const originalSubGoals = [...subGoals]
    setSubGoals((prev) => prev.filter((sg) => sg.sub_goal_id !== sub_goal_id))

    try {
      await deleteSubGoal(goal.goalId, sub_goal_id)
    } catch (e: any) {
      setSubGoals(originalSubGoals)
      setError(e.message)
    }
  }

  const toggleGoalCompletion = () => {
    onUpdate({ completed: !goal.completed })
  }

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-[#5D6E72] text-white"
      case "MEDIUM":
        return "bg-[#BBDCE5] text-[#0F1C21]"
      case "LOW":
        return "bg-[#EEF5F7] text-[#0F1C21]"
      default:
        return "bg-white text-[#0F1C21]"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "높음"
      case "MEDIUM":
        return "보통"
      case "LOW":
        return "낮음"
      default:
        return priority
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const completedSubGoals = subGoals.filter((sg) => sg.completed).length
  const progressPercentage =
    subGoals.length > 0 ? Math.round((completedSubGoals / subGoals.length) * 100) : 0

  const startInlineEdit = (subGoal: SubGoal) => {
    setEditingSubGoalId(subGoal.sub_goal_id)
    setEditingSubGoalTitle(subGoal.title)
  }

  const cancelInlineEdit = () => {
    setEditingSubGoalId(null)
    setEditingSubGoalTitle("")
  }

  const saveInlineEdit = async (subGoal: SubGoal) => {
    if (!editingSubGoalTitle.trim()) return

    const originalSubGoals = [...subGoals]
    setSubGoals((prev) =>
      prev.map((sg) =>
        sg.sub_goal_id === subGoal.sub_goal_id
          ? { ...sg, title: editingSubGoalTitle.trim() }
          : sg
      )
    )
    cancelInlineEdit()

    try {
      await updateSubGoal(goal.goalId, subGoal.sub_goal_id, {
        title: editingSubGoalTitle.trim(),
        is_completed: subGoal.completed,
        is_time_selected: Boolean(subGoal.is_time_selected),
        start_date_time: subGoal.is_time_selected ? subGoal.start_date_time ?? undefined : undefined,
        end_date_time: subGoal.is_time_selected ? subGoal.end_date_time ?? undefined : undefined,
      })
    } catch (e: any) {
      setSubGoals(originalSubGoals)
      setError(e.message)
    }
  }

  const handleGoalFormSubmit = async (data: Goal) => {
    await Promise.resolve(
      onUpdate({
        title: data.title,
        priority: data.priority,
        startDate: data.startDate,
        endDate: data.endDate,
        color: data.color,
      })
    )
    setIsGoalFormOpen(false)
  }

  const handleDeleteGoal = async () => {
    const confirmed = window.confirm("정말로 이 목표를 삭제할까요?")
    if (!confirmed) return

    await Promise.resolve(onDelete())
  }

  return (
    <div className="min-h-screen bg-[#EEF5F7] text-[#0F1C21]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 rounded-full border border-[#99C6D6] bg-white px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-white/80"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로 돌아가기
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="rounded-full border border-[#99C6D6] bg-white px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-white/80"
              onClick={() => setIsGoalFormOpen(true)}
            >
              목표 수정
            </Button>
            <Button
              variant="ghost"
              className="rounded-full border border-[#5D6E72] bg-white px-4 py-2 text-sm font-semibold text-[#5D6E72] shadow-sm hover:bg-white/80"
              onClick={handleDeleteGoal}
            >
              삭제
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border border-[#D3E6ED] bg-white shadow-lg">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getPriorityBadgeStyle(
                      goal.priority
                    )}`}
                  >
                    {getPriorityText(goal.priority)}
                  </span>
                  <h1 className="text-2xl font-bold leading-snug text-[#0F1C21] sm:text-3xl">
                    {goal.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#5D6E72]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(goal.startDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(goal.endDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {goal.duration}일 계획
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${
                    goal.completed
                      ? "border border-[#99C6D6] bg-white text-[#0F1C21]"
                      : "bg-[#BBDCE5] text-[#0F1C21]"
                  }`}
                  onClick={toggleGoalCompletion}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="ml-2">{goal.completed ? "완료 해제" : "완료로 표시"}</span>
                </Button>
              </div>

              {subGoals.length > 0 && (
                <div className="rounded-2xl border border-[#D3E6ED] bg-[#EEF5F7] px-4 py-3 text-sm text-[#5D6E72]">
                  소목표 진행률{" "}
                  <span className="font-semibold text-[#0F1C21]">
                    {completedSubGoals}/{subGoals.length} ({progressPercentage}%)
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-[#D3E6ED] bg-white shadow-md">
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#0F1C21]">소목표</h2>
                  <p className="text-xs text-[#5D6E72]">
                    {subGoals.length === 0
                      ? "아직 추가된 소목표가 없어요."
                      : `${subGoals.length}개의 소목표 중 ${completedSubGoals}개를 완료했습니다.`}
                  </p>
                </div>
                <Button
                  className="flex items-center gap-2 rounded-full bg-[#BBDCE5] px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-[#BBDCE5]/80"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  소목표 추가
                </Button>
              </div>

              {error && (
                <div className="rounded-xl border border-[#5D6E72] bg-[#EEF5F7] px-3 py-2 text-xs text-[#5D6E72]">
                  {error}
                </div>
              )}

              {loadingSubGoals ? (
                <div className="py-10 text-center text-sm text-[#5D6E72]">소목표를 불러오는 중...</div>
              ) : subGoals.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#5D6E72]">
                  목표를 작은 단계로 나눠서 관리해 보세요.
                </div>
              ) : (
                <div className="space-y-3">
                  {subGoals.map((subGoal) => {
                    const isEditing = editingSubGoalId === subGoal.sub_goal_id
                    return (
                      <div
                        key={subGoal.sub_goal_id}
                        className="flex items-center gap-3 rounded-2xl border border-[#D3E6ED] bg-[#EEF5F7] px-3 py-3"
                      >
                        <Checkbox
                          checked={subGoal.completed}
                          onCheckedChange={() => toggleSubGoal(subGoal.sub_goal_id)}
                          className="h-5 w-5 border-[#99C6D6] data-[state=checked]:bg-[#BBDCE5]"
                        />
                        {isEditing ? (
                          <Input
                            value={editingSubGoalTitle}
                            onChange={(e) => setEditingSubGoalTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveInlineEdit(subGoal)
                              if (e.key === "Escape") cancelInlineEdit()
                            }}
                            className="flex-1 bg-white text-sm text-[#0F1C21]"
                            autoFocus
                          />
                        ) : (
                          <span
                            className={`flex-1 text-sm font-medium ${
                              subGoal.completed ? "text-[#5D6E72] line-through" : "text-[#0F1C21]"
                            }`}
                          >
                            {subGoal.title}
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => saveInlineEdit(subGoal)}
                                className="rounded-full px-3 py-1 text-xs font-semibold text-[#0F1C21] hover:bg-white/70"
                              >
                                저장
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelInlineEdit}
                                className="rounded-full px-3 py-1 text-xs font-semibold text-[#5D6E72] hover:bg-white/70"
                              >
                                취소
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-[#5D6E72] hover:bg-white/70"
                              onClick={() => startInlineEdit(subGoal)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">소목표 수정</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-[#5D6E72] hover:bg-white/70"
                            onClick={() => handleDeleteSubGoal(subGoal.sub_goal_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">소목표 삭제</span>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {isGoalFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#D3E6ED] bg-white p-4 shadow-2xl">
            <GoalForm
              goal={goal as any}
              onSubmit={handleGoalFormSubmit}
              onCancel={() => setIsGoalFormOpen(false)}
            />
          </div>
        </div>
      )}

      <SubGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubGoalCreated={fetchSubGoals}
        goalId={goal.goalId}
      />
    </div>
  )
}
