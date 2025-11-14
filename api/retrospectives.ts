import axiosInstance from "./axiosinstance"

export type RetrospectiveOutcome = "COMPLETE_SUCCESS" | "COMPLETE_FAILURE" | "RETRY_FAILURE"

export interface RetrospectiveFactor {
  key: string
  description: string
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
