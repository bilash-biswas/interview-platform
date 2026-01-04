import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './api';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api`,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('token');
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
