"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  X,
  Clock,
  Calendar,
  Target,
  Bell,
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
  Palette,
} from "lucide-react"

interface Goal {
  goalId: number
  title: string
  priority: string
}

interface SubTask {
  id: string
  title: string
  completed: boolean
}

interface Schedule {
  planId?: number
  title: string
  startDateTime: string
  endDateTime: string
  allDay: boolean
  goalId?: number
  subGoalId?: number
  reminderMinutes?: number
  icon?: string
  color?: string
  subTasks?: SubTask[]
}

interface ScheduleFormProps {
  schedule?: Schedule | null
  onSubmit: (data: Omit<Schedule, "planId" | "isCompleted" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
  defaultDate: Date
}

const iconOptions = [
  { value: "User", icon: User, label: "사용자" },
  { value: "Briefcase", icon: Briefcase, label: "업무" },
  { value: "Book", icon: Book, label: "학습" },
  { value: "Dumbbell", icon: Dumbbell, label: "운동" },
  { value: "Coffee", icon: Coffee, label: "휴식" },
  { value: "Heart", icon: Heart, label: "건강" },
  { value: "Star", icon: Star, label: "중요" },
  { value: "Zap", icon: Zap, label: "에너지" },
  { value: "Music", icon: Music, label: "음악" },
  { value: "Camera", icon: Camera, label: "사진" },
  { value: "Gamepad2", icon: Gamepad2, label: "게임" },
]

const colorOptions = [
  { value: "blue", label: "파랑", class: "bg-blue-100 text-blue-600 border-blue-200" },
  { value: "red", label: "빨강", class: "bg-red-100 text-red-600 border-red-200" },
  { value: "green", label: "초록", class: "bg-green-100 text-green-600 border-green-200" },
  { value: "purple", label: "보라", class: "bg-purple-100 text-purple-600 border-purple-200" },
  { value: "orange", label: "주황", class: "bg-orange-100 text-orange-600 border-orange-200" },
  { value: "pink", label: "분홍", class: "bg-pink-100 text-pink-600 border-pink-200" },
  { value: "yellow", label: "노랑", class: "bg-yellow-100 text-yellow-600 border-yellow-200" },
  { value: "indigo", label: "남색", class: "bg-indigo-100 text-indigo-600 border-indigo-200" },
]

export function ScheduleForm({ schedule, onSubmit, onCancel, defaultDate }: ScheduleFormProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [subTasks, setSubTasks] = useState<SubTask[]>(schedule?.subTasks || [])
  const [newSubTask, setNewSubTask] = useState("")
  const [formData, setFormData] = useState({
    title: schedule?.title || "",
    startDate: schedule?.startDateTime
      ? new Date(schedule.startDateTime).toISOString().split("T")[0]
      : defaultDate.toISOString().split("T")[0],
    endDate: schedule?.endDateTime
      ? new Date(schedule.endDateTime).toISOString().split("T")[0]
      : defaultDate.toISOString().split("T")[0],
    startDateTime: schedule?.startDateTime
      ? (() => {
          const date = new Date(schedule.startDateTime)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          return `${year}-${month}-${day}T${hours}:${minutes}`
        })()
      : (() => {
          const year = defaultDate.getFullYear()
          const month = String(defaultDate.getMonth() + 1).padStart(2, '0')
          const day = String(defaultDate.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}T09:00`
        })(),
    endDateTime: schedule?.endDateTime
      ? (() => {
          const date = new Date(schedule.endDateTime)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          return `${year}-${month}-${day}T${hours}:${minutes}`
        })()
      : (() => {
          const year = defaultDate.getFullYear()
          const month = String(defaultDate.getMonth() + 1).padStart(2, '0')
          const day = String(defaultDate.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}T10:00`
        })(),
    allDay: schedule?.allDay || false,
    goalId: schedule?.goalId,
    reminderMinutes: schedule?.reminderMinutes,
    icon: schedule?.icon || "User",
    color: schedule?.color || "blue",
  })

  // Mock goals data
  useEffect(() => {
    const mockGoals: Goal[] = [
      { goalId: 1, title: "프로젝트 완료하기", priority: "HIGH" },
      { goalId: 2, title: "운동 루틴 만들기", priority: "MEDIUM" },
      { goalId: 3, title: "독서 습관 만들기", priority: "LOW" },
    ]
    setGoals(mockGoals)
  }, [])

  const addSubTask = () => {
    if (newSubTask.trim()) {
      const subTask: SubTask = {
        id: Date.now().toString(),
        title: newSubTask.trim(),
        completed: false,
      }
      setSubTasks([...subTasks, subTask])
      setNewSubTask("")
    }
  }

  const removeSubTask = (id: string) => {
    setSubTasks(subTasks.filter((task) => task.id !== id))
  }

  const toggleSubTask = (id: string) => {
    setSubTasks(subTasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // datetime-local 입력값을 올바른 ISO 문자열로 변환
    const formatDateTime = (dateTimeString: string) => {
      // datetime-local 입력은 "YYYY-MM-DDTHH:MM" 형식
      // 로컬 시간을 그대로 유지하여 ISO 형식으로 변환
      const date = new Date(dateTimeString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      // 로컬 시간대를 유지하면서 ISO 형식으로 변환 (Z 대신 로컬 시간대 오프셋 사용)
      const timezoneOffset = date.getTimezoneOffset()
      const offsetHours = Math.abs(Math.floor(timezoneOffset / 60))
      const offsetMinutes = Math.abs(timezoneOffset % 60)
      const offsetSign = timezoneOffset > 0 ? '-' : '+'
      const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`
      
      return `${year}-${month}-${day}T${hours}:${minutes}:00${offsetString}`
    }

    // 로컬 시간대 오프셋을 동적으로 계산
    const getLocalTimezoneOffset = () => {
      const date = new Date()
      const timezoneOffset = date.getTimezoneOffset()
      const offsetHours = Math.abs(Math.floor(timezoneOffset / 60))
      const offsetMinutes = Math.abs(timezoneOffset % 60)
      const offsetSign = timezoneOffset > 0 ? '-' : '+'
      return `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`
    }

    const timezoneOffset = getLocalTimezoneOffset()

    onSubmit({
      title: formData.title,
      startDateTime: formData.allDay
        ? `${formData.startDate}T00:00:00${timezoneOffset}`
        : formatDateTime(formData.startDateTime),
      endDateTime: formData.allDay
        ? `${formData.endDate}T23:59:59${timezoneOffset}`
        : formatDateTime(formData.endDateTime),
      allDay: formData.allDay,
      goalId: formData.goalId,
      reminderMinutes: formData.reminderMinutes,
      icon: formData.icon,
      color: formData.color,
      subTasks: subTasks.length > 0 ? subTasks : undefined,
    })
  }

  const handleAllDayChange = (checked: boolean) => {
    const currentStartDate = formData.startDateTime.split("T")[0]
    const currentEndDate = formData.endDateTime.split("T")[0]
    
    setFormData((prev) => ({
      ...prev,
      allDay: checked,
      startDate: checked ? currentStartDate : prev.startDateTime.split("T")[0],
      endDate: checked ? currentEndDate : prev.endDateTime.split("T")[0],
      startDateTime: checked ? currentStartDate + "T09:00" : prev.startDateTime,
      endDateTime: checked ? currentEndDate + "T10:00" : prev.endDateTime,
    }))
  }

  const selectedIcon = iconOptions.find((option) => option.value === formData.icon)
  const selectedColor = colorOptions.find((option) => option.value === formData.color)

  return (
    <div className="p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {schedule ? "일정 수정" : "새 일정 추가"}
        </h2>
        <Button variant="ghost" size="sm" onClick={onCancel} className="hover:bg-slate-100 dark:hover:bg-slate-700">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            일정 제목
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="일정 제목을 입력하세요"
            className="h-10 border-slate-300 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800"
            required
          />
        </div>

        {/* Icon and Color Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Palette className="h-4 w-4 text-slate-500" />
              아이콘
            </Label>
            <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
              <SelectTrigger className="h-10 border-slate-300 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  {selectedIcon && React.createElement(selectedIcon.icon, { className: "h-4 w-4" })}
                  <span>{selectedIcon?.label}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {React.createElement(option.icon, { className: "h-4 w-4" })}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">색상</Label>
            <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
              <SelectTrigger className="h-10 border-slate-300 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${selectedColor?.class.split(" ")[0]}`}></div>
                  <span>{selectedColor?.label}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${option.class.split(" ")[0]}`}></div>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${selectedColor?.class}`}>
              {selectedIcon && React.createElement(selectedIcon.icon, { className: "h-5 w-5" })}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{formData.title || "일정 제목"}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">미리보기</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="goalId"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
          >
            <Target className="h-4 w-4 text-slate-500" />
            연결된 목표 (선택사항)
          </Label>
          <Select
            value={formData.goalId?.toString() || "none"}
            onValueChange={(value) =>
              setFormData({ ...formData, goalId: value === "none" ? undefined : Number.parseInt(value) })
            }
          >
            <SelectTrigger className="h-10 border-slate-300 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800">
              <SelectValue placeholder="목표를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">목표 없음</SelectItem>
              {goals.map((goal) => (
                <SelectItem key={goal.goalId} value={goal.goalId.toString()}>
                  {goal.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allDay"
            checked={formData.allDay}
            onCheckedChange={handleAllDayChange}
            className="border-slate-300 dark:border-slate-600"
          />
          <Label htmlFor="allDay" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            하루 종일
          </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="startDateTime"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
            >
              <Calendar className="h-4 w-4 text-slate-500" />
              시작 {formData.allDay ? "날짜" : "날짜 및 시간"}
            </Label>
            <Input
              id="startDateTime"
              type={formData.allDay ? "date" : "datetime-local"}
              value={formData.allDay ? formData.startDate : formData.startDateTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [formData.allDay ? "startDate" : "startDateTime"]: e.target.value,
                })
              }
              className="h-10 border-slate-300 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="endDateTime"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
            >
              <Clock className="h-4 w-4 text-slate-500" />
              종료 {formData.allDay ? "날짜" : "날짜 및 시간"}
            </Label>
            <Input
              id="endDateTime"
              type={formData.allDay ? "date" : "datetime-local"}
              value={formData.allDay ? formData.endDate : formData.endDateTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [formData.allDay ? "endDate" : "endDateTime"]: e.target.value,
                })
              }
              min={formData.allDay ? formData.startDate : formData.startDateTime}
              className="h-10 border-slate-300 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="reminderMinutes"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
          >
            <Bell className="h-4 w-4 text-slate-500" />
            알림 설정 (선택사항)
          </Label>
          <Select
            value={formData.reminderMinutes?.toString() || "none"}
            onValueChange={(value) =>
              setFormData({ ...formData, reminderMinutes: value === "none" ? undefined : Number.parseInt(value) })
            }
          >
            <SelectTrigger className="h-10 border-slate-300 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800">
              <SelectValue placeholder="알림 시간을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">알림 없음</SelectItem>
              <SelectItem value="5">5분 전</SelectItem>
              <SelectItem value="10">10분 전</SelectItem>
              <SelectItem value="15">15분 전</SelectItem>
              <SelectItem value="30">30분 전</SelectItem>
              <SelectItem value="60">1시간 전</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sub Tasks Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">세부 일정 (선택사항)</Label>

          <div className="flex gap-2">
            <Input
              placeholder="세부 일정을 입력하세요"
              value={newSubTask}
              onChange={(e) => setNewSubTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addSubTask()
                }
              }}
              className="h-9 border-slate-300 focus:border-slate-900 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800"
            />
            <Button
              type="button"
              onClick={addSubTask}
              disabled={!newSubTask.trim()}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-3 py-1 text-sm disabled:opacity-50"
            >
              추가
            </Button>
          </div>

          {subTasks.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {subTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded border dark:border-slate-700"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleSubTask(task.id)}
                    className="border-slate-300 dark:border-slate-600"
                  />
                  <span
                    className={`flex-1 text-sm ${task.completed ? "line-through text-slate-500" : "text-slate-900 dark:text-slate-100"}`}
                  >
                    {task.title}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubTask(task.id)}
                    className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">💡 일정은 1분 단위로 정확하게 설정할 수 있습니다</p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium"
          >
            {schedule ? "일정 수정" : "일정 추가"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 bg-transparent"
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  )
}
