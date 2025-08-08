"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, ChevronDown, ChevronUp, Plus, Settings, Bell, Sun, Moon, Monitor, Menu, X } from "lucide-react"
import { ScheduleTimeline } from "@/components/schedule-timeline"
import { ScheduleCalendar } from "@/components/schedule-calendar"
import { ScheduleForm } from "@/components/schedule-form"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

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

interface SubTask {
  id: string
  title: string
  completed: boolean
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const timelineRef = useRef<{ scrollToCurrentTime: () => void }>(null)
  const { theme, setTheme } = useTheme()

  // Mock data
  const mockSchedules: Schedule[] = [
    {
      planId: 1,
      title: "아침 운동",
      startDateTime: `${selectedDate.toISOString().split('T')[0]}T08:00:00`,
      endDateTime: `${selectedDate.toISOString().split('T')[0]}T10:00:00`, // 2시간
      allDay: false,
      isCompleted: true,
      completedAt: `${selectedDate.toISOString().split('T')[0]}T09:00:00`,
      reminderMinutes: 10,
      icon: "Dumbbell",
      color: "green",
      subTasks: [
        { id: "1", title: "스트레칭", completed: true },
        { id: "2", title: "유산소 운동", completed: true },
        { id: "3", title: "근력 운동", completed: false },
      ],
      createdAt: "2025-08-03T06:44:59.765Z",
      updatedAt: "2025-08-03T06:44:59.765Z",
    },
    {
      planId: 2,
      title: "팀 회의",
      startDateTime: `${selectedDate.toISOString().split('T')[0]}T10:30:00`,
      endDateTime: `${selectedDate.toISOString().split('T')[0]}T12:00:00`, // 1.5시간
      allDay: false,
      isCompleted: false,
      reminderMinutes: 15,
      icon: "Briefcase",
      color: "blue",
      subTasks: [
        { id: "4", title: "프레젠테이션 준비", completed: true },
        { id: "5", title: "회의록 작성", completed: false },
      ],
      createdAt: "2025-08-03T06:44:59.765Z",
      updatedAt: "2025-08-03T06:44:59.765Z",
    },
    {
      planId: 3,
      title: "점심 시간",
      startDateTime: `${selectedDate.toISOString().split('T')[0]}T12:00:00`,
      endDateTime: `${selectedDate.toISOString().split('T')[0]}T13:00:00`,
      allDay: false,
      isCompleted: false,
      icon: "Coffee",
      color: "orange",
      createdAt: "2025-08-03T06:44:59.765Z",
      updatedAt: "2025-08-03T06:44:59.765Z",
    },
    {
      planId: 4,
      title: "프로젝트 검토",
      startDateTime: `${selectedDate.toISOString().split('T')[0]}T15:00:00`,
      endDateTime: `${selectedDate.toISOString().split('T')[0]}T18:00:00`, // 3시간
      allDay: false,
      isCompleted: false,
      reminderMinutes: 30,
      icon: "Book",
      color: "purple",
      subTasks: [
        { id: "6", title: "코드 리뷰", completed: false },
        { id: "7", title: "테스트 케이스 작성", completed: false },
        { id: "8", title: "문서 업데이트", completed: false },
      ],
      createdAt: "2025-08-03T06:44:59.765Z",
      updatedAt: "2025-08-03T06:44:59.765Z",
    },
    {
      planId: 5,
      title: "생일 파티",
      startDateTime: `${selectedDate.toISOString().split('T')[0]}T00:00:00`,
      endDateTime: `${selectedDate.toISOString().split('T')[0]}T23:59:59`,
      allDay: true,
      isCompleted: false,
      reminderMinutes: 60,
      icon: "Heart",
      color: "pink",
      createdAt: "2025-08-03T06:44:59.765Z",
      updatedAt: "2025-08-03T06:44:59.765Z",
    },
  ]

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setSchedules(mockSchedules)
      setLoading(false)
    }, 1000)
  }, [])

  // 화면 크기 변경 시 사이드바 상태 조정
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg 브레이크포인트
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const createSchedule = async (scheduleData: Omit<Schedule, "planId" | "isCompleted" | "createdAt" | "updatedAt">) => {
    const newSchedule: Schedule = {
      ...scheduleData,
      planId: Date.now(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setSchedules((prev) => [...prev, newSchedule])
    setShowForm(false)
    setEditingSchedule(null)
  }

  const updateSchedule = async (planId: number, updates: Partial<Schedule>) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.planId === planId ? { ...schedule, ...updates, updatedAt: new Date().toISOString() } : schedule,
      ),
    )
  }

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setShowForm(true)
  }

  const handleUpdateSchedule = (scheduleData: Omit<Schedule, "planId" | "isCompleted" | "createdAt" | "updatedAt">) => {
    if (editingSchedule) {
      updateSchedule(editingSchedule.planId, scheduleData)
      setShowForm(false)
      setEditingSchedule(null)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  const todaySchedules = schedules
    .filter((schedule) => {
      // 시간대 문제를 방지하기 위해 날짜만 비교
      const scheduleDate = new Date(schedule.startDateTime)
      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      
      return scheduleDate.getFullYear() === selectedDateOnly.getFullYear() &&
             scheduleDate.getMonth() === selectedDateOnly.getMonth() &&
             scheduleDate.getDate() === selectedDateOnly.getDate()
    })
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`fixed lg:static inset-y-0 left-0 z-40 w-80 lg:w-72 xl:w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                ← 목표로 돌아가기
              </Link>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-700">
                      {theme === "light" ? (
                        <Sun className="h-4 w-4" />
                      ) : theme === "dark" ? (
                        <Moon className="h-4 w-4" />
                      ) : (
                        <Monitor className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="h-4 w-4 mr-2" />
                      라이트 모드
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon className="h-4 w-4 mr-2" />
                      다크 모드
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <Monitor className="h-4 w-4 mr-2" />
                      시스템 설정
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">일정 관리</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{formatDate(selectedDate)}</p>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <Button
              onClick={() => {
                setEditingSchedule(null)
                setShowForm(true)
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />새 일정 추가
            </Button>
          </div>

          {/* Today's Summary */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">오늘의 요약</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">전체 일정</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{todaySchedules.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">완료됨</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {todaySchedules.filter((s) => s.isCompleted).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">남은 일정</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {todaySchedules.filter((s) => !s.isCompleted).length}
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">다가오는 일정</h3>
            <div className="space-y-3">
              {todaySchedules
                .filter((schedule) => !schedule.isCompleted)
                .slice(0, 5)
                .map((schedule) => (
                  <Card
                    key={schedule.planId}
                    className="border-0 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-700 cursor-pointer"
                    onClick={() => handleEditSchedule(schedule)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {schedule.title}
                            </p>
                            {schedule.reminderMinutes && <Bell className="h-3 w-3 text-blue-500 flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            {schedule.allDay ? (
                              <span>하루 종일</span>
                            ) : (
                              <span>
                                {new Date(schedule.startDateTime).toLocaleTimeString("ko-KR", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            )}
                            {schedule.reminderMinutes && (
                              <span className="text-blue-600">• {schedule.reminderMinutes}분 전 알림</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {selectedDate.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                  })}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Calendar className="h-4 w-4" />
                  {showCalendar ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedDate(new Date())
                  }}
                >
                  오늘
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar View (Collapsible) */}
          {showCalendar && (
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <ScheduleCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                schedules={schedules}
                onClose={() => setShowCalendar(false)}
              />
            </div>
          )}

          {/* Timeline View */}
          <div className="flex-1 overflow-hidden">
            <ScheduleTimeline
              ref={timelineRef}
              schedules={todaySchedules}
              selectedDate={selectedDate}
              onUpdateSchedule={updateSchedule}
              onEditSchedule={handleEditSchedule}
              loading={loading}
              onScrollToCurrentTime={() => {
                // 현재 시간으로 스크롤 완료 후 실행할 로직이 있다면 여기에 추가
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Schedule Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <ScheduleForm
              schedule={editingSchedule}
              onSubmit={editingSchedule ? handleUpdateSchedule : createSchedule}
              onCancel={() => {
                setShowForm(false)
                setEditingSchedule(null)
              }}
              defaultDate={selectedDate}
            />
          </div>
        </div>
      )}
    </div>
  )
}
