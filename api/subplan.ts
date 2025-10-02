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
      params: { date: dateTime, _cacheBust: new Date().getTime() }, // 👈 파라미터 이름을 'date'로 수정
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
    color: string;
    plan_id: number;
    sub_plans: SubPlan[];
    plan_category: string;
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
  planData: CreatePlanRequest
): Promise<CreatePlanResponse["result"]> => {
  try {
    const response = await axiosInstance.post<CreatePlanResponse>(
      `/plans`,
      planData
    );

    return response.data.result;
  } catch (error) {
    console.error("❌ createPlan API 호출 실패:", error);
    throw error;
  }
};

//------------------------------------일정 수정 api---------------------------------
export interface UpdatePlanRequest {
  title: string;
  color: string;             // 예: "BLUE"
  plan_category: string;     // 예: "WORK"
  start_date_time: string;   // "2025-08-03T15:05"
  end_date_time: string;     // "2025-08-03T15:05"
  all_day: boolean;
  is_completed: boolean;
}

export interface UpdatePlanResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    title: string;
    color: string;
    plan_id: number;
    goal_id: number;
    sub_goal_id: number;
    sub_plans: {
      title: string;
      sub_plan_id: number;
      is_completed: boolean;
      completed_at: string;
      created_at: string;
      updated_at: string;
    }[];
    plan_category: string;
    start_date_time: string;
    end_date_time: string;
    all_day: boolean;
    is_completed: boolean;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
  };
}

export const updatePlan = async (
  planId: number,
  planData: Partial<UpdatePlanRequest>
): Promise<UpdatePlanResponse["result"]> => {
  try {
    const response = await axiosInstance.patch<UpdatePlanResponse>(
      `/plans/${planId}`,
      planData
    );

    return response.data.result;
  } catch (error) {
    console.error("❌ updatePlan API 호출 실패:", error);
    throw error;
  }
};

//----------------------------------세부 일정 호출 api---------------------------------
export interface SubPlan {
  title: string;
  sub_plan_id: number;
  is_completed: boolean;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface GetSubPlansResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    sub_plans: SubPlan[];
  };
}

export const getSubPlans = async (
  planId: number
): Promise<GetSubPlansResponse["result"]["sub_plans"]> => {
  try {
    const response = await axiosInstance.get<GetSubPlansResponse>(
      `/plans/${planId}/sub-plans`
    );
    return response.data.result.sub_plans;
  } catch (error) {
    console.error("❌ getSubPlans API 호출 실패:", error);
    throw error;
  }
};

//----------------------------------세부 일정 생성 api--------------------------------
export interface CreateSubPlanRequest {
  sub_plans: {
    title: string;
  }[];
}

export interface SubPlan {
  title: string;
  sub_plan_id: number;
  is_completed: boolean;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSubPlansResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    plan_id: number;
    created_sub_plans: SubPlan[];
  };
}
export const createSubPlans = async (
  planId: number,
  subPlans: { title: string }[]
): Promise<SubPlan[]> => {
  try {
    const body: CreateSubPlanRequest = { sub_plans: subPlans };

    const response = await axiosInstance.post<CreateSubPlansResponse>(
      `/plans/${planId}/subplans`,
      body
    );

    return response.data.result.created_sub_plans;
  } catch (error) {
    console.error("❌ createSubPlans API 호출 실패:", error);
    throw error;
  }
};

//----------------------------------세부 일정 수정 api---------------------------------
interface SubPlanUpdate {
  title?: string;
  is_completed?: boolean;
}

export const updateSubPlan = async (planId: number, subPlanId: number, data: SubPlanUpdate) => {
  const response = await axiosInstance.patch(`/plans/${planId}/subplans/${subPlanId}`, data);
  return response.data;
};

//----------------------------------일정 삭제 api---------------------------------
export interface DeletePlanResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: string;
}

export const deletePlan = async (planId: number): Promise<DeletePlanResponse> => {
  try {
    const response = await axiosInstance.delete<DeletePlanResponse>(
      `/plans/${planId}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ deletePlan API 호출 실패:", error);
    throw error;
  }
};

export interface DailyPlan {
  date: string;
  plans: Plan[];
  plan_count: number;
}

export interface GetMonthlyPlansResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    year: number;
    month: number;
    daily_plans: DailyPlan[];
  };
}

export const getMonthlyPlans = async (year: number, month: number): Promise<DailyPlan[]> => {
  try {
    const response = await axiosInstance.get<GetMonthlyPlansResponse>("/plans/monthly", {
      params: { year, month, _cacheBust: new Date().getTime() },
    });
    return response.data.result.daily_plans;
  } catch (error) {
    console.error("❌ getMonthlyPlans API 호출 실패:", error);
    throw error;
  }
};

//----------------------------------세부 일정 삭제 api---------------------------------
export interface DeleteSubPlanResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: string;
}

export const deleteSubPlan = async (planId: number, subPlanId: number): Promise<DeleteSubPlanResponse> => {
  try {
    const response = await axiosInstance.delete<DeleteSubPlanResponse>(
      `/plans/${planId}/subplans/${subPlanId}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ deleteSubPlan API 호출 실패:", error);
    throw error;
  }
};