import axiosInstance from "./axiosinstance";

export interface CreateTemplateRequest {
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  duration: number;
}

export interface SubTemplateResponse {
  title: string;
  sub_template_id: number;
  template_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateResponseResult {
  templateId: number;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  duration: number;
  subTemplates: SubTemplateResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

export async function createTemplate(
  data: CreateTemplateRequest
): Promise<CreateTemplateResponseResult> {
  try {
    const response = await axiosInstance.post<ApiResponse<CreateTemplateResponseResult>>(
      "/templates",
      data
    );
    return response.data.result;
  } catch (error) {
    console.error("Failed to create template:", error);
    throw error;
  }
}

export interface CreateSubTemplateRequest {
  title: string;
}

export interface CreateSubTemplatesRequestBody {
  subTemplates: CreateSubTemplateRequest[];
}

export interface CreateSubTemplatesResponseResult {
  subTemplates: SubTemplateResponse[];
}

export async function createSubTemplates(
  templateId: number,
  subTemplatesData: CreateSubTemplateRequest[]
): Promise<SubTemplateResponse[]> {
  try {
    const requestBody: CreateSubTemplatesRequestBody = {
      subTemplates: subTemplatesData,
    };
    const response = await axiosInstance.post<ApiResponse<CreateSubTemplatesResponseResult>>(
      `/templates/${templateId}/subtemplates`,
      requestBody
    );
    return response.data.result.subTemplates;
  } catch (error) {
    console.error(`Failed to create sub-templates for template ${templateId}:`, error);
    throw error;
  }
}

export interface UpdateTemplateRequest {
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  duration: number;
}

export interface UpdateTemplateResponseResult {
  templateId: number;
  userId: number;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  duration: number;
  createdAt: string;
  updatedAt: string;
  subTemplates: SubTemplateResponse[];
}

export async function updateTemplate(
  templateId: number,
  data: UpdateTemplateRequest
): Promise<UpdateTemplateResponseResult> {
  try {
    const response = await axiosInstance.patch<ApiResponse<UpdateTemplateResponseResult>>(
      `/templates/${templateId}`,
      data
    );
    return response.data.result;
  } catch (error) {
    console.error(`Failed to update template ${templateId}:`, error);
    throw error;
  }
}

export interface TemplateResponse {
  templateId: number;
  userId: number;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  duration: number;
  createdAt: string;
  updatedAt: string;
  subTemplates: SubTemplateResponse[];
}

export async function getTemplates(title?: string): Promise<TemplateResponse[]> {
  try {
    const response = await axiosInstance.get<ApiResponse<TemplateResponse[]>>('/templates', {
      params: title ? { title } : {},
    });
    return response.data.result;
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    throw error;
  }
}

export async function getSubTemplates(templateId: number): Promise<SubTemplateResponse[]> {
  try {
    const response = await axiosInstance.get<ApiResponse<SubTemplateResponse[]>>(
      `/templates/${templateId}/subtemplates`
    );
    return response.data.result;
  } catch (error) {
    console.error(`Failed to fetch sub-templates for template ${templateId}:`, error);
    throw error;
  }
}

export interface UpdateSubTemplateRequest {
  title: string;
}

export async function updateSubTemplate(
  subTemplateId: number,
  data: UpdateSubTemplateRequest
): Promise<SubTemplateResponse> {
  try {
    const response = await axiosInstance.patch<ApiResponse<SubTemplateResponse>>(
      `/subtemplates/${subTemplateId}`,
      data
    );
    return response.data.result;
  } catch (error) {
    console.error(`Failed to update sub-template ${subTemplateId}:`, error);
    throw error;
  }
}
