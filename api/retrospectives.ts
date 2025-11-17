import axiosInstance from "./axiosinstance"

export type RetrospectiveOutcome = "COMPLETE_SUCCESS" | "COMPLETE_FAILURE" | "RETRY_FAILURE"

export interface RetrospectiveFactor {
  key: string
  description: string
}

export interface RetrospectiveFactorStat {
  factor: string
  description: string
  count: number
}

interface FactorsResponse {
  isSuccess: boolean
  code: string
  message: string
  result: {
    successFactors: RetrospectiveFactor[]
    failureFactors: RetrospectiveFactor[]
  }
}

export interface RetrospectivePayload {
  outcome: RetrospectiveOutcome
  factors: string[]
  context?: string
}

export interface RetrospectiveSummaryItem {
  retrospectiveId: number
  goalId: number
  goalName: string
  outcome: RetrospectiveOutcome
  content: string | null
  factors: string[]
  createdAt: string
}

export interface RetrospectivePage {
  content: RetrospectiveSummaryItem[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  isLast: boolean
}

export interface RetrospectiveStatistics {
  topSuccessFactors: RetrospectiveFactorStat[]
  topFailureFactors: RetrospectiveFactorStat[]
}

export interface RetrospectiveMyPageResult {
  statistics: RetrospectiveStatistics
  retrospectives: RetrospectivePage
}

export interface RetrospectiveMyPageParams {
  outcome?: RetrospectiveOutcome
  page?: number
  size?: number
  sort?: string
}

let cachedFactors: { successFactors: RetrospectiveFactor[]; failureFactors: RetrospectiveFactor[] } | null = null

export const getRetrospectiveFactors = async () => {
  if (cachedFactors) {
    return cachedFactors
  }

  const response = await axiosInstance.get<FactorsResponse>("/retrospectives/factors")
  cachedFactors = response.data.result
  return cachedFactors
}

export const createGoalRetrospective = async (goalId: number, payload: RetrospectivePayload) => {
  const response = await axiosInstance.post(`/retrospectives/goals/${goalId}`, payload)
  return response.data
}

export const getRetrospectiveMyPage = async (
  params: RetrospectiveMyPageParams
): Promise<RetrospectiveMyPageResult> => {
  const response = await axiosInstance.get<{ result: RetrospectiveMyPageResult }>("/retrospectives/mypage", {
    params,
  })
  return response.data.result
}

export const deleteGoalRetrospective = async (goalId: number, retrospectiveId: number) => {
  const response = await axiosInstance.delete(`/retrospectives/goals/${goalId}/${retrospectiveId}`)
  return response.data
}
