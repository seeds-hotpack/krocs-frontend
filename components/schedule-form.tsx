"use client"


import { createSubPlans, updateSubPlan, deleteSubPlan } from "../api/subplan";
import React from "react";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
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
  Pencil,
  Trash2
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
  onDelete?: (planId: number) => void; // 삭제 함수 prop 추가
  defaultDate: Date
  goals?: Goal[]
  onSubTaskChange: (planId: number, index: number | null, newSubTask: SubTask) => void;
  onSubTasksUpdate: (planId: number, newSubTasks: SubTask[]) => void; // 세부 일정 목록 업데이트 prop 추가
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
  { name: "PLAN_BLUE", color: "#2196f3" },
  { name: "PLAN_RED", color: "#F44336" },
  { name: "PLAN_GREEN", color: "#4caf50" },
  { name: "PLAN_PURPLE", color: "#9c27b0" },
  { name: "PLAN_ORANGE", color: "#ff9800" },
  { name: "PLAN_PINK", color: "#e91e63" },
  { name: "PLAN_YELLOW", color: "#ffeb3b" },
  { name: "PLAN_NAVY", color: "#607d8b" },
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
      : new Date(defaultDate.getFullYear(), defaultDate.getMonth(), defaultDate.getDate(), 9, 0); // Use defaultDate's date, set time to 9:00
    const initialEndDateTime = schedule?.endDateTime
      ? new Date(schedule.endDateTime)
      : new Date(defaultDate.getFullYear(), defaultDate.getMonth(), defaultDate.getDate(), 10, 0); // Use defaultDate's date, set time to 10:00

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
        // For new schedules, just update local state
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
      // API 호출 성공 시, 로컬 및 부모 상태 업데이트
      setSubTasks(newSubTasks);
      onSubTasksUpdate(schedule.planId, newSubTasks);
    } catch (error) {
      console.error("Failed to delete sub-task:", error);
      alert("세부 일정 삭제에 실패했습니다. 다시 시도해 주세요.");
      // 실패 시 특별한 UI 복구 로직이 필요하다면 여기에 추가
    }
  }

  const toggleSubTask = async (id: string, index: number) => {
    const subTaskToUpdate = subTasks[index];
    if (!subTaskToUpdate || !schedule?.planId) return;

    try {
      // First, call the API to ensure the change is persisted
      await updateSubPlan(schedule.planId, Number(id), { is_completed: !subTaskToUpdate.completed });

      // On successful API call, update the local and parent state
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
      // First, call the API to ensure the change is persisted
      await updateSubPlan(schedule.planId, Number(subTaskToUpdate.id), { title: editingSubTaskTitle.trim() });

      // On successful API call, update the local and parent state
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
            <div className="flex gap-2 pt-2">
              {colorOptions.map(({ name, color }) => (
                <button
                  key={name}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 ${formData.color === color ? "border-slate-900" : "border-transparent"}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-white"
              style={{ backgroundColor: formData.color }}
            >
              {selectedIcon && React.createElement(selectedIcon.icon, { className: "h-5 w-5" })}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{formData.title || "일정 제목"}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">미리보기</p>
            </div>
          </div>
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
                  e.stopPropagation() // 이벤트 전파 중단 추가
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
              {subTasks.map((task, index) => (
                <div
                  key={`${task.id}-${index}`}
                  className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded border dark:border-slate-700"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleSubTask(task.id, index)}
                    className="border-slate-300 dark:border-slate-600"
                  />
                  {editingSubTaskIndex === index ? (
                    <Input
                      value={editingSubTaskTitle}
                      onChange={(e) => setEditingSubTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveInlineEdit();
                        if (e.key === "Escape") cancelInlineEdit();
                      }}
                      className="flex-1 h-8"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`flex-1 text-sm ${task.completed ? "line-through text-slate-500" : "text-slate-900 dark:text-slate-100"}`}
                    >
                      {task.title}
                    </span>
                  )}
                  {editingSubTaskIndex === index ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={saveInlineEdit}
                        className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        저장
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={cancelInlineEdit}
                        className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        취소
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startInlineEdit(task, index)}
                      className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
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

          {schedule && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </Button>
          )}
        </div>
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
        title="일정 삭제 확인"
        message="정말로 이 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
      />
    </div>
  )
}