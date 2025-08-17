import axiosInstance from './axiosinstance';
//---------------------------------소목표 호출 api---------------------------------
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
//---------------------------------소목표 생성 api---------------------------------
export interface CreateSubGoalRequest {
  title: string;
}

export interface CreatedSubGoal {
  subGoalId: number;
  title: string;
  isCompleted: boolean;
}

export interface CreateSubGoalResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    goal_id: number;
    created_sub_goals: CreatedSubGoal[];
  };
}

export const createSubGoal = async (
  goalId: number,
  subGoalData: CreateSubGoalRequest
): Promise<CreateSubGoalResponse> => {
  try {
    console.log("createSubGoal 호출:", goalId, subGoalData);
    const response = await axiosInstance.post<CreateSubGoalResponse>(
      `/goals/${goalId}/subgoals`,
      {
        sub_goals: [subGoalData], // ✅ 요청 바디를 배열로 감싸서 보내야 함
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('소목표 생성 실패:', error.response?.data || error.message);
    throw error;
  }
};
//----------------------------------소목표 삭제 api---------------------------------
export interface DeleteSubGoalResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result?: string; 
}

export const deleteSubGoal = async (
  subGoalId: number
): Promise<DeleteSubGoalResponse> => {
  try {
    const response = await axiosInstance.delete<DeleteSubGoalResponse>(
      `/subgoals/${subGoalId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('소목표 삭제 실패:', error.response?.data || error.message);
    throw error;
  }
};