"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { Calendar, Plus, Menu } from "lucide-react"

import { ScheduleTimeline } from "@/components/schedule-timeline"
import { ScheduleCalendar } from "@/components/schedule-calendar"
import { ScheduleForm } from "@/components/schedule-form"
import { SubGoalModal } from "@/components/subgoal-modal"

import { getGoals, type Goal } from "@/api/goals"
import { getSubGoals, updateSubGoal } from "@/api/subgoals"
import { logout } from "@/api/auth"
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  createSubPlans,
  type Plan,
  type CreatePlanRequest,
  type UpdatePlanRequest,
} from "@/api/subplan"

import krocsLogo from "@/assets/krocslogo.png"

export interface SubTask {
  id: string
  title: string
  completed: boolean
}

export interface Schedule {
  planId: number
  goalId?: number
  subGoalId?: number
  title: string
  subTasks?: SubTask[]
  startDateTime: string
  endDateTime: string
  allDay: boolean
  isCompleted: boolean
  completedAt?: string | null
  createdAt: string
  updatedAt: string
  icon?: string
  color?: string
  reminderMinutes?: number
  type: "schedule" | "subgoal"
  isTimeSelected?: boolean
}

const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const FILTER_LABELS: Record<"all" | "schedules" | "subgoals", string> = {
  all: "전체",
  schedules: "일정",
  subgoals: "세부목표",
}

export default function SchedulePage() {
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [subGoalSchedules, setSubGoalSchedules] = useState<Schedule[]>([])
  const [goalList, setGoalList] = useState<Goal[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [filterType, setFilterType] = useState<"all" | "schedules" | "subgoals">("all")
  const [showSubGoalModal, setShowSubGoalModal] = useState(false)
  const [editingSubGoal, setEditingSubGoal] = useState<{
    goalId: number
    subGoal: {
      sub_goal_id: number
      title: string
      completed: boolean
      is_time_selected: boolean
      start_date_time?: string | null
      end_date_time?: string | null
    }
  } | null>(null)

  const timelineRef = useRef<{
    scrollToCurrentTime: () => void
    scrollToSchedule: (planId: number) => void
  }>(null)

  const handleLogout = async () => {
    try {
      await logout()
      alert("로그아웃 되었습니다.")
      router.push("/login")
    } catch {
      alert("로그아웃에 실패했습니다.")
    }
  }

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true)
      setError(null)
      try {
        const formattedDate = formatDateToYYYYMMDD(selectedDate)
        const fetchedPlans: Plan[] = await getPlans(formattedDate)

        const hexToColorNameMap: Record<string, string> = {
          "#2196f3": "blue",
          "#f44336": "red",
          "#4caf50": "green",
          "#9c27b0": "purple",
          "#ff9800": "orange",
          "#e91e63": "pink",
          "#ffeb3b": "yellow",
          "#607d8b": "indigo",
        }

        const reverseCategoryMap: Record<string, string> = {
          WORK: "Briefcase",
          STUDY: "Book",
          WORKOUT: "Dumbbell",
          REST: "Coffee",
          HEALTH: "Heart",
          IMPORTANT: "Star",
          ENERGY: "Zap",
          MUSIC: "Music",
          PHOTO: "Camera",
          GAME: "Gamepad2",
        }

        const adaptedSchedules: Schedule[] = fetchedPlans.map((plan) => ({
          planId: plan.plan_id,
          goalId: plan.goal_id,
          subGoalId: plan.sub_goal_id,
          title: plan.title,
          color: hexToColorNameMap[plan.color.toLowerCase()] || "blue",
          icon: reverseCategoryMap[plan.plan_category] || "User",
          subTasks: plan.sub_plans
            .map((subPlan) => ({
              id: String(subPlan.sub_plan_id),
              title: subPlan.title,
              completed: subPlan.is_completed,
            }))
            .sort((a, b) => Number(a.id) - Number(b.id)),
          startDateTime: plan.start_date_time,
          endDateTime: plan.end_date_time,
          allDay: plan.all_day,
          isCompleted: plan.is_completed,
          completedAt: plan.completed_at,
          createdAt: plan.created_at,
          updatedAt: plan.updated_at,
          type: "schedule",
        }))

        setSchedules(adaptedSchedules)
      } catch (err) {
        setError("일정을 불러오는 데 실패했습니다.")
        setSchedules([])
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [selectedDate, refreshTrigger])

  useEffect(() => {
    const fetchGoalsAndSubGoals = async () => {
      try {
        const goals = await getGoals({ searchDate: formatDateToYYYYMMDD(selectedDate) })
        setGoalList(goals)

        console.log("🎯 Goals for selected date:", goals)

        const subGoalResponses = await Promise.all(goals.map((goal) => getSubGoals(goal.goalId)))

        const allSubGoals: Schedule[] = []

        subGoalResponses.forEach((res, index) => {
          const goal = goals[index]
          const goalId = goal.goalId
          const goalColor = goal.color
          
          console.log(`🔍 Processing goal ${goalId}: ${goal.title}`, res.result.subGoals)
          
          res.result.subGoals.forEach((sg) => {
            // 시간이 선택된 소목표
            if (sg.is_time_selected && sg.start_date_time) {
              const startDate = sg.start_date_time.split("T")[0]
              const selectedDay = formatDateToYYYYMMDD(selectedDate)
              
              // 시간이 선택된 소목표는 해당 날짜에만 표시
              if (startDate === selectedDay) {
                console.log(`  ✅ Adding timed subgoal: ${sg.title}`)
                allSubGoals.push({
                  planId: sg.sub_goal_id,
                  goalId,
                  subGoalId: sg.sub_goal_id,
                  title: sg.title,
                  startDateTime: sg.start_date_time,
                  endDateTime: sg.end_date_time,
                  isCompleted: sg.is_completed,
                  allDay: false,
                  color: goalColor,
                  type: "subgoal",
                  subTasks: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  isTimeSelected: true,
                })
              }
            } 
            // 하루 종일 소목표 (시간이 선택되지 않은 경우)
            // 목표의 날짜에 따라 표시됨
            else if (!sg.is_time_selected) {
              console.log(`  ✅ Adding all-day subgoal: ${sg.title} (from goal: ${goal.title})`)
              
              // 하루 종일 소목표는 목표의 날짜를 사용
              const goalStartDate = new Date(goal.startDate)
              const goalStartDateString = formatDateToYYYYMMDD(goalStartDate)
              
              allSubGoals.push({
                planId: sg.sub_goal_id,
                goalId,
                subGoalId: sg.sub_goal_id,
                title: sg.title,
                startDateTime: `${goalStartDateString}T00:00:00`,
                endDateTime: `${goalStartDateString}T23:59:59`,
                isCompleted: sg.is_completed,
                allDay: true,
                color: goalColor,
                type: "subgoal",
                subTasks: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isTimeSelected: false,
              })
            }
          })
        })

        console.log("📦 Final allSubGoals:", allSubGoals)
        setSubGoalSchedules(allSubGoals)
      } catch (err) {
        console.error("Failed to fetch goals or sub-goals:", err)
      }
    }

    fetchGoalsAndSubGoals()
  }, [selectedDate, refreshTrigger])

  const onUpdateSubGoal = (goalId: number, subGoalId: number, updates: { isCompleted: boolean; title: string }) => {
    const currentSubGoal = subGoalSchedules.find((sg) => sg.planId === subGoalId)

    setSubGoalSchedules((prev) =>
      prev.map((sg) => (sg.planId === subGoalId ? { ...sg, isCompleted: updates.isCompleted } : sg))
    )

    updateSubGoal(goalId, subGoalId, {
      title: updates.title,
      is_completed: updates.isCompleted,
      is_time_selected: Boolean(currentSubGoal?.isTimeSelected),
      start_date_time: currentSubGoal?.isTimeSelected ? currentSubGoal?.startDateTime : undefined,
      end_date_time: currentSubGoal?.isTimeSelected ? currentSubGoal?.endDateTime : undefined,
    }).catch((err) => {
      console.error("Failed to update sub-goal, reverting:", err)
      setSubGoalSchedules((prev) =>
        prev.map((sg) => (sg.planId === subGoalId ? { ...sg, isCompleted: !updates.isCompleted } : sg))
      )
    })
  }

  const timelineItems = useMemo(() => {
    if (filterType === "schedules") {
      return schedules
    }
    if (filterType === "subgoals") {
      return subGoalSchedules
    }
    return [...schedules, ...subGoalSchedules].sort(
      (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    )
  }, [schedules, subGoalSchedules, filterType])

  const createSchedule = async (
    scheduleData: Omit<Schedule, "planId" | "isCompleted" | "createdAt" | "updatedAt" | "type">
  ) => {
    const categoryMap: Record<string, string> = {
      Briefcase: "WORK",
      Book: "STUDY",
      Dumbbell: "WORKOUT",
      Coffee: "REST",
      Heart: "HEALTH",
      Star: "IMPORTANT",
      Zap: "ENERGY",
      Music: "MUSIC",
      Camera: "PHOTO",
      Gamepad2: "GAME",
    }

    const apiPayload: CreatePlanRequest = {
      title: scheduleData.title,
      start_date_time: scheduleData.startDateTime,
      end_date_time: scheduleData.endDateTime,
      all_day: scheduleData.allDay,
      color: scheduleData.color || "#2196f3",
      plan_category: categoryMap[scheduleData.icon || ""] || "ETC",
    }

    try {
      const newPlanFromApi = await createPlan(apiPayload)

      if (scheduleData.subTasks && scheduleData.subTasks.length > 0) {
        const subPlansToCreate = scheduleData.subTasks.map((st) => ({ title: st.title }))
        await createSubPlans(newPlanFromApi.plan_id, subPlansToCreate)
      }

      setShowForm(false)
      setEditingSchedule(null)
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      console.error("Failed to create schedule:", err)
      setError("일정 생성에 실패했습니다.")
    }
  }

  const updateSchedule = async (planId: number, updates: Partial<Schedule>) => {
    const originalSchedule = schedules.find((s) => s.planId === planId)
    if (!originalSchedule) {
      setError("일정 수정에 필요한 정보가 부족합니다.")
      return
    }

    const categoryMap: Record<string, string> = {
      Briefcase: "WORK",
      Book: "STUDY",
      Dumbbell: "WORKOUT",
      Coffee: "REST",
      Heart: "HEALTH",
      Star: "IMPORTANT",
      Zap: "ENERGY",
      Music: "MUSIC",
      Camera: "PHOTO",
      Gamepad2: "GAME",
    }

    const colorNameToHexMap: Record<string, string> = {
      blue: "#2196f3",
      red: "#f44336",
      green: "#4caf50",
      purple: "#9c27b0",
      orange: "#ff9800",
      pink: "#e91e63",
      yellow: "#ffeb3b",
      indigo: "#607d8b",
    }

    const updatedSchedule = { ...originalSchedule, ...updates }

    const apiPayload: UpdatePlanRequest = {
      title: updatedSchedule.title,
      start_date_time: updatedSchedule.startDateTime,
      end_date_time: updatedSchedule.endDateTime,
      all_day: updatedSchedule.allDay,
      is_completed: updatedSchedule.isCompleted,
      color: colorNameToHexMap[updatedSchedule.color || "blue"] || "#2196f3",
      plan_category: categoryMap[updatedSchedule.icon || ""] || "ETC",
    }

    try {
      await updatePlan(planId, apiPayload)
      setRefreshTrigger((prev) => prev + 1)
      setShowForm(false)
      setEditingSchedule(null)
    } catch (err) {
      console.error("Failed to update schedule:", err)
      setError("일정 수정에 실패했습니다.")
    }
  }

  const deleteSchedule = async (planId: number) => {
    try {
      await deletePlan(planId)
      setRefreshTrigger((prev) => prev + 1)
      setShowForm(false)
      setEditingSchedule(null)
    } catch (err) {
      console.error("Failed to delete schedule:", err)
      setError("일정 삭제에 실패했습니다.")
    }
  }

  const handleEditSchedule = (schedule: Schedule) => {
    if (schedule.type === 'subgoal' && schedule.goalId) {
      // 소목표인 경우 소목표 모달 열기
      setEditingSubGoal({
        goalId: schedule.goalId,
        subGoal: {
          sub_goal_id: schedule.subGoalId || schedule.planId,
          title: schedule.title,
          completed: schedule.isCompleted,
          is_time_selected: schedule.isTimeSelected || false,
          start_date_time: schedule.startDateTime,
          end_date_time: schedule.endDateTime,
        }
      })
      setShowSubGoalModal(true)
    } else {
      // 일정인 경우 일정 모달 열기
      setEditingSchedule(schedule)
      setShowForm(true)
    }
  }

  const handleUpdateSchedule = (
    scheduleData: Omit<Schedule, "planId" | "isCompleted" | "createdAt" | "updatedAt" | "type">
  ) => {
    if (editingSchedule) {
      updateSchedule(editingSchedule.planId, scheduleData)
    }
  }

  const handleSubTasksUpdate = (planId: number, newSubTasks: SubTask[]) => {
    const updatedSchedules = schedules.map((schedule) =>
      schedule.planId === planId ? { ...schedule, subTasks: newSubTasks } : schedule
    )
    setSchedules(updatedSchedules)

    if (editingSchedule && editingSchedule.planId === planId) {
      const updatedScheduleForForm = updatedSchedules.find((s) => s.planId === planId)
      if (updatedScheduleForForm) {
        setEditingSchedule(updatedScheduleForForm)
      }
    }
  }

  const selectedDayLabel = selectedDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  })

  const totalSchedules = schedules.length
  const completedSchedules = schedules.filter((s) => s.isCompleted).length

  return (
    <div className="min-h-screen bg-[#EEF5F7] text-[#0F1C21]">
      {/* Header - Goal 페이지 스타일 */}
      <header className="sticky top-0 z-20 border-b border-[#D3E6ED] bg-[#EEF5F7]/95 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Image 
            src={krocsLogo}
            alt="Krocs Logo" 
            width={120}
            height={120}
            className="object-contain"
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Sidebar - Calendar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-3xl border border-[#D3E6ED] bg-white p-4 shadow-md">
              <CardContent className="p-0">
                <ScheduleCalendar
                  selectedDate={selectedDate}
                  onDateSelect={(date) => setSelectedDate(date)}
                  schedules={schedules}
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Timeline */}
          <div className="space-y-6 lg:col-span-2">
            {error && (
              <div className="rounded-2xl border border-[#5D6E72] bg-white/90 px-4 py-3 text-xs text-[#5D6E72]">
                {error}
              </div>
            )}

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0F1C21]">일정 타임라인</h2>
                  <p className="mt-1 text-sm text-black/60">
                    {selectedDayLabel} • {timelineItems.length}개
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    className="h-10 rounded-full bg-[#ff8b6b] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#ff7a56] transition-colors"
                    onClick={() => {
                      setEditingSchedule(null)
                      setShowForm(true)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-2">새 일정</span>
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
                        <Link href="/goal">목표관리</Link>
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
            </section>

            <section className="space-y-4">
              <div className="overflow-hidden rounded-3xl border border-[#D3E6ED] bg-white shadow-lg">
                <ScheduleTimeline
                  ref={timelineRef}
                  schedules={timelineItems}
                  selectedDate={selectedDate}
                  onUpdateSchedule={updateSchedule}
                  onDeleteSchedule={deleteSchedule}
                  onEditSchedule={handleEditSchedule}
                  loading={loading}
                  onFilterTypeChange={setFilterType}
                  filterType={filterType}
                  onUpdateSubGoal={onUpdateSubGoal}
                  scrollToPlanId={null}
                  onScrollToPlanIdProcessed={() => {}}
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#D3E6ED] bg-white p-4 shadow-2xl">
            <ScheduleForm
              schedule={editingSchedule}
              onSubmit={editingSchedule ? handleUpdateSchedule : createSchedule}
              onCancel={() => {
                setShowForm(false)
                setEditingSchedule(null)
              }}
              onDelete={deleteSchedule}
              defaultDate={selectedDate}
              goals={goalList}
              onSubTaskChange={(planId, index, newSubTask) => {
                const newSchedules = schedules.map((schedule) => {
                  if (schedule.planId !== planId) {
                    return schedule
                  }
                  const newSubTasks = [...(schedule.subTasks || [])]
                  if (index === null) {
                    newSubTasks.push(newSubTask)
                  } else {
                    newSubTasks[index] = newSubTask
                  }
                  return { ...schedule, subTasks: newSubTasks }
                })
                setSchedules(newSchedules)
                if (editingSchedule && editingSchedule.planId === planId) {
                  const updatedScheduleForForm = newSchedules.find((s) => s.planId === planId)
                  if (updatedScheduleForForm) {
                    setEditingSchedule(updatedScheduleForForm)
                  }
                }
              }}
              onSubTasksUpdate={handleSubTasksUpdate}
            />
          </div>
        </div>
      )}

      {showSubGoalModal && editingSubGoal && (
        <SubGoalModal
          isOpen={showSubGoalModal}
          onClose={() => {
            setShowSubGoalModal(false)
            setEditingSubGoal(null)
          }}
          onSubGoalCreated={() => {
            setRefreshTrigger((prev) => prev + 1)
          }}
          goalId={editingSubGoal.goalId}
          editingSubGoal={editingSubGoal.subGoal}
        />
      )}
    </div>
  )
}
