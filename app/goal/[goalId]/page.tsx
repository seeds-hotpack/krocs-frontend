'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GoalDetail } from "@/components/goal-detail"
import { getGoals, Goal } from '@/api/goals'
import { update_Goal } from '@/api/updateGoal'

// goal-detail.tsx에서 사용하는 onUpdate와 동일한 인터페이스를 정의합니다.
interface UpdateGoalData {
  title?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  startDate?: string;
  endDate?: string;
  completed?: boolean;
}

export default function GoalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = Array.isArray(params.goalId) ? params.goalId[0] : params.goalId;

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoal = async () => {
      if (!goalId) return;

      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const allGoals = await getGoals(formattedDate);
        const numericGoalId = parseInt(goalId, 10);
        const foundGoal = allGoals.find(g => g.goalId === numericGoalId);

        if (foundGoal) {
          setGoal(foundGoal);
        } else {
          setError("Goal not found.");
        }
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/login');
        } else {
          setError(err?.response?.data?.message || "Failed to load the goal.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [goalId, router]);

  const handleUpdate = async (updatedData: Partial<UpdateGoalData>) => {
    if (!goal) return;

    const apiPayload = {
        ...(updatedData.title && { title: updatedData.title }),
        ...(updatedData.priority && { priority: updatedData.priority }),
        ...(updatedData.startDate && { startDate: updatedData.startDate }),
        ...(updatedData.endDate && { endDate: updatedData.endDate }),
        ...(updatedData.completed !== undefined && { isCompleted: updatedData.completed }),
    };

    try {
      const response = await update_Goal(goal.goalId, 1, apiPayload); // userId는 1로 가정
      const updatedGoalFromApi = response.result;
      
      setGoal(prevGoal => {
        if (!prevGoal) return null;
        return {
            ...prevGoal,
            title: updatedGoalFromApi.title,
            priority: updatedGoalFromApi.priority as 'LOW' | 'MEDIUM' | 'HIGH',
            startDate: updatedGoalFromApi.startDate,
            endDate: updatedGoalFromApi.endDate,
            completed: updatedGoalFromApi.isCompleted,
        };
      });
    } catch (err) {
      console.error("Failed to update goal:", err);
      setError("목표 업데이트에 실패했습니다.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">Error: {error}</div>;
  }

  if (!goal) {
    return <div className="flex items-center justify-center min-h-screen">Goal not found.</div>;
  }

  return (
    <GoalDetail
      goal={goal}
      onBack={() => router.push('/')}
      onUpdate={handleUpdate}
    />
  );
}