import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Use IP address for physical device / emulator
const API_URL = 'http://192.168.10.235:8000/api'; 

export interface AIAnalysisResult {
    analysis: {
        sentiment: string;
        confidence: number;
        word_count: number;
        summary: string;
        keywords: string[];
    };
    original_text: string;
}

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
        return headers;
    },
  }),
  endpoints: (builder) => ({
    analyzeText: builder.mutation<AIAnalysisResult, { text: string }>({
      query: (body) => ({
        url: '/ai/analyze',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useAnalyzeTextMutation } = aiApi;
