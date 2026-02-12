"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

interface Goal {
  goalId: number
  title: string
  startDate: string
  endDate: string
  priority: "HIGH" | "MEDIUM" | "LOW"
  completed: boolean
}

interface ScheduleCalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  schedules: Schedule[]
  goals?: Goal[]
  showSchedules?: boolean
  onClose?: () => void
  refreshTrigger?: number
}

export function ScheduleCalendar({
  selectedDate,
  onDateSelect,
  schedules,
  goals = [],
  showSchedules = true,
  onClose,
  refreshTrigger,
}: ScheduleCalendarProps) {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  const [monthlyPlans, setMonthlyPlans] = useState<DailyPlan[]>([]);
  const [loadingMonthlyPlans, setLoadingMonthlyPlans] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setToday(now);
  }, []);

  useEffect(() => {
    const fetchMonthlyPlans = async () => {
      if (!showSchedules) {
        setMonthlyPlans([]);
        return;
      }
      setLoadingMonthlyPlans(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        const data = await getMonthlyPlans(year, month);
        setMonthlyPlans(data);
      } catch (error: any) {
        console.error("Failed to fetch monthly plans:", error);
        setMonthlyPlans([]);
        if (error.response?.status === 401 || error.response?.data?.code === "GLOBAL401") {
          alert(error.response?.data?.message || "인증에 실패했습니다. 다시 로그인해주세요.");
          router.push("/login");
        } else if (error.response?.data?.code === "PLAN500") {
          alert(error.response.data.message || "일정 조회에 실패했습니다.");
        } else {
          alert(error.response?.data?.message || "일정 조회에 실패했습니다.");
        }
      } finally {
        setLoadingMonthlyPlans(false);
      }
    };
    fetchMonthlyPlans();
  }, [currentMonth, router, refreshTrigger, showSchedules]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

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

  const getGoalsForDate = (date: Date) => {
    return goals.filter(goal => {
      const startDate = new Date(goal.startDate);
      const endDate = new Date(goal.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const renderCalendarDays = () => {
    if (!isMounted) {
      // 서버 사이드 렌더링 및 초기 로딩 시 기본 스타일로 렌더링
      const days = []
      const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7

      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(
          <button
            key={`prev-${i}`}
            className="aspect-square flex items-center justify-center text-[#5D6E72]/40 hover:bg-[#EEF5F7] rounded-xl transition-all text-sm"
          >
            {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -firstDayOfMonth + i + 1).getDate()}
          </button>,
        )
      }

      for (let day = 1; day <= daysInMonth; day++) {
        days.push(
          <button
            key={day}
            className="aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative group text-sm font-medium text-[#5D6E72] hover:bg-[#EEF5F7]"
          >
            <span>{day}</span>
          </button>,
        )
      }

      const remainingCells = totalCells - days.length
      for (let day = 1; day <= remainingCells; day++) {
        days.push(
          <button
            key={`next-${day}`}
            className="aspect-square flex items-center justify-center text-[#5D6E72]/40 hover:bg-[#EEF5F7] rounded-xl transition-all text-sm"
          >
            {day}
          </button>,
        )
      }

      return days
    }

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
      const isToday = today ? date.getTime() === today.getTime() : false
      const isSelected = date.getTime() === selectedDate.getTime()
      const daySchedules = showSchedules ? getMonthlySchedulesForDate(date) : []
      const dayGoals = getGoalsForDate(date)
      const totalItemsCount = showSchedules ? daySchedules.length : dayGoals.length
      const hasSchedules = totalItemsCount > 0

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
            <div className="absolute bottom-1.5 flex gap-0.5">
              {totalItemsCount >= 4 && <div className="h-1 w-4 rounded-full bg-[#ff8b6b]" />}
              {totalItemsCount > 0 &&
                totalItemsCount < 4 &&
                Array.from({ length: totalItemsCount }).map((_, index) => (
                  <div key={index} className="h-1 w-1 rounded-full bg-[#ff8b6b]" />
                ))}
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
    </div>
  )
}
