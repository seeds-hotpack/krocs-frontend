"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import {
  CreateSubGoalRequest,
  createSubGoal,
} from "@/api/subgoals"

interface SubGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubGoalCreated: () => void
  goalId: number
}

export function SubGoalModal({
  isOpen,
  onClose,
  onSubGoalCreated,
  goalId,
}: SubGoalModalProps) {
  const [title, setTitle] = useState("")
  const [isTimeSelected, setIsTimeSelected] = useState(false)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("소목표 이름을 입력해 주세요.")
      return
    }

    setLoading(true)
    setError(null)

    const subGoalData: CreateSubGoalRequest = {
      title: title.trim(),
      is_time_selected: false,
    }

    if (isTimeSelected) {
      if (!startTime || !endTime) {
        setError("시간을 사용할 경우 시작과 종료 시간을 모두 선택해야 해요.")
        setLoading(false)
        return
      }
      // Combine date with time for the request
      const today = new Date().toISOString().split("T")[0]
      subGoalData.is_time_selected = true
      subGoalData.start_date_time = `${today}T${startTime}:00`
      subGoalData.end_date_time = `${today}T${endTime}:00`
    }

    try {
      await createSubGoal(goalId, subGoalData)
      onSubGoalCreated() // Callback to refresh the sub-goal list
      handleClose()
    } catch (e: any) {
      setError(e.message || "소목표 생성에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    // Reset form state
    setTitle("")
    setIsTimeSelected(false)
    setStartTime("")
    setEndTime("")
    setError(null)
    setLoading(false)
    onClose() // Close the modal
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#D3E6ED] bg-white/95 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5D6E72]">
              소목표 추가
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#0F1C21]">어떤 일을 더할까요?</h2>
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
              className="mt-2 h-11 rounded-xl border-[#D3E6ED] bg-[#EEF5F7] text-sm text-[#0F1C21] placeholder:text-[#5D6E72] focus:border-[#99C6D6] focus:ring-[#99C6D6]"
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#D3E6ED] bg-[#EEF5F7] px-4 py-3">
            <Checkbox
              id="isTimeSelected"
              checked={isTimeSelected}
              onCheckedChange={(checked) => setIsTimeSelected(Boolean(checked))}
              className="h-5 w-5 border-[#99C6D6] data-[state=checked]:bg-[#BBDCE5]"
            />
            <Label
              htmlFor="isTimeSelected"
              className="text-sm font-semibold text-[#0F1C21]"
            >
              시간도 함께 관리할래요
            </Label>
          </div>

          {isTimeSelected && (
            <div className="grid gap-4 rounded-2xl border border-[#D3E6ED] bg-[#EEF5F7] px-4 py-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="startTime" className="text-sm font-semibold text-[#0F1C21]">
                  시작 시간
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-2 h-11 rounded-xl border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#99C6D6] focus:ring-[#99C6D6]"
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
                  className="mt-2 h-11 rounded-xl border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#99C6D6] focus:ring-[#99C6D6]"
                />
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
            className="rounded-full bg-[#BBDCE5] px-4 py-2 text-sm font-semibold text-[#0F1C21] shadow-sm hover:bg-[#BBDCE5]/80 disabled:opacity-50"
          >
            {loading ? "추가 중..." : "소목표 추가"}
          </Button>
        </div>
      </div>
    </div>
  )
}
