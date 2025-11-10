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
  Palette
} from "lucide-react"
import type { Goal } from "@/api/goals"
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

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
        ? new Date(schedule.startDateTime).toISOString().split("T")[0]
        : defaultDate.toISOString().split("T")[0],
      endDate: schedule?.endDateTime
        ? new Date(schedule.endDateTime).toISOString().split("T")[0]
        : defaultDate.toISOString().split("T")[0],
      startDateTime: formatLocalDatetime(initialStartDateTime),
      endDateTime: formatLocalDatetime(initialEndDateTime),
      allDay: schedule?.allDay || false,
      reminderMinutes: schedule?.reminderMinutes,
      icon: schedule?.icon || "User",
      color: schedule?.color || "#A8D5E2",
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
        startDate: schedule?.startDateTime ? new Date(schedule.startDateTime).toISOString().split("T")[0] : defaultDate.toISOString().split("T")[0],
        endDate: schedule?.endDateTime ? new Date(schedule.endDateTime).toISOString().split("T")[0] : defaultDate.toISOString().split("T")[0],
        startDateTime: formatLocalDatetime(updatedStartDateTime),
        endDateTime: formatLocalDatetime(updatedEndDateTime),
        allDay: schedule?.allDay || false,
        reminderMinutes: schedule?.reminderMinutes,
        icon: schedule?.icon || "User",
        color: schedule?.color || "#2196f3",
      };
    });
  }, [schedule, defaultDate]);

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
      console.error("API를 통한 세부 일정 생성 실패:", error);
      alert("세부 일정 추가에 실패했습니다.");
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
      console.error("Failed to delete sub-task:", error);
      alert("세부 일정 삭제에 실패했습니다.");
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
      console.error("API를 통한 세부 일정 완료 상태 변경 실패:", error);
      alert("세부 일정 완료 상태 변경에 실패했습니다.");
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
      console.error("API를 통한 세부 일정 수정 실패:", error);
      alert("세부 일정 수정에 실패했습니다.");
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

  // Calculate duration
  const startDate = new Date(formData.allDay ? formData.startDate : formData.startDateTime);
  const endDate = new Date(formData.allDay ? formData.endDate : formData.endDateTime);
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white">
      {/* Orange Header */}
      <div className="bg-gradient-to-r from-[#FF9B7D] to-[#FFA98A] px-6 py-5 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              {schedule ? "일정 수정" : "일정 생성"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title Input */}
        <div className="space-y-2">
          <Label className="text-base font-bold text-gray-800 flex items-center gap-1">
            일정 이름 <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="예: 매일 아침 명상하기"
            className="h-14 rounded-3xl border-2 border-gray-200 bg-gray-50 px-5 text-base focus:border-[#A8D5E2] focus:ring-0"
            required
          />
        </div>

        {/* Priority Buttons */}
        <div className="space-y-3">
          <Label className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Flag className="h-5 w-5" />
            중요도
          </Label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              className="h-14 rounded-3xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
            >
              높음
            </button>
            <button
              type="button"
              className="h-14 rounded-3xl bg-[#A8D5E2] text-gray-800 font-medium"
            >
              보통
            </button>
            <button
              type="button"
              className="h-14 rounded-3xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
            >
              낮음
            </button>
          </div>
        </div>

        {/* Color Picker */}
        <div className="space-y-3">
          <Label className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Palette className="h-5 w-5" />
            목표 컬러
          </Label>
          <div className="grid grid-cols-4 gap-3">
            {colorOptions.map(({ name, color }) => (
              <button
                key={name}
                type="button"
                className={`aspect-square rounded-[20px] transition-all ${
                  formData.color === color
                    ? "ring-4 ring-gray-800 ring-offset-2 scale-105"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData({ ...formData, color })}
                title={name}
              />
            ))}
          </div>
        </div>

        {/* Icon Selector */}
        <div className="space-y-3">
          <Label className="text-base font-bold text-gray-800">아이콘</Label>
          <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
            <SelectTrigger className="h-14 rounded-3xl border-2 border-gray-200 bg-gray-50 px-5">
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

        {/* Date Selection */}
        <div className="space-y-3">
          <Label className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            기간 설정
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm text-gray-600">시작일</span>
              <Input
                type={formData.allDay ? "date" : "datetime-local"}
                value={formData.allDay ? formData.startDate : formData.startDateTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [formData.allDay ? "startDate" : "startDateTime"]: e.target.value,
                  })
                }
                className="h-14 rounded-3xl border-2 border-gray-200 bg-white px-5"
                required
              />
            </div>
            <div className="space-y-2">
              <span className="text-sm text-gray-600">종료일</span>
              <Input
                type={formData.allDay ? "date" : "datetime-local"}
                value={formData.allDay ? formData.endDate : formData.endDateTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [formData.allDay ? "endDate" : "endDateTime"]: e.target.value,
                  })
                }
                min={formData.allDay ? formData.startDate : formData.startDateTime}
                className="h-14 rounded-3xl border-2 border-gray-200 bg-white px-5"
                required
              />
            </div>
          </div>
        </div>

        {/* Duration Display */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-5 border-l-4 border-[#FF9B7D]">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">선택한 기간</span>
            <span className="text-2xl font-bold text-gray-800">{durationDays}일</span>
          </div>
        </div>

        {/* Sub Tasks */}
        {subTasks.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-bold text-gray-800">세부 일정</Label>
            <div className="space-y-2">
              {subTasks.map((task, index) => (
                <div
                  key={`${task.id}-${index}`}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleSubTask(task.id, index)}
                    className="h-5 w-5"
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
                        className="flex-1 h-9 rounded-2xl"
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={saveInlineEdit}
                        className="bg-[#FF9B7D] hover:bg-[#FF8A6B] rounded-xl"
                      >
                        저장
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className={`flex-1 ${task.completed ? "line-through text-gray-400" : ""}`}>
                        {task.title}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => startInlineEdit(task, index)}
                        className="hover:bg-gray-200 rounded-xl"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubTask(task.id)}
                        className="hover:bg-red-100 text-red-600 rounded-xl"
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

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-14 rounded-3xl border-2 border-gray-200 bg-white text-gray-700 font-bold text-base hover:bg-gray-50"
          >
            취소
          </Button>
          <Button
            type="submit"
            className="flex-1 h-14 rounded-3xl bg-gradient-to-r from-[#FF9B7D] to-[#FFA98A] text-white font-bold text-base hover:from-[#FF8A6B] hover:to-[#FF9879] shadow-lg"
          >
            {schedule ? "일정 수정" : "일정 만들기"}
          </Button>
        </div>

        {schedule && onDelete && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            className="w-full h-14 rounded-3xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50"
          >
            <Trash2 className="h-5 w-5 mr-2" />
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