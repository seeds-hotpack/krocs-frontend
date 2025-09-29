"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { getMonthlyPlans, DailyPlan } from "@/api/subplan";

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
  const [monthlyPlans, setMonthlyPlans] = useState<DailyPlan[]>([]);
  const [loadingMonthlyPlans, setLoadingMonthlyPlans] = useState(false);

  useEffect(() => {
    const fetchMonthlyPlans = async () => {
      setLoadingMonthlyPlans(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // Month is 0-indexed in JS Date
        const data = await getMonthlyPlans(year, month);
        setMonthlyPlans(data);
      } catch (error) {
        console.error("Failed to fetch monthly plans:", error);
        setMonthlyPlans([]);
      } finally {
        setLoadingMonthlyPlans(false);
      }
    };
    fetchMonthlyPlans();
  }, [currentMonth]);

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
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return schedules.filter((schedule) => {
      const startDate = new Date(schedule.startDateTime);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(schedule.endDateTime);
      endDate.setHours(0, 0, 0, 0);

      // Handle schedules that end on the same day they start
      if (startDate.getTime() === endDate.getTime()) {
        return startDate.getTime() === targetDate.getTime();
      }

      // For multi-day events, check if the target date is within the range
      return targetDate.getTime() >= startDate.getTime() && targetDate.getTime() <= endDate.getTime();
    });
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
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
              {daySchedules.length < 4 ? (
                <div className="flex gap-0.5">
                  {daySchedules.slice(0, 3).map((_, index) => (
                    <div
                      key={index}
                      className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/60" : "bg-slate-400"}`}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className={`h-1 rounded-sm ${isSelected ? "bg-white/70" : "bg-slate-500"}`}
                  style={{ width: "10px" }}
                />
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

      <div className="mt-8 border-t pt-4 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">월별 일정</h3>
        {loadingMonthlyPlans ? (
          <div className="text-slate-500">월별 일정을 불러오는 중...</div>
        ) : monthlyPlans.length === 0 ? (
          <div className="text-slate-500">이번 달에는 일정이 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {monthlyPlans.map((dailyPlan) => (
              <div key={dailyPlan.date}>
                <h4 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-2">{dailyPlan.date} ({dailyPlan.plan_count}개)</h4>
                <div className="space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                  {dailyPlan.plans.map((plan) => (
                    <div key={plan.plan_id} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${plan.color === 'BLUE' ? 'bg-blue-500' : plan.color === 'RED' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                      <span className={`text-sm ${plan.is_completed ? 'line-through text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>{plan.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
