import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './api';

export const quizApi = createApi({
  reducerPath: 'quizApi',
  baseQuery: baseQuery,
  tagTypes: ['Question', 'Category'],
  endpoints: (builder) => ({
    getQuestions: builder.query<any[], void>({
      query: () => '/quiz',
      providesTags: ['Question'],
    }),
    addQuestion: builder.mutation<any, any>({
      query: (question) => ({
        url: '/quiz',
        method: 'POST',
        body: question,
      }),
      invalidatesTags: ['Question'],
    }),
    getCategories: builder.query<any[], void>({
      query: () => '/quiz/categories',
      providesTags: ['Category'],
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useAddQuestionMutation,
  useGetCategoriesQuery,
} = quizApi;
