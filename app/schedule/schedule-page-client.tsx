"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { Calendar, Plus } from "lucide-react"

import { ScheduleTimeline } from "@/components/schedule-timeline"
import { ScheduleCalendar } from "@/components/schedule-calendar"
import { ScheduleForm } from "@/components/schedule-form"
import { SubGoalModal } from "@/components/subgoal-modal"


import { getGoals, type Goal } from "@/api/goals"
import { getSubGoals, updateSubGoal } from "@/api/subgoals"
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

import { toKoreanISOString } from "@/lib/korean-time"
import { GlobalNav } from "@/components/global-nav"

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

const DEFAULT_SCHEDULE_COLOR = "#2196f3"

const COLOR_NAME_TO_HEX: Record<string, string> = {
  blue: "#2196f3",
  red: "#F44336",
  green: "#4caf50",
  purple: "#9c27b0",
  orange: "#ff9800",
  pink: "#e91e63",
  yellow: "#ffeb3b",
  indigo: "#607d8b",
}

const normalizeColorValue = (color?: string) => {
  if (!color) return DEFAULT_SCHEDULE_COLOR
  const normalized = color.trim().toLowerCase()
  if (normalized.startsWith("#")) {
    return normalized
  }
  return COLOR_NAME_TO_HEX[normalized as keyof typeof COLOR_NAME_TO_HEX] || DEFAULT_SCHEDULE_COLOR
}

export default function SchedulePageClient() {
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

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true)
      setError(null)
      try {
        const formattedDate = formatDateToYYYYMMDD(selectedDate)
        const fetchedPlans: Plan[] = await getPlans(formattedDate)

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
          color: normalizeColorValue(plan.color),
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
      } catch (err: any) {
        console.error("일정을 불러오는 데 실패했습니다.", err)
        setSchedules([])
        if (err.response?.status === 401 || err.response?.data?.code === "GLOBAL401") {
          alert(err.response?.data?.message || "인증에 실패했습니다. 다시 로그인해주세요.")
          router.push("/login")
        } else if (err.response?.status === 400 && err.response?.data?.detail) {
          alert(err.response.data.detail)
        } else if (err.response?.data?.code === "PLAN404" || err.response?.data?.code === "PLAN500" || err.response?.data?.code === "TIMELINE404") {
          alert(err.response.data.message || "일정을 불러오는 데 실패했습니다.")
        } else {
          alert(err.response?.data?.message || "일정을 불러오는 데 실패했습니다.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [selectedDate, refreshTrigger, router])

  useEffect(() => {
    const fetchGoalsAndSubGoals = async () => {
      try {
        const goals = await getGoals({ searchDate: formatDateToYYYYMMDD(selectedDate) })
        setGoalList(goals)

        const subGoalResponses = await Promise.all(goals.map((goal) => getSubGoals(goal.goalId)))

        const allSubGoals: Schedule[] = []

        subGoalResponses.forEach((res, index) => {
          const goal = goals[index]
          const goalId = goal.goalId
          const goalColor = normalizeColorValue(goal.color)
          const buildSubGoalColor = (sgColor?: string) =>
            sgColor ? normalizeColorValue(sgColor) : goalColor
          
          res.result.subGoals.forEach((sg) => {
            // 시간이 선택된 소목표
            if (sg.is_time_selected && sg.start_date_time) {
              const startDate = sg.start_date_time.split("T")[0]
              const selectedDay = formatDateToYYYYMMDD(selectedDate)
              
              // 시간이 선택된 소목표는 해당 날짜에만 표시
              if (startDate === selectedDay) {
                const subGoalColor = buildSubGoalColor(sg.color)
                allSubGoals.push({
                  planId: sg.sub_goal_id,
                  goalId,
                  subGoalId: sg.sub_goal_id,
                  title: sg.title,
                  startDateTime: sg.start_date_time,
                  endDateTime: sg.end_date_time,
                  isCompleted: sg.is_completed,
                  allDay: false,
                  color: subGoalColor,
                  type: "subgoal",
                  subTasks: [],
                  createdAt: toKoreanISOString(),
                  updatedAt: toKoreanISOString(),
                  isTimeSelected: true,
                })
              }
            } 
            // 하루 종일 소목표 (시간이 선택되지 않은 경우)
            // 목표의 날짜에 따라 표시됨
            else if (!sg.is_time_selected) {
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
                color: buildSubGoalColor(sg.color),
                type: "subgoal",
                subTasks: [],
                createdAt: toKoreanISOString(),
                updatedAt: toKoreanISOString(),
                isTimeSelected: false,
              })
            }
          })
        })

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
      color: normalizeColorValue(scheduleData.color),
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
    } catch (err: any) {
      console.error("Failed to create schedule:", err)
      if (err.response?.status === 401 || err.response?.data?.code === "GLOBAL401") {
        alert(err.response?.data?.message || "인증에 실패했습니다. 다시 로그인해주세요.")
        router.push("/login")
      } else if (err.response?.data?.code === "PLAN500") {
        alert(err.response.data.message || "일정 생성에 실패했습니다.")
      } else if ((err.response?.data?.code === "VALIDATION400" || err.response?.data?.code === "BAD_REQUEST_BODY400") && err.response?.data?.result) {
        const errorResult = err.response.data.result
        const errorMessages = Object.values(errorResult)
        if (errorMessages.length > 0 && typeof errorMessages[0] === 'string') {
          alert(errorMessages[0])
        } else {
          alert(err.response.data.message || "잘못된 요청입니다.")
        }
      } else {
        setError("일정 생성에 실패했습니다.")
      }
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

    const updatedSchedule = { ...originalSchedule, ...updates }

    const apiPayload: UpdatePlanRequest = {
      title: updatedSchedule.title,
      start_date_time: updatedSchedule.startDateTime,
      end_date_time: updatedSchedule.endDateTime,
      all_day: updatedSchedule.allDay,
      is_completed: updatedSchedule.isCompleted,
      color: normalizeColorValue(updatedSchedule.color || originalSchedule.color),
      plan_category: categoryMap[updatedSchedule.icon || ""] || "ETC",
    }

    try {
      await updatePlan(planId, apiPayload)
      setRefreshTrigger((prev) => prev + 1)
      setShowForm(false)
      setEditingSchedule(null)
    } catch (err: any) {
      console.error("Failed to update schedule:", err)
      if (err.response?.status === 401 || err.response?.data?.code === "GLOBAL401") {
        alert(err.response?.data?.message || "인증에 실패했습니다. 다시 로그인해주세요.")
        router.push("/login")
      } else if (err.response?.data?.code === "PLAN400" || err.response?.data?.code === "PLAN404" || err.response?.data?.code === "PLAN500") {
        alert(err.response.data.message || "일정 수정에 실패했습니다.")
      } else if (err.response?.data?.code === "BAD_REQUEST_BODY400" && err.response?.data?.result) {
        const errorResult = err.response.data.result
        const errorMessages = Object.values(errorResult)
        if (errorMessages.length > 0 && typeof errorMessages[0] === 'string') {
          alert(errorMessages[0])
        } else {
          alert(err.response.data.message || "잘못된 요청입니다.")
        }
      } else {
        alert(err.response?.data?.message || "일정 수정에 실패했습니다.")
      }
    }
  }

  const deleteSchedule = async (planId: number) => {
    try {
      await deletePlan(planId)
      setRefreshTrigger((prev) => prev + 1)
      setShowForm(false)
      setEditingSchedule(null)
    } catch (err: any) {
      console.error("Failed to delete schedule:", err)
      if (err.response?.status === 401 || err.response?.data?.code === "GLOBAL401") {
        alert(err.response?.data?.message || "인증에 실패했습니다. 다시 로그인해주세요.")
        router.push("/login")
      } else if (err.response?.data?.code === "PLAN404" || err.response?.data?.code === "PLAN500") {
        alert(err.response.data.message || "일정 삭제에 실패했습니다.")
      } else {
        alert(err.response?.data?.message || "일정 삭제에 실패했습니다.")
      }
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
      <GlobalNav />
      <main className="mx-auto max-w-7xl px-4 pt-6 pb-28 md:px-6 md:pb-6 font-daeojamjil">

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Sidebar - Calendar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-3xl border border-[#D3E6ED] bg-white p-4 shadow-md">
              <CardContent className="p-0">
                <ScheduleCalendar
                  selectedDate={selectedDate}
                  onDateSelect={(date) => setSelectedDate(date)}
                  schedules={schedules}
                  refreshTrigger={refreshTrigger}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#D3E6ED] bg-white shadow-2xl">
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
          onDelete={async (subGoalId) => {
            try {
              const { deleteSubGoal } = await import("@/api/subgoals")
              await deleteSubGoal(editingSubGoal.goalId, subGoalId)
              setRefreshTrigger((prev) => prev + 1)
              setShowSubGoalModal(false)
              setEditingSubGoal(null)
            } catch (err) {
              console.error("Failed to delete sub-goal:", err)
              setError("세부목표 삭제에 실패했습니다.")
            }
          }}
        />
      )}
    </div>
  )
}
