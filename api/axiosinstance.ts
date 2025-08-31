import axios from 'axios';

// axios 인스턴스 생성
const axiosInstance = axios.create({
  // baseURL: 'http://localhost:8080/api/v1',
  baseURL: 'http://ec2-3-37-36-91.ap-northeast-2.compute.amazonaws.com:8080/api/v1',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 추가
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