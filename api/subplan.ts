import axiosInstance from "./axiosinstance";

// 서버에서 내려주는 데이터 타입 정의
export interface SubPlan {
  title: string;
  sub_plan_id: number;
  is_completed: boolean;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  title: string;
  color: string;            
  plan_id: number;
  goal_id: number;
  sub_goal_id: number;
  sub_plans: SubPlan[];
  plan_category: string;    
  start_date_time: string;
  end_date_time: string;
  all_day: boolean;
  is_completed: boolean;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface GetPlansResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    plans: Plan[];
  };
}

// 특정 날짜(dateTime)에 대한 일정 가져오기 API
export const getPlans = async (dateTime: string): Promise<Plan[]> => {
  try {
    const response = await axiosInstance.get<GetPlansResponse>("/plans", {
      params: { dateTime }, // 👈 쿼리 파라미터
    });

    // result.plans 반환
    return response.data.result.plans;
  } catch (error) {
    console.error("❌ getPlans API 호출 실패:", error);
    throw error;
  }
};

//-----------------------------------일정 생성 api---------------------------------
export interface CreatePlanRequest {
  title: string;
  start_date_time: string; // "2025-08-03T15:05"
  end_date_time: string;   // "2025-08-03T15:05"
  all_day: boolean;
  color: string;           // ✅ 추가
  plan_category: string;   // ✅ 추가 (enum이면 나중에 타입 좁혀도 됨)
}

export interface CreatePlanResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    title: string;
    color: string;            // ✅ 추가
    plan_id: number;
    goal_id: number;
    sub_goal_id: number;
    sub_plans: SubPlan[];     // ✅ 타입 명확히
    plan_category: string;    // ✅ 추가
    start_date_time: string;
    end_date_time: string;
    all_day: boolean;
    is_completed: boolean;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
  };
}

export const createPlan = async (
  subGoalId: number,
  planData: CreatePlanRequest
): Promise<CreatePlanResponse["result"]> => {
  try {
    const response = await axiosInstance.post<CreatePlanResponse>(
      `/plans`,
      planData,
      {
        params: { sub_goal_id: subGoalId }, // 👈 쿼리 파라미터
      }
    );

    return response.data.result;
  } catch (error) {
    console.error("❌ createPlan API 호출 실패:", error);
    throw error;
  }
};