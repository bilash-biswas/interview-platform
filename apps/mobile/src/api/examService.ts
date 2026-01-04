import api from './client';

export const examApi = {
  getAvailableExams: async () => {
    const response = await api.get('/exam/list');
    return response.data;
  },
  getExamDetails: async (examId: string) => {
    const response = await api.get(`/exam/${examId}`);
    return response.data;
  },
  submitExam: async (examId: string, submission: any) => {
    const response = await api.post(`/exam/${examId}/submit`, submission);
    return response.data;
  },
};
