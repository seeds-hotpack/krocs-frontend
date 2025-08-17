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


export const getGoals = async (date: string): Promise<Goal[]> => {
  const response = await axiosInstance.get('/goals', { params: { date } });
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

export const deleteBigGoal = async (goalId: number): Promise<DeleteGoalResponse> => {
  try {
    // 👇 두 번째 인자로 전달되던 params 객체를 삭제했습니다.
    const response = await axiosInstance.delete<DeleteGoalResponse>(`/goals/${goalId}`);

    return response.data;
  } catch (error: any) {
    console.error('대목표 삭제 중 오류 발생:', error);

    throw error;
  }
};