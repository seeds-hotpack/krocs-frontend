import axiosInstance from './axiosinstance';

interface SubGoal {
  subGoalId: number;
  title: string;
  isCompleted: boolean;
}

export interface UpdateGoalRequest {
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  isCompleted: boolean;
  color?: string;
}

interface UpdateGoalResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    goalId: number;
    title: string;
    priority: string;
    startDate: string;
    endDate: string;
    isCompleted: boolean;
    subGoals: SubGoal[];
    completionPercentage: number;
    createdAt: string;
    updatedAt: string;
  };
}

export const update_Goal = async (
  goalId: number,
  userId: number,
  goalData: Partial<UpdateGoalRequest>
): Promise<UpdateGoalResponse> => {
  try {
    const response = await axiosInstance.patch<UpdateGoalResponse>(
      `/goals/${goalId}?user_id=${userId}`,
      goalData
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to update goal:', error);
    throw error;
  }
};