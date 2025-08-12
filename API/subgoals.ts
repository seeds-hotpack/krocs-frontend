import axiosInstance from './axiosinstance';

export interface SubGoal {
  subGoalId: number;
  title: string;
  isCompleted: boolean;
}

export interface GetSubGoalsResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    subGoals: SubGoal[];
  };
}

export const getSubGoals = async (
  goalId: number
): Promise<GetSubGoalsResponse> => {
  try {
    const response = await axiosInstance.get<GetSubGoalsResponse>(
      `/goals/${goalId}/subgoals`
    );
    return response.data;
  } catch (error: any) {
    const msg = error?.response?.data?.message;
    if (msg === "소목표를 찾을 수 없습니다.") {
      return {
        isSuccess: true,
        code: "SUCCESS",
        message: msg,
        result: { subGoals: [] },
      };
    }
    
    throw new Error(msg || "소목표를 불러오지 못했습니다.");
  }
};