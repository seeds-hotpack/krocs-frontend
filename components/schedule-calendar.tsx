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
  onClose?: () => void
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
        const month = currentMonth.getMonth() + 1;
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
  today.setHours(0, 0, 0, 0)

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const getMonthlySchedulesForDate = (date: Date) => {
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dailyPlan = monthlyPlans.find(dp => dp.date === formattedDate);
    return dailyPlan ? dailyPlan.plans : [];
  };

  const renderCalendarDays = () => {
    const days = []
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7

    // Previous month's trailing days
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -firstDayOfMonth + i + 1)
      days.push(
        <button
          key={`prev-${i}`}
          className="aspect-square flex items-center justify-center text-[#5D6E72]/40 hover:bg-[#EEF5F7] rounded-xl transition-all text-sm"
          onClick={() => onDateSelect(prevMonthDate)}
        >
          {prevMonthDate.getDate()}
        </button>,
      )
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      date.setHours(0, 0, 0, 0)
      const isToday = date.getTime() === today.getTime()
      const isSelected = date.getTime() === selectedDate.getTime()
      const daySchedules = getMonthlySchedulesForDate(date)
      const hasSchedules = daySchedules.length > 0

      days.push(
        <button
          key={day}
          className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative group text-sm font-medium ${
            isSelected
              ? "bg-gradient-to-br from-[#BBDCE5] to-[#99C6D6] text-white shadow-md scale-105"
              : isToday
                ? "bg-[#EEF5F7] text-[#0F1C21] ring-2 ring-[#BBDCE5] ring-offset-1"
                : hasSchedules
                  ? "text-[#0F1C21] hover:bg-[#EEF5F7]"
                  : "text-[#5D6E72] hover:bg-[#EEF5F7]"
          }`}
          onClick={() => onDateSelect(date)}
        >
          <span className={isToday && !isSelected ? "font-bold" : ""}>{day}</span>
          
          {hasSchedules && (
            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
              {daySchedules.length <= 3 ? (
                <div className="flex gap-1">
                  {daySchedules.slice(0, 3).map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        isSelected 
                          ? "bg-white shadow-sm" 
                          : "bg-[#BBDCE5] group-hover:bg-[#5D6E72]"
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    isSelected 
                      ? "bg-white shadow-sm" 
                      : "bg-[#BBDCE5] group-hover:bg-[#5D6E72]"
                  }`}
                  style={{ width: "14px" }}
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
          className="aspect-square flex items-center justify-center text-[#5D6E72]/40 hover:bg-[#EEF5F7] rounded-xl transition-all text-sm"
          onClick={() => onDateSelect(nextMonthDate)}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-[#0F1C21]">
          {currentMonth.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
          })}
        </h3>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={previousMonth} 
            className="h-8 w-8 rounded-full hover:bg-[#EEF5F7] text-[#5D6E72]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={nextMonth} 
            className="h-8 w-8 rounded-full hover:bg-[#EEF5F7] text-[#5D6E72]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose} 
              className="h-8 w-8 rounded-full hover:bg-[#EEF5F7] text-[#5D6E72] ml-1"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
          <div 
            key={day} 
            className={`h-8 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider ${
              index === 0 ? "text-red-400" : index === 6 ? "text-blue-400" : "text-[#5D6E72]/60"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">{renderCalendarDays()}</div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-[#D3E6ED] flex items-center justify-center gap-4 text-xs text-[#5D6E72]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#BBDCE5]"></div>
          <span>일정 있음</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full ring-2 ring-[#BBDCE5]"></div>
          <span>오늘</span>
        </div>
      </div>
    </div>
  )
}