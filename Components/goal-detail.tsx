"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Trash2, Calendar, Clock, Target } from "lucide-react"

interface SubGoal {
  subGoalId: number
  title: string
  completed: boolean
}

interface Goal {
  goalId: number
  title: string
  priority: "LOW" | "MEDIUM" | "HIGH"
  startDate: string
  endDate: string
  duration: number
  completed: boolean
  subGoals: SubGoal[]
  createdAt: string
  updatedAt: string
}

interface GoalDetailProps {
  goal: Goal
  onBack: () => void
  onUpdate: (updatedGoal: Partial<Goal>) => void
}

export function GoalDetail({ goal, onBack, onUpdate }: GoalDetailProps) {
  const [newSubGoalTitle, setNewSubGoalTitle] = useState("")
  const [subGoals, setSubGoals] = useState<SubGoal[]>(goal.subGoals)

  const addSubGoal = () => {
    if (newSubGoalTitle.trim()) {
      const newSubGoal: SubGoal = {
        subGoalId: Date.now(),
        title: newSubGoalTitle.trim(),
        completed: false,
      }
      const updatedSubGoals = [...subGoals, newSubGoal]
      setSubGoals(updatedSubGoals)
      onUpdate({ subGoals: updatedSubGoals })
      setNewSubGoalTitle("")
    }
  }

  const toggleSubGoal = (subGoalId: number) => {
    const updatedSubGoals = subGoals.map((sg) =>
      sg.subGoalId === subGoalId ? { ...sg, completed: !sg.completed } : sg,
    )
    setSubGoals(updatedSubGoals)
    onUpdate({ subGoals: updatedSubGoals })
  }

  const deleteSubGoal = (subGoalId: number) => {
    const updatedSubGoals = subGoals.filter((sg) => sg.subGoalId !== subGoalId)
    setSubGoals(updatedSubGoals)
    onUpdate({ subGoals: updatedSubGoals })
  }

  const toggleGoalCompletion = () => {
    onUpdate({ completed: !goal.completed })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-slate-900 text-white"
      case "MEDIUM":
        return "bg-slate-600 text-white"
      case "LOW":
        return "bg-slate-400 text-white"
      default:
        return "bg-slate-300 text-slate-700"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "High"
      case "MEDIUM":
        return "Medium"
      case "LOW":
        return "Low"
      default:
        return priority
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const completedSubGoals = subGoals.filter((sg) => sg.completed).length
  const progressPercentage = subGoals.length > 0 ? (completedSubGoals / subGoals.length) * 100 : 0

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-slate-100 px-3 py-2 rounded-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Goals
          </Button>
        </div>

        {/* Main Goal Card */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <h1
                  className={`text-2xl font-semibold ${goal.completed ? "line-through text-slate-500" : "text-slate-900"}`}
                >
                  {goal.title}
                </h1>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${getPriorityColor(goal.priority)}`}>
                    {getPriorityText(goal.priority)}
                  </span>
                  {goal.completed && (
                    <span className="px-3 py-1 rounded text-sm font-medium bg-slate-900 text-white">Completed</span>
                  )}
                </div>
              </div>
              <Button
                variant={goal.completed ? "secondary" : "default"}
                onClick={toggleGoalCompletion}
                className={`px-6 py-2 font-medium ${
                  goal.completed
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {goal.completed ? "Mark Incomplete" : "Mark Complete"}
              </Button>
            </div>

            {/* Progress Bar */}
            {subGoals.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-slate-900 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">Start Date</div>
                  <div className="font-medium text-slate-900">{formatDate(goal.startDate)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">End Date</div>
                  <div className="font-medium text-slate-900">{formatDate(goal.endDate)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">Duration</div>
                  <div className="font-medium text-slate-900">{goal.duration} days</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sub Goals Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-xl font-semibold text-slate-900">Subtasks</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Add Sub Goal */}
            <div className="flex gap-3 mb-6">
              <Input
                placeholder="Add a new subtask"
                value={newSubGoalTitle}
                onChange={(e) => setNewSubGoalTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addSubGoal()
                  }
                }}
                className="h-10 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
              />
              <Button
                onClick={addSubGoal}
                disabled={!newSubGoalTitle.trim()}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 font-medium disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {subGoals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No subtasks yet</h3>
                <p className="text-slate-600">Break down your goal into smaller, manageable tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subGoals.map((subGoal, index) => (
                  <div
                    key={subGoal.subGoalId}
                    className={`group flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                      subGoal.completed
                        ? "bg-slate-50 border-slate-200"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                      {index + 1}
                    </div>

                    <Checkbox
                      checked={subGoal.completed}
                      onCheckedChange={() => toggleSubGoal(subGoal.subGoalId)}
                      className="w-5 h-5"
                    />

                    <span
                      className={`flex-1 font-medium ${
                        subGoal.completed ? "line-through text-slate-500" : "text-slate-900"
                      }`}
                    >
                      {subGoal.title}
                    </span>

                    {subGoal.completed && (
                      <span className="px-2 py-1 bg-slate-900 text-white text-xs font-medium rounded">Done</span>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSubGoal(subGoal.subGoalId)}
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 hover:bg-slate-100 rounded-md transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4 text-slate-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {subGoals.length > 0 && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-slate-900 mb-1">
                    {completedSubGoals}/{subGoals.length}
                  </div>
                  <div className="text-sm text-slate-600">Subtasks completed ({Math.round(progressPercentage)}%)</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
