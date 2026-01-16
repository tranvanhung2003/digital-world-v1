import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getValidToken } from '@/utils/tokenManager';
import { handleUnauthorizedError } from '@/utils/authUtils';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';

/**
 * API Configuration
 */
const API_CONFIG = {
  DEFAULT_URL: 'http://localhost:8888/api',
  TIMEOUT: 10000,
  HEADERS: {
    ACCEPT: 'application/json',
    CONTENT_TYPE: 'application/json',
  },
} as const;

/**
 * Lấy URL cơ sở của API
 */
const getBaseUrl = (): string => {
  const apiBaseUrl = import.meta.env.VITE_API_URL || API_CONFIG.DEFAULT_URL;

  return apiBaseUrl.endsWith('/api') ? apiBaseUrl : `${apiBaseUrl}/api`;
};

// Log cấu hình API trong môi trường development
const logApiConfig = (): void => {
  if (import.meta.env.DEV) {
  }
};
// Khởi tọa cấu hình API
logApiConfig();

/**
 * Chuẩn bị headers cho API requests
 */
const prepareHeaders = async (headers: Headers): Promise<Headers> => {
  // Lấy token hợp lệ
  const token = await getValidToken();

  // Thêm authorization header nếu token tồn tại
  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  } else {
    // Nếu không có token hợp lệ, kiểm tra localStorage
    const localToken = localStorage.getItem('token');

    if (localToken) {
      headers.set('authorization', `Bearer ${localToken}`);
    }
  }

  // Thêm headers chuẩn
  headers.set('Accept', API_CONFIG.HEADERS.ACCEPT);
  headers.set('Content-Type', API_CONFIG.HEADERS.CONTENT_TYPE);

  return headers;
};

/**
 * Base query cho API requests
 */
const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders,
  timeout: API_CONFIG.TIMEOUT,
});

/**
 * Kiểm tra nếu lỗi là 401 Unauthorized
 */
const isUnauthorizedError = (error: any): boolean => {
  return error?.status === 401 || error?.data?.error?.statusCode === 401;
};

/**
 * Log lỗi API trong môi trường development
 */
const logApiError = (args: string | FetchArgs, error: any): void => {
  if (import.meta.env.DEV) {
    console.group('API Error');
    console.log('Endpoint:', typeof args === 'string' ? args : args.url);
    console.log('Status:', error.status);
    console.log('Data:', error.data);
    console.groupEnd();
  }
};

/**
 * Base query nâng cao với tự động đăng xuất khi gặp lỗi 401
 *
 */
const baseQueryWithAutoLogout: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  try {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error) {
      logApiError(args, result.error);

      // Xử lý lỗi 401 Unauthorized
      if (isUnauthorizedError(result.error)) {
        const normalizedError = {
          status: 401,
          data: result.error?.data || result.error,
        };

        handleUnauthorizedError(normalizedError);
      }
    }

    return result;
  } catch (error) {
    console.error('Lỗi API không mong đợi:', error);
    return {
      error: {
        status: 'FETCH_ERROR',
        error: String(error),
      },
    };
  }
};

// Tạo API service
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAutoLogout,
  tagTypes: [
    'Product',
    'Category',
    'User',
    'CurrentUser',
    'Addresses',
    'Cart',
    'CartCount',
    'Order',
    'Review',
    'PaymentMethod',
    'AdminDashboard',
    'AdminStats',
    'AdminOrder',
    'AdminProduct',
    'AdminUser',
    'Upload',
    'WarrantyPackages',
    'Images',
    'News',
  ],
  endpoints: () => ({}),
});

// Factory function để tạo baseQuery với prefix URL tùy chỉnh
export const createPrefixedBaseQuery = (
  prefix: string = '',
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  return async (args, api, extraOptions) => {
    // Thêm prefix vào URL
    const adjustedArgs =
      typeof args === 'string'
        ? `${prefix}${args}`
        : { ...args, url: `${prefix}${args.url}` };

    // Sử dụng baseQueryWithAutoLogout để xử lý request và lỗi 401
    return baseQueryWithAutoLogout(adjustedArgs, api, extraOptions);
  };
};

// Export hàm baseQueryWithAutoLogout để tái sử dụng trong các API service khác
export { baseQueryWithAutoLogout, baseQuery };

export const {
  // Các endpoints sẽ được thêm vào ở các file khác
} = api;
