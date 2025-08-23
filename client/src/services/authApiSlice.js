import { apiSlice } from './apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),
    resendOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/resend-otp',
        method: 'POST',
        body: data,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'GET',
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/password/forgot',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, passwords }) => ({
        url: `/auth/password/reset/${token}`,
        method: 'PUT',
        body: passwords,
      }),
    }),
    updatePassword: builder.mutation({
      query: (passwords) => ({
        url: '/auth/password/update',
        method: 'PUT',
        body: passwords,
      }),
    }),
    getProfile: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApiSlice; 