"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import {
  CreateSubGoalRequest,
  createSubGoal,
  updateSubGoal,
} from "@/api/subgoals"

interface SubGoal {
  sub_goal_id: number
  title: string
  completed: boolean
  is_time_selected: boolean
  start_date_time?: string | null
  end_date_time?: string | null
}

interface SubGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubGoalCreated: () => void
  goalId: number
  editingSubGoal?: SubGoal | null
}

export function SubGoalModal({
  isOpen,
  onClose,
  onSubGoalCreated,
  goalId,
  editingSubGoal = null,
}: SubGoalModalProps) {
  const [title, setTitle] = useState("")
  const [isTimeSelected, setIsTimeSelected] = useState(false)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isEditMode = !!editingSubGoal

  // 편집 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (editingSubGoal) {
      setTitle(editingSubGoal.title)
      setIsTimeSelected(editingSubGoal.is_time_selected)
      
      if (editingSubGoal.is_time_selected && editingSubGoal.start_date_time && editingSubGoal.end_date_time) {
        const startDateTime = new Date(editingSubGoal.start_date_time)
        const endDateTime = new Date(editingSubGoal.end_date_time)
        
        setStartDate(startDateTime.toISOString().split('T')[0])
        setEndDate(endDateTime.toISOString().split('T')[0])
        setStartTime(startDateTime.toTimeString().slice(0, 5))
        setEndTime(endDateTime.toTimeString().slice(0, 5))
      }
    } else {
      // 새로운 소목표 추가 시 오늘 날짜로 초기화
      const today = new Date().toISOString().split("T")[0]
      setStartDate(today)
      setEndDate(today)
    }
  }, [editingSubGoal])

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("소목표 이름을 입력해 주세요.")
      return
    }

    setLoading(true)
    setError(null)

    const subGoalData: CreateSubGoalRequest = {
      title: title.trim(),
      is_completed: editingSubGoal?.completed ?? false,
      is_time_selected: false,
    }

    if (isTimeSelected) {
      if (!startTime || !endTime || !startDate || !endDate) {
        setError("시간을 사용할 경우 날짜와 시간을 모두 선택해야 해요.")
        setLoading(false)
        return
      }
      subGoalData.is_time_selected = true
      subGoalData.start_date_time = `${startDate}T${startTime}:00`
      subGoalData.end_date_time = `${endDate}T${endTime}:00`
    }

    try {
      if (isEditMode && editingSubGoal) {
        await updateSubGoal(goalId, editingSubGoal.sub_goal_id, subGoalData)
      } else {
        await createSubGoal(goalId, subGoalData)
      }
      onSubGoalCreated()
      handleClose()
    } catch (e: any) {
      setError(e.message || `소목표 ${isEditMode ? '수정' : '생성'}에 실패했습니다.`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTitle("")
    setIsTimeSelected(false)
    setStartTime("")
    setEndTime("")
    setStartDate("")
    setEndDate("")
    setError(null)
    setLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#D3E6ED] bg-white/95 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5D6E72]">
              {isEditMode ? "소목표 수정" : "소목표 추가"}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#0F1C21]">
              {isEditMode ? "소목표를 수정하세요" : "어떤 일을 더할까요?"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-9 w-9 rounded-full border border-[#99C6D6] bg-white text-[#0F1C21] shadow-sm hover:bg-white/80"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5">
          <div>
            <Label htmlFor="title" className="text-sm font-semibold text-[#0F1C21]">
              소목표 이름
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 1장 읽고 요약하기"
              className="mt-2 h-11 rounded-xl border-[#D3E6ED] bg-[#EEF5F7] text-sm text-[#0F1C21] placeholder:text-[#5D6E72] focus:border-[#ff8b6b] focus:ring-[#ff8b6b]"
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#D3E6ED] bg-[#EEF5F7] px-4 py-3">
            <Checkbox
              id="isTimeSelected"
              checked={isTimeSelected}
              onCheckedChange={(checked) => setIsTimeSelected(Boolean(checked))}
              className="h-5 w-5 border-[#99C6D6] data-[state=checked]:bg-[#ff8b6b] data-[state=checked]:border-[#ff8b6b]"
            />
            <Label
              htmlFor="isTimeSelected"
              className="text-sm font-semibold text-[#0F1C21]"
            >
              시간도 함께 관리할래요
            </Label>
          </div>

          {isTimeSelected && (
            <div className="space-y-4 rounded-2xl border border-[#D3E6ED] bg-[#EEF5F7] px-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-semibold text-[#0F1C21]">
                    시작 날짜
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-2 h-11 rounded-xl border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-[#ff8b6b]"
                  />
                </div>
                <div>
                  <Label htmlFor="startTime" className="text-sm font-semibold text-[#0F1C21]">
                    시작 시간
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-2 h-11 rounded-xl border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-[#ff8b6b]"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="endDate" className="text-sm font-semibold text-[#0F1C21]">
                    종료 날짜
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-2 h-11 rounded-xl border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-[#ff8b6b]"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-sm font-semibold text-[#0F1C21]">
                    종료 시간
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-2 h-11 rounded-xl border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-[#ff8b6b]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-[#5D6E72] bg-[#EEF5F7] px-3 py-2 text-center text-xs text-[#5D6E72]">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
            className="rounded-full border border-[#99C6D6] bg-white px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-white/80"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || loading}
            className="rounded-full bg-[#ff8b6b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#ff6b47] disabled:opacity-50"
          >
            {loading ? `${isEditMode ? '수정' : '추가'} 중...` : isEditMode ? "소목표 수정" : "소목표 추가"}
          </Button>
        </div>
      </div>
    </div>
  )
}