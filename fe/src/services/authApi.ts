// @ts-nocheck
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from '@/types/auth.types';
import { User } from '@/types/user.types';
import { api, baseQuery } from './api';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Đăng nhập người dùng
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
            undefined,
          );

          if (result.error) {
            console.log('Lỗi đăng nhập:', result.error);

            if (result.error.status === 401) {
              return {
                error: {
                  status: result.error.status,
                  data: result.error.data || 'Email hoặc mật khẩu không hợp lệ',
                },
              };
            }

            return { error: result.error };
          }

          console.log('Phản hồi đăng nhập:', result.data);

          // Xử lý response từ API theo format từ backend
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
          console.error('Lỗi mạng khi đăng nhập:', error);

          return {
            error: {
              status: 'FETCH_ERROR',
              data: 'Lỗi mạng, vui lòng thử lại',
            },
          };
        }
      },

      transformResponse: (response: any) => {
        console.log('Phản hồi đăng nhập:', response);

        // Xử lý response từ API theo format từ backend
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
        console.log('Lỗi đăng nhập:', response);

        // Xử lý error response
        if (response?.data?.message) {
          return response.data.message;
        }

        return response?.data || 'Đăng nhập thất bại';
      },
    }),

    // Xác thực email với token (GET method)
    verifyEmail: builder.mutation<{ message: string }, string>({
      queryFn: async (token, { signal }) => {
        try {
          const baseUrl =
            import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
          const url = `${baseUrl}/auth/verify-email/${token}`;

          console.log('Đang gửi yêu cầu đến:', url);
          const response = await fetch(url, {
            method: 'GET',
            signal,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          console.log('📨 Phản hồi thô:', {
            status: response.status,
            ok: response.ok,
            data,
          });

          if (!response.ok) {
            // Nếu lỗi là token đã được sử dụng, có thể coi như đã verify thành công
            if (response.status === 400) {
              console.log('Token đã được sử dụng, coi như thành công');
              return {
                data: {
                  message: 'Email đã được xác thực thành công trước đó',
                },
              };
            }

            return {
              error: {
                status: response.status,
                data: data?.message || data || 'Xác thực thất bại',
              },
            };
          }

          // Kiểm tra nếu response có status: 'success'
          if (data?.status === 'success') {
            return {
              data: {
                message: data.message || 'Xác thực email thành công',
              },
            };
          }

          return {
            data: {
              message: data?.message || 'Xác thực email thành công',
            },
          };
        } catch (error) {
          console.log('Lỗi mạng:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              data: error instanceof Error ? error.message : 'Lỗi mạng',
            },
          };
        }
      },
    }),

    // Đăng ký người dùng mới
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
            undefined,
          );

          if (result.error) {
            console.log('Lỗi đăng ký:', result.error);

            if (result.error.status === 401) {
              return {
                error: {
                  status: result.error.status,
                  data: result.error.data || 'Đăng ký thất bại',
                },
              };
            }

            return { error: result.error };
          }

          console.log('Phản hồi đăng ký:', result.data);

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
          console.error('Lỗi mạng khi đăng ký:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              data: 'Lỗi mạng, vui lòng thử lại',
            },
          };
        }
      },

      transformResponse: (response: any) => {
        console.log('Phản hồi đăng ký:', response);

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
        console.log('Lỗi đăng ký:', response);

        // Xử lý error response
        if (response?.data?.message) {
          return response.data.message;
        }

        return response?.data || 'Đăng ký thất bại';
      },
    }),

    // Làm mới token
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
        console.log('Phản hồi làm mới token:', response);

        if (response?.status === 'success') {
          return {
            token: response.token,
            refreshToken: response.refreshToken,
          };
        }

        return response;
      },
      transformErrorResponse: (response: any) => {
        console.log('Lỗi làm mới token:', response);

        // Clear tokens nếu refresh token hết hạn hoặc không hợp lệ
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        return response?.data || 'Làm mới token thất bại';
      },
    }),

    // Đăng xuất người dùng
    logout: builder.mutation<void, void>({
      queryFn: () => {
        try {
          // Clear localStorage khi đăng xuất
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: 'Logout failed' } };
        }
      },
    }),

    // Đặt lại mật khẩu
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
            undefined,
          );

          if (result.error) {
            console.log('Lỗi đặt lại mật khẩu:', result.error);

            if (result.error.status === 401) {
              return {
                error: {
                  status: result.error.status,
                  data: result.error.data || 'Đặt lại mật khẩu thất bại',
                },
              };
            }

            return { error: result.error };
          }

          console.log('Phản hồi đặt lại mật khẩu:', result.data);

          // Xử lý response từ API theo format thật từ backend
          if (result.data?.status === 'success') {
            return {
              data: {
                message: result.data.message || 'Đặt lại mật khẩu thành công',
              },
            };
          }

          // Fallback nếu format khác
          return { data: result.data };
        } catch (error) {
          console.error('Lỗi mạng đặt lại mật khẩu:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              data: 'Lỗi mạng, vui lòng thử lại',
            },
          };
        }
      },
      transformResponse: (response: any) => {
        console.log('Phản hồi đặt lại mật khẩu:', response);

        // Xử lý response từ API theo format thật từ backend
        if (response?.status === 'success') {
          return {
            message: response.message || 'Đặt lại mật khẩu thành công',
          };
        }

        // Fallback nếu format khác
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.log('Lỗi đặt lại mật khẩu:', response);

        // Xử lý error response
        if (response?.data?.message) {
          return response.data.message;
        }

        return response?.data || 'Đặt lại mật khẩu thất bại';
      },
    }),

    // Gửi lại email xác thực
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
            undefined,
          );

          if (result.error) {
            console.log('Lỗi gửi lại email xác thực:', result.error);

            if (result.error.status === 401) {
              return {
                error: {
                  status: result.error.status,
                  data: result.error.data || 'Gửi lại email xác thực thất bại',
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
                  result.data.message || 'Gửi lại email xác thực thành công',
              },
            };
          }

          // Fallback nếu format khác
          return { data: result.data };
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR',
              data: 'Lỗi mạng, vui lòng thử lại',
            },
          };
        }
      },
      transformResponse: (response: any) => {
        // Xử lý response từ API theo format thật từ backend
        if (response?.status === 'success') {
          return {
            message: response.message || 'Gửi lại email xác thực thành công',
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

        return response?.data || 'Gửi lại email xác thực thất bại';
      },
    }),

    // Lấy thông tin người dùng hiện tại
    getCurrentUser: builder.query<User, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        // Xử lý response từ API theo format thật từ backend
        if (response?.status === 'success') {
          console.log('Thông tin người dùng hiện tại:', response.data);

          return response.data; // API trả về user trong response.data
        }

        // Fallback nếu format khác
        return response;
      },
      transformErrorResponse: (response: any) => {
        return response?.data || 'Không thể lấy thông tin người dùng';
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
