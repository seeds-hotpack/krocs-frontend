"use client"

import React, { forwardRef, useImperativeHandle, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Circle,
  Calendar,
  User,
  Coffee,
  Briefcase,
  Book,
  Dumbbell,
  Bell,
  Heart,
  Star,
  Zap,
  Music,
  Camera,
  Gamepad2,
  ChevronDown,
  ChevronUp,
  Target,
  AlertTriangle,
} from "lucide-react"
import { updateSubPlan } from "@/api/subplan";
import { updateSubGoal } from "@/api/subgoals";
import { Checkbox } from "@/components/ui/checkbox"
import { toKoreanDateTimeLocalString, toKoreanISOString } from "@/lib/korean-time";

interface SubTask {
  id: string
  title: string
  completed: boolean
}

interface Schedule {
  planId: number
  goalId?: number
  subGoalId?: number
  title: string
  startDateTime: string
  endDateTime: string
  allDay: boolean
  isCompleted: boolean
  completedAt?: string | null
  createdAt: string
  updatedAt: string
  reminderMinutes?: number
  icon?: string
  color?: string
  subTasks?: SubTask[]
  type: 'schedule' | 'subgoal';
}

interface ScheduleTimelineProps {
  schedules: Schedule[]
  selectedDate: Date
  onUpdateSchedule: (planId: number, updates: Partial<Schedule>) => void
  onUpdateSubGoal: (
    goalId: number,
    subGoalId: number,
    updates: {
      title?: string
      isCompleted?: boolean
      isTimeSelected?: boolean
      startDateTime?: string
      endDateTime?: string
    }
  ) => void;
  onDeleteSchedule: (planId: number) => void;
  onEditSchedule?: (schedule: Schedule) => void
  loading: boolean
  onScrollToCurrentTime?: () => void
  filterType: 'all' | 'schedules' | 'subgoals';
  onFilterTypeChange: (type: 'all' | 'schedules' | 'subgoals') => void;
  scrollToPlanId: number | null;
  onScrollToPlanIdProcessed: () => void;
}

export const ScheduleTimeline = forwardRef<{
  scrollToCurrentTime: () => void;
  scrollToSchedule: (planId: number) => void;
}, ScheduleTimelineProps>(({ 
  schedules, 
  selectedDate, 
  onUpdateSchedule, 
  onUpdateSubGoal,
  onDeleteSchedule, 
  onEditSchedule, 
  loading, 
  onScrollToCurrentTime, 
  filterType, 
  onFilterTypeChange,
  scrollToPlanId,
  onScrollToPlanIdProcessed,
}, ref) => {
  const [expandedSchedules, setExpandedSchedules] = useState<Set<number>>(new Set())
  const timelineRef = useRef<HTMLDivElement>(null)
  const [dragPreview, setDragPreview] = useState<{
    planId: number
    startDateTime: string
    endDateTime: string
  } | null>(null)
  const [expandedMobileSchedules, setExpandedMobileSchedules] = useState<Set<number>>(new Set())
  const dragPreviewRef = useRef<{
    planId: number
    startDateTime: string
    endDateTime: string
  } | null>(null)
  const dragMetaRef = useRef<{
    planId: number
    type: "schedule" | "subgoal"
    goalId?: number
    title: string
    isCompleted: boolean
    mode: "move" | "resize"
    startY: number
    startStartTime: Date
    startEndTime: Date
    hasMoved: boolean
  } | null>(null)
  const suppressClickRef = useRef(false)

  const DRAG_STEP_MINUTES = 5
  const PIXELS_PER_MINUTE = 1
  const PIXELS_PER_STEP = DRAG_STEP_MINUTES * PIXELS_PER_MINUTE
  const TIME_LABEL_INTERVAL_MINUTES = 60
  const TIME_COLUMN_WIDTH_REM = 3.75
  const TIMELINE_GAP_REM = 1.25

  useImperativeHandle(ref, () => ({
    scrollToCurrentTime: () => {},
    scrollToSchedule: (planId: number) => {
      const scheduleElement = timelineRef.current?.querySelector(`[data-schedule-id="${planId}"]`) as HTMLElement;
      if (scheduleElement) {
        scheduleElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    },
  }));

  const iconMap = {
    User,
    Coffee,
    Briefcase,
    Book,
    Dumbbell,
    Heart,
    Star,
    Zap,
    Music,
    Camera,
    Gamepad2,
    Target,
  }

  const getScheduleIcon = (schedule: Schedule) => {
    if (schedule.type === 'subgoal') return Target;
    if (schedule.icon && iconMap[schedule.icon as keyof typeof iconMap]) {
      return iconMap[schedule.icon as keyof typeof iconMap]
    }
    const lowerTitle = schedule.title?.toLowerCase() || ""
    if (lowerTitle.includes("운동") || lowerTitle.includes("workout")) return Dumbbell
    if (lowerTitle.includes("회의") || lowerTitle.includes("meeting")) return Briefcase
    if (lowerTitle.includes("독서") || lowerTitle.includes("book")) return Book
    if (lowerTitle.includes("휴식") || lowerTitle.includes("break")) return Coffee
    return User
  }

  const getScheduleColor = (color?: string) => {
    if (color?.startsWith('#')) {
      return color;
    }
    
    const colorMap: Record<string, string> = {
      blue: "#2196f3",
      red: "#F44336",
      green: "#4caf50",
      purple: "#9c27b0",
      orange: "#ff9800",
      pink: "#e91e63",
      yellow: "#ffeb3b",
      indigo: "#607d8b",
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const getDisplayTimes = (schedule: Schedule) => {
    if (dragPreview?.planId === schedule.planId) {
      return {
        start: dragPreview.startDateTime,
        end: dragPreview.endDateTime,
      }
    }
    return {
      start: schedule.startDateTime,
      end: schedule.endDateTime,
    }
  }

  const toggleComplete = (schedule: Schedule) => {
    if (schedule.type === 'subgoal' && schedule.goalId) {
      onUpdateSubGoal(schedule.goalId, schedule.planId, { 
        title: schedule.title, 
        isCompleted: !schedule.isCompleted 
      });
    } else {
      onUpdateSchedule(schedule.planId, {
        isCompleted: !schedule.isCompleted,
        completedAt: !schedule.isCompleted ? toKoreanISOString() : undefined,
      })
    }
  }

  const toggleSubTask = async (planId: number, subTaskId: string) => {
    const schedule = schedules.find((s) => s.planId === planId);
    if (!schedule?.subTasks) return;

    const subTask = schedule.subTasks.find(st => st.id === subTaskId);
    if (!subTask) return;

    const newCompletedState = !subTask.completed;

    const updatedSubTasks = schedule.subTasks.map((task) =>
      task.id === subTaskId ? { ...task, completed: newCompletedState } : task
    );
    onUpdateSchedule(planId, { subTasks: updatedSubTasks });

    try {
      await updateSubPlan(planId, Number(subTaskId), { is_completed: newCompletedState });
    } catch (error) {
      console.error("Failed to update sub-task:", error);
      onUpdateSchedule(planId, { subTasks: schedule.subTasks });
    }
  };

  const toggleExpanded = (planId: number) => {
    const newExpanded = new Set(expandedSchedules)
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId)
    } else {
      newExpanded.add(planId)
    }
    setExpandedSchedules(newExpanded)
  }

  const toggleMobileExpanded = (planId: number) => {
    const nextExpanded = new Set(expandedMobileSchedules)
    if (nextExpanded.has(planId)) {
      nextExpanded.delete(planId)
    } else {
      nextExpanded.add(planId)
    }
    setExpandedMobileSchedules(nextExpanded)
  }

  const handleScheduleClick = (schedule: Schedule) => {
    if (onEditSchedule) {
      onEditSchedule(schedule)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const hour = date.getHours()
    const minute = date.getMinutes()
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    const ampm = hour >= 12 ? "PM" : "AM"
    const minuteStr = minute === 0 ? "00" : minute.toString().padStart(2, "0")
    return `${displayHour}:${minuteStr} ${ampm}`
  }

  const getDuration = (start: string, end: string) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffMins = Math.round(diffMs / (1000 * 60))
    if (diffMins < 60) {
      return `${diffMins}분`
    } else {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`
    }
  }

  // 일정 길이에 따른 아이콘 높이 계산 (분 단위)
  const getIconHeight = (start: string, end: string) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffMins = Math.round(diffMs / (1000 * 60))

    return Math.max(0, diffMins * PIXELS_PER_MINUTE)
  }

  const formatTimeLabel = (totalMinutes: number) => {
    const hour = Math.floor(totalMinutes / 60)
    const minute = totalMinutes % 60
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    const ampm = hour >= 12 ? "PM" : "AM"
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`
  }

  const clampDateRange = (start: Date, end: Date) => {
    const dayStart = new Date(selectedDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const durationMs = end.getTime() - start.getTime()
    let newStart = new Date(start)
    let newEnd = new Date(end)

    if (newStart < dayStart) {
      newStart = new Date(dayStart)
      newEnd = new Date(dayStart.getTime() + durationMs)
    }
    if (newEnd > dayEnd) {
      newEnd = new Date(dayEnd)
      newStart = new Date(dayEnd.getTime() - durationMs)
    }

    return { newStart, newEnd, dayStart, dayEnd }
  }

  const startDrag = (
    event: React.PointerEvent,
    schedule: Schedule,
    mode: "move" | "resize"
  ) => {
    if (schedule.allDay) return
    if (schedule.type === "subgoal" && !schedule.goalId) return
    event.preventDefault()
    event.stopPropagation()

    const startStartTime = new Date(schedule.startDateTime)
    const startEndTime = new Date(schedule.endDateTime)
    dragMetaRef.current = {
      planId: schedule.planId,
      type: schedule.type,
      goalId: schedule.goalId,
      title: schedule.title,
      isCompleted: schedule.isCompleted,
      mode,
      startY: event.clientY,
      startStartTime,
      startEndTime,
      hasMoved: false,
    }
    setDragPreview({
      planId: schedule.planId,
      startDateTime: schedule.startDateTime,
      endDateTime: schedule.endDateTime,
    })
    dragPreviewRef.current = {
      planId: schedule.planId,
      startDateTime: schedule.startDateTime,
      endDateTime: schedule.endDateTime,
    }

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragMetaRef.current) return
      const deltaY = moveEvent.clientY - dragMetaRef.current.startY
      if (Math.abs(deltaY) > 3) {
        dragMetaRef.current.hasMoved = true
      }
      const stepDelta =
        Math.round(deltaY / PIXELS_PER_STEP) * DRAG_STEP_MINUTES
      if (stepDelta === 0) return

      const baseStart = dragMetaRef.current.startStartTime
      const baseEnd = dragMetaRef.current.startEndTime
      let newStart = new Date(baseStart)
      let newEnd = new Date(baseEnd)

      if (dragMetaRef.current.mode === "move") {
        newStart = new Date(baseStart.getTime() + stepDelta * 60000)
        newEnd = new Date(baseEnd.getTime() + stepDelta * 60000)
        const clamped = clampDateRange(newStart, newEnd)
        newStart = clamped.newStart
        newEnd = clamped.newEnd
      } else {
        newEnd = new Date(baseEnd.getTime() + stepDelta * 60000)
        const dayStart = new Date(selectedDate)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(dayStart)
        dayEnd.setDate(dayEnd.getDate() + 1)
        const minEnd = new Date(baseStart.getTime() + DRAG_STEP_MINUTES * 60000)
        if (newEnd < minEnd) newEnd = minEnd
        if (newEnd > dayEnd) newEnd = dayEnd
        newStart = new Date(baseStart)
      }

      setDragPreview({
        planId: dragMetaRef.current.planId,
        startDateTime: toKoreanDateTimeLocalString(newStart),
        endDateTime: toKoreanDateTimeLocalString(newEnd),
      })
      dragPreviewRef.current = {
        planId: dragMetaRef.current.planId,
        startDateTime: toKoreanDateTimeLocalString(newStart),
        endDateTime: toKoreanDateTimeLocalString(newEnd),
      }
    }

    const handlePointerUp = () => {
      if (!dragMetaRef.current) return
      suppressClickRef.current = dragMetaRef.current.hasMoved

      if (dragMetaRef.current.hasMoved && dragPreviewRef.current) {
        if (dragMetaRef.current.type === "subgoal" && dragMetaRef.current.goalId) {
          onUpdateSubGoal(dragMetaRef.current.goalId, dragMetaRef.current.planId, {
            title: dragMetaRef.current.title,
            isCompleted: dragMetaRef.current.isCompleted,
            isTimeSelected: true,
            startDateTime: dragPreviewRef.current.startDateTime,
            endDateTime: dragPreviewRef.current.endDateTime,
          })
        } else {
          onUpdateSchedule(dragMetaRef.current.planId, {
            startDateTime: dragPreviewRef.current.startDateTime,
            endDateTime: dragPreviewRef.current.endDateTime,
            allDay: false,
          })
        }
      }

      dragMetaRef.current = null
      setDragPreview(null)
      dragPreviewRef.current = null
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
  }

  const handleScheduleSelect = (schedule: Schedule) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    handleScheduleClick(schedule)
  }

  // 일정 겹침 감지 함수
  const checkOverlap = (schedule1: Schedule, schedule2: Schedule): boolean => {
    // 하루 종일 일정은 겹침 체크에서 제외
    if (schedule1.allDay || schedule2.allDay) return false
    
    const start1 = new Date(schedule1.startDateTime).getTime()
    const end1 = new Date(schedule1.endDateTime).getTime()
    const start2 = new Date(schedule2.startDateTime).getTime()
    const end2 = new Date(schedule2.endDateTime).getTime()
    
    // 겹침 조건: schedule1의 시작이 schedule2의 끝보다 이전이고, schedule1의 끝이 schedule2의 시작보다 이후
    return start1 < end2 && end1 > start2
  }

  // 각 일정에 대해 겹치는 일정들을 찾는 함수
  const getOverlappingSchedules = (schedule: Schedule, allSchedules: Schedule[]): Schedule[] => {
    return allSchedules.filter(s => 
      s.planId !== schedule.planId && checkOverlap(schedule, s)
    )
  }

  // 하루 종일 일정과 시간 지정 일정 분리
  const allDaySchedules = schedules.filter(s => s.allDay && s.type !== 'subgoal')
  const timedSchedules = schedules
    .filter(s => !s.allDay)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
  const timelineEntries = timedSchedules
    .map((schedule) => {
      const displayTimes = getDisplayTimes(schedule)
      return {
        schedule,
        displayStart: displayTimes.start,
        displayEnd: displayTimes.end,
      }
    })
    .sort((a, b) => new Date(a.displayStart).getTime() - new Date(b.displayStart).getTime())
  const timelineStartMinutes = timelineEntries.length
    ? Math.min(
        ...timelineEntries.map(({ displayStart }) => {
          const start = new Date(displayStart)
          return start.getHours() * 60 + start.getMinutes()
        })
      )
    : 0
  const timelineEndMinutes = timelineEntries.length
    ? Math.max(
        ...timelineEntries.map(({ displayEnd }) => {
          const end = new Date(displayEnd)
          return end.getHours() * 60 + end.getMinutes()
        })
      )
    : 0
  const firstTickMinutes =
    Math.ceil(timelineStartMinutes / TIME_LABEL_INTERVAL_MINUTES) * TIME_LABEL_INTERVAL_MINUTES
  const tickCount =
    timelineEntries.length && timelineEndMinutes >= firstTickMinutes
      ? Math.floor((timelineEndMinutes - firstTickMinutes) / TIME_LABEL_INTERVAL_MINUTES) + 1
      : 0

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-2"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6" ref={timelineRef}>
      {/* 필터 버튼 */}
      <div className="mb-6 flex gap-2">
        <Button
          onClick={() => onFilterTypeChange('all')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
            filterType === 'all'
              ? 'bg-[#ff8b6b] text-white shadow-sm hover:bg-[#ff7a56]'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체
        </Button>
        <Button
          onClick={() => onFilterTypeChange('schedules')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
            filterType === 'schedules'
              ? 'bg-[#ff8b6b] text-white shadow-sm hover:bg-[#ff7a56]'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          일정
        </Button>
        <Button
          onClick={() => onFilterTypeChange('subgoals')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
            filterType === 'subgoals'
              ? 'bg-[#ff8b6b] text-white shadow-sm hover:bg-[#ff7a56]'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          세부목표
        </Button>
      </div>

      {allDaySchedules.length === 0 && timedSchedules.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#D3E6ED] rounded-3xl bg-white/60">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filterType === 'subgoals' ? '세부목표가 없습니다' : '오늘 일정이 없습니다'}
          </h3>
          <p className="text-gray-500">
            {filterType === 'subgoals' ? '첫 번째 세부목표를 등록해보세요' : '첫 번째 일정을 추가해보세요'}
          </p>
        </div>
      ) : (
        <>
          {/* 하루 종일 일정 섹션 */}
          {allDaySchedules.length > 0 && (
            <div className="mb-8 pb-6 border-b-2 border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">하루 종일</h3>
              <div className="flex flex-wrap gap-4">
                {allDaySchedules.map((schedule) => {
                  const scheduleColor = getScheduleColor(schedule.color)
                  const IconComponent = getScheduleIcon(schedule)

                  return (
                    <div
                      key={`${schedule.type}-${schedule.planId}`}
                      data-schedule-id={schedule.planId}
                      className="flex flex-col items-center gap-2 group"
                    >
                      {/* 동그란 아이콘 */}
                      <div className="relative">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: scheduleColor }}
                          onClick={() => handleScheduleClick(schedule)}
                        >
                          <IconComponent className="w-7 h-7" />
                        </div>
                        
                        {/* 완료 체크 버튼 */}
                        <button
                          className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform border-2"
                          style={{ borderColor: schedule.isCompleted ? '#22c55e' : '#e5e7eb' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleComplete(schedule)
                          }}
                        >
                          {schedule.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* 제목 */}
                      <div className="text-center max-w-[80px]">
                        <p
                          className={`text-xs font-medium text-gray-900 truncate ${
                            schedule.isCompleted ? "line-through opacity-60" : ""
                          }`}
                          title={schedule.title}
                        >
                          {schedule.title}
                        </p>
                        {schedule.subTasks && schedule.subTasks.length > 0 && (
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {schedule.subTasks.filter((t) => t.completed).length}/{schedule.subTasks.length}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 시간 지정 일정 타임라인 */}
          {timedSchedules.length > 0 && (
            <div className="relative">
              {tickCount > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: tickCount }).map((_, idx) => {
                    const tickMinutes = firstTickMinutes + idx * TIME_LABEL_INTERVAL_MINUTES
                    const topOffset = (tickMinutes - timelineStartMinutes) * PIXELS_PER_MINUTE
                    return (
                      <div
                        key={`tick-${tickMinutes}`}
                        className="absolute left-0 right-0"
                        style={{ top: `${topOffset}px` }}
                      >
                        <div
                          className="absolute left-0 pr-2 text-[10px] text-gray-400 text-right"
                          style={{ width: `${TIME_COLUMN_WIDTH_REM}rem` }}
                        >
                          {formatTimeLabel(tickMinutes)}
                        </div>
                        <div
                          className="h-px bg-gray-200/70"
                          style={{ marginLeft: `${TIME_COLUMN_WIDTH_REM + TIMELINE_GAP_REM}rem` }}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
              {(() => {
                let previousEnd: Date | null = null

                return timelineEntries.map((entry, index) => {
                  const { schedule, displayStart, displayEnd } = entry
                  const isExpanded = expandedSchedules.has(schedule.planId)
                  const isLast = index === timelineEntries.length - 1
                  const scheduleColor = getScheduleColor(schedule.color)
                  const IconComponent = getScheduleIcon(schedule)
                  const overlappingSchedules = getOverlappingSchedules(schedule, timedSchedules)
                  const hasOverlap = overlappingSchedules.length > 0

                  const startDate = new Date(displayStart)
                  const endDate = new Date(displayEnd)
                  const gapMinutes = previousEnd
                    ? Math.max(0, Math.round((startDate.getTime() - previousEnd.getTime()) / (1000 * 60)))
                    : 0
                  const gapHeight = gapMinutes * PIXELS_PER_MINUTE
                  previousEnd = new Date(Math.max(previousEnd?.getTime() ?? 0, endDate.getTime()))

                  return (
                    <React.Fragment key={`${schedule.type}-${schedule.planId}`}>
                      {gapHeight > 0 && (
                        <div className="flex gap-5 relative" aria-hidden="true">
                          <div className="w-15 flex-shrink-0" style={{ height: `${gapHeight}px` }} />
                          <div className="relative flex flex-col items-center" />
                          <div className="flex-1" style={{ height: `${gapHeight}px` }} />
                        </div>
                      )}
                      <div
                        className="flex gap-5 relative"
                        data-schedule-id={schedule.planId}
                      >
                        {/* 시간 표시 영역 (눈금 라벨 사용) */}
                        <div
                          className="w-15 flex-shrink-0"
                          style={{ height: `${getIconHeight(displayStart, displayEnd)}px` }}
                          aria-hidden="true"
                        />

                        {/* 타임라인 */}
                        <div className="relative flex flex-col items-center">
                          {/* 아이콘 - 일정 길이에 비례하는 높이 */}
                          <div className="relative">
                            <div
                              className={`w-14 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer transition-transform touch-none ${
                                schedule.allDay || schedule.type !== "schedule" ? "hover:scale-105" : "hover:scale-[1.03]"
                              }`}
                              style={{ 
                                backgroundColor: scheduleColor,
                                height: `${getIconHeight(displayStart, displayEnd)}px`,
                                borderRadius: '28px'
                              }}
                      onPointerDown={(event) => startDrag(event, schedule, "move")}
                      onClick={() => handleScheduleSelect(schedule)}
                      title={schedule.allDay ? "일정 보기" : "드래그로 시간 이동"}
                    >
                      <IconComponent className="w-6 h-6" />
                      {!schedule.allDay && (
                        <div
                          className="absolute -bottom-3 left-1/2 h-4 w-10 -translate-x-1/2 rounded-full bg-white shadow-md ring-1 ring-black/10"
                          onPointerDown={(event) => startDrag(event, schedule, "resize")}
                          title="드래그로 길이 조절"
                        />
                              )}
                            </div>
                            
                            {/* 완료 체크 버튼 */}
                            <button
                              className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform border-2 z-10"
                              style={{ borderColor: schedule.isCompleted ? '#22c55e' : '#e5e7eb' }}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleComplete(schedule)
                              }}
                            >
                              {schedule.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-400" />
                              )}
                            </button>

                            {/* 겹침 경고 아이콘 */}
                            {hasOverlap && (
                              <div 
                                className="absolute -bottom-1 -left-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-md z-10"
                                title={`${overlappingSchedules.length}개의 일정과 겹침`}
                              >
                                <AlertTriangle className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 일정 내용 */}
                  <div className="flex-1 pb-8">
                    <div
                      className={`bg-white rounded-2xl p-4 shadow-sm border transition-shadow ${
                        hasOverlap ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200'
                      } cursor-pointer hover:shadow-md`}
                      onClick={() => handleScheduleClick(schedule)}
                    >
                      <div className="md:hidden">
                        <button
                          type="button"
                          className="flex w-full items-start justify-between gap-3 text-left"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMobileExpanded(schedule.planId)
                          }}
                        >
                          <div className="flex-1">
                            <div className={`font-semibold text-gray-900 ${schedule.isCompleted ? "line-through opacity-60" : ""}`}>
                              {schedule.title}
                            </div>
                            <div className="mt-1 text-[11px] text-gray-500">
                              {getDuration(displayStart, displayEnd)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {schedule.subTasks && schedule.subTasks.length > 0 && (
                              <span className="text-[10px] text-gray-500">
                                {schedule.subTasks.filter((t) => t.completed).length}/{schedule.subTasks.length}
                              </span>
                            )}
                            {expandedMobileSchedules.has(schedule.planId) ? (
                              <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {expandedMobileSchedules.has(schedule.planId) && (
                          <div className="mt-3 space-y-3">
                            {hasOverlap && (
                              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
                                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="font-medium">
                                  {overlappingSchedules.length}개의 일정과 시간이 겹칩니다
                                </span>
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {getDuration(displayStart, displayEnd)}
                              {schedule.reminderMinutes && (
                                <span className="ml-2 inline-flex items-center gap-1">
                                  <Bell className="h-3 w-3" />
                                  {schedule.reminderMinutes}분 전
                                </span>
                              )}
                            </div>
                            {schedule.type === "subgoal" && (
                              <div className="text-[11px] text-gray-500">
                                드래그하면 시간 지정 소목표로 전환됩니다
                              </div>
                            )}
                            {schedule.subTasks && schedule.subTasks.length > 0 && (
                              <div className="space-y-2 border-t border-gray-100 pt-3">
                                {schedule.subTasks.map((subTask) => (
                                  <div
                                    key={subTask.id}
                                    className="flex items-center gap-2 text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Checkbox
                                      checked={subTask.completed}
                                      onCheckedChange={() => toggleSubTask(schedule.planId, subTask.id)}
                                      className="h-4 w-4"
                                    />
                                    <span className={`flex-1 ${subTask.completed ? "line-through opacity-60" : ""}`}>
                                      {subTask.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="hidden md:block">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                              <span>{getDuration(displayStart, displayEnd)}</span>
                              {schedule.reminderMinutes && (
                                <div className="flex items-center gap-1">
                                  <Bell className="h-3 w-3" />
                                  <span>{schedule.reminderMinutes}분 전</span>
                                </div>
                              )}
                            </div>
                            <h3
                              className={`font-semibold text-gray-900 ${schedule.isCompleted ? "line-through opacity-60" : ""}`}
                            >
                              {schedule.title}
                            </h3>
                          </div>

                          {schedule.subTasks && schedule.subTasks.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full ml-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleExpanded(schedule.planId)
                              }}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>

                        {/* 서브태스크 */}
                        {schedule.subTasks && schedule.subTasks.length > 0 && (
                          <>
                            {isExpanded ? (
                              <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                                {schedule.subTasks.map((subTask) => (
                                  <div
                                    key={subTask.id}
                                    className="flex items-center gap-2 text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Checkbox
                                      checked={subTask.completed}
                                      onCheckedChange={() => toggleSubTask(schedule.planId, subTask.id)}
                                      className="h-4 w-4"
                                    />
                                    <span className={`flex-1 ${subTask.completed ? "line-through opacity-60" : ""}`}>
                                      {subTask.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                {schedule.subTasks.filter((t) => t.completed).length}/{schedule.subTasks.length} 완료
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                      </div>
                    </React.Fragment>
                  )
                })
              })()}
        </div>
      )}
        </>
      )}
    </div>
  )
})

ScheduleTimeline.displayName = "ScheduleTimeline";
