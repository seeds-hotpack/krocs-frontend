import axios from 'axios';


const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosInstance.interceptors.request.use(
  (config) => {
    // 👇 임의의 토큰 'test-token'을 직접 할당합니다.
    const token = 'test-token';

    // 토큰이 존재하므로 항상 Authorization 헤더를 추가합니다.
    config.headers['Authorization'] = `Bearer ${token}`;

    // 설정된 config를 반환합니다.
    return config;
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);

export default axiosInstance;