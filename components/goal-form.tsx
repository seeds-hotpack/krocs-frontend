"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface Goal {
  goalId: number
  title: string
  priority: "LOW" | "MEDIUM" | "HIGH"
  startDate: string
  endDate: string
  duration: number
  completed: boolean
  subGoals: any[]
  createdAt: string
  updatedAt: string
}

interface GoalFormProps {
  goal?: Goal | null
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function GoalForm({ goal, onSubmit, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState({
    title: goal?.title || "",
    priority: goal?.priority || "MEDIUM",
    startDate: goal?.startDate || new Date().toISOString().split("T")[0],
    endDate: goal?.endDate || new Date().toISOString().split("T")[0],
    duration: goal?.duration || 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Calculate duration if not provided
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const calculatedDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    onSubmit({
      ...formData,
      duration: calculatedDuration,
    })
  }

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    const newFormData = { ...formData, [field]: value }

    // Auto-calculate duration when dates change
    if (newFormData.startDate && newFormData.endDate) {
      const start = new Date(newFormData.startDate)
      const end = new Date(newFormData.endDate)
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      newFormData.duration = Math.max(0, duration)
    }

    setFormData(newFormData)
  }

  return (
    <Card className="max-w-2xl mx-auto border-0 shadow-lg">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-900">{goal ? "Edit Goal" : "New Goal"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel} className="hover:bg-slate-100 rounded-md">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-slate-700">
              Goal Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter your goal"
              className="h-10 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium text-slate-700">
              Priority
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger className="h-10 border-slate-300 focus:border-slate-900 focus:ring-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-slate-700">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                className="h-10 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-slate-700">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                min={formData.startDate}
                className="h-10 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium text-slate-700">
              Duration (days)
            </Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) || 0 })}
              min="0"
              readOnly
              className="h-10 border-slate-300 bg-slate-50"
            />
            <p className="text-sm text-slate-500">Automatically calculated from start and end dates</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium">
              {goal ? "Update Goal" : "Create Goal"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-slate-300 hover:bg-slate-50 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
