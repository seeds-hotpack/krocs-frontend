"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Clock, Calendar, Sparkles, Trash2 } from "lucide-react"
import {
  CreateSubGoalRequest,
  UpdateSubGoalRequest,
  createSubGoal,
  updateSubGoal,
} from "@/api/subgoals"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

export interface SubGoalModalData {
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
  editingSubGoal?: SubGoalModalData | null
  onDelete?: (subGoalId: number) => void
}

export function SubGoalModal({
                               isOpen,
                               onClose,
                               onSubGoalCreated,
                               goalId,
                               editingSubGoal = null,
                               onDelete,
                             }: SubGoalModalProps) {
  const [title, setTitle] = useState("")
  const [isTimeSelected, setIsTimeSelected] = useState(false)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

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

    const buildBaseData = (): CreateSubGoalRequest => ({
      title: title.trim(),
      is_time_selected: false,
    })

    const subGoalCreateData = buildBaseData()

    if (isTimeSelected) {
      if (!startTime || !endTime || !startDate || !endDate) {
        setError("시간을 사용할 경우 날짜와 시간을 모두 선택해야 해요.")
        setLoading(false)
        return
      }
      const buildDateTime = (date: string, time: string) => `${date}T${time}`
      subGoalCreateData.is_time_selected = true
      subGoalCreateData.start_date_time = buildDateTime(startDate, startTime)
      subGoalCreateData.end_date_time = buildDateTime(endDate, endTime)
    }

    try {
      if (isEditMode && editingSubGoal) {
        const sanitizeDate = (value?: string | null) => value ?? undefined
        const updatePayload: UpdateSubGoalRequest = {
          title: subGoalCreateData.title,
          is_completed: editingSubGoal.completed,
          is_time_selected: subGoalCreateData.is_time_selected,
          start_date_time: subGoalCreateData.is_time_selected
            ? sanitizeDate(subGoalCreateData.start_date_time)
            : undefined,
          end_date_time: subGoalCreateData.is_time_selected
            ? sanitizeDate(subGoalCreateData.end_date_time)
            : undefined,
        }
        await updateSubGoal(goalId, editingSubGoal.sub_goal_id, updatePayload)
      } else {
        await createSubGoal(goalId, subGoalCreateData)
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
        <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Header with Gradient */}
          <div className="relative px-6 py-5 bg-gradient-to-br from-[#ff8b6b] to-[#ff6b47] overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-white flex-shrink-0" />
                <h2 className="text-lg font-bold text-white">
                  {isEditMode ? "소목표 수정" : "소목표 추가"}
                </h2>
              </div>
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-all flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-[#0F1C21] flex items-center gap-2">
                <span>소목표 이름</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 1장 읽고 요약하기"
                  className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-base text-[#0F1C21] placeholder:text-[#5D6E72]/50 focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff6b47]/20 transition-all"
              />
            </div>

            {/* Time Selection Toggle */}
            <div className="flex items-center space-x-3 p-3 bg-[#EEF5F7] rounded-2xl">
              <Checkbox
                  id="isTimeSelected"
                  checked={isTimeSelected}
                  onCheckedChange={(checked) => setIsTimeSelected(Boolean(checked))}
                  className="border-[#99C6D6] data-[state=checked]:bg-[#ff8b6b] data-[state=checked]:border-[#ff6b47]"
              />
              <Label
                  htmlFor="isTimeSelected"
                  className="text-sm font-semibold text-[#0F1C21] cursor-pointer"
              >
                시간도 함께 관리할래요
              </Label>
            </div>

            {/* Date and Time Inputs */}
            {isTimeSelected && (
                <div className="space-y-4">
                  {/* Date Selection */}
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
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff6b47]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-xs text-[#5D6E72]">
                          종료 날짜
                        </Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff6b47]/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Time Selection */}
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
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff6b47]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime" className="text-xs text-[#5D6E72]">
                          종료 시간
                        </Label>
                        <Input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-sm text-[#0F1C21] focus:border-[#ff8b6b] focus:ring-2 focus:ring-[#ff6b47]/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-3 rounded-2xl bg-red-50 border-2 border-red-200">
                  <p className="text-sm text-red-600 text-center font-medium">{error}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 h-12 rounded-2xl border-2 border-[#D3E6ED] bg-white text-[#5D6E72] font-semibold hover:bg-[#EEF5F7] transition-all"
              >
                취소
              </Button>
              <Button
                  onClick={handleSubmit}
                  disabled={!title.trim() || loading}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#ff8b6b] to-[#ff6b47] text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading ? `${isEditMode ? '수정' : '추가'} 중...` : isEditMode ? "수정 완료" : "소목표 추가"}
              </Button>
            </div>

            {/* Delete Button - 편집 모드일 때만 표시 */}
            {isEditMode && onDelete && editingSubGoal && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="w-full h-12 rounded-2xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                세부목표 삭제
              </Button>
            )}
          </div>
        </div>

        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            if (editingSubGoal && onDelete) {
              onDelete(editingSubGoal.sub_goal_id);
            }
            setShowDeleteModal(false);
            handleClose();
          }}
          title="세부목표 삭제"
          message="정말로 이 세부목표를 삭제하시겠습니까?"
          confirmText="삭제"
        />
      </div>
  )
}
