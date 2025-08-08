import axiosInstance from './axiosinstance';

// export const getGoals = async (userId = 1) => {
//   const response = await axiosInstance.get(
//   '/goals', {
//     params: { user_id: userId },
//     // headers: { Authorization: Bearer ${token} } // 필요 시 동적으로
//   });
//   return response.data.result;
// };
const fetchGoals = async (userId, date) => {
  try {
    const response = await axios.get('http://localhost:8080/api/v1/goals', {
      params: {
        user_id: userId,
        date: date, // 형식: '2025-07-29'
      },
      headers: {
        Accept: '*/*',
      },
    });

    const data = response.data;

    if (data.isSuccess) {
      console.log('요청 성공:', data.result);
      return data.result; // goals 배열
    } else {
      console.warn('API 오류:', data.message);
      return [];
    }
  } catch (error) {
    console.error('API 호출 실패:', error);
    return [];
  }
};

export default fetchGoals;