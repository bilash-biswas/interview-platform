import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './api';

export const examApi = createApi({
  reducerPath: 'examApi',
  baseQuery,
  tagTypes: ['Exam', 'ExamResult'],
  endpoints: (builder) => ({
    getExams: builder.query<any[], void>({
      query: () => '/exams',
      providesTags: ['Exam'],
    }),
    getExamDetails: builder.query<any, string>({
      query: (id) => `/exams/${id}`,
      providesTags: (result, error, id) => [{ type: 'Exam', id }],
    }),
    getExamQuestions: builder.query<any[], string>({
      query: (id) => `/exams/${id}/questions`,
    }),
    createExam: builder.mutation<any, any>({
      query: (body) => ({
        url: '/exams',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Exam'],
    }),
    submitExamAnswers: builder.mutation<any, { examId: string; body: any }>({
      query: ({ examId, body }) => ({
        url: `/exams/${examId}/submit`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExamResult'],
    }),
    getExamRankings: builder.query<any[], string>({
      query: (id) => `/exams/${id}/rankings`,
      providesTags: (result, error, id) => [{ type: 'ExamResult', id }],
    }),
  }),
});

export const {
  useGetExamsQuery,
  useGetExamDetailsQuery,
  useGetExamQuestionsQuery,
  useCreateExamMutation,
  useSubmitExamAnswersMutation,
  useGetExamRankingsQuery,
} = examApi;
