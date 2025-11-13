"use client"

import React, { forwardRef, useImperativeHandle, useCallback, useState, useRef, useEffect } from "react"
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
  Clock,
  Trash2,
  Target,
} from "lucide-react"
import { updateSubPlan } from "@/api/subplan";
import { updateSubGoal } from "@/api/subgoals";
import { Checkbox } from "@/components/ui/checkbox"

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
  onUpdateSubGoal: (goalId: number, subGoalId: number, updates: { isCompleted: boolean, title: string }) => void;
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
      red: "#f44336",
      green: "#4caf50",
      purple: "#9c27b0",
      orange: "#ff9800",
      pink: "#e91e63",
      yellow: "#ffeb3b",
      indigo: "#607d8b",
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
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
        completedAt: !schedule.isCompleted ? new Date().toISOString() : undefined,
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
    
    // 최소 56px (기본), 15분당 +14px
    // 30분 = 56px, 1시간 = 84px, 2시간 = 140px
    const baseHeight = 56
    const additionalHeight = Math.floor(diffMins / 15) * 7
    return Math.min(baseHeight + additionalHeight, 200) // 최대 200px
  }

  // 하루 종일 일정과 시간 지정 일정 분리
  const allDaySchedules = schedules.filter(s => s.allDay)
  const timedSchedules = schedules
    .filter(s => !s.allDay)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())

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

  if (allDaySchedules.length === 0 && timedSchedules.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">오늘 일정이 없습니다</h3>
        <p className="text-gray-500">첫 번째 일정을 추가해보세요</p>
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
                  key={schedule.planId}
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

                    {/* 세부목표 배지 */}
                    {schedule.type === 'subgoal'}
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
          {timedSchedules.map((schedule, index) => {
            const isExpanded = expandedSchedules.has(schedule.planId)
            const isLast = index === timedSchedules.length - 1
            const scheduleColor = getScheduleColor(schedule.color)
            const IconComponent = getScheduleIcon(schedule)

            return (
              <div
                key={schedule.planId}
                className="flex gap-6 relative"
                data-schedule-id={schedule.planId}
              >
                {/* 시간 표시 - 시작/종료 시간 모두 표시 */}
                <div className="w-24 flex-shrink-0 pt-2">
                  <div className="text-xs font-semibold text-gray-900">
                    {formatTime(schedule.startDateTime)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(schedule.endDateTime)}
                  </div>
                </div>

                {/* 타임라인 */}
                <div className="relative flex flex-col items-center">
                  {/* 아이콘 - 일정 길이에 비례하는 높이 */}
                  <div className="relative">
                    <div
                      className="w-14 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer hover:scale-105 transition-transform"
                      style={{ 
                        backgroundColor: scheduleColor,
                        height: `${getIconHeight(schedule.startDateTime, schedule.endDateTime)}px`,
                        borderRadius: '28px' // w-14의 절반
                      }}
                      onClick={() => handleScheduleClick(schedule)}
                    >
                      <IconComponent className="w-6 h-6" />
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

                    {/* 세부목표 배지 */}
                    {schedule.type === 'subgoal'}
                  </div>

                  {/* 연결선 */}
                  {!isLast && (
                    <div
                      className="w-0.5 flex-1 mt-2 mb-2"
                      style={{ backgroundColor: scheduleColor, minHeight: '40px' }}
                    />
                  )}
                </div>

                {/* 일정 내용 */}
                <div className="flex-1 pb-8">
                  <div
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleScheduleClick(schedule)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <span>
                            {formatTime(schedule.startDateTime)} - {formatTime(schedule.endDateTime)}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>{getDuration(schedule.startDateTime, schedule.endDateTime)}</span>
                          {schedule.type === 'subgoal' && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                세부목표
                              </span>
                            </>
                          )}
                          {schedule.reminderMinutes && (
                            <>
                              <span className="text-gray-400">•</span>
                              <div className="flex items-center gap-1">
                                <Bell className="h-3 w-3" />
                                <span>{schedule.reminderMinutes}분 전</span>
                              </div>
                            </>
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
            )
          })}
        </div>
      )}
    </div>
  )
})

ScheduleTimeline.displayName = "ScheduleTimeline";
