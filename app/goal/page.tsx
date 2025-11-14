"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

import { getGoals, Goal, deleteBigGoal } from "@/api/goals"
import { update_Goal as updateGoalApi, type UpdateGoalRequest } from "@/api/updateGoal"
import { createGoal as createGoalApi } from "@/api/createGoal"
import { getSubGoals, deleteSubGoal, updateSubGoal } from "@/api/subgoals"
import { ScheduleCalendar } from "@/components/schedule-calendar"
import { GoalForm } from "@/components/goal-form"
import { SubGoalModal, type SubGoalModalData } from "@/components/subgoal-modal"
import { RetrospectiveFlow } from "@/components/retrospective/retrospective-flow"
import { toKoreanISOString } from "@/lib/korean-time"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

import { Plus, Calendar, Target, CheckCircle2, ChevronDown, ChevronRight, Pencil, Trash2, MoreHorizontal } from "lucide-react"

interface SubGoal {
  sub_goal_id: number
  title: string
  completed: boolean
  is_time_selected?: boolean
  start_date_time?: string | null
  end_date_time?: string | null
}

export default function GoalPage() {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => {
    // 페이지 로드 시 localStorage에서 날짜 복원
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('goalPageSelectedDate')
      if (saved) {
        const date = new Date(saved)
        if (!isNaN(date.getTime())) {
          return date
        }
      }
    }
    return new Date()
  })
  const [expandedGoals, setExpandedGoals] = useState<Set<number>>(new Set())
  const [subGoalsMap, setSubGoalsMap] = useState<Record<number, SubGoal[]>>({})
  const [loadingSubGoals, setLoadingSubGoals] = useState<Set<number>>(new Set())
  const [editingSubGoal, setEditingSubGoal] = useState<SubGoalModalData | null>(null)
  const [isSubGoalModalOpen, setIsSubGoalModalOpen] = useState(false)
  const [currentGoalId, setCurrentGoalId] = useState<number | null>(null)
  const [retrospectiveGoal, setRetrospectiveGoal] = useState<Goal | null>(null)
  const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null)
  const [actionMenuGoalId, setActionMenuGoalId] = useState<number | null>(null)

  // 날짜 변경 시 localStorage에 저장
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    if (typeof window !== 'undefined') {
      localStorage.setItem('goalPageSelectedDate', toKoreanISOString(date))
    }
  }

  const fetchGoals = useCallback(
    async (date: Date) => {
      setLoading(true)
      setError(null)
      try {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        const formattedDate = `${year}-${month}-${day}`

        const data = await getGoals({
          searchDate: formattedDate,
        })
        setGoals(data)
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push("/login")
        } else {
          setError(err?.response?.data?.message || "목표를 불러오는데 실패했습니다.")
          console.error(err)
        }
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  const refreshGoals = useCallback(async () => {
    await fetchGoals(selectedDate)
  }, [fetchGoals, selectedDate])

  const createGoal = async (
    goalData: Omit<Goal, "goalId" | "completed" | "subGoals" | "createdAt" | "updatedAt"> & { color: string }
  ) => {
    setLoading(true)
    try {
      const apiData = {
        title: goalData.title,
        priority: goalData.priority,
        startDate: goalData.startDate,
        endDate: goalData.endDate,
        color: goalData.color,
      }
      await createGoalApi(1, apiData)
      await refreshGoals()
      setIsFormOpen(false)
    } catch (err: any) {
      setError(err?.response?.data?.message || "목표 생성에 실패했습니다.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateGoal = async (goalId: number, goalData: Partial<Goal>) => {
    const originalGoal = goals.find((g) => g.goalId === goalId)
    if (!originalGoal) return

    // 낙관적 업데이트 시 progress 유지
    const optimisticUpdatedGoal = { 
      ...originalGoal, 
      ...goalData,
      // completionPercentage는 유지
      completionPercentage: originalGoal.completionPercentage 
    }
    setGoals((prevGoals) => prevGoals.map((g) => (g.goalId === goalId ? optimisticUpdatedGoal : g)))

    const updatedGoal = { ...originalGoal, ...goalData }

    const apiPayload: UpdateGoalRequest = {
      title: updatedGoal.title,
      priority: updatedGoal.priority,
      startDate: updatedGoal.startDate,
      endDate: updatedGoal.endDate,
      isCompleted: updatedGoal.completed,
      color: updatedGoal.color || "#bbdefb",
    }

    try {
      const response = await updateGoalApi(goalId, 1, apiPayload)
      const updatedGoalFromApi = response.result

      const finalGoal: Goal = {
        ...originalGoal,
        goalId: updatedGoalFromApi.goalId,
        title: updatedGoalFromApi.title,
        priority: updatedGoalFromApi.priority as "HIGH" | "MEDIUM" | "LOW",
        startDate: updatedGoalFromApi.startDate,
        endDate: updatedGoalFromApi.endDate,
        completed: updatedGoalFromApi.isCompleted,
        subGoals: (updatedGoalFromApi.subGoals || []).map((sg: any) => ({
          sub_goal_id: sg.subGoalId,
          title: sg.title,
          completed: sg.isCompleted,
        })),
        completionPercentage: updatedGoalFromApi.completionPercentage ?? originalGoal.completionPercentage ?? 0,
        createdAt: updatedGoalFromApi.createdAt,
        updatedAt: updatedGoalFromApi.updatedAt,
        duration: originalGoal.duration,
        color: apiPayload.color,
      }

      setGoals((prevGoals) => prevGoals.map((g) => (g.goalId === goalId ? finalGoal : g)))

      if (editingGoal?.goalId === goalId) {
        setEditingGoal(null)
        setIsFormOpen(false)
      }
    } catch (err: any) {
      setGoals((prevGoals) => prevGoals.map((g) => (g.goalId === goalId ? originalGoal : g)))
      setError(err?.response?.data?.message || "목표 수정에 실패했습니다.")
      console.error(err)
    }
  }

  const toggleGoalCompletion = async (goalId: number) => {
    const goal = goals.find((g) => g.goalId === goalId)
    if (!goal) return
    await updateGoal(goalId, { ...goal, completed: !goal.completed })
  }

  const toggleGoalExpansion = async (goalId: number) => {
    const newExpanded = new Set(expandedGoals)
    
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId)
    } else {
      newExpanded.add(goalId)
      // 세부목표를 아직 불러오지 않았다면 불러오기
      if (!subGoalsMap[goalId]) {
        setLoadingSubGoals(prev => new Set(prev).add(goalId))
        try {
          const response = await getSubGoals(goalId)
          setSubGoalsMap(prev => ({
            ...prev,
            [goalId]: response.result.subGoals.map(sg => ({
              sub_goal_id: sg.sub_goal_id,
              title: sg.title,
              completed: sg.is_completed,
              is_time_selected: sg.is_time_selected,
              start_date_time: sg.start_date_time,
              end_date_time: sg.end_date_time,
            }))
          }))
        } catch (err) {
          console.error("세부목표 불러오기 실패:", err)
        } finally {
          setLoadingSubGoals(prev => {
            const newSet = new Set(prev)
            newSet.delete(goalId)
            return newSet
          })
        }
      }
    }
    
    setExpandedGoals(newExpanded)
  }

  const toggleSubGoal = async (goalId: number, sub_goal_id: number) => {
    const originalSubGoals = subGoalsMap[goalId] || []
    const subGoalToUpdate = originalSubGoals.find((sg) => sg.sub_goal_id === sub_goal_id)
    if (!subGoalToUpdate) return

    const newCompletedStatus = !subGoalToUpdate.completed
    
    // 낙관적 업데이트
    setSubGoalsMap((prev) => ({
      ...prev,
      [goalId]: prev[goalId].map((sg) =>
        sg.sub_goal_id === sub_goal_id ? { ...sg, completed: newCompletedStatus } : sg
      )
    }))

    try {
      await updateSubGoal(goalId, sub_goal_id, {
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
      
      // 목표의 진행률을 업데이트하기 위해 목표 목록 새로고침
      await fetchGoals(selectedDate)
    } catch (e: any) {
      // 실패 시 원래 상태로 복원
      setSubGoalsMap((prev) => ({
        ...prev,
        [goalId]: originalSubGoals
      }))
      setError(e.message || "세부목표 업데이트에 실패했습니다.")
    }
  }

  const handleDeleteSubGoal = async (goalId: number, sub_goal_id: number) => {
    const originalSubGoals = subGoalsMap[goalId] || []
    
    // 낙관적 업데이트
    setSubGoalsMap((prev) => ({
      ...prev,
      [goalId]: prev[goalId].filter((sg) => sg.sub_goal_id !== sub_goal_id)
    }))

    try {
      await deleteSubGoal(goalId, sub_goal_id)
      
      // 목표의 진행률을 업데이트하기 위해 목표 목록 새로고침
      await fetchGoals(selectedDate)
    } catch (e: any) {
      // 실패 시 원래 상태로 복원
      setSubGoalsMap((prev) => ({
        ...prev,
        [goalId]: originalSubGoals
      }))
      setError(e.message || "세부목표 삭제에 실패했습니다.")
    }
  }

  const openSubGoalModal = (goalId: number, subGoal?: SubGoal) => {
    setCurrentGoalId(goalId)
    if (subGoal) {
      setEditingSubGoal({
        sub_goal_id: subGoal.sub_goal_id,
        title: subGoal.title,
        completed: subGoal.completed,
        is_time_selected: Boolean(subGoal.is_time_selected),
        start_date_time: subGoal.start_date_time ?? null,
        end_date_time: subGoal.end_date_time ?? null,
      })
    } else {
      setEditingSubGoal(null)
    }
    setIsSubGoalModalOpen(true)
  }

  const handleSubGoalModalClose = () => {
    setIsSubGoalModalOpen(false)
    setEditingSubGoal(null)
    setCurrentGoalId(null)
  }

  const handleSubGoalUpdated = async () => {
    if (currentGoalId) {
      // 세부목표 목록 새로고침
      setLoadingSubGoals(prev => new Set(prev).add(currentGoalId))
      try {
        const response = await getSubGoals(currentGoalId)
        setSubGoalsMap(prev => ({
          ...prev,
          [currentGoalId]: response.result.subGoals.map(sg => ({
            sub_goal_id: sg.sub_goal_id,
            title: sg.title,
            completed: sg.is_completed,
            is_time_selected: sg.is_time_selected,
            start_date_time: sg.start_date_time,
            end_date_time: sg.end_date_time,
          }))
        }))
      } catch (err) {
        console.error("세부목표 불러오기 실패:", err)
      } finally {
        setLoadingSubGoals(prev => {
          const newSet = new Set(prev)
          newSet.delete(currentGoalId)
          return newSet
        })
      }
      
      // 목표 목록도 새로고침
      await fetchGoals(selectedDate)
    }
  }

  const handleGoalCompletionClick = (goal: Goal) => {
    if (goal.completed) {
      toggleGoalCompletion(goal.goalId)
    } else {
      setRetrospectiveGoal(goal)
    }
  }

  useEffect(() => {
    const handleClickOutside = () => setActionMenuGoalId(null)
    window.addEventListener("click", handleClickOutside)
    return () => window.removeEventListener("click", handleClickOutside)
  }, [])

  const handleEditGoalClick = (goal: Goal) => {
    setEditingGoal(goal)
    setIsFormOpen(true)
  }

  const handleDeleteGoal = async (goalId: number) => {
    if (!confirm("정말로 이 목표를 삭제하시겠습니까?")) return
    setDeletingGoalId(goalId)
    try {
      await deleteBigGoal(goalId)
      if (editingGoal?.goalId === goalId) {
        setEditingGoal(null)
        setIsFormOpen(false)
      }
      await refreshGoals()
      setExpandedGoals((prev) => {
        const next = new Set(prev)
        next.delete(goalId)
        return next
      })
    } catch (error) {
      console.error(error)
      alert("목표 삭제에 실패했습니다.")
    } finally {
      setDeletingGoalId(null)
    }
  }

  useEffect(() => {
    fetchGoals(selectedDate)
  }, [selectedDate, fetchGoals])

  const getPriorityColor = (priority: string) => {
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

  const getProgressPercentage = (goal: Goal, subGoalsFromMap?: SubGoal[]) => {
    // subGoalsMap에서 가져온 데이터가 있으면 우선 사용
    if (subGoalsFromMap && subGoalsFromMap.length > 0) {
      const completed = subGoalsFromMap.filter((sg) => sg.completed).length
      return (completed / subGoalsFromMap.length) * 100
    }
    
    // API에서 받은 completionPercentage가 있으면 사용
    if (goal.completionPercentage !== undefined && goal.completionPercentage !== null) {
      return goal.completionPercentage
    }
    // 없으면 계산
    if (goal.subGoals.length === 0) return 0
    const completed = goal.subGoals.filter((sg) => sg.completed).length
    return (completed / goal.subGoals.length) * 100
  }

  const formatDateTime = (dateTimeStr: string | null | undefined) => {
    if (!dateTimeStr) return null
    const date = new Date(dateTimeStr)
    return date.toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const completedList = goals.filter((goal) => goal.completed)
  const overdueList = goals.filter((goal) => {
    if (goal.completed) return false
    const endDate = new Date(goal.endDate)
    return endDate < today
  })
  const inProgressList = goals.filter((goal) => {
    if (goal.completed) return false
    const endDate = new Date(goal.endDate)
    return endDate >= today
  })

  const sortByPriority = (goalsList: Goal[]) => {
    const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 }
    return [...goalsList].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }

  const totalGoals = goals.length
  const inProgressCount = inProgressList.length
  const completedCount = completedList.length
  const overdueCount = overdueList.length

  const sections = [
    { title: "진행 중", goals: sortByPriority(inProgressList) },
    { title: "완료된 목표", goals: sortByPriority(completedList) },
    { title: "기한 초과", goals: sortByPriority(overdueList) },
  ]

  const sectionsToRender = sections.filter((section) => section.goals.length > 0)
  const hasVisibleGoals = sectionsToRender.length > 0

  const selectedDayLabel = selectedDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  })

  return (
    <div className="min-h-screen bg-[#EEF5F7] text-[#0F1C21]">
      

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-3xl border border-[#D3E6ED] bg-white p-4 shadow-md">
              <CardContent className="p-0">
                <ScheduleCalendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  schedules={[]}
                  goals={goals}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-2">
            {error && (
              <div className="rounded-2xl border border-[#5D6E72] bg-white/90 px-4 py-3 text-xs text-[#5D6E72]">
                {error}
              </div>
            )}

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0F1C21]">목표 현황</h2>
                  <p className="mt-1 text-sm text-black/60">
                    {selectedDayLabel} • 전체 {totalGoals}개
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    className="h-10 rounded-full bg-[#ff8b6b] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#ff7a56] transition-colors"
                    onClick={() => {
                      setEditingGoal(null)
                      setIsFormOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-2">새 목표</span>
                  </Button>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card
                      key={index}
                      className="animate-pulse rounded-3xl border border-[#D3E6ED] bg-white p-4 shadow-xs"
                    >
                      <div className="mb-2 h-3 w-1/4 rounded-full bg-[#BBDCE5]/40" />
                      <div className="mb-3 h-4 w-3/4 rounded-full bg-[#BBDCE5]/30" />
                      <div className="h-2 rounded-full bg-[#BBDCE5]/20" />
                    </Card>
                  ))}
                </div>
              ) : !hasVisibleGoals ? (
                <Card className="rounded-3xl border border-[#D3E6ED] bg-white p-10 text-center shadow-xs">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#BBDCE5]/30">
                    <Target className="h-7 w-7 text-[#0F1C21]" />
                  </div>
                  <p className="text-base font-semibold">등록된 목표가 없습니다</p>
                  <p className="mt-2 text-sm text-black/60">
                    첫 목표를 만들어 하루 루틴을 시작해보세요.
                  </p>
                  <Button
                    className="mt-5 rounded-full bg-[#ff8b6b] px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#ff7a56] hover:shadow-lg transition-all"
                    onClick={() => setIsFormOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-2">새 목표 만들기</span>
                  </Button>
                </Card>
              ) : (
                sectionsToRender.map((section) => (
                  <div key={section.title} className="space-y-3">
                    <h3 className="px-2 text-xs font-bold uppercase tracking-wider text-black/40">
                      {section.title}
                    </h3>
                    <div className="space-y-3">
                      {section.goals.map((goal) => {
                        const isCompleted = goal.completed
                        const priorityClass = getPriorityColor(goal.priority)
                        const isExpanded = expandedGoals.has(goal.goalId)
                        const subGoals = subGoalsMap[goal.goalId] || []
                        const isLoadingSubGoals = loadingSubGoals.has(goal.goalId)

                        // subGoalsMap에 데이터가 있으면 그것을 사용, 없으면 goal.subGoals 사용
                        const displaySubGoals = subGoalsMap[goal.goalId] || goal.subGoals
                        const completedSubGoalsCount = displaySubGoals.filter((sg) => sg.completed).length
                        const totalSubGoalsCount = displaySubGoals.length

                        // 진행률 계산 - displaySubGoals 사용
                        const rawProgress = getProgressPercentage(goal, displaySubGoals)
                        const progress = Math.max(0, Math.min(100, Math.round(rawProgress)))

                        const startDate = new Date(goal.startDate)
                        const endDate = new Date(goal.endDate)
                        startDate.setHours(0, 0, 0, 0)
                        endDate.setHours(0, 0, 0, 0)
                        
                        const todayZero = new Date(today)
                        todayZero.setHours(0, 0, 0, 0)
                        
                        const daysRemaining = Math.ceil((endDate.getTime() - todayZero.getTime()) / (1000 * 60 * 60 * 24))
                        const calculatedTotalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
                        const totalDays = goal.duration === 0 ? calculatedTotalDays : goal.duration
                        const isOverdue = daysRemaining < 0 && !isCompleted
                        
                        return (
                          <div key={goal.goalId}>
                            <Card
                              className="group rounded-3xl border-2 bg-white shadow-sm transition-all hover:shadow-md"
                              style={{
                                borderLeftWidth: '5px',
                                borderLeftColor: goal.color || '#BBDCE5',
                                borderTopColor: '#D3E6ED',
                                borderRightColor: '#D3E6ED',
                                borderBottomColor: '#D3E6ED',
                              }}
                            >
                              <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleGoalCompletionClick(goal)
                                      }}
                                      className={`mt-1 flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${
                                        isCompleted ? 'bg-gradient-to-br shadow-sm' : 'hover:border-opacity-80'
                                      }`}
                                      style={isCompleted ? {
                                        backgroundColor: goal.color || '#5D6E72',
                                        borderColor: goal.color || '#5D6E72',
                                      } : {
                                        borderColor: goal.color || '#D3E6ED',
                                      }}
                                    >
                                      {isCompleted && <CheckCircle2 className="h-4 w-4 text-white" strokeWidth={3} />}
                                    </button>
                                    <div className="flex-1 min-w-0 space-y-3">
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                          <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${priorityClass}`}
                                          >
                                            {getPriorityText(goal.priority)}
                                          </span>
                                          <div className="flex items-center gap-1 text-xs font-medium text-[#5D6E72]">
                                            <button
                                              onClick={() => toggleGoalExpansion(goal.goalId)}
                                              className="flex items-center gap-1 rounded-full border border-[#D3E6ED] bg-[#F7FBFC] px-2 py-1 transition-colors hover:text-[#0F1C21]"
                                            >
                                              <span>세부목표</span>
                                              <ChevronRight
                                                className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                              />
                                            </button>
                                            <div className="relative">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  setActionMenuGoalId((prev) => (prev === goal.goalId ? null : goal.goalId))
                                                }}
                                                className="ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-[#D3E6ED] bg-white text-[#5D6E72] transition-colors hover:bg-[#EEF5F7]"
                                                aria-label="목표 작업 열기"
                                              >
                                                <MoreHorizontal className="h-4 w-4" />
                                              </button>
                                              {actionMenuGoalId === goal.goalId && (
                                                <div
                                                  className="absolute right-0 top-8 z-10 w-32 rounded-2xl border border-[#D3E6ED] bg-white p-2 text-sm shadow-lg"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <button
                                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[#0F1C21] transition-colors hover:bg-[#EEF5F7]"
                                                    onClick={() => {
                                                      handleEditGoalClick(goal)
                                                      setActionMenuGoalId(null)
                                                    }}
                                                  >
                                                    <Pencil className="h-4 w-4" />
                                                    수정
                                                  </button>
                                                  <button
                                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[#d85b48] transition-colors hover:bg-[#FFECEA]"
                                                    onClick={() => {
                                                      handleDeleteGoal(goal.goalId)
                                                      setActionMenuGoalId(null)
                                                    }}
                                                    disabled={deletingGoalId === goal.goalId}
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                    삭제
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <CardTitle className={`text-lg font-bold leading-tight transition-all ${
                                          isCompleted ? 'text-[#5D6E72]/70 line-through' : 'text-[#0F1C21]'
                                        }`}>
                                          {goal.title}
                                        </CardTitle>
                                      </div>
                                      <div className="flex items-center gap-4 flex-wrap text-xs text-[#5D6E72]">
                                        <div className="flex items-center gap-1.5">
                                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                          <span className="whitespace-nowrap">
                                            {new Date(goal.startDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })} - {new Date(goal.endDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <Target className="h-3.5 w-3.5 flex-shrink-0" />
                                          <span className={`font-semibold whitespace-nowrap ${isOverdue ? "text-red-500" : ""}`}>
                                            {isCompleted ? "완료" : isOverdue ? `${Math.abs(daysRemaining)}일 초과` : daysRemaining === 0 ? "오늘 마감" : `D-${daysRemaining}`}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="space-y-1.5 max-w-[700px]">
                                        <div className="flex items-center justify-between text-[10px]">
                                          <span className="text-[#5D6E72] font-medium">
                                            {totalSubGoalsCount > 0 ? `세부목표 ${completedSubGoalsCount}/${totalSubGoalsCount}` : '목표 진행률'}
                                          </span>
                                          <span className="font-bold" style={{ color: goal.color || '#5D6E72' }}>
                                            {progress}%
                                          </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-[#EEF5F7] overflow-hidden">
                                          <div
                                            className="h-full transition-all duration-500 ease-out rounded-full"
                                            style={{
                                              width: `${progress}%`,
                                              backgroundColor: goal.color || '#BBDCE5',
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {isExpanded && (
                                  <div className="mt-4 pt-4 border-t border-[#D3E6ED]">
                                    {isLoadingSubGoals ? (
                                      <div className="text-center py-4 text-sm text-[#5D6E72]">
                                        세부목표를 불러오는 중...
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <h4 className="text-sm font-semibold text-[#0F1C21]">
                                            세부목표 ({subGoals.filter((sg) => sg.completed).length}/{subGoals.length})
                                          </h4>
                                          <Button
                                            className="h-8 w-8 rounded-full bg-[#ff8b6b] p-0 text-white shadow-sm hover:bg-[#ff7a56] transition-colors flex items-center justify-center"
                                            onClick={() => openSubGoalModal(goal.goalId)}
                                          >
                                            <Plus className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        {subGoals.length === 0 ? (
                                          <div className="text-center py-6 text-sm text-[#5D6E72]">
                                            <p className="mb-3">아직 등록된 세부목표가 없습니다.</p>
                                          </div>
                                        ) : (
                                          <div className="space-y-2">
                                            {subGoals.map((subGoal) => (
                                              <div
                                                key={subGoal.sub_goal_id}
                                                className="flex items-start gap-3 rounded-xl bg-[#EEF5F7] px-3 py-2.5"
                                              >
                                                <Checkbox
                                                  checked={subGoal.completed}
                                                  onCheckedChange={() => toggleSubGoal(goal.goalId, subGoal.sub_goal_id)}
                                                  className="mt-0.5 h-4 w-4 border-[#99C6D6] data-[state=checked]:border-[#ff8b6b]"
                                                  style={{
                                                    backgroundColor: subGoal.completed ? goal.color || '#ff8b6b' : 'transparent',
                                                    borderColor: subGoal.completed ? goal.color || '#ff8b6b' : '#99C6D6',
                                                  }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                  <span
                                                    className={`text-sm ${
                                                      subGoal.completed
                                                        ? 'text-[#5D6E72] line-through'
                                                        : 'text-[#0F1C21] font-medium'
                                                    }`}
                                                  >
                                                    {subGoal.title}
                                                  </span>
                                                  {subGoal.is_time_selected && (subGoal.start_date_time || subGoal.end_date_time) && (
                                                    <div className="mt-1 flex items-center gap-2 text-xs text-[#5D6E72]">
                                                      <Calendar className="h-3 w-3" />
                                                      <span>
                                                        {subGoal.start_date_time && formatDateTime(subGoal.start_date_time)}
                                                        {subGoal.start_date_time && subGoal.end_date_time && ' - '}
                                                        {subGoal.end_date_time && formatDateTime(subGoal.end_date_time)}
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full text-[#5D6E72] hover:bg-white/70"
                                                    onClick={() => openSubGoalModal(goal.goalId, subGoal)}
                                                  >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    <span className="sr-only">수정</span>
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full text-[#5D6E72] hover:bg-white/70"
                                                    onClick={() => handleDeleteSubGoal(goal.goalId, subGoal.sub_goal_id)}
                                                  >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    <span className="sr-only">삭제</span>
                                                  </Button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </div>
      </main>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#D3E6ED] bg-white p-4 shadow-2xl">
            <GoalForm
              goal={editingGoal}
              onSubmit={editingGoal ? (data) => updateGoal(editingGoal.goalId, data) : createGoal}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingGoal(null)
              }}
            />
          </div>
        </div>
      )}

      {isSubGoalModalOpen && currentGoalId && (
        <SubGoalModal
          isOpen={isSubGoalModalOpen}
          onClose={handleSubGoalModalClose}
          onSubGoalCreated={handleSubGoalUpdated}
          goalId={currentGoalId}
          editingSubGoal={editingSubGoal}
          onDelete={(subGoalId) => handleDeleteSubGoal(currentGoalId, subGoalId)}
        />
      )}

      <RetrospectiveFlow
        goal={retrospectiveGoal}
        isOpen={Boolean(retrospectiveGoal)}
        onClose={() => setRetrospectiveGoal(null)}
        onCompleted={refreshGoals}
      />
    </div>
  )
}
