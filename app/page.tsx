"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { getGoals, Goal } from "../api/goals"
import { update_Goal as updateGoalApi, type UpdateGoalRequest } from "../api/updateGoal"
import { createGoal as createGoalApi } from "../api/createGoal"
import { logout } from "../api/auth"
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

const BRAND_BASE = "#BBDCE5"
const BRAND_DARK = "#5D6E72"
const BRAND_LIGHT = "#DDEDF2"
const BRAND_SOFT = "#EEF5F7"

export default function GoalManagementApp() {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("In Progress")

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

    // 사용자에게 즉시 반영되도록 낙관적 업데이트
    const optimisticUpdatedGoal = { ...originalGoal, ...goalData }
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

      // API 응답으로 확정 데이터를 다시 반영
      const finalGoal: Goal = {
        ...originalGoal,
        goalId: updatedGoalFromApi.goalId,
        title: updatedGoalFromApi.title,
        priority: updatedGoalFromApi.priority as "HIGH" | "MEDIUM" | "LOW",
        startDate: updatedGoalFromApi.startDate,
        endDate: updatedGoalFromApi.endDate,
        completed: updatedGoalFromApi.isCompleted,
        color: updatedGoal.color,
        subGoals: (updatedGoalFromApi.subGoals || []).map((sg: any) => ({
          sub_goal_id: sg.subGoalId,
          title: sg.title,
          completed: sg.isCompleted,
        })),
        completionPercentage: updatedGoalFromApi.completionPercentage ?? 0,
        createdAt: updatedGoalFromApi.createdAt,
        updatedAt: updatedGoalFromApi.updatedAt,
        duration: originalGoal.duration, // update API가 duration을 반환하지 않는다고 가정
      }

      setGoals((prevGoals) => prevGoals.map((g) => (g.goalId === goalId ? finalGoal : g)))

      if (editingGoal?.goalId === goalId) {
        setEditingGoal(null)
        setIsFormOpen(false)
      }
    } catch (err: any) {
      // API 호출 실패 시 낙관적 업데이트 되돌리기
      setGoals((prevGoals) => prevGoals.map((g) => (g.goalId === goalId ? originalGoal : g)))
      setError(err?.response?.data?.message || "목표 수정에 실패했습니다.")
      console.error(err)
    }
  }

  const toggleGoalCompletion = async (goalId: number) => {
    const goal = goals.find((g) => g.goalId === goalId)
    if (!goal) return

    // 기존 updateGoal 함수를 호출해 API 처리와 상태 갱신 수행
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}.${month}.${day}`
  }

  const getProgressPercentage = (goal: Goal) => {
    if (goal.subGoals.length === 0) return goal.completed ? 100 : 0
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
        return [{ title: "진행 중", goals: inProgressList }]
      case "Completed":
        return [{ title: "완료된 목표", goals: completedList }]
      case "Overdue":
        return [{ title: "기한 초과", goals: overdueList }]
      default:
        return [
          { title: "진행 중", goals: inProgressList },
          { title: "완료된 목표", goals: completedList },
        ]
    }
  })()

  const sectionsToRender = sections.filter((section) => section.goals.length > 0)
  const hasVisibleGoals = sectionsToRender.length > 0

  const selectedMonthLabel = `${selectedDate.getFullYear()}.${String(selectedDate.getMonth() + 1).padStart(2, "0")}`
  const selectedDayLabel = selectedDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  })
  const activeFilterLabel = FILTER_LABELS[filterStatus] ?? filterStatus

  return (
    <div className="min-h-screen bg-[#EEF5F7] text-[#0F1C21]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <header className="sticky top-0 z-20 border-b border-[#D3E6ED] bg-[#EEF5F7]/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <button
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm"
              onClick={() => setIsCalendarOpen((prev) => !prev)}
            >
              {selectedMonthLabel}
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <Button
                className="h-10 w-10 rounded-full bg-[#BBDCE5] text-[#0F1C21] shadow-sm hover:bg-[#BBDCE5]/80"
                onClick={() => {
                  setEditingGoal(null)
                  setIsFormOpen(true)
                }}
              >
                <Plus className="h-5 w-5" />
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
          {isCalendarOpen && (
            <div className="mt-4 rounded-2xl border border-[#D3E6ED] bg-white p-3 shadow-sm">
              <ScheduleCalendar
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  setSelectedDate(date)
                  setIsCalendarOpen(false)
                }}
                schedules={[]}
                onClose={() => setIsCalendarOpen(false)}
              />
            </div>
          )}
        </header>

        <main className="flex-1 space-y-6 px-5 py-6">
          {error && (
            <div className="rounded-2xl border border-[#5D6E72] bg-white/90 px-4 py-3 text-xs text-[#5D6E72]">
              {error}
            </div>
          )}

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">목표 현황</h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-full border border-[#99C6D6] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F1C21] shadow-sm hover:bg-white/80"
                  >
                    {FILTER_LABELS[filterStatus]}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-40 rounded-2xl border border-[#D3E6ED] bg-white p-2 text-sm text-[#0F1C21] shadow-md"
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
            <p className="text-xs text-black/60">
              {selectedDayLabel} • {FILTER_LABELS[filterStatus]} {filterCounts[filterStatus]}개
            </p>
          </section>

          <section className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card
                    key={index}
                    className="animate-pulse rounded-3xl border border-[#D3E6ED] bg-white/90 p-5 shadow-xs"
                  >
                    <div className="mb-3 h-4 w-3/4 rounded-full bg-[#BBDCE5]/40" />
                    <div className="mb-4 h-3 w-1/2 rounded-full bg-[#BBDCE5]/30" />
                    <div className="h-16 rounded-2xl bg-[#BBDCE5]/20" />
                  </Card>
                ))}
              </div>
            ) : !hasVisibleGoals ? (
              <div className="rounded-3xl border border-[#D3E6ED] bg-white/90 p-8 text-center shadow-xs">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#BBDCE5]/30">
                  <Target className="h-6 w-6 text-[#0F1C21]" />
                </div>
                <p className="text-sm font-semibold">
                  {filterStatus === "All" ? "등록된 목표가 없습니다" : "조건에 맞는 목표가 없어요"}
                </p>
                <p className="mt-2 text-xs text-black/60">
                  {filterStatus === "All"
                    ? "첫 목표를 만들어 하루 루틴을 시작해보세요."
                    : "다른 필터를 선택하거나 새로운 목표를 추가해보세요."}
                </p>
                <Button
                  className="mt-4 rounded-full bg-[#BBDCE5] px-4 text-[#0F1C21] shadow-sm hover:bg-[#BBDCE5]/80"
                  onClick={() => setIsFormOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  새 목표 만들기
                </Button>
              </div>
            ) : (
              sectionsToRender.map((section) => (
                <div key={section.title} className="space-y-3">
                  <p className="px-1 text-xs font-semibold uppercase tracking-wide text-black/45">
                    {section.title}
                  </p>
                  <div className="space-y-3">
                    {section.goals.map((goal) => {
                      const rawProgress = getProgressPercentage(goal)
                      const progress = Math.max(0, Math.min(100, Math.round(rawProgress)))
                      const isCompleted = goal.completed
                      const priorityClass = getPriorityColor(goal.priority)
                      const circleBackground = {
                        background: `conic-gradient(#BBDCE5 ${progress}%, rgba(187,220,229,0.25) ${progress}% 100%)`,
                      }

                      return (
                        <Link href={`/goal/${goal.goalId}`} key={goal.goalId} className="block">
                          <Card className="rounded-3xl border border-[#D3E6ED] bg-white px-5 py-4 shadow-xs">
                            <CardContent className="flex items-center justify-between gap-4 p-0">
                              <div className="flex-1 space-y-2 overflow-hidden">
                                <span
                                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${priorityClass}`}
                                >
                                  {getPriorityText(goal.priority)}
                                </span>
                                <CardTitle className="truncate text-lg font-semibold leading-tight text-[#0F1C21]">
                                  {goal.title}
                                </CardTitle>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <div
                                  className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF5F7]"
                                  style={circleBackground}
                                >
                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#0F1C21]">
                                    {progress}%
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    isCompleted ? "text-[#5D6E72]" : "text-[#0F1C21]"
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    toggleGoalCompletion(goal.goalId)
                                  }}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span className="ml-2">{isCompleted ? "완료 해제" : "완료 처리"}</span>
                                </Button>
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
    </div>
  )
}
