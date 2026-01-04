import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface MathQuestion {
  id: number;
  text: string;
  options: string[];
  correct_option_index: number;
  category: string;
  difficulty: string;
}

export const mathApi = createApi({
  reducerPath: 'mathApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  }),
  endpoints: (builder) => ({
    getMathQuestions: builder.query<MathQuestion[], void>({
      query: () => '/math/questions',
    }),
  }),
});

export const { useGetMathQuestionsQuery } = mathApi;
