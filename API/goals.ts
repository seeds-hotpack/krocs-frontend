import axiosInstance from './axiosinstance';

export interface SubGoal {
  subGoalId: number;
  title: string;
  completed: boolean;
}

export interface Goal {
  goalId: number;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  startDate: string;
  endDate: string;
  duration: number;
  completed: boolean;
  subGoals: SubGoal[];
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export const getGoals = async (userId: number, date: string): Promise<Goal[]> => {
  const params = { user_id: userId, date };  // date 필수
  const response = await axiosInstance.get('/goals', { params });
  const apiGoals = response.data.result;

  return apiGoals.map((g: any) => ({
    goalId: g.goalId,
    title: g.title,
    priority: g.priority,
    startDate: g.startDate,
    endDate: g.endDate,
    completed: g.isCompleted,
    subGoals: (g.subGoals || []).map((sg: any) => ({
      subGoalId: sg.subGoalId,
      title: sg.title,
      completed: sg.isCompleted,
    })),
    completionPercentage: g.completionPercentage ?? 0,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  }));
};

//----------------------------------대목표 삭제 api---------------------------------
interface DeleteGoalResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: string;
}

export const deleteBigGoal = async (goalId: number, userId: number): Promise<DeleteGoalResponse> => {
  try {
    const response = await axiosInstance.delete<DeleteGoalResponse>(`/goals/${goalId}`, {
      params: { user_id: userId },
    });

    return response.data;
  } catch (error: any) {
    console.error('대목표 삭제 중 오류 발생:', error);

    throw error;
  }
};