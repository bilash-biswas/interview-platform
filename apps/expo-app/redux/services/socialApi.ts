import { createApi } from '@reduxjs/toolkit/query/react';
import { io } from 'socket.io-client';
import { baseQuery } from './api';

const SOCIAL_SOCKET_URL = 'http://192.168.10.235:3007';

export const socialApi = createApi({
  reducerPath: 'socialApi',
  baseQuery,
  tagTypes: ['Post', 'Friend', 'Story'],
  endpoints: (builder) => ({
    getFeed: builder.query<any[], void>({
      query: () => '/social/posts/feed',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Post' as const, id })), { type: 'Post', id: 'LIST' }]
          : [{ type: 'Post', id: 'LIST' }],
      async onCacheEntryAdded(arg, { cacheDataLoaded, cacheEntryRemoved, dispatch }) {
        const socket = io(SOCIAL_SOCKET_URL);
        try {
          await cacheDataLoaded;
          socket.on('post-update', (data: any) => {
            if (data.postId) {
              dispatch(socialApi.util.invalidateTags([{ type: 'Post', id: data.postId }]));
            } else if (data.type === 'NEW_POST') {
              dispatch(socialApi.util.invalidateTags([{ type: 'Post', id: 'LIST' }]));
            }
          });
          socket.on('friend-update', () => {
             dispatch(socialApi.util.invalidateTags(['Friend']));
          });
        } catch {}
        await cacheEntryRemoved;
        socket.close();
      },
    }),
    createPost: builder.mutation<any, any>({
      query: (body) => ({
        url: '/social/posts',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
    likePost: builder.mutation<any, { postId: string; userId: string }>({
      query: ({ postId, userId }) => ({
        url: `/social/posts/${postId}/like`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }],
    }),
    addComment: builder.mutation<any, { postId: string; body: any }>({
      query: ({ postId, body }) => ({
        url: `/social/posts/${postId}/comments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }],
    }),
    addReply: builder.mutation<any, { postId: string; commentId: string; body: any }>({
      query: ({ postId, commentId, body }) => ({
        url: `/social/posts/${postId}/comments/${commentId}/replies`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }],
    }),
    sendFriendRequest: builder.mutation<any, any>({
      query: (body) => ({
        url: '/social/friends/request',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Friend'],
    }),
    acceptFriendRequest: builder.mutation<any, { requestId: string }>({
      query: (body) => ({
        url: '/social/friends/accept',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Friend'],
    }),
    getFriends: builder.query<any[], string>({
      query: (userId) => `/social/friends/${userId}`,
      providesTags: ['Friend'],
    }),
    getPendingFriends: builder.query<any[], string>({
      query: (userId) => `/social/friends/${userId}/pending`,
      providesTags: ['Friend'],
    }),
    getStories: builder.query<any[], void>({
      query: () => '/social/stories/active',
      providesTags: ['Story'],
    }),
    createStory: builder.mutation<any, any>({
      query: (body) => ({
        url: '/social/stories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Story'],
    }),
    getUserProfile: builder.query<any, { userId: string; viewerId?: string }>({
      query: ({ userId, viewerId }) => ({
        url: `/social/users/${userId}/profile`,
        params: { viewerId },
      }),
      providesTags: (result, error, { userId }) => [{ type: 'Post', id: `USER_${userId}` }, 'Post'],
    }),
  }),
});

export const {
  useGetFeedQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useAddCommentMutation,
  useAddReplyMutation,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useGetFriendsQuery,
  useGetPendingFriendsQuery,
  useGetStoriesQuery,
  useCreateStoryMutation,
  useGetUserProfileQuery,
} = socialApi;
