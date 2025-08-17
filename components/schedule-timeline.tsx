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
  const [currentTime, setCurrentTime] = useState(new Date())
  const [expandedSchedules, setExpandedSchedules] = useState<Set<number>>(new Set())
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
  const [showBackToCurrentTime, setShowBackToCurrentTime] = useState(false)
  const timelineRef = useRef<HTMLDivElement>(null)

  // ref를 통해 외부에서 호출할 수 있는 메서드들
  useImperativeHandle(ref, () => ({
    scrollToCurrentTime
  }))

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // 초기 로딩 시에만 현재 시간으로 스크롤 (일정 업데이트 시에는 스크롤하지 않음)
  useEffect(() => {
    if (!loading && timelineRef.current) {
      // 오늘 날짜인 경우에만 현재 시간으로 스크롤
      const today = new Date()
      const isToday = selectedDate.toDateString() === today.toDateString()
      
      if (isToday) {
        const currentPosition = getCurrentTimePosition()
        const containerHeight = timelineRef.current.clientHeight
        const scrollTo = currentPosition - containerHeight / 2
        
        // 부드러운 스크롤 애니메이션
        timelineRef.current.scrollTo({
          top: Math.max(0, scrollTo),
          behavior: 'smooth'
        })
      }
    }
  }, [loading]) // selectedDate 의존성 제거

  // 날짜가 변경될 때만 현재 시간으로 스크롤
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
  }, [selectedDate]) // 날짜 변경 시에만 실행

  // 스크롤 이벤트 감지하여 현재 시간에서 벗어났는지 확인
  useEffect(() => {
    const timelineElement = timelineRef.current
    if (!timelineElement) return

    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      // 디바운스 적용
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
        
        // 현재 시간이 화면에 보이는지 확인 (더 넉넉한 여유 공간 포함)
        const tolerance = 200 // 픽셀 단위 여유 공간을 늘림
        const isCurrentTimeVisible = 
          currentPosition >= scrollTop - tolerance && 
          currentPosition <= scrollBottom + tolerance
        
        setShowBackToCurrentTime(!isCurrentTimeVisible)
      }, 50) // 50ms 디바운스
    }

    timelineElement.addEventListener('scroll', handleScroll)
    return () => {
      timelineElement.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [selectedDate, currentTime])

  // Generate time slots in 15-minute intervals
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

  // Separate all-day and timed schedules
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
    
    return Math.max(0.25, durationHours) // Minimum 15 minutes
  }

  const getScheduleHeight = (schedule: Schedule) => {
    const duration = getScheduleDuration(schedule)
    const slotHeight = 24 // Height for 15 minutes (32px → 24px로 더 축소)
    const height = duration * 4 * slotHeight // 4 slots per hour
    
    return height
  }

  const getSchedulePosition = (schedule: Schedule) => {
    const startTime = new Date(schedule.startDateTime)
    const startHour = startTime.getHours() + startTime.getMinutes() / 60

    // Snap to 15-minute intervals
    const slotHeight = 24 // Height for 15 minutes (32px → 24px로 더 축소)
    const position = Math.round(startHour * 4) * slotHeight // 4 slots per hour

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

  // 일정 겹침 감지 함수
  const checkScheduleOverlap = (schedule: Schedule, newStartTime: Date, newEndTime: Date) => {
    return timedSchedules.some((otherSchedule) => {
      if (otherSchedule.planId === schedule.planId) return false
      
      const otherStart = new Date(otherSchedule.startDateTime)
      const otherEnd = new Date(otherSchedule.endDateTime)
      
      // 겹침 조건: 새로운 일정의 시작이 다른 일정의 끝보다 이전이고, 새로운 일정의 끝이 다른 일정의 시작보다 이후
      return newStartTime < otherEnd && newEndTime > otherStart
    })
  }

  // 겹치는 일정들 찾기
  const getOverlappingSchedules = (schedule: Schedule, newStartTime: Date, newEndTime: Date) => {
    return timedSchedules.filter((otherSchedule) => {
      if (otherSchedule.planId === schedule.planId) return false
      
      const otherStart = new Date(otherSchedule.startDateTime)
      const otherEnd = new Date(otherSchedule.endDateTime)
      
      return newStartTime < otherEnd && newEndTime > otherStart
    })
  }

  // 모든 겹침 영역 계산
  const getOverlapAreas = () => {
    const overlapAreas: Array<{
      start: Date
      end: Date
      schedules: Schedule[]
    }> = []

    for (let i = 0; i < timedSchedules.length; i++) {
      for (let j = i + 1; j < timedSchedules.length; j++) {
        const schedule1 = timedSchedules[i]
        const schedule2 = timedSchedules[j]
        
        const start1 = new Date(schedule1.startDateTime)
        const end1 = new Date(schedule1.endDateTime)
        const start2 = new Date(schedule2.startDateTime)
        const end2 = new Date(schedule2.endDateTime)
        
        // 겹침 확인
        if (start1 < end2 && end1 > start2) {
          const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()))
          const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()))
          
          // 기존 겹침 영역과 병합
          let merged = false
          for (const area of overlapAreas) {
            if (area.start <= overlapEnd && area.end >= overlapStart) {
              // 겹침 영역이 겹치면 병합
              area.start = new Date(Math.min(area.start.getTime(), overlapStart.getTime()))
              area.end = new Date(Math.max(area.end.getTime(), overlapEnd.getTime()))
              if (!area.schedules.includes(schedule1)) area.schedules.push(schedule1)
              if (!area.schedules.includes(schedule2)) area.schedules.push(schedule2)
              merged = true
              break
            }
          }
          
          if (!merged) {
            overlapAreas.push({
              start: overlapStart,
              end: overlapEnd,
              schedules: [schedule1, schedule2]
            })
          }
        }
      }
    }
    
    return overlapAreas
  }

  const handleMouseDown = (e: React.MouseEvent, planId: number) => {
    if (!timelineRef.current) return
    
    const timelineRect = timelineRef.current.getBoundingClientRect()
    const scrollTop = timelineRef.current.scrollTop
    
    // 클릭한 위치를 타임라인 내부의 상대 위치로 계산
    const clickY = e.clientY - timelineRect.top + scrollTop
    
    // 드래그할 요소의 현재 위치 찾기
    const schedule = timedSchedules.find((s) => s.planId === planId)
    if (!schedule) return
    
    const originalPosition = getSchedulePosition(schedule)
    
    setDraggedItem(planId)
    setDragOffset({
      x: e.clientX - timelineRect.left,
      y: clickY - originalPosition.top, // 클릭한 위치에서 요소의 상대 위치
    })
    setDragPosition({ x: e.clientX, y: e.clientY })
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedItem || !timelineRef.current) return

    const timelineRect = timelineRef.current.getBoundingClientRect()
    const scrollTop = timelineRef.current.scrollTop
    
    // 현재 마우스 위치를 타임라인 내부의 상대 위치로 계산
    const currentY = e.clientY - timelineRect.top + scrollTop
    
    // 드래그 오프셋을 고려한 새로운 위치 계산
    const newY = currentY - dragOffset.y
    const snappedY = snapToGrid(Math.max(0, newY))

    // Update drag position for visual feedback
    setDragPosition({ x: e.clientX, y: e.clientY })

    // Update the dragged item position visually (both icon and bubble)
    const draggedElement = document.querySelector(`[data-schedule-id="${draggedItem}"]`) as HTMLElement
    const draggedContainer = draggedElement?.parentElement as HTMLElement
    
    console.log('=== Drag Update ===')
    console.log('draggedItem:', draggedItem)
    console.log('draggedElement found:', !!draggedElement)
    console.log('draggedContainer found:', !!draggedContainer)
    console.log('draggedElement tagName:', draggedElement?.tagName)
    console.log('draggedContainer tagName:', draggedContainer?.tagName)
    console.log('draggedContainer className:', draggedContainer?.className)
    console.log('draggedContainer children count:', draggedContainer?.children?.length)
    
    // 컨테이너의 모든 자식 요소 확인
    if (draggedContainer) {
      console.log('Container children:')
      Array.from(draggedContainer.children).forEach((child, index) => {
        console.log(`  Child ${index}:`, child.tagName, child.className)
      })
    }
    
    if (draggedElement && draggedContainer) {
      const originalSchedule = timedSchedules.find((s) => s.planId === draggedItem)
      if (originalSchedule) {
        const originalPosition = getSchedulePosition(originalSchedule)
        const transformY = snappedY - originalPosition.top
        
        // 아이콘과 카드 컨테이너 모두 이동 - 높은 z-index로 최상단 표시
        draggedContainer.style.transform = `translateY(${transformY}px)`
        draggedContainer.style.zIndex = "9999"
        draggedContainer.style.opacity = "0.9"
        draggedContainer.style.pointerEvents = "none" // 드래그 중 다른 상호작용 방지
        
        // 카드가 보이도록 추가 스타일 적용
        const cardElement = draggedContainer.children[1] as HTMLElement
        console.log('cardElement found:', !!cardElement)
        console.log('cardElement tagName:', cardElement?.tagName)
        console.log('cardElement className:', cardElement?.className)
        
        if (cardElement) {
          console.log('Before card style - opacity:', cardElement.style.opacity)
          console.log('Before card style - zIndex:', cardElement.style.zIndex)
          
          // opacity와 z-index만 조정, 위치는 원래대로 유지
          cardElement.style.opacity = "1"
          cardElement.style.zIndex = "9999"
          
          console.log('After card style - opacity:', cardElement.style.opacity)
          console.log('After card style - zIndex:', cardElement.style.zIndex)
        } else {
          console.log('cardElement is null or undefined')
        }
        
        console.log('transformY:', transformY, 'zIndex: 9999')
        console.log('container transform applied:', draggedContainer.style.transform)
        console.log('card element found:', !!cardElement)
      } else {
        console.log('originalSchedule not found for planId:', draggedItem)
      }
    } else {
      console.log('draggedElement or draggedContainer not found')
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!draggedItem || !timelineRef.current) return

    const timelineRect = timelineRef.current.getBoundingClientRect()
    const scrollTop = timelineRef.current.scrollTop
    
    // 현재 마우스 위치를 타임라인 내부의 상대 위치로 계산
    const currentY = e.clientY - timelineRect.top + scrollTop
    
    // 드래그 오프셋을 고려한 새로운 위치 계산
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

    // 겹침 확인 (경고만 표시, 업데이트는 허용)
    const hasOverlap = checkScheduleOverlap(schedule, newStart, newEnd)
    const overlappingSchedules = getOverlappingSchedules(schedule, newStart, newEnd)

    // 겹침이 있어도 업데이트 허용 (alert 제거)

    // 겹침 여부와 관계없이 업데이트 허용
    onUpdateSchedule(draggedItem, {
      startDateTime: newStart.toISOString(),
      endDateTime: newEnd.toISOString(),
    })

    // Reset visual state
    const draggedElement = document.querySelector(`[data-schedule-id="${draggedItem}"]`) as HTMLElement
    const draggedContainer = draggedElement?.parentElement as HTMLElement
    
    if (draggedElement && draggedContainer) {
      draggedContainer.style.transform = ""
      draggedContainer.style.zIndex = ""
      draggedContainer.style.opacity = ""
      draggedContainer.style.pointerEvents = ""
      
      // 카드 스타일도 초기화
      const cardElement = draggedContainer.children[1] as HTMLElement
      if (cardElement) {
        cardElement.style.opacity = ""
        cardElement.style.zIndex = ""
      }
    }

    setDraggedItem(null)
    setDragOffset({ x: 0, y: 0 })
    setDragPosition({ x: 0, y: 0 })
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

  // 현재 시간으로 스크롤하는 함수
  const scrollToCurrentTime = () => {
    if (timelineRef.current) {
      const currentPosition = getCurrentTimePosition()
      const containerHeight = timelineRef.current.clientHeight
      const scrollTo = currentPosition - containerHeight / 2
      
      timelineRef.current.scrollTo({
        top: Math.max(0, scrollTo),
        behavior: 'smooth'
      })
      
      // 콜백 함수가 있으면 호출
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
        {/* 현재 시간으로 돌아가기 버튼 */}
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
        {/* All Day Events Section */}
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

        {/* Timeline */}
        <div
          className="relative"
          style={{ height: `${24 * 4 * 24}px` }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Timeline Line */}
          <div className="absolute left-[52px] sm:left-[76px] top-0 bottom-0 w-0.5 bg-slate-300 dark:bg-slate-600"></div>

          {/* Time Labels */}
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

          {/* Overlap Areas */}
          {getOverlapAreas().map((overlap, index) => {
            const startHour = overlap.start.getHours() + overlap.start.getMinutes() / 60
            const endHour = overlap.end.getHours() + overlap.end.getMinutes() / 60
            const startPosition = Math.round(startHour * 4) * 24
            const endPosition = Math.round(endHour * 4) * 24
            const height = endPosition - startPosition
            
            // 겹치는 일정 개수에 따라 투명도 조정
            const overlapCount = overlap.schedules.length
            const opacity = Math.min(0.8, 0.2 + (overlapCount - 2) * 0.2) // 최소 0.2, 최대 0.8
            const borderOpacity = Math.min(0.8, 0.3 + (overlapCount - 2) * 0.1) // 테두리 투명도도 조정
            
            return (
              <div
                key={`overlap-${index}`}
                className="absolute left-[52px] sm:left-[76px] right-2 sm:right-6 border z-5 flex items-center justify-center"
                style={{
                  top: `${startPosition}px`,
                  height: `${height}px`,
                  backgroundColor: `rgba(239, 68, 68, ${opacity})`, // red-500 with dynamic opacity
                  borderColor: `rgba(252, 165, 165, ${borderOpacity})`, // red-300 with dynamic opacity
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

          {/* Current Time Indicator */}
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

          {/* Schedule Icons and Bubbles */}
          {timedSchedules.map((schedule, index) => {
            const position = getSchedulePosition(schedule)
            const isExpanded = expandedSchedules.has(schedule.planId)
            const isEven = index % 2 === 0
            
            // 실제 일정 시간에 맞는 아이콘 높이 계산 - 정확히 일정 높이와 일치
            const iconHeight = Math.max(32, position.height) // 최소 32px, 실제 일정 높이 사용
            const iconWidth = Math.max(32, Math.min(iconHeight * 0.8, 48)) // Width based on height, max 48px

            return (
              <div key={schedule.planId} className="absolute flex items-center" style={{ top: `${position.top}px`, height: `${position.height}px` }}>
                {/* Oval Icon on Timeline */}
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
                    borderRadius: `${Math.min(iconWidth / 2, 20)}px`, // 더 둥글게 조정
                  }}
                >
                  {React.createElement(getScheduleIcon(schedule.icon, schedule.title), {
                    className: `${iconHeight > 48 ? "h-6 w-6" : "h-4 w-4"}`,
                  })}
                </div>

                {/* Speech Bubble */}
                {visibleCards.has(schedule.planId) && (
                  <div
                    className={`absolute left-24 sm:left-32 w-64 sm:w-72 md:w-80 lg:w-72 xl:w-80 ${
                      draggedItem === schedule.planId ? "opacity-75" : ""
                    }`}
                  >
                    {/* Bubble Tail */}
                    <div
                      className="absolute left-0 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent"
                      style={{
                        top: "50%", // 카드 중앙에 맞춤
                        transform: "translateY(-50%)",
                        marginLeft: "-8px", // 꼬리를 더 왼쪽으로 이동
                        borderRightColor:
                          getBubbleColor(schedule.color)
                            .split(" ")
                            .find((c) => c.includes("border-"))
                            ?.replace("border-", "")
                            ?.replace("200", "300") || "#cbd5e1",
                      }}
                    ></div>

                    {/* Bubble Content */}
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

                      {/* Sub Tasks */}
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

                      {/* Sub Tasks Summary */}
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

          {/* Drag Preview */}
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

        {/* Empty State */}
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
