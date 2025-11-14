"use client"

import { createSubPlans, updateSubPlan, deleteSubPlan } from "../api/subplan";
import React from "react";
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
  Pencil,
  Trash2,
  Plus,
  Flag,
  Palette,
  Sparkles
} from "lucide-react"
import type { Goal } from "@/api/goals"
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { toKoreanDateString } from "@/lib/korean-time";

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
  onDelete?: (planId: number) => void
  defaultDate: Date
  goals?: Goal[]
  onSubTaskChange: (planId: number, index: number | null, newSubTask: SubTask) => void
  onSubTasksUpdate: (planId: number, newSubTasks: SubTask[]) => void
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
  { name: "블루", color: "#2196f3" },
  { name: "레드", color: "#F44336" },
  { name: "그린", color: "#4caf50" },
  { name: "퍼플", color: "#9c27b0" },
  { name: "오렌지", color: "#ff9800" },
  { name: "핑크", color: "#e91e63" },
  { name: "옐로우", color: "#ffeb3b" },
  { name: "네이비", color: "#607d8b" },
]

const formatLocalDatetime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function ScheduleForm({ schedule, onSubmit, onCancel, onDelete, defaultDate, goals = [], onSubTaskChange, onSubTasksUpdate }: ScheduleFormProps) {
  const [subTasks, setSubTasks] = useState<SubTask[]>(schedule?.subTasks || [])
  const [newSubTask, setNewSubTask] = useState("")
  const [editingSubTaskIndex, setEditingSubTaskIndex] = useState<number | null>(null)
  const [editingSubTaskTitle, setEditingSubTaskTitle] = useState("")
  const [formData, setFormData] = useState(() => {
    const initialStartDateTime = schedule?.startDateTime
      ? new Date(schedule.startDateTime)
      : new Date(defaultDate.getFullYear(), defaultDate.getMonth(), defaultDate.getDate(), 9, 0);
    const initialEndDateTime = schedule?.endDateTime
      ? new Date(schedule.endDateTime)
      : new Date(defaultDate.getFullYear(), defaultDate.getMonth(), defaultDate.getDate(), 10, 0);

    return {
      title: schedule?.title || "",
      startDate: schedule?.startDateTime
        ? toKoreanDateString(schedule.startDateTime)
        : toKoreanDateString(defaultDate),
      endDate: schedule?.endDateTime
        ? toKoreanDateString(schedule.endDateTime)
        : toKoreanDateString(defaultDate),
      startDateTime: formatLocalDatetime(initialStartDateTime),
      endDateTime: formatLocalDatetime(initialEndDateTime),
      allDay: schedule?.allDay || false,
      reminderMinutes: schedule?.reminderMinutes,
      icon: schedule?.icon || "User",
      color: schedule?.color || "#2196f3",
    };
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setSubTasks(schedule?.subTasks || []);
    setFormData(prev => {
      const updatedStartDateTime = schedule?.startDateTime
        ? new Date(schedule.startDateTime)
        : new Date(defaultDate.getFullYear(), defaultDate.getMonth(), defaultDate.getDate(), 9, 0);
      const updatedEndDateTime = schedule?.endDateTime
        ? new Date(schedule.endDateTime)
        : new Date(defaultDate.getFullYear(), defaultDate.getMonth(), defaultDate.getDate(), 10, 0);

      return {
        ...prev,
        title: schedule?.title || "",
        startDate: schedule?.startDateTime ? toKoreanDateString(schedule.startDateTime) : toKoreanDateString(defaultDate),
        endDate: schedule?.endDateTime ? toKoreanDateString(schedule.endDateTime) : toKoreanDateString(defaultDate),
        startDateTime: formatLocalDatetime(updatedStartDateTime),
        endDateTime: formatLocalDatetime(updatedEndDateTime),
        allDay: schedule?.allDay || false,
        reminderMinutes: schedule?.reminderMinutes,
        icon: schedule?.icon || "User",
        color: schedule?.color || "#2196f3",
      };
    });
  }, [schedule, defaultDate]);

  const handleApiError = (error: any, context: string) => {
    console.error(`API ${context} 실패:`, error);

    // GLOBAL401
    if (error.response?.status === 401 || error.response?.data?.code === "GLOBAL401") {
      alert(error.response?.data?.message || "인증에 실패했습니다.");
      // Redirection to login should be handled by a top-level component
      return;
    }

    // 400 Bad Request with detail (for delete)
    if (error.response?.status === 400 && error.response?.data?.detail) {
      alert(error.response.data.detail);
      return;
    }

    // VALIDATION400 / BAD_REQUEST_BODY400 with result object
    if ((error.response?.data?.code === "VALIDATION400" || error.response?.data?.code === "BAD_REQUEST_BODY400") && error.response?.data?.result) {
      const errorResult = error.response.data.result;
      const errorMessages = Object.values(errorResult);
      if (errorMessages.length > 0 && typeof errorMessages[0] === 'string') {
        alert(errorMessages[0]);
      } else {
        alert(error.response.data.message || "잘못된 요청입니다.");
      }
      return;
    }

    // Other specific codes with a message property
    if (error.response?.data?.message) {
      alert(error.response.data.message);
      return;
    }

    // Fallback for any other errors
    alert(`${context}에 실패했습니다.`);
  };

  const addSubTask = async () => {
    if (!newSubTask.trim()) return;
    if (!schedule?.planId) {
        const tempSubTask: SubTask = {
            id: Date.now().toString(),
            title: newSubTask.trim(),
            completed: false,
        };
        setSubTasks([...subTasks, tempSubTask]);
        setNewSubTask("");
        return;
    }

    try {
      const createdSubPlans = await createSubPlans(schedule.planId, [{ title: newSubTask.trim() }]);
      if (createdSubPlans && createdSubPlans.length > 0) {
          const newApiSubTask = {
            id: String(createdSubPlans[0].sub_plan_id),
            title: createdSubPlans[0].title,
            completed: createdSubPlans[0].is_completed,
          };
          const newSubTasks = [...subTasks, newApiSubTask];
          setSubTasks(newSubTasks);
          onSubTaskChange(schedule.planId, null, newApiSubTask);
          setNewSubTask("");
      }
    } catch (error) {
      handleApiError(error, "세부 일정 추가");
    }
  };

  const removeSubTask = async (id: string) => {
    if (!schedule?.planId) return;

    const newSubTasks = subTasks.filter((task) => task.id !== id);

    try {
      await deleteSubPlan(schedule.planId, Number(id));
      setSubTasks(newSubTasks);
      onSubTasksUpdate(schedule.planId, newSubTasks);
    } catch (error) {
      handleApiError(error, "세부 일정 삭제");
    }
  }

  const toggleSubTask = async (id: string, index: number) => {
    const subTaskToUpdate = subTasks[index];
    if (!subTaskToUpdate || !schedule?.planId) return;

    try {
      await updateSubPlan(schedule.planId, Number(id), { is_completed: !subTaskToUpdate.completed });

      const updatedSubTask: SubTask = {
        ...subTaskToUpdate,
        completed: !subTaskToUpdate.completed,
      };

      const newSubTasks = [...subTasks];
      newSubTasks[index] = updatedSubTask;
      setSubTasks(newSubTasks);
      onSubTaskChange(schedule.planId, index, updatedSubTask);

    } catch (error) {
      handleApiError(error, "세부 일정 완료 상태 변경");
    }
  };

  const startInlineEdit = (subTask: SubTask, index: number) => {
    setEditingSubTaskIndex(index);
    setEditingSubTaskTitle(subTask.title);
  };

  const cancelInlineEdit = () => {
    setEditingSubTaskIndex(null);
    setEditingSubTaskTitle("");
  };

  const saveInlineEdit = async () => {
    if (editingSubTaskIndex === null || !editingSubTaskTitle.trim()) return;
    if (!schedule?.planId) return;

    const subTaskToUpdate = subTasks[editingSubTaskIndex];
    try {
      await updateSubPlan(schedule.planId, Number(subTaskToUpdate.id), { title: editingSubTaskTitle.trim() });

      const updatedSubTask: SubTask = {
        ...subTaskToUpdate,
        title: editingSubTaskTitle.trim(),
      };

      const newSubTasks = [...subTasks];
      newSubTasks[editingSubTaskIndex] = updatedSubTask;
      setSubTasks(newSubTasks);
      onSubTaskChange(schedule.planId, editingSubTaskIndex, updatedSubTask);
      
      cancelInlineEdit();
    } catch (error) {
      handleApiError(error, "세부 일정 수정");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formatDateTime = (dateTimeString: string) => {
      const date = new Date(dateTimeString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    onSubmit({
      title: formData.title,
      startDateTime: formData.allDay
        ? `${formData.startDate}T00:00`
        : formatDateTime(formData.startDateTime),
      endDateTime: formData.allDay
        ? `${formData.endDate}T23:59`
        : formatDateTime(formData.endDateTime),
      allDay: formData.allDay,
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

  return (
    <div className="relative w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
      {/* Header with Gradient - 동일하게 */}
      <div className="relative px-6 py-5 bg-gradient-to-br from-[#ff8b6b] to-[#ff6b47] overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-white flex-shrink-0" />
            <h2 className="text-lg font-bold text-white">
              {schedule ? "일정 수정" : "일정 생성"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-all flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title Input - 동일하게 */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold text-[#0F1C21] flex items-center gap-2">
            <span>일정 이름</span>
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="예: 매일 아침 명상하기"
            className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-base text-[#0F1C21] placeholder:text-[#5D6E72]/50 focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff8b6b]/20 transition-all"
            required
          />
        </div>

        {/* Icon Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-[#0F1C21]">아이콘</Label>
          <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
            <SelectTrigger className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff8b6b]/20">
              <div className="flex items-center gap-3">
                {selectedIcon && React.createElement(selectedIcon.icon, { className: "h-5 w-5" })}
                <span className="font-medium">{selectedIcon?.label}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {iconOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="rounded-xl">
                  <div className="flex items-center gap-3">
                    {React.createElement(option.icon, { className: "h-5 w-5" })}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Color Selection - GoalForm과 동일하게 */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[#0F1C21] flex items-center gap-2">
            <Palette className="h-4 w-4 text-[#5D6E72]" />
            <span>일정 컬러</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map(({ name, color }) => {
              const isSelected = formData.color === color
              return (
                <button
                  key={name}
                  type="button"
                  className={`relative h-11 w-11 rounded-2xl border-2 transition-all hover:scale-110 ${
                    isSelected ? "border-[#0F1C21] shadow-lg scale-110" : "border-white shadow-sm"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                  aria-label={`${name} 선택`}
                  title={name}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-3 w-3 bg-[#0F1C21] rounded-full"></div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* All Day Toggle */}
        <div className="flex items-center space-x-3 p-3 bg-[#EEF5F7] rounded-2xl">
          <Checkbox
            id="allDay"
            checked={formData.allDay}
            onCheckedChange={handleAllDayChange}
            className="border-[#99C6D6]"
          />
          <Label htmlFor="allDay" className="text-sm font-semibold text-[#0F1C21] cursor-pointer">
            하루 종일
          </Label>
        </div>

        {/* Date Selection - 날짜와 시간 분리 */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[#0F1C21] flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#5D6E72]" />
            <span>기간 설정</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs text-[#5D6E72]">
                시작 날짜
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff8b6b]/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs text-[#5D6E72]">
                종료 날짜
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff8b6b]/20"
                required
              />
            </div>
          </div>
        </div>

        {/* Time Selection - 하루 종일이 아닐 때만 표시 */}
        {!formData.allDay && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-[#0F1C21] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#5D6E72]" />
              <span>시간 설정</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-xs text-[#5D6E72]">
                  시작 시간
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startDateTime.split("T")[1]}
                  onChange={(e) => {
                    const newStartDateTime = `${formData.startDate}T${e.target.value}`;
                    setFormData({ ...formData, startDateTime: newStartDateTime });
                  }}
                  className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff8b6b]/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-xs text-[#5D6E72]">
                  종료 시간
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endDateTime.split("T")[1]}
                  onChange={(e) => {
                    const newEndDateTime = `${formData.endDate}T${e.target.value}`;
                    setFormData({ ...formData, endDateTime: newEndDateTime });
                  }}
                  className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff8b6b]/20"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Reminder */}
        <div className="space-y-2">
          <Label htmlFor="reminderMinutes" className="text-sm font-semibold text-[#0F1C21] flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#5D6E72]" />
            알림 (선택)
          </Label>
          <Select
            value={formData.reminderMinutes?.toString() || "none"}
            onValueChange={(value) =>
              setFormData({ ...formData, reminderMinutes: value === "none" ? undefined : Number.parseInt(value) })
            }
          >
            <SelectTrigger className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff8b6b]/20">
              <SelectValue placeholder="알림 시간 선택" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="none" className="rounded-xl">알림 없음</SelectItem>
              <SelectItem value="5" className="rounded-xl">5분 전</SelectItem>
              <SelectItem value="10" className="rounded-xl">10분 전</SelectItem>
              <SelectItem value="15" className="rounded-xl">15분 전</SelectItem>
              <SelectItem value="30" className="rounded-xl">30분 전</SelectItem>
              <SelectItem value="60" className="rounded-xl">1시간 전</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sub Tasks */}
        {subTasks.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-[#0F1C21]">세부 일정</Label>
            <div className="space-y-2">
              {subTasks.map((task, index) => (
                <div
                  key={`${task.id}-${index}`}
                  className="flex items-center gap-3 p-3 bg-[#EEF5F7] rounded-2xl"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleSubTask(task.id, index)}
                    className="h-5 w-5 border-[#99C6D6]"
                  />
                  {editingSubTaskIndex === index ? (
                    <>
                      <Input
                        value={editingSubTaskTitle}
                        onChange={(e) => setEditingSubTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveInlineEdit();
                          if (e.key === "Escape") cancelInlineEdit();
                        }}
                        className="flex-1 h-9 rounded-xl border-2 border-[#D3E6ED]"
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={saveInlineEdit}
                        className="h-8 px-3 bg-[#ff8b6b] hover:bg-[#ff7a56] text-white rounded-xl"
                      >
                        저장
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className={`flex-1 text-sm font-medium ${task.completed ? "line-through text-[#5D6E72]" : "text-[#0F1C21]"}`}>
                        {task.title}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => startInlineEdit(task, index)}
                        className="h-8 w-8 p-0 hover:bg-[#D3E6ED] rounded-xl"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubTask(task.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100 text-red-600 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - GoalForm과 동일하게 */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex-1 h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-[#5D6E72] font-semibold hover:bg-[#EEF5F7] transition-all"
          >
            취소
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#ff8b6b] to-[#ff6b47] text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            {schedule ? "수정 완료" : "일정 만들기"}
          </Button>
        </div>

        {schedule && onDelete && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            className="w-full h-12 rounded-2xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            일정 삭제
          </Button>
        )}
      </form>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (schedule?.planId && onDelete) {
            onDelete(schedule.planId);
          }
          setShowDeleteModal(false);
        }}
        title="일정 삭제"
        message="정말로 이 일정을 삭제하시겠습니까?"
        confirmText="삭제"
      />
    </div>
  )
}
