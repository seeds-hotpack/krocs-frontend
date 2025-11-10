'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GoalDetail } from "@/components/goal-detail"
import { getGoalById, Goal, deleteBigGoal } from '@/api/goals'
import { update_Goal, type UpdateGoalRequest } from '@/api/updateGoal'

// goal-detail.tsx에서 사용하는 onUpdate와 동일한 인터페이스를 정의합니다.
interface UpdateGoalData {
  title?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  startDate?: string;
  endDate?: string;
  completed?: boolean;
  color?: string;
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
        const numericGoalId = parseInt(goalId, 10);
        if (isNaN(numericGoalId)) {
          setError("Invalid Goal ID.");
          setLoading(false);
          return;
        }
        const foundGoal = await getGoalById(numericGoalId);

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

    const payload = {
      ...goal,
      ...updatedData,
    };

    const apiPayload: UpdateGoalRequest = {
      title: payload.title,
      priority: payload.priority,
      startDate: payload.startDate,
      endDate: payload.endDate,
      isCompleted: payload.completed,
      color: payload.color,
    };

    try {
      const response = await update_Goal(goal.goalId, 1, apiPayload); // userId는 1로 가정
      const updatedGoalFromApi = response.result;
      
      setGoal(prevGoal => {
        if (!prevGoal) return null;
        const start = new Date(updatedGoalFromApi.startDate);
        const end = new Date(updatedGoalFromApi.endDate);
        const calculatedDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        return {
            ...prevGoal,
            title: updatedGoalFromApi.title,
            priority: updatedGoalFromApi.priority as 'LOW' | 'MEDIUM' | 'HIGH',
            startDate: updatedGoalFromApi.startDate,
            endDate: updatedGoalFromApi.endDate,
            completed: updatedGoalFromApi.isCompleted,
            color: apiPayload.color,
            duration: calculatedDuration,
        };
      });
    } catch (err) {
      console.error("Failed to update goal:", err);
      setError("목표 업데이트에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!goal) return;
    try {
      await deleteBigGoal(goal.goalId);
      alert("목표가 삭제되었습니다.");
      router.push('/');
    } catch (err: any) {
      console.error("Failed to delete goal:", err);
      alert(err?.response?.data?.message || "목표 삭제에 실패했습니다.");
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
      onDelete={handleDelete}
    />
  );
}
