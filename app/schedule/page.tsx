"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, ChevronDown, ChevronUp, Plus, Settings, Bell, Sun, Moon, Monitor, Menu, X, AlertCircle } from "lucide-react"
import { ScheduleTimeline } from "@/components/schedule-timeline"
import { ScheduleCalendar } from "@/components/schedule-calendar"
import { ScheduleForm } from "@/components/schedule-form"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { getGoals, type Goal } from "@/api/goals";
import { getPlans, Plan, SubPlan, createPlan, updatePlan, createSubPlans, type CreatePlanRequest, type UpdatePlanRequest } from "@/api/subplan"

// 컴포넌트에서 사용할 데이터 인터페이스
export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}
export interface Schedule {
  planId: number;
  goalId?: number;
  subGoalId?: number;
  title: string;
  subTasks?: SubTask[];
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  icon?: string;
  color?: string;
  reminderMinutes?: number;
}

// YYYY-MM-DD 형식으로 날짜를 변환하는 헬퍼 함수
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [goalList, setGoalList] = useState<Goal[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const timelineRef = useRef<{ scrollToCurrentTime: () => void }>(null)
  const { theme, setTheme } = useTheme()

  // 일정 목록 가져오기
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true)
      setError(null)
      try {
        const formattedDate = formatDateToYYYYMMDD(selectedDate)
        const fetchedPlans: Plan[] = await getPlans(formattedDate)

        const reverseColorMap: { [key: string]: string } = {
          BLUE: "blue", RED: "red", GREEN: "green", PURPLE: "purple",
          ORANGE: "orange", PINK: "pink", YELLOW: "yellow", NAVY: "indigo",
        };

        const reverseCategoryMap: { [key: string]: string } = {
          WORK: "Briefcase", STUDY: "Book", ETC: "User",
        };

        const adaptedSchedules: Schedule[] = fetchedPlans.map(plan => ({
          planId: plan.plan_id,
          goalId: plan.goal_id,
          subGoalId: plan.sub_goal_id,
          title: plan.title,
          color: reverseColorMap[plan.color] || "blue",
          icon: reverseCategoryMap[plan.plan_category] || "User",
          subTasks: plan.sub_plans.map(subPlan => ({
            id: String(subPlan.sub_plan_id),
            title: subPlan.title,
            completed: subPlan.is_completed,
          })).sort((a, b) => Number(a.id) - Number(b.id)), // Sub-tasks sorted by ID
          startDateTime: plan.start_date_time,
          endDateTime: plan.end_date_time,
          allDay: plan.all_day,
          isCompleted: plan.is_completed,
          completedAt: plan.completed_at,
          createdAt: plan.created_at,
          updatedAt: plan.updated_at,
        }));

        setSchedules(adaptedSchedules)
      } catch (err) {
        setError("일정을 불러오는 데 실패했습니다. 다시 시도해 주세요.")
        setSchedules([]);
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [selectedDate, refreshTrigger])

  // 목표 목록 가져오기 (컴포넌트 마운트 시 한 번만 실행)
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const goals = await getGoals(formatDateToYYYYMMDD(selectedDate));
        setGoalList(goals);
      } catch (err) {
        console.error("Failed to fetch goals:", err);
      }
    };
    fetchGoals();
  }, [selectedDate]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const createSchedule = async (scheduleData: Omit<Schedule, 'planId' | 'isCompleted' | 'createdAt' | 'updatedAt'>) => {
    if (scheduleData.subGoalId === undefined) {
      setError("일정을 생성하려면 하위 목표를 선택해야 합니다.");
      console.error("SubGoalId is required to create a plan.");
      return;
    }

    const colorMap: { [key: string]: string } = {
      blue: "BLUE", red: "RED", green: "GREEN", purple: "PURPLE",
      orange: "ORANGE", pink: "PINK", yellow: "YELLOW", indigo: "NAVY",
    };

    const categoryMap: { [key: string]: string } = {
      Briefcase: "WORK", Book: "STUDY",
    };

    const apiPayload: CreatePlanRequest = {
      title: scheduleData.title,
      start_date_time: scheduleData.startDateTime,
      end_date_time: scheduleData.endDateTime,
      all_day: scheduleData.allDay,
      color: colorMap[scheduleData.color || 'blue'] || "BLUE",
      plan_category: categoryMap[scheduleData.icon || ''] || "ETC",
    };

    try {
      const newPlanFromApi = await createPlan(scheduleData.subGoalId, apiPayload);

      if (scheduleData.subTasks && scheduleData.subTasks.length > 0) {
        const subPlansToCreate = scheduleData.subTasks.map(st => ({ title: st.title }));
        await createSubPlans(newPlanFromApi.plan_id, subPlansToCreate);
      }

      setShowForm(false);
      setEditingSchedule(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to create schedule:", err);
      setError("일정 생성에 실패했습니다. 다시 시도해 주세요.");
    }
  }

  const updateSchedule = async (planId: number, updates: Partial<Schedule>) => {
    const originalSchedule = schedules.find(s => s.planId === planId);
    if (!originalSchedule || originalSchedule.subGoalId === undefined) {
      console.error("Schedule or subGoalId not found for update");
      setError("일정 수정에 필요한 정보가 부족합니다.");
      return;
    }

    const apiPayload: Partial<UpdatePlanRequest> = {};
    const colorMap: { [key: string]: string } = { blue: "BLUE", red: "RED", green: "GREEN", purple: "PURPLE", orange: "ORANGE", pink: "PINK", yellow: "YELLOW", indigo: "NAVY" };
    const categoryMap: { [key: string]: string } = { Briefcase: "WORK", Book: "STUDY" };

    if (updates.title !== undefined) apiPayload.title = updates.title;
    if (updates.startDateTime !== undefined) apiPayload.start_date_time = updates.startDateTime;
    if (updates.endDateTime !== undefined) apiPayload.end_date_time = updates.endDateTime;
    if (updates.allDay !== undefined) apiPayload.all_day = updates.allDay;
    if (updates.isCompleted !== undefined) apiPayload.is_completed = updates.isCompleted;
    if (updates.color !== undefined) apiPayload.color = colorMap[updates.color] || 'BLUE';
    if (updates.icon !== undefined) apiPayload.plan_category = categoryMap[updates.icon] || 'ETC';

    try {
      if (Object.keys(apiPayload).length > 0) {
        await updatePlan(planId, originalSchedule.subGoalId, apiPayload);
      }
      
      setRefreshTrigger(prev => prev + 1);
      setShowForm(false);
      setEditingSchedule(null);
    } catch (err) {
      console.error("Failed to update schedule:", err);
      setError("일정 수정에 실패했습니다. 다시 시도해 주세요.");
    }
  }

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setShowForm(true)
  }

  const handleUpdateSchedule = (scheduleData: Omit<Schedule, 'planId' | 'isCompleted' | 'createdAt' | 'updatedAt'>) => {
    if (editingSchedule) {
      updateSchedule(editingSchedule.planId, scheduleData)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })
  }

  const todaySchedules = [...schedules].sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`fixed lg:static inset-y-0 left-0 z-40 w-80 lg:w-72 xl:w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                ← 목표로 돌아가기
              </Link>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-700">
                  <X className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-700">
                      {theme === "light" ? <Sun className="h-4 w-4" /> : theme === "dark" ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}><Sun className="h-4 w-4 mr-2" />라이트 모드</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}><Moon className="h-4 w-4 mr-2" />다크 모드</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}><Monitor className="h-4 w-4 mr-2" />시스템 설정</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-700"><Settings className="h-4 w-4" /></Button>
              </div>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">일정 관리</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{formatDate(selectedDate)}</p>
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <Button onClick={() => { setEditingSchedule(null); setShowForm(true); }} className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 justify-start">
              <Plus className="h-4 w-4 mr-2" />새 일정 추가
            </Button>
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">오늘의 요약</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">전체 일정</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{todaySchedules.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">완료됨</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{todaySchedules.filter((s) => s.isCompleted).length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">남은 일정</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{todaySchedules.filter((s) => !s.isCompleted).length}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">다가오는 일정</h3>
            <div className="space-y-3">
              {todaySchedules.filter((schedule) => !schedule.isCompleted).slice(0, 5).map((schedule) => (
                  <Card key={schedule.planId} className="border-0 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-700 cursor-pointer" onClick={() => handleEditSchedule(schedule)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{schedule.title}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            {schedule.allDay ? (<span>하루 종일</span>) : (<span>{new Date(schedule.startDateTime).toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit", hour12: true })}</span>)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Menu className="h-4 w-4" />
                </Button>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {selectedDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCalendar(!showCalendar)} className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Calendar className="h-4 w-4" />
                  {showCalendar ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { setSelectedDate(new Date()) }}>오늘</Button>
              </div>
            </div>
          </div>

          {showCalendar && (
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <ScheduleCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} schedules={schedules} onClose={() => setShowCalendar(false)} />
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {error && (
              <div className="flex flex-col items-center justify-center h-full text-red-500">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p className="text-lg">{error}</p>
              </div>
            )}
            {!error && (
              <ScheduleTimeline
                ref={timelineRef}
                schedules={todaySchedules}
                selectedDate={selectedDate}
                onUpdateSchedule={updateSchedule}
                onEditSchedule={handleEditSchedule}
                loading={loading}
                onScrollToCurrentTime={() => {}}
              />
            )}
          </div>
        </div>
      </div>

      {sidebarOpen && (<div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />)}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <ScheduleForm
              schedule={editingSchedule}
              onSubmit={editingSchedule ? handleUpdateSchedule : createSchedule}
              onCancel={() => { setShowForm(false); setEditingSchedule(null); }}
              defaultDate={selectedDate}
              goals={goalList}
              onSubTaskChange={(planId, index, newSubTask) => {
                const newSchedules = schedules.map(schedule => {
                    if (schedule.planId !== planId) {
                        return schedule;
                    }
                    const newSubTasks = [...(schedule.subTasks || [])];
                    if (index === null) { // Add
                        newSubTasks.push(newSubTask);
                    } else { // Update
                        newSubTasks[index] = newSubTask;
                    }
                    return { ...schedule, subTasks: newSubTasks };
                });
                setSchedules(newSchedules);
                if (editingSchedule && editingSchedule.planId === planId) {
                    const updatedScheduleForForm = newSchedules.find(s => s.planId === planId);
                    if (updatedScheduleForForm) {
                        setEditingSchedule(updatedScheduleForForm);
                    }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
