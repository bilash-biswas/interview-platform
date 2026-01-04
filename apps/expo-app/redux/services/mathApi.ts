import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Use IP address for physical device / emulator
const API_URL = 'http://192.168.10.235:8000/api'; 

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
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
        // Add headers if needed
        return headers;
    },
  }),
  endpoints: (builder) => ({
    getMathQuestions: builder.query<MathQuestion[], void>({
      query: () => '/math/questions',
    }),
  }),
});

export const { useGetMathQuestionsQuery } = mathApi;
