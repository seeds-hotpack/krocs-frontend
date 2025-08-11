"use client"

import { getGoals, Goal } from '../api/goals';
import { update_Goal as updateGoalApi } from '../api/updateGoal'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Calendar, Clock, Target, TrendingUp, CheckCircle2, Sun, Moon, Monitor } from "lucide-react"
import { GoalForm } from "@/components/goal-form"
import { GoalDetail } from "@/components/goal-detail"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { ScheduleCalendar } from "@/components/schedule-calendar"



export default function GoalManagementApp() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(false)
  const { theme, setTheme } = useTheme()
   const [error, setError] = useState<string | null>(null)
   const [selectedDate, setSelectedDate] = useState(new Date())
   const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const fetchGoals = async (date: Date) => {
    setLoading(true)
    setError(null)
    try {
      // 로컬 타임존 기준으로 YYYY-MM-DD 포맷 만들기
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const formattedDate = `${year}-${month}-${day}`

      const data = await getGoals(1, formattedDate)
      setGoals(data)
    } catch (err) {
      setError("목표를 불러오는데 실패했습니다.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createGoal = async (goalData: Omit<Goal, "goalId" | "completed" | "subGoals" | "createdAt" | "updatedAt">) => {
    // Mock API call
    const newGoal: Goal = {
      ...goalData,
      goalId: Date.now(),
      completed: false,
      subGoals: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setGoals((prev) => [...prev, newGoal])
    setIsFormOpen(false)
  }

  const updateGoal = async (goalId: number, goalData: Partial<Goal>) => {
    setLoading(true)
    try {
      const updateData = {
        title: goalData.title ?? "",
        priority: goalData.priority ?? "MEDIUM",
        startDate: goalData.startDate ?? "",
        endDate: goalData.endDate ?? "",
        isCompleted: goalData.completed ?? false,
      }
      // userId 1로 고정
      await updateGoalApi(goalId, 1, updateData)
      // 수정 후 최신 데이터 다시 불러오기
      await fetchGoals(selectedDate)
      setEditingGoal(null)
      setIsFormOpen(false)
    } catch (err) {
      setError("목표 수정에 실패했습니다.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteGoal = async (goalId: number) => {
    setGoals((prev) => prev.filter((goal) => goal.goalId !== goalId))
    if (selectedGoal?.goalId === goalId) {
      setSelectedGoal(null)
    }
  }

  const toggleGoalCompletion = async (goalId: number) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.goalId === goalId ? { ...goal, completed: !goal.completed, updatedAt: new Date().toISOString() } : goal,
      ),
    )
  }

  // 날짜가 바뀔 때마다 fetchGoals 호출
  useEffect(() => {
    fetchGoals(selectedDate)
  }, [selectedDate])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-slate-900 text-white"
      case "MEDIUM":
        return "bg-slate-600 text-white"
      case "LOW":
        return "bg-slate-400 text-white"
      default:
        return "bg-slate-300 text-slate-700"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "High"
      case "MEDIUM":
        return "Medium"
      case "LOW":
        return "Low"
      default:
        return priority
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getProgressPercentage = (goal: Goal) => {
    if (goal.subGoals.length === 0) return goal.completed ? 100 : 0
    const completed = goal.subGoals.filter((sg) => sg.completed).length
    return (completed / goal.subGoals.length) * 100
  }

  // 날짜 비교 함수 (연,월,일만 비교)
  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()

  // 실제로 화면에 보이는 목표만 필터링
  // const visibleGoals = goals.filter(goal => isSameDay(new Date(goal.startDate), selectedDate))
  const totalGoals = goals.length
  const completedGoals = goals.filter(goal => goal.completed).length

  if (selectedGoal) {
    return (
      <GoalDetail
        goal={selectedGoal}
        onBack={() => setSelectedGoal(null)}
        onUpdate={(updatedGoal) => {
          updateGoal(selectedGoal.goalId, updatedGoal)
          setSelectedGoal({ ...selectedGoal, ...updatedGoal })
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Goals</h1>
            <p className="text-slate-600 dark:text-slate-400">Track and achieve your objectives</p>
          </div>
          <div className="flex items-center gap-3 relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 bg-transparent"
                >
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
            <Link href="/schedule">
              <Button
                variant="outline"
                className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 bg-transparent"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 bg-transparent"
              onClick={() => setIsCalendarOpen((prev) => !prev)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {selectedDate.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })}
            </Button>
            {isCalendarOpen && (
              <div className="absolute right-0 top-12 z-50 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                <ScheduleCalendar
                  selectedDate={selectedDate}
                  onDateSelect={(date) => {
                    setSelectedDate(date)
                    setIsCalendarOpen(false)
                  }}
                  schedules={[]} // 필요시 일정 데이터 전달
                  onClose={() => setIsCalendarOpen(false)}
                />
              </div>
            )}
            <Button
              onClick={() => {
                setEditingGoal(null)
                setIsFormOpen(true)
              }}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-6 py-2 rounded-lg font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Goals</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalGoals}</p>
                </div>
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Completed</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{completedGoals}</p>
                </div>
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Success Rate</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    {totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%
                  </p>
                </div>
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isFormOpen && (
          <div className="mb-8">
            <GoalForm
              goal={editingGoal}
              onSubmit={editingGoal ? (data) => updateGoal(editingGoal.goalId, data) : createGoal}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingGoal(null)
              }}
            />
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-sm dark:bg-slate-800">
                <CardHeader className="pb-4">
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-9 bg-slate-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <Card className="text-center py-16 border-0 shadow-sm dark:bg-slate-800">
            <CardContent>
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-slate-400 dark:text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No goals yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first goal to get started</p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-6 py-2 rounded-lg font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map(goal => {
                const progress = getProgressPercentage(goal)
                return (
                  <Card
                    key={goal.goalId}
                    className={`group cursor-pointer transition-all duration-200 hover:shadow-md border-0 shadow-sm ${
                      goal.completed ? "bg-slate-50 dark:bg-slate-800" : "bg-white dark:bg-slate-900"
                    }`}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <CardTitle
                          className={`text-lg font-medium leading-tight ${
                            goal.completed
                              ? "line-through text-slate-500 dark:text-slate-400"
                              : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {goal.title}
                        </CardTitle>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingGoal(goal)
                              setIsFormOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteGoal(goal.goalId)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                          {getPriorityText(goal.priority)}
                        </span>
                        {goal.completed && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-slate-900 text-white">Done</span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 dark:bg-slate-700">
                          <div
                            className="bg-slate-900 h-1.5 rounded-full transition-all duration-300 dark:bg-slate-100"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{goal.duration} days</span>
                        </div>
                        {goal.subGoals.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <span>
                              {goal.subGoals.filter((sg) => sg.completed).length}/{goal.subGoals.length} subtasks
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        variant={goal.completed ? "secondary" : "default"}
                        size="sm"
                        className={`w-full font-medium ${
                          goal.completed
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300"
                            : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleGoalCompletion(goal.goalId)
                        }}
                      >
                        {goal.completed ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          "Mark Complete"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
