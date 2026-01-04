import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getChatHistory: builder.query<any[], string>({
      query: (roomId) => `/chat/history/${roomId}`,
    }),
    getConversations: builder.query<any[], string>({
      query: (userId) => `/chat/conversations/${userId}`,
    }),
    markAsRead: builder.mutation<any, { roomId: string; userId: string }>({
      query: ({ roomId, userId }) => ({
        url: `/chat/read/${roomId}`,
        method: 'POST',
        body: { userId },
      }),
    }),
  }),
});

export const {
  useGetChatHistoryQuery,
  useGetConversationsQuery,
  useMarkAsReadMutation,
} = chatApi;
