// api/auth.ts
import axiosInstance from './axiosinstance';

/**
 * 로그아웃을 요청하는 API 함수
 */
export const logout = async () => {
  try {
    const response = await axiosInstance.post('auth/logout');
    return response.data;
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};
