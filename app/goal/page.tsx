"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { getGoals, Goal } from "@/api/goals"
import { update_Goal as updateGoalApi, type UpdateGoalRequest } from "@/api/updateGoal"
import { createGoal as createGoalApi } from "@/api/createGoal"
import { logout } from "@/api/auth"
import { ScheduleCalendar } from "@/components/schedule-calendar"
import { GoalForm } from "@/components/goal-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { Plus, Calendar, Target, CheckCircle2, Menu, ChevronDown } from "lucide-react"

const FILTER_LABELS: Record<string, string> = {
  All: "전체",
  "In Progress": "진행 중",
  Completed: "완료",
  Overdue: "기한 초과",
}

const FILTER_OPTIONS = [
  { value: "All", label: FILTER_LABELS["All"] },
  { value: "In Progress", label: FILTER_LABELS["In Progress"] },
  { value: "Completed", label: FILTER_LABELS["Completed"] },
  { value: "Overdue", label: FILTER_LABELS["Overdue"] },
]

export default function GoalPage() {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filterStatus, setFilterStatus] = useState("All")

  const handleLogout = async () => {
    try {
      await logout()
      alert("로그아웃 되었습니다.")
      router.push("/login")
    } catch {
      alert("로그아웃에 실패했습니다.")
    }
  }

  const fetchGoals = useCallback(
    async (date: Date, status: string) => {
      setLoading(true)
      setError(null)
      try {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        const formattedDate = `${year}-${month}-${day}`

        const apiStatusMap: { [key: string]: "IN_PROGRESS" | "COMPLETED" | "EXPIRED" } = {
          "In Progress": "IN_PROGRESS",
          Completed: "COMPLETED",
          Overdue: "EXPIRED",
        }

        const apiStatus = apiStatusMap[status]

        const data = await getGoals({
          searchDate: formattedDate,
          status: apiStatus,
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
      await fetchGoals(selectedDate, filterStatus)
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
      color: updatedGoal.color,
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
        color: updatedGoalFromApi.color,
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

  useEffect(() => {
    fetchGoals(selectedDate, filterStatus)
  }, [selectedDate, filterStatus, fetchGoals])

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

  const getProgressPercentage = (goal: Goal) => {
    // API에서 받은 completionPercentage가 있으면 사용
    if (goal.completionPercentage !== undefined && goal.completionPercentage !== null) {
      return goal.completionPercentage
    }
    // 없으면 계산
    if (goal.subGoals.length === 0) return 0
    const completed = goal.subGoals.filter((sg) => sg.completed).length
    return (completed / goal.subGoals.length) * 100
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

  const filterCounts: Record<string, number> = {
    All: totalGoals,
    "In Progress": inProgressCount,
    Completed: completedCount,
    Overdue: overdueCount,
  }

  const sections = (() => {
    switch (filterStatus) {
      case "In Progress":
        return [{ title: "진행 중", goals: sortByPriority(inProgressList) }]
      case "Completed":
        return [{ title: "완료된 목표", goals: sortByPriority(completedList) }]
      case "Overdue":
        return [{ title: "기한 초과", goals: sortByPriority(overdueList) }]
      default:
        return [
          { title: "진행 중", goals: sortByPriority(inProgressList) },
          { title: "완료된 목표", goals: sortByPriority(completedList) },
        ]
    }
  })()

  const sectionsToRender = sections.filter((section) => section.goals.length > 0)
  const hasVisibleGoals = sectionsToRender.length > 0

  const selectedDayLabel = selectedDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  })

  return (
    <div className="min-h-screen bg-[#EEF5F7] text-[#0F1C21]">
      <header className="sticky top-0 z-20 border-b border-[#D3E6ED] bg-[#EEF5F7]/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold text-[#0F1C21]">목표 관리</h1>
          <div className="flex items-center gap-3">
            <Button
              className="h-10 rounded-full bg-[#BBDCE5] px-4 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-[#BBDCE5]/80"
              onClick={() => {
                setEditingGoal(null)
                setIsFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="ml-2">새 목표</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-[#99C6D6] bg-white text-[#0F1C21] shadow-sm hover:bg-white/80"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 rounded-2xl border border-[#D3E6ED] bg-white p-2 text-sm text-[#0F1C21] shadow-md"
              >
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2">
                  <Link href="/">홈</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2">
                  <Link href="/schedule">일정보기</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2">
                  <Link href="/templates">템플릿</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl px-3 py-2" onClick={handleLogout}>
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-3xl border border-[#D3E6ED] bg-white p-4 shadow-md">
              <CardContent className="p-0">
                <ScheduleCalendar
                  selectedDate={selectedDate}
                  onDateSelect={(date) => setSelectedDate(date)}
                  schedules={[]}
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
                    {selectedDayLabel} • {FILTER_LABELS[filterStatus]} {filterCounts[filterStatus]}개
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 rounded-full border border-[#99C6D6] bg-white px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-white/80"
                    >
                      {FILTER_LABELS[filterStatus]}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-44 rounded-2xl border border-[#D3E6ED] bg-white p-2 text-sm text-[#0F1C21] shadow-md"
                  >
                    {FILTER_OPTIONS.map((option) => {
                      const isActive = option.value === filterStatus
                      return (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => setFilterStatus(option.value)}
                          className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                            isActive ? "bg-[#BBDCE5]/40 font-semibold text-[#0F1C21]" : ""
                          }`}
                        >
                          <span>{option.label}</span>
                          <span className="text-xs text-black/50">{filterCounts[option.value]}</span>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                  <p className="text-base font-semibold">
                    {filterStatus === "All" ? "등록된 목표가 없습니다" : "조건에 맞는 목표가 없어요"}
                  </p>
                  <p className="mt-2 text-sm text-black/60">
                    {filterStatus === "All"
                      ? "첫 목표를 만들어 하루 루틴을 시작해보세요."
                      : "다른 필터를 선택하거나 새로운 목표를 추가해보세요."}
                  </p>
                  <Button
                    className="mt-5 rounded-full bg-[#BBDCE5] px-5 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-[#BBDCE5]/80"
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
                        const rawProgress = getProgressPercentage(goal)
                        const progress = Math.max(0, Math.min(100, Math.round(rawProgress)))
                        const isCompleted = goal.completed
                        const priorityClass = getPriorityColor(goal.priority)

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
                          <Link href={`/goal/${goal.goalId}`} key={goal.goalId} className="block">
                            <Card 
                              className="group rounded-3xl border-2 bg-white shadow-sm transition-all hover:shadow-md hover:scale-[1.005]"
                              style={{ 
                                borderLeftWidth: '5px',
                                borderLeftColor: goal.color || '#BBDCE5',
                                borderTopColor: '#D3E6ED',
                                borderRightColor: '#D3E6ED',
                                borderBottomColor: '#D3E6ED'
                              }}
                            >
                              <CardContent className="p-5">
                                <div className="flex items-center justify-between gap-4">
                                  {/* Checkbox + Content */}
                                  <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        toggleGoalCompletion(goal.goalId)
                                      }}
                                      className={`mt-1 flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${
                                        isCompleted
                                          ? 'bg-gradient-to-br shadow-sm'
                                          : 'hover:border-opacity-80'
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
                                        <span
                                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${priorityClass}`}
                                        >
                                          {getPriorityText(goal.priority)}
                                        </span>
                                        <CardTitle className={`text-lg font-bold leading-tight transition-all ${
                                          isCompleted ? 'text-[#5D6E72]/70 line-through' : 'text-[#0F1C21] group-hover:text-[#5D6E72]'
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

                                      <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[10px]">
                                          <span className="text-[#5D6E72] font-medium">
                                            {goal.subGoals.length > 0 ? `소목표 ${goal.subGoals.filter((sg) => sg.completed).length}/${goal.subGoals.length}` : '목표 진행률'}
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
                                              backgroundColor: goal.color || '#BBDCE5'
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div
                                    className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full shadow-sm"
                                    style={{
                                      background: `conic-gradient(${goal.color || '#BBDCE5'} ${progress}%, #EEF5F7 ${progress}% 100%)`
                                    }}
                                  >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                      <span className="text-xs font-bold text-[#0F1C21]">{progress}%</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
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
    </div>
  )
}
