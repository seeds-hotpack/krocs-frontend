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
  plan_id: number;
  goal_id: number;
  sub_goal_id: number;
  sub_plans: SubPlan[];
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