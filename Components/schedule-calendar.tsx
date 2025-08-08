"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface Schedule {
  planId: number
  title: string
  startDateTime: string
  endDateTime: string
  allDay: boolean
  isCompleted: boolean
}

interface ScheduleCalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  schedules: Schedule[]
  onClose: () => void
}

export function ScheduleCalendar({ selectedDate, onDateSelect, schedules, onClose }: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const today = new Date()

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.startDateTime)
      return scheduleDate.toDateString() === date.toDateString()
    })
  }

  const renderCalendarDays = () => {
    const days = []
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7

    // Previous month's trailing days
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -firstDayOfMonth + i + 1)
      days.push(
        <button
          key={`prev-${i}`}
          className="h-12 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
          onClick={() => onDateSelect(prevMonthDate)}
        >
          {prevMonthDate.getDate()}
        </button>,
      )
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isToday = date.toDateString() === today.toDateString()
      const isSelected = date.toDateString() === selectedDate.toDateString()
      const daySchedules = getSchedulesForDate(date)

      days.push(
        <button
          key={day}
          className={`h-12 rounded-lg transition-colors relative ${
            isSelected
              ? "bg-slate-900 text-white"
              : isToday
                ? "bg-slate-100 text-slate-900 font-medium"
                : "text-slate-700 hover:bg-slate-50"
          }`}
          onClick={() => onDateSelect(date)}
        >
          {day}
          {daySchedules.length > 0 && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
              {daySchedules.slice(0, 3).map((_, index) => (
                <div key={index} className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/60" : "bg-slate-400"}`} />
              ))}
              {daySchedules.length > 3 && (
                <div className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/60" : "bg-slate-600"}`} />
              )}
            </div>
          )}
        </button>,
      )
    }

    // Next month's leading days
    const remainingCells = totalCells - days.length
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day)
      days.push(
        <button
          key={`next-${day}`}
          className="h-12 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
          onClick={() => onDateSelect(nextMonthDate)}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={previousMonth} className="hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={nextMonth} className="hover:bg-slate-100">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-slate-100 ml-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-slate-600">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
    </div>
  )
}
