import axiosInstance from './axiosinstance';

interface CreateGoalRequest {
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

interface SubGoal {
  subGoalId: number;
  title: string;
  isCompleted: boolean;
}

interface CreateGoalResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    goalId: number;
    title: string;
    priority: string;
    startDate: string;
    endDate: string;
    subGoals: SubGoal[];
    createdAt: string;
    updatedAt: string;
    completed: boolean;
  };
}

export const createGoal = async (
  userId: number,
  goalData: CreateGoalRequest
): Promise<CreateGoalResponse> => {
  try {
    const response = await axiosInstance.post<CreateGoalResponse>(
      `/goals?user_id=${userId}`,
      goalData
    );
    return response.data;
  } catch (error: any) {
    console.error('대목표 생성 실패:', error);
    throw error;
  }
};