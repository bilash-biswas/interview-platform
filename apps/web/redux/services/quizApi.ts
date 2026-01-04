import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const quizApi = createApi({
  reducerPath: 'quizApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/quiz`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Question', 'Category'],
  endpoints: (builder) => ({
    // Questions
    getQuestions: builder.query<any[], void>({
      query: () => '/',
      providesTags: ['Question'],
    }),
    addQuestion: builder.mutation<any, any>({
      query: (question) => ({
        url: '/',
        method: 'POST',
        body: question,
      }),
      invalidatesTags: ['Question'],
    }),
    updateQuestion: builder.mutation<any, { id: string; question: any }>({
      query: ({ id, question }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: question,
      }),
      invalidatesTags: ['Question'],
    }),
    deleteQuestion: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Question'],
    }),

    // Categories
    getCategories: builder.query<any[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    addCategory: builder.mutation<any, any>({
      query: (category) => ({
        url: '/categories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<any, { id: string; category: any }>({
      query: ({ id, category }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<any, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = quizApi;
