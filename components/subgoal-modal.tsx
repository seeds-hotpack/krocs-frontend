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
      setError("Title is required.")
      return
    }

    setLoading(true)
    setError(null)

    const subGoalData: CreateSubGoalRequest = {
      title: title.trim(),
    }

    if (isTimeSelected) {
      if (!startTime || !endTime) {
        setError("Start and end times are required when time is selected.")
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
      setError(e.message || "Failed to create sub-goal.")
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
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Add New Subtask
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-0 h-8 w-8"
          >
            <X className="h-5 w-5 text-slate-500" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label
              htmlFor="title"
              className="text-slate-700 dark:text-slate-300"
            >
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete the first chapter"
              className="mt-1 h-10 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="isTimeSelected"
              checked={isTimeSelected}
              onCheckedChange={(checked) => setIsTimeSelected(Boolean(checked))}
              className="w-5 h-5"
            />
            <Label
              htmlFor="isTimeSelected"
              className="text-slate-700 dark:text-slate-300 font-medium"
            >
              Set time range for this subtask
            </Label>
          </div>

          {isTimeSelected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
              <div>
                <Label
                  htmlFor="startTime"
                  className="text-slate-700 dark:text-slate-300"
                >
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 h-10 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <Label
                  htmlFor="endTime"
                  className="text-slate-700 dark:text-slate-300"
                >
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 h-10 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 text-red-500 text-sm text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || loading}>
            {loading ? "Adding..." : "Add Subtask"}
          </Button>
        </div>
      </div>
    </div>
  )
}
