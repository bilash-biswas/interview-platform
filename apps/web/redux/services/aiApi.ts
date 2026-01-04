import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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

export interface CodeAnalysisResult {
    analysis: {
        function_count: number;
        class_count: number;
        imports: string[];
        complexity_warning: boolean;
        suggestions: string[];
    };
}

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  }),
  endpoints: (builder) => ({
    analyzeText: builder.mutation<AIAnalysisResult, { text: string }>({
      query: (body) => ({
        url: '/ai/analyze',
        method: 'POST',
        body,
      }),
    }),
    reviewCode: builder.mutation<CodeAnalysisResult, { code: string }>({
      query: (body) => ({
        url: '/ai/review',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useAnalyzeTextMutation, useReviewCodeMutation } = aiApi;
