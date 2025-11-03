"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { Calendar, CheckCircle2, ChevronDown, Clock, Plus, Target } from "lucide-react"

import { ScheduleTimeline } from "@/components/schedule-timeline"
import { ScheduleCalendar } from "@/components/schedule-calendar"
import { ScheduleForm } from "@/components/schedule-form"

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
  all: "전체 보기",
  schedules: "일정만",
  subgoals: "소목표만",
}

export default function SchedulePage() {
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
        setError("일정을 불러오는 데 실패했습니다. 다시 시도해 주세요.")
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

        const subGoalResponses = await Promise.all(goals.map((goal) => getSubGoals(goal.goalId)))

        const timeSelectedSubGoals: Schedule[] = []
        const selectedDay = formatDateToYYYYMMDD(selectedDate)

        subGoalResponses.forEach((res, index) => {
          const goalId = goals[index].goalId
          res.result.subGoals.forEach((sg) => {
            if (!sg.is_time_selected) {
              return
            }
            const startDate = sg.start_date_time?.split("T")[0]
            if (startDate === selectedDay) {
              timeSelectedSubGoals.push({
                planId: sg.sub_goal_id,
                goalId,
                subGoalId: sg.sub_goal_id,
                title: sg.title,
                startDateTime: sg.start_date_time,
                endDateTime: sg.end_date_time,
                isCompleted: sg.is_completed,
                allDay: true,
                color: "red",
                type: "subgoal",
                subTasks: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isTimeSelected: true,
              })
            }
          })
        })

        setSubGoalSchedules(timeSelectedSubGoals)
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
      setError("일정 생성에 실패했습니다. 다시 시도해 주세요.")
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
      setError("일정 수정에 실패했습니다. 다시 시도해 주세요.")
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
      setError("일정 삭제에 실패했습니다. 다시 시도해 주세요.")
    }
  }

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setShowForm(true)
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
    weekday: "long",
  })
  const selectedMonthLabel = `${selectedDate.getFullYear()}.${String(selectedDate.getMonth() + 1).padStart(2, "0")}`

  const totalSchedules = schedules.length
  const completedSchedules = schedules.filter((s) => s.isCompleted).length
  const pendingSchedules = totalSchedules - completedSchedules
  const subgoalCount = subGoalSchedules.length

  return (
    <div className="min-h-screen bg-[#EEF5F7] text-[#0F1C21]">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Link href="/" className="text-sm font-semibold text-[#5D6E72] hover:text-[#0F1C21]">
              ← 목표 보드로 돌아가기
            </Link>
            <h1 className="text-2xl font-bold text-[#0F1C21] sm:text-3xl">하루 일정 타임라인</h1>
            <p className="text-sm text-[#5D6E72]">{selectedDayLabel}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-full border border-[#99C6D6] bg-white px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-white/80"
              onClick={() => setShowCalendar((prev) => !prev)}
            >
              <Calendar className="h-4 w-4" />
              {selectedMonthLabel}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2 rounded-full bg-[#BBDCE5] px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-[#BBDCE5]/80">
                  {FILTER_LABELS[filterType]}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 rounded-2xl border border-[#D3E6ED] bg-white p-2 text-sm">
                {(
                  [
                    { value: "all", label: FILTER_LABELS["all"] },
                    { value: "schedules", label: FILTER_LABELS["schedules"] },
                    { value: "subgoals", label: FILTER_LABELS["subgoals"] },
                  ] as const
                ).map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setFilterType(option.value)}
                    className={`rounded-xl px-3 py-2 ${
                      filterType === option.value ? "bg-[#BBDCE5]/40 font-semibold text-[#0F1C21]" : ""
                    }`}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              className="flex items-center gap-2 rounded-full bg-[#BBDCE5] px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-[#BBDCE5]/80"
              onClick={() => {
                setEditingSchedule(null)
                setShowForm(true)
              }}
            >
              <Plus className="h-4 w-4" />
              새 일정
            </Button>
          </div>
        </header>

        {showCalendar && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-[#D3E6ED] bg-white shadow-md">
            <ScheduleCalendar
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date)
                setShowCalendar(false)
              }}
              schedules={schedules}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"></section>

        <section className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-[#0F1C21]">타임라인</h2>
              <p className="text-xs text-[#5D6E72]">
                {FILTER_LABELS[filterType]} · {timelineItems.length}개 일정
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="rounded-full border border-[#99C6D6] bg-white px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-white/80"
                onClick={() => {
                  setSelectedDate(new Date())
                  timelineRef.current?.scrollToCurrentTime?.()
                }}
              >
                오늘로 이동
              </Button>
              <Button
                variant="ghost"
                className="rounded-full border border-[#99C6D6] bg-white px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-white/80"
                onClick={() => timelineRef.current?.scrollToCurrentTime?.()}
              >
                현재 시간 보기
              </Button>
            </div>
          </div>

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

      {error && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-lg -translate-x-1/2 rounded-full border border-[#5D6E72] bg-white px-4 py-3 text-center text-sm text-[#5D6E72] shadow-lg">
          {error}
        </div>
      )}

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
    </div>
  )
}
