import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // ✅ 여기에 API의 기본 URL 입력
  timeout: 5000, // 요청 제한 시간 (ms)
  headers: {
    'Content-Type': 'application/json',
    // Authorization: Bearer ${token} // 필요 시 토큰 삽입
  },
});

export default axiosInstance;