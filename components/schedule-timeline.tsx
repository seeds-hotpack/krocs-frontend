"use client"

import React, { forwardRef, useImperativeHandle } from "react"

import { useState, useRef, useEffect } from "react"
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
} from "lucide-react"
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
  completedAt?: string
  createdAt: string
  updatedAt: string
  reminderMinutes?: number
  icon?: string
  color?: string
  subTasks?: SubTask[]
}

interface ScheduleTimelineProps {
  schedules: Schedule[]
  selectedDate: Date
  onUpdateSchedule: (planId: number, updates: Partial<Schedule>) => void
  onEditSchedule?: (schedule: Schedule) => void
  loading: boolean
  onScrollToCurrentTime?: () => void
}

export const ScheduleTimeline = forwardRef<{ scrollToCurrentTime: () => void }, ScheduleTimelineProps>(({
  schedules,
  selectedDate,
  onUpdateSchedule,
  onEditSchedule,
  loading,
  onScrollToCurrentTime,
}, ref) => {
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [mouseDownPosition, setMouseDownPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date())
  const [expandedSchedules, setExpandedSchedules] = useState<Set<number>>(new Set())
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
  const [showBackToCurrentTime, setShowBackToCurrentTime] = useState(false)
  const timelineRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    scrollToCurrentTime
  }))

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!loading && timelineRef.current) {
      const today = new Date()
      const isToday = selectedDate.toDateString() === today.toDateString()
      
      if (isToday) {
        const currentPosition = getCurrentTimePosition()
        const containerHeight = timelineRef.current.clientHeight
        const scrollTo = currentPosition - containerHeight / 2
        
        timelineRef.current.scrollTo({
          top: Math.max(0, scrollTo),
          behavior: 'smooth'
        })
      }
    }
  }, [loading])

  useEffect(() => {
    if (!loading && timelineRef.current) {
      const today = new Date()
      const isToday = selectedDate.toDateString() === today.toDateString()
      
      if (isToday) {
        const currentPosition = getCurrentTimePosition()
        const containerHeight = timelineRef.current.clientHeight
        const scrollTo = currentPosition - containerHeight / 2
        
        timelineRef.current.scrollTo({
          top: Math.max(0, scrollTo),
          behavior: 'smooth'
        })
      }
    }
  }, [selectedDate])

  useEffect(() => {
    const timelineElement = timelineRef.current
    if (!timelineElement) return

    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const today = new Date()
        const isToday = selectedDate.toDateString() === today.toDateString()
        
        if (!isToday) {
          setShowBackToCurrentTime(false)
          return
        }

        const currentPosition = getCurrentTimePosition()
        const containerHeight = timelineElement.clientHeight
        const scrollTop = timelineElement.scrollTop
        const scrollBottom = scrollTop + containerHeight
        
        const tolerance = 200
        const isCurrentTimeVisible = 
          currentPosition >= scrollTop - tolerance && 
          currentPosition <= scrollBottom + tolerance
        
        setShowBackToCurrentTime(!isCurrentTimeVisible)
      }, 50)
    }

    timelineElement.addEventListener('scroll', handleScroll)
    return () => {
      timelineElement.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [selectedDate, currentTime])

  const timeSlots = []
  for (let hour = 0; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = hour + minute / 60
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
      const ampm = hour >= 12 ? "PM" : "AM"
      const minuteStr = minute === 0 ? "00" : minute.toString().padStart(2, "0")

      timeSlots.push({
        time,
        hour,
        minute,
        label: `${displayHour}:${minuteStr} ${ampm}`,
        shortLabel: minute === 0 ? `${displayHour}:00` : `${displayHour}:${minuteStr}`,
        isHour: minute === 0,
      })
    }
  }

  const allDaySchedules = schedules.filter((s) => s.allDay)
  const timedSchedules = schedules.filter((s) => !s.allDay)

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
  }

  const getScheduleIcon = (iconName?: string, title?: string) => {
    if (iconName && iconMap[iconName as keyof typeof iconMap]) {
      return iconMap[iconName as keyof typeof iconMap]
    }
    const lowerTitle = title?.toLowerCase() || ""
    if (lowerTitle.includes("운동") || lowerTitle.includes("workout")) return Dumbbell
    if (lowerTitle.includes("회의") || lowerTitle.includes("meeting")) return Briefcase
    if (lowerTitle.includes("독서") || lowerTitle.includes("book")) return Book
    if (lowerTitle.includes("휴식") || lowerTitle.includes("break")) return Coffee
    return User
  }

  const getScheduleColor = (color?: string) => {
    const colorMap = {
      blue: "bg-blue-500 border-blue-600 text-white",
      red: "bg-red-500 border-red-600 text-white",
      green: "bg-green-500 border-green-600 text-white",
      purple: "bg-purple-500 border-purple-600 text-white",
      orange: "bg-orange-500 border-orange-600 text-white",
      pink: "bg-pink-500 border-pink-600 text-white",
      yellow: "bg-yellow-500 border-yellow-600 text-white",
      indigo: "bg-indigo-500 border-indigo-600 text-white",
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const getBubbleColor = (color?: string) => {
    const colorMap = {
      blue: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100",
      red: "bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100",
      green: "bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100",
      purple:
        "bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-100",
      orange:
        "bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-100",
      pink: "bg-pink-50 border-pink-200 text-pink-900 dark:bg-pink-950 dark:border-pink-800 dark:text-pink-100",
      yellow:
        "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100",
      indigo:
        "bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-100",
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const getScheduleDuration = (schedule: Schedule) => {
    const start = new Date(schedule.startDateTime)
    const end = new Date(schedule.endDateTime)
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return Math.max(0.25, durationHours)
  }

  const getScheduleHeight = (schedule: Schedule) => {
    const duration = getScheduleDuration(schedule)
    const slotHeight = 24
    const height = duration * 4 * slotHeight
    return height
  }

  const getSchedulePosition = (schedule: Schedule) => {
    const startTime = new Date(schedule.startDateTime)
    const startHour = startTime.getHours() + startTime.getMinutes() / 60
    const slotHeight = 24
    const position = Math.round(startHour * 4) * slotHeight
    return {
      top: position,
      height: getScheduleHeight(schedule),
      exactStartTime: startHour,
    }
  }

  const getCurrentTimePosition = () => {
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60
    const slotHeight = 24
    return currentHour * 4 * slotHeight
  }

  const snapToGrid = (y: number) => {
    const slotHeight = 24
    return Math.round(y / slotHeight) * slotHeight
  }

  const getTimeFromPosition = (position: number) => {
    const slotHeight = 24
    const slotIndex = Math.round(position / slotHeight)
    const hour = Math.floor(slotIndex / 4)
    const minute = (slotIndex % 4) * 15
    return { hour: Math.max(0, Math.min(23, hour)), minute }
  }

  const checkScheduleOverlap = (schedule: Schedule, newStartTime: Date, newEndTime: Date) => {
    return timedSchedules.some((otherSchedule) => {
      if (otherSchedule.planId === schedule.planId) return false
      const otherStart = new Date(otherSchedule.startDateTime)
      const otherEnd = new Date(otherSchedule.endDateTime)
      return newStartTime < otherEnd && newEndTime > otherStart
    })
  }

  const getOverlappingSchedules = (schedule: Schedule, newStartTime: Date, newEndTime: Date) => {
    return timedSchedules.filter((otherSchedule) => {
      if (otherSchedule.planId === schedule.planId) return false
      const otherStart = new Date(otherSchedule.startDateTime)
      const otherEnd = new Date(otherSchedule.endDateTime)
      return newStartTime < otherEnd && newEndTime > otherStart
    })
  }

  const getOverlapAreas = () => {
    const overlapAreas: Array<{ start: Date; end: Date; schedules: Schedule[] }> = []
    for (let i = 0; i < timedSchedules.length; i++) {
      for (let j = i + 1; j < timedSchedules.length; j++) {
        const schedule1 = timedSchedules[i]
        const schedule2 = timedSchedules[j]
        const start1 = new Date(schedule1.startDateTime)
        const end1 = new Date(schedule1.endDateTime)
        const start2 = new Date(schedule2.startDateTime)
        const end2 = new Date(schedule2.endDateTime)
        if (start1 < end2 && end1 > start2) {
          const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()))
          const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()))
          let merged = false
          for (const area of overlapAreas) {
            if (area.start <= overlapEnd && area.end >= overlapStart) {
              area.start = new Date(Math.min(area.start.getTime(), overlapStart.getTime()))
              area.end = new Date(Math.max(area.end.getTime(), overlapEnd.getTime()))
              if (!area.schedules.includes(schedule1)) area.schedules.push(schedule1)
              if (!area.schedules.includes(schedule2)) area.schedules.push(schedule2)
              merged = true
              break
            }
          }
          if (!merged) {
            overlapAreas.push({ start: overlapStart, end: overlapEnd, schedules: [schedule1, schedule2] })
          }
        }
      }
    }
    return overlapAreas
  }

  const handleMouseDown = (e: React.MouseEvent, planId: number) => {
    if (!timelineRef.current) return
    setMouseDownPosition({ x: e.clientX, y: e.clientY });
    const timelineRect = timelineRef.current.getBoundingClientRect()
    const scrollTop = timelineRef.current.scrollTop
    const clickY = e.clientY - timelineRect.top + scrollTop
    const schedule = timedSchedules.find((s) => s.planId === planId)
    if (!schedule) return
    const originalPosition = getSchedulePosition(schedule)
    setDraggedItem(planId)
    setDragOffset({ x: e.clientX - timelineRect.left, y: clickY - originalPosition.top })
    setDragPosition({ x: e.clientX, y: e.clientY })
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedItem || !timelineRef.current) return
    const timelineRect = timelineRef.current.getBoundingClientRect()
    const scrollTop = timelineRef.current.scrollTop
    const currentY = e.clientY - timelineRect.top + scrollTop
    const newY = currentY - dragOffset.y
    const snappedY = snapToGrid(Math.max(0, newY))
    setDragPosition({ x: e.clientX, y: e.clientY })
    const draggedElement = document.querySelector(`[data-schedule-id="${draggedItem}"]`) as HTMLElement
    const draggedContainer = draggedElement?.parentElement as HTMLElement
    if (draggedElement && draggedContainer) {
      const originalSchedule = timedSchedules.find((s) => s.planId === draggedItem)
      if (originalSchedule) {
        const originalPosition = getSchedulePosition(originalSchedule)
        const transformY = snappedY - originalPosition.top
        draggedContainer.style.transform = `translateY(${transformY}px)`
        draggedContainer.style.zIndex = "9999"
        draggedContainer.style.opacity = "0.9"
        draggedContainer.style.pointerEvents = "none"
        const cardElement = draggedContainer.children[1] as HTMLElement
        if (cardElement) {
          cardElement.style.opacity = "1"
          cardElement.style.zIndex = "9999"
        }
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!draggedItem || !timelineRef.current) return

    if (mouseDownPosition) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPosition.x, 2) +
        Math.pow(e.clientY - mouseDownPosition.y, 2)
      );
      if (distance < 5) {
        setDraggedItem(null);
        setMouseDownPosition(null);
        return;
      }
    }

    const timelineRect = timelineRef.current.getBoundingClientRect()
    const scrollTop = timelineRef.current.scrollTop
    const currentY = e.clientY - timelineRect.top + scrollTop
    const newY = currentY - dragOffset.y
    const snappedY = snapToGrid(Math.max(0, newY))
    const schedule = timedSchedules.find((s) => s.planId === draggedItem)
    if (!schedule) return
    const originalStart = new Date(schedule.startDateTime)
    const originalEnd = new Date(schedule.endDateTime)
    const duration = originalEnd.getTime() - originalStart.getTime()
    const newTime = getTimeFromPosition(snappedY)
    const newStart = new Date(selectedDate)
    newStart.setHours(newTime.hour, newTime.minute, 0, 0)
    const newEnd = new Date(newStart.getTime() + duration)
    const hasOverlap = checkScheduleOverlap(schedule, newStart, newEnd)
    const formatToAPIDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    onUpdateSchedule(draggedItem, {
      startDateTime: formatToAPIDate(newStart),
      endDateTime: formatToAPIDate(newEnd),
    })

    const draggedElement = document.querySelector(`[data-schedule-id="${draggedItem}"]`) as HTMLElement
    const draggedContainer = draggedElement?.parentElement as HTMLElement
    if (draggedElement && draggedContainer) {
      draggedContainer.style.transform = ""
      draggedContainer.style.zIndex = ""
      draggedContainer.style.opacity = ""
      draggedContainer.style.pointerEvents = ""
      const cardElement = draggedContainer.children[1] as HTMLElement
      if (cardElement) {
        cardElement.style.opacity = ""
        cardElement.style.zIndex = ""
      }
    }

    setDraggedItem(null)
    setDragOffset({ x: 0, y: 0 })
    setDragPosition({ x: 0, y: 0 })
    setMouseDownPosition(null);
  }

  const toggleComplete = (planId: number, isCompleted: boolean) => {
    onUpdateSchedule(planId, {
      isCompleted: !isCompleted,
      completedAt: !isCompleted ? new Date().toISOString() : undefined,
    })
  }

  const toggleSubTask = (planId: number, subTaskId: string) => {
    const schedule = schedules.find((s) => s.planId === planId)
    if (!schedule?.subTasks) return
    const updatedSubTasks = schedule.subTasks.map((task) =>
      task.id === subTaskId ? { ...task, completed: !task.completed } : task,
    )
    onUpdateSchedule(planId, { subTasks: updatedSubTasks })
  }

  const toggleExpanded = (planId: number) => {
    const newExpanded = new Set(expandedSchedules)
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId)
    } else {
      newExpanded.add(planId)
    }
    setExpandedSchedules(newExpanded)
  }

  const toggleCardVisibility = (planId: number) => {
    const newVisible = new Set(visibleCards)
    if (newVisible.has(planId)) {
      newVisible.delete(planId)
    } else {
      newVisible.add(planId)
    }
    setVisibleCards(newVisible)
  }

  const scrollToCurrentTime = () => {
    if (timelineRef.current) {
      const currentPosition = getCurrentTimePosition()
      const containerHeight = timelineRef.current.clientHeight
      const scrollTo = currentPosition - containerHeight / 2
      timelineRef.current.scrollTo({
        top: Math.max(0, scrollTo),
        behavior: 'smooth'
      })
      if (onScrollToCurrentTime) {
        onScrollToCurrentTime()
      }
    }
  }

  const handleBubbleClick = (schedule: Schedule, e: React.MouseEvent) => {
    e.stopPropagation()
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

  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              <div className="flex-1 h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto" ref={timelineRef}>
      <div className="relative p-6">
        {showBackToCurrentTime && (
          <div className="sticky top-6 z-50 flex justify-center">
            <Button
              onClick={scrollToCurrentTime}
              className="bg-slate-800/80 hover:bg-slate-700/80 text-white backdrop-blur-sm border border-slate-600/50 shadow-lg transition-all duration-200 hover:scale-105"
              size="sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              현재 시간으로 돌아가기
            </Button>
          </div>
        )}
        {allDaySchedules.length > 0 && (
          <div className="mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">하루 종일</h3>
            <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2">
              {allDaySchedules.map((schedule) => (
                <div key={schedule.planId} className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center ${getScheduleColor(schedule.color)} relative cursor-pointer`}
                    onClick={(e) => handleBubbleClick(schedule, e)}
                  >
                    {React.createElement(getScheduleIcon(schedule.icon, schedule.title), { className: "h-4 w-4 sm:h-5 sm:w-5" })}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 bg-white dark:bg-slate-800 rounded-full shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleComplete(schedule.planId, schedule.isCompleted)
                      }}
                    >
                      {schedule.isCompleted ? (
                        <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                      ) : (
                        <Circle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400" />
                      )}
                    </Button>
                  </div>
                  <span
                    className={`text-xs text-center max-w-12 sm:max-w-16 truncate ${
                      schedule.isCompleted ? "line-through text-slate-500" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {schedule.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="relative"
          style={{ height: `${24 * 4 * 24}px` }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="absolute left-[52px] sm:left-[76px] top-0 bottom-0 w-0.5 bg-slate-300 dark:bg-slate-600"></div>

          {timeSlots.map((slot, slotIndex) => (
            <div
              key={`${slot.hour}-${slot.minute}`}
              className="absolute left-0 flex items-center"
              style={{ top: `${slotIndex * 24}px` }}
            >
              <div className="w-12 sm:w-16 text-right pr-2 sm:pr-4">
                {slot.isHour && (
                  <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">{slot.shortLabel}</span>
                )}
              </div>
              <div
                className={`w-1 sm:w-2 h-0.5 ${slot.isHour ? "bg-slate-400 dark:bg-slate-500" : "bg-slate-200 dark:bg-slate-700"}`}
              ></div>
            </div>
          ))}

          {getOverlapAreas().map((overlap, index) => {
            const startHour = overlap.start.getHours() + overlap.start.getMinutes() / 60
            const endHour = overlap.end.getHours() + overlap.end.getMinutes() / 60
            const startPosition = Math.round(startHour * 4) * 24
            const endPosition = Math.round(endHour * 4) * 24
            const height = endPosition - startPosition
            
            const overlapCount = overlap.schedules.length
            const opacity = Math.min(0.8, 0.2 + (overlapCount - 2) * 0.2)
            const borderOpacity = Math.min(0.8, 0.3 + (overlapCount - 2) * 0.1)
            
            return (
              <div
                key={`overlap-${index}`}
                className="absolute left-[52px] sm:left-[76px] right-2 sm:right-6 border z-5 flex items-center justify-center"
                style={{
                  top: `${startPosition}px`,
                  height: `${height}px`,
                  backgroundColor: `rgba(239, 68, 68, ${opacity})`,
                  borderColor: `rgba(252, 165, 165, ${borderOpacity})`,
                  borderWidth: '1px',
                }}
                title={`겹치는 일정 (${overlapCount}개): ${overlap.schedules.map(s => s.title).join(', ')}`}
              >
                <div className="bg-white/90 dark:bg-slate-800/90 px-2 py-1 rounded text-xs font-medium text-red-600 dark:text-red-400 shadow-sm">
                  일정이 겹쳐있습니다! 조정해주세요!
                </div>
              </div>
            )
          })}

          {currentTime.toDateString() === selectedDate.toDateString() && (
            <div
              className="absolute left-[52px] sm:left-[76px] right-2 sm:right-6 h-0.5 bg-red-500 z-20 flex items-center"
              style={{ top: `${getCurrentTimePosition()}px` }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5"></div>
              <div className="ml-2 text-xs text-red-600 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm">
                {currentTime.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          )}

          {timedSchedules.map((schedule, index) => {
            const position = getSchedulePosition(schedule)
            const isExpanded = expandedSchedules.has(schedule.planId)
            const isEven = index % 2 === 0
            
            const iconHeight = Math.max(32, position.height)
            const iconWidth = Math.max(32, Math.min(iconHeight * 0.8, 48))

            return (
              <div key={schedule.planId} className="absolute flex items-center" style={{ top: `${position.top}px`, height: `${position.height}px` }}>
                <div
                  className={`absolute left-[52px] sm:left-[76px] border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${getScheduleColor(schedule.color)} ${
                    draggedItem === schedule.planId ? "scale-110 shadow-lg" : "hover:scale-105"
                  } z-10`}
                  data-schedule-id={schedule.planId}
                  onMouseDown={(e) => handleMouseDown(e, schedule.planId)}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleCardVisibility(schedule.planId)
                  }}
                  style={{
                    transform: "translateX(-50%)",
                    width: `${iconWidth}px`,
                    height: `${iconHeight}px`,
                    borderRadius: `${Math.min(iconWidth / 2, 20)}px`,
                  }}
                >
                  {React.createElement(getScheduleIcon(schedule.icon, schedule.title), {
                    className: `${iconHeight > 48 ? "h-6 w-6" : "h-4 w-4"}`,
                  })}
                </div>

                {visibleCards.has(schedule.planId) && (
                  <div
                    className={`absolute left-24 sm:left-32 w-64 sm:w-72 md:w-80 lg:w-72 xl:w-80 ${
                      draggedItem === schedule.planId ? "opacity-75" : ""
                    }`}
                  >
                    <div
                      className="absolute left-0 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent"
                      style={{
                        top: "50%",
                        transform: "translateY(-50%)",
                        marginLeft: "-8px",
                        borderRightColor:
                          getBubbleColor(schedule.color)
                            .split(" ")
                            .find((c) => c.includes("border-"))
                            ?.replace("border-", "")
                            ?.replace("200", "300") || "#cbd5e1",
                      }}
                    ></div>

                    <div
                      className={`rounded-lg border-2 p-3 sm:p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${getBubbleColor(schedule.color)}`}
                      onClick={(e) => handleBubbleClick(schedule, e)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs mb-1">
                            <span className="truncate">
                              {formatTime(schedule.startDateTime)} - {formatTime(schedule.endDateTime)} (
                              {getDuration(schedule.startDateTime, schedule.endDateTime)})
                            </span>
                            {schedule.reminderMinutes && (
                              <div className="flex items-center gap-1">
                                <Bell className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{schedule.reminderMinutes}분 전</span>
                              </div>
                            )}
                          </div>
                          <h3 className={`font-medium text-sm ${schedule.isCompleted ? "line-through opacity-60" : ""} truncate`}>
                            {schedule.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          {schedule.subTasks && schedule.subTasks.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleExpanded(schedule.planId)
                              }}
                            >
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleComplete(schedule.planId, schedule.isCompleted)
                            }}
                          >
                            {schedule.isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 opacity-60" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {schedule.subTasks && schedule.subTasks.length > 0 && isExpanded && (
                        <div className="mt-3 space-y-2 border-t border-black/10 dark:border-white/10 pt-2">
                          {schedule.subTasks.map((subTask) => (
                            <div key={subTask.id} className="flex items-center gap-2 text-xs">
                              <Checkbox
                                checked={subTask.completed}
                                onCheckedChange={() => toggleSubTask(schedule.planId, subTask.id)}
                                className="h-3 w-3"
                              />
                              <span className={`flex-1 ${subTask.completed ? "line-through opacity-60" : ""}`}>
                                {subTask.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {schedule.subTasks && schedule.subTasks.length > 0 && !isExpanded && (
                        <div className="text-xs opacity-60 mt-1">
                          {schedule.subTasks.filter((t) => t.completed).length}/{schedule.subTasks.length} 완료
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {draggedItem && (
            <div
              className="fixed pointer-events-none z-50 opacity-75"
              style={{
                left: dragPosition.x - 20,
                top: dragPosition.y - 20,
              }}
            >
              <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          )}
        </div>

        {timedSchedules.length === 0 && allDaySchedules.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">오늘 일정이 없습니다</h3>
            <p className="text-slate-600 dark:text-slate-400">첫 번째 일정을 추가해보세요</p>
          </div>
        )}
      </div>
    </div>
  )
})