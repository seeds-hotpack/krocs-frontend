import axiosInstance from './axiosinstance';

export interface SubGoal {
  sub_goal_id: number;
  title: string;
  completed: boolean;
  is_time_selected?: boolean;
  start_date_time?: string | null;
  end_date_time?: string | null;
}

export interface Goal {
  goalId: number;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  color: string;
  startDate: string;
  endDate: string;
  duration: number;
  completed: boolean;
  subGoals: SubGoal[];
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetGoalsParams {
  searchDate?: string;
  keyword?: string;
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
}

export const getGoals = async (params: GetGoalsParams): Promise<Goal[]> => {
  const response = await axiosInstance.get('/goals', { params });
  const apiGoals = response.data.result;

  if (!Array.isArray(apiGoals)) {
    console.error("API did not return an array of goals:", apiGoals);
    return []; 
  }

  return apiGoals.map((g: any) => {
    const startDate = new Date(g.startDate);
    const endDate = new Date(g.endDate);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      goalId: g.goalId,
      title: g.title,
      priority: g.priority,
      color: g.color,
      startDate: g.startDate,
      endDate: g.endDate,
      duration: duration, // 계산된 duration 추가
      completed: g.isCompleted,
      subGoals: (g.subGoals || []).map((sg: any) => ({
        sub_goal_id: sg.sub_goal_id,
        title: sg.title,
        completed: sg.is_completed,
        is_time_selected: Boolean(sg.is_time_selected),
        start_date_time: sg.start_date_time ?? null,
        end_date_time: sg.end_date_time ?? null,
      })),
      completionPercentage: g.completionPercentage ?? 0,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    };
  });
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

export interface GetGoalResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: any; // The raw goal object from API
}

export const getGoalById = async (goalId: number): Promise<Goal> => {
    const response = await axiosInstance.get<GetGoalResponse>(`/goals/${goalId}`);
    const g = response.data.result;

    // Reuse the same mapping logic from getGoals
    const startDate = new Date(g.startDate);
    const endDate = new Date(g.endDate);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
        goalId: g.goalId,
        title: g.title,
        priority: g.priority,
        color: g.color,
        startDate: g.startDate,
        endDate: g.endDate,
        duration: duration,
        completed: g.isCompleted,
        subGoals: (g.subGoals || []).map((sg: any) => ({
            sub_goal_id: sg.sub_goal_id,
            title: sg.title,
            completed: sg.is_completed,
            is_time_selected: Boolean(sg.is_time_selected),
            start_date_time: sg.start_date_time ?? null,
            end_date_time: sg.end_date_time ?? null,
        })),
        completionPercentage: g.completionPercentage ?? 0,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
    };
};