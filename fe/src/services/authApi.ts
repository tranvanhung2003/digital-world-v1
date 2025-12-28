import { api, baseQuery } from './api';
import { User } from '@/types/user.types';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from '@/types/auth.types';
import { authenticateUser, getUserByEmail } from '@/data/mockUsers';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      queryFn: async (credentials, { signal }) => {
        try {
          const result = await baseQuery(
            {
              url: '/auth/login',
              method: 'POST',
              body: {
                email: credentials.email,
                password: credentials.password,
              },
            },
            { signal },
            undefined
          );

          if (result.error) {
            console.log('Login error:', result.error);

            // Don't let 401 errors trigger auto-logout for login attempts
            if (result.error.status === 401) {
              return {
                error: {
                  status: result.error.status,
                  data: result.error.data || 'Invalid email or password',
                },
              };
            }

            return { error: result.error };
          }

          console.log('Login response:', result.data);

          // Xử lý response từ API theo format thật từ backend
          if (result.data?.status === 'success') {
            return {
              data: {
                user: result.data.user,
                token: result.data.token,
                refreshToken: result.data.refreshToken,
              },
            };
          }

          // Fallback nếu format khác
          return { data: result.data };
        } catch (error) {
          console.error('Login network error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              data: 'Network error, please try again',
            },
          };
        }
      },
      transformResponse: (response: any) => {
        console.log('Login response:', response);

        // Xử lý response từ API theo format thật từ backend
        if (response?.status === 'success') {
          return {
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
          };
        }

        // Fallback nếu format khác
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.log('Login error:', response);

        // Xử lý error response
        if (response?.data?.message) {
          return response.data.message;
        }

        return response?.data || 'Login failed';
      },
    }),

    verifyEmail: builder.mutation<{ message: string }, string>({
      queryFn: async (token, { signal }) => {
        try {
          console.log('🚀 Starting verifyEmail with token:', token);

          const baseUrl =
            import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
          const url = `${baseUrl}/api/auth/verify-email/${token}`;

          console.log('🔗 Making request to:', url);

          const response = await fetch(url, {
            method: 'GET',
            signal,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          console.log('📨 Raw response:', {
            status: response.status,
            ok: response.ok,
            data,
          });

          if (!response.ok) {
            console.log('❌ Response not OK:', response.status, data);

            // Nếu lỗi là token đã được sử dụng, có thể coi như đã verify thành công
            if (
              response.status === 400 &&
              (data?.message?.includes('đã được xác thực') ||
                data?.message?.includes('already verified') ||
                data?.message?.includes('đã được sử dụng'))
            ) {
              console.log('🔄 Token already used, treating as success');
              return {
                data: {
                  message: 'Email đã được xác thực thành công trước đó',
                },
              };
            }

            return {
              error: {
                status: response.status,
                data: data?.message || data || 'Verification failed',
              },
            };
          }

          // Kiểm tra nếu response có status: 'success'
          if (data?.status === 'success') {
            console.log('✅ Success response detected');
            return {
              data: {
                message: data.message || 'Email verified successfully',
              },
            };
          }

          console.log('🤔 Unexpected response format:', data);
          return {
            data: {
              message: data?.message || 'Email verified successfully',
            },
          };
        } catch (error) {
          console.log('💥 Fetch error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              data: error instanceof Error ? error.message : 'Network error',
            },
          };
        }
      },
    }),

    register: builder.mutation<AuthResponse, RegisterData>({
      queryFn: async (userData, { signal }) => {
        try {
          const result = await baseQuery(
            {
              url: '/auth/register',
              method: 'POST',
              body: userData,
            },
            { signal },
            undefined
          );

          if (result.error) {
            console.log('Register error:', result.error);

            // Don't let 401 errors trigger auto-logout for registration attempts
            if (result.error.status === 401) {
              return {
                error: {
                  status: result.error.status,
                  data: result.error.data || 'Registration failed',
                },
              };
            }

            return { error: result.error };
          }

          console.log('Register response:', result.data);

          // Xử lý response từ API theo format thật từ backend
          if (result.data?.status === 'success') {
            return {
              data: {
                user: result.data.user,
                token: result.data.token,
                refreshToken: result.data.refreshToken,
              },
            };
          }

          // Fallback nếu format khác
          return { data: result.data };
        } catch (error) {
          console.error('Register network error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              data: 'Network error, please try again',
            },
          };
        }
      },
      transformResponse: (response: any) => {
        console.log('Register response:', response);

        // Xử lý response từ API theo format thật from backend
        if (response?.status === 'success') {
          return {
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
          };
        }

        // Fallback nếu format khác
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.log('Register error:', response);

        // Xử lý error response
        if (response?.data?.message) {
          return response.data.message;
        }

        return response?.data || 'Registration failed';
      },
    }),

    refreshToken: builder.mutation<
      { token: string; refreshToken: string },
      void
    >({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken: localStorage.getItem('refreshToken') },
      }),
      transformResponse: (response: any) => {
        console.log('Refresh token response:', response);

        if (response?.status === 'success') {
          return {
            token: response.token,
            refreshToken: response.refreshToken,
          };
        }

        return response;
      },
      transformErrorResponse: (response: any) => {
        console.log('Refresh token error:', response);

        // Clear tokens nếu refresh token expired
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        return response?.data || 'Token refresh failed';
      },
    }),

    logout: builder.mutation<void, void>({
      queryFn: () => {
        try {
          // Clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: 'Logout failed' } };
        }
      },
    }),

    resetPassword: builder.mutation<
      { message: string },
      { token: string; password: string }
    >({
      queryFn: async ({ token, password }, { signal }) => {
        try {
          const result = await baseQuery(
            {
              url: `/auth/reset-password`,
              method: 'POST',
              body: { token, password },
            },
            { signal },
            undefined
          );

          if (result.error) {
            console.log('Reset password error:', result.error);

            // Don't let 401 errors trigger auto-logout for password reset attempts
            if (result.error.status === 401) {
              return {
                error: {
                  status: result.error.status,
                  data: result.error.data || 'Password reset failed',
                },
              };
            }

            return { error: result.error };
          }

          console.log('Reset password response:', result.data);

          // Xử lý response từ API theo format thật từ backend
          if (result.data?.status === 'success') {
            return {
              data: {
                message:
                  result.data.message || 'Password has been reset successfully',
              },
            };
          }

          // Fallback nếu format khác
          return { data: result.data };
        } catch (error) {
          console.error('Reset password network error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              data: 'Network error, please try again',
            },
          };
        }
      },
      transformResponse: (response: any) => {
        console.log('Reset password response:', response);

        // Xử lý response từ API theo format thật từ backend
        if (response?.status === 'success') {
          return {
            message: response.message || 'Password has been reset successfully',
          };
        }

        // Fallback nếu format khác
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.log('Reset password error:', response);

        // Xử lý error response
        if (response?.data?.message) {
          return response.data.message;
        }

        return response?.data || 'Password reset failed';
      },
    }),

    resendVerification: builder.mutation<
      { message: string },
      { email: string }
    >({
      queryFn: async ({ email }, { signal }) => {
        try {
          const result = await baseQuery(
            {
              url: '/auth/resend-verification',
              method: 'POST',
              body: { email },
            },
            { signal },
            undefined
          );

          if (result.error) {
            console.log('Resend verification error:', result.error);

            // Don't let 401 errors trigger auto-logout for resend attempts
            if (result.error.status === 401) {
              return {
                error: {
                  status: result.error.status,
                  data:
                    result.error.data || 'Failed to resend verification email',
                },
              };
            }

            return { error: result.error };
          }

          // Xử lý response từ API theo format thật từ backend
          if (result.data?.status === 'success') {
            return {
              data: {
                message:
                  result.data.message || 'Verification email sent successfully',
              },
            };
          }

          // Fallback nếu format khác
          return { data: result.data };
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR',
              data: 'Network error, please try again',
            },
          };
        }
      },
      transformResponse: (response: any) => {
        // Xử lý response từ API theo format thật từ backend
        if (response?.status === 'success') {
          return {
            message: response.message || 'Verification email sent successfully',
          };
        }

        // Fallback nếu format khác
        return response;
      },
      transformErrorResponse: (response: any) => {
        // Xử lý error response
        if (response?.data?.message) {
          return response.data.message;
        }

        return response?.data || 'Failed to resend verification email';
      },
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        // Xử lý response từ API theo format thật từ backend
        if (response?.status === 'success') {
          console.log('✅ Returning user data:', response.data);
          return response.data; // API trả về user trong response.data
        }

        // Fallback nếu format khác
        return response;
      },
      transformErrorResponse: (response: any) => {
        // Let the global interceptor handle 401 errors
        return response?.data || 'Failed to fetch user';
      },
      providesTags: ['CurrentUser'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useResetPasswordMutation,
  useResendVerificationMutation,
  useGetCurrentUserQuery,
  useVerifyEmailMutation,
} = authApi;
