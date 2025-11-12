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
  Target,
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
    const confirmed = window.confirm("이 소목표를 삭제하시겠습니까?")
    if (!confirmed) return

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
        return "bg-[#DDEDF2] text-[#0F1C21]"
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
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 rounded-full border border-[#99C6D6] bg-white px-5 py-2.5 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-white/80 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="rounded-full border border-[#99C6D6] bg-white px-5 py-2.5 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-white/80 transition-all"
              onClick={() => setIsGoalFormOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              수정
            </Button>
            <Button
              variant="ghost"
              className="rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-500 shadow-sm hover:bg-red-50 transition-all"
              onClick={handleDeleteGoal}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              삭제
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Goal Info Card */}
          <Card 
            className="rounded-3xl border-2 bg-white shadow-lg overflow-hidden"
            style={{
              borderLeftWidth: '6px',
              borderLeftColor: goal.color || '#BBDCE5',
              borderTopColor: '#D3E6ED',
              borderRightColor: '#D3E6ED',
              borderBottomColor: '#D3E6ED'
            }}
          >
            <CardContent className="p-8">
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getPriorityBadgeStyle(
                          goal.priority
                        )}`}
                      >
                        {getPriorityText(goal.priority)}
                      </span>
                      <h1 className="text-3xl font-bold leading-tight text-[#0F1C21]">
                        {goal.title}
                      </h1>
                    </div>
                    <Button
                      onClick={toggleGoalCompletion}
                      className={`rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-all ${
                        goal.completed
                          ? "bg-white border-2 text-[#0F1C21] hover:bg-gray-50"
                          : "text-[#0F1C21] hover:opacity-90"
                      }`}
                      style={{
                        backgroundColor: goal.completed ? 'white' : goal.color || '#BBDCE5',
                        borderColor: goal.completed ? (goal.color || '#BBDCE5') : 'transparent'
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {goal.completed ? "완료 해제" : "완료"}
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#5D6E72]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(goal.startDate)}</span>
                    </div>
                    <span className="text-[#D3E6ED]">→</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(goal.endDate)}</span>
                    </div>
                    <span className="text-[#D3E6ED]">•</span>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span className="font-semibold">{goal.duration}일 계획</span>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                {subGoals.length > 0 && (
                  <div className="space-y-3 rounded-2xl bg-gradient-to-br from-[#EEF5F7] to-[#DDEDF2] p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5" style={{ color: goal.color || '#5D6E72' }} />
                        <span className="text-sm font-semibold text-[#0F1C21]">소목표 진행률</span>
                      </div>
                      <span className="text-2xl font-bold" style={{ color: goal.color || '#5D6E72' }}>
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded-full bg-white overflow-hidden shadow-inner">
                        <div 
                          className="h-full transition-all duration-500 ease-out rounded-full"
                          style={{ 
                            width: `${progressPercentage}%`,
                            backgroundColor: goal.color || '#BBDCE5'
                          }}
                        />
                      </div>
                      <p className="text-xs text-[#5D6E72] text-center">
                        {completedSubGoals}/{subGoals.length} 완료
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sub Goals Card */}
          <Card className="rounded-3xl border border-[#D3E6ED] bg-white shadow-md">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#0F1C21] flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" style={{ color: goal.color || '#5D6E72' }} />
                      소목표
                    </h2>
                    <p className="text-sm text-[#5D6E72] mt-1">
                      {subGoals.length === 0
                        ? "목표를 작은 단계로 나눠 관리해보세요"
                        : `총 ${subGoals.length}개의 소목표`}
                    </p>
                  </div>
                  <Button
                    className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[#0F1C21] shadow-md hover:shadow-lg transition-all"
                    style={{ backgroundColor: goal.color || '#ff8b6b' }}
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    소목표 추가
                  </Button>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {loadingSubGoals ? (
                  <div className="py-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" style={{ color: goal.color || '#BBDCE5' }}></div>
                    <p className="mt-3 text-sm text-[#5D6E72]">소목표를 불러오는 중...</p>
                  </div>
                ) : subGoals.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${goal.color || '#BBDCE5'}20` }}>
                      <Target className="h-8 w-8" style={{ color: goal.color || '#5D6E72' }} />
                    </div>
                    <p className="text-sm text-[#5D6E72] font-medium">아직 소목표가 없습니다</p>
                    <p className="text-xs text-[#5D6E72] mt-1">큰 목표를 작은 단계로 나눠보세요</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {subGoals.map((subGoal) => {
                      const isEditing = editingSubGoalId === subGoal.sub_goal_id
                      return (
                        <div
                          key={subGoal.sub_goal_id}
                          className="group flex items-center gap-4 rounded-2xl border-2 border-[#D3E6ED] bg-white px-4 py-3.5 transition-all hover:shadow-md hover:border-opacity-60"
                          style={{
                            borderLeftWidth: '4px',
                            borderLeftColor: subGoal.completed ? (goal.color || '#BBDCE5') : '#D3E6ED'
                          }}
                        >
                          <button
                            onClick={() => toggleSubGoal(subGoal.sub_goal_id)}
                            className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${
                              subGoal.completed
                                ? 'shadow-sm'
                                : 'hover:border-opacity-80'
                            }`}
                            style={subGoal.completed ? {
                              backgroundColor: goal.color || '#5D6E72',
                              borderColor: goal.color || '#5D6E72',
                            } : {
                              borderColor: goal.color || '#D3E6ED',
                            }}
                          >
                            {subGoal.completed && <CheckCircle2 className="h-4 w-4 text-[#0F1C21]" strokeWidth={3} />}
                          </button>

                          {isEditing ? (
                            <Input
                              value={editingSubGoalTitle}
                              onChange={(e) => setEditingSubGoalTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveInlineEdit(subGoal)
                                if (e.key === "Escape") cancelInlineEdit()
                              }}
                              className="flex-1 bg-[#EEF5F7] border-[#99C6D6] text-sm text-[#0F1C21] font-medium rounded-xl"
                              autoFocus
                            />
                          ) : (
                            <span
                              className={`flex-1 text-sm font-medium transition-all ${
                                subGoal.completed ? "text-[#5D6E72] line-through opacity-60" : "text-[#0F1C21]"
                              }`}
                            >
                              {subGoal.title}
                            </span>
                          )}

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => saveInlineEdit(subGoal)}
                                  className="rounded-full px-3 py-1 h-8 text-xs font-semibold hover:bg-[#EEF5F7]"
                                  style={{ color: goal.color || '#0F1C21' }}
                                >
                                  저장
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={cancelInlineEdit}
                                  className="rounded-full px-3 py-1 h-8 text-xs font-semibold text-[#5D6E72] hover:bg-[#EEF5F7]"
                                >
                                  취소
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-[#5D6E72] hover:bg-[#EEF5F7]"
                                  onClick={() => startInlineEdit(subGoal)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-red-400 hover:bg-red-50"
                                  onClick={() => handleDeleteSubGoal(subGoal.sub_goal_id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isGoalFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#D3E6ED] bg-white p-6 shadow-2xl">
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
