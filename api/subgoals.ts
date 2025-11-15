import axiosInstance from './axiosinstance';
//---------------------------------소목표 호출 api---------------------------------
export interface SubGoal {
  sub_goal_id: number;
  title: string;
  is_completed: boolean;
  is_time_selected: boolean;
  start_date_time: string;
  end_date_time: string;
  color?: string;
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
  is_time_selected: boolean;
  start_date_time?: string | null;
  end_date_time?: string | null;
}

export interface CreatedSubGoal {
  sub_goal_id: number;
  title: string;
  is_completed: boolean;
  is_time_selected: boolean;
  start_date_time: string;
  end_date_time: string;
  color?: string;
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
  goalId: number,
  subGoalId: number
): Promise<DeleteSubGoalResponse> => {
  try {
    const response = await axiosInstance.delete<DeleteSubGoalResponse>(
            `/goals/${goalId}/subgoals/${subGoalId}`    );
    return response.data;
  } catch (error: any) {
    console.error('소목표 삭제 실패:', error.response?.data || error.message);
    throw error;
  }
};
//------------------------------------소목표 수정 api---------------------------------
export interface UpdateSubGoalRequest {
  title: string;
  is_completed: boolean;
  is_time_selected?: boolean;
  start_date_time?: string;
  end_date_time?: string;
}

// 응답 Result 타입 정의
export interface SubGoalResponse {
  title: string;
  sub_goal_id: number;
  goal_id: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

// 최종 응답 구조
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// 서브골 수정 API
export const updateSubGoal = async (
  goalId: number,
  subGoalId: number,
  data: UpdateSubGoalRequest
): Promise<SubGoalResponse> => {
  try {
    const response = await axiosInstance.patch<ApiResponse<SubGoalResponse>>(
      `/goals/${goalId}/subgoals/${subGoalId}`,
      data
    );

    return response.data.result; // result만 리턴
  } catch (error: any) {
    console.error("서브골 수정 실패:", error.response?.data || error.message);
    throw error;
  }
};
