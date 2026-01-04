import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<any, any>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<any, any>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getProfile: builder.query<any, void>({
      query: () => '/auth/profile',
    }),
    getAllUsers: builder.query<any[], void>({
      query: () => '/auth/users',
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useGetProfileQuery, 
  useGetAllUsersQuery 
} = authApi;
