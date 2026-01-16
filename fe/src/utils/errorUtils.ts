/**
 * Các tiện ích xử lý lỗi
 * Các trình xử lý lỗi tập trung và phản hồi người dùng
 */

/**
 * Các loại lỗi phổ biến trong ứng dụng
 */
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Standard error interface
 */
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string | number;
  details?: any;
}

/**
 * Error messages mapping
 */
const ERROR_MESSAGES = {
  [ErrorType.NETWORK_ERROR]: {
    vi: 'Không thể kết nối tới server. Vui lòng kiểm tra kết nối internet.',
    en: 'Unable to connect to server. Please check your internet connection.',
  },
  [ErrorType.VALIDATION_ERROR]: {
    vi: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
    en: 'Invalid data. Please check your information.',
  },
  [ErrorType.AUTHENTICATION_ERROR]: {
    vi: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    en: 'Session expired. Please login again.',
  },
  [ErrorType.AUTHORIZATION_ERROR]: {
    vi: 'Bạn không có quyền truy cập tài nguyên này.',
    en: 'You do not have permission to access this resource.',
  },
  [ErrorType.NOT_FOUND_ERROR]: {
    vi: 'Không tìm thấy tài nguyên yêu cầu.',
    en: 'Requested resource not found.',
  },
  [ErrorType.SERVER_ERROR]: {
    vi: 'Lỗi server. Vui lòng thử lại sau.',
    en: 'Server error. Please try again later.',
  },
  [ErrorType.UNKNOWN_ERROR]: {
    vi: 'Đã xảy ra lỗi không xác định.',
    en: 'An unknown error occurred.',
  },
} as const;

/**
 * Phân tích lỗi từ các nguồn khác nhau
 */
export const parseError = (error: any): AppError => {
  // Lỗi Redux Toolkit Query
  if (error?.status) {
    const status = error.status;
    const message =
      error.data?.message ||
      error.data?.error?.message ||
      'Đã xảy ra lỗi không xác định.';

    if (status === 400) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message,
        code: status,
        details: error.data,
      };
    }

    if (status === 401) {
      return {
        type: ErrorType.AUTHENTICATION_ERROR,
        message,
        code: status,
        details: error.data,
      };
    }

    if (status === 403) {
      return {
        type: ErrorType.AUTHORIZATION_ERROR,
        message,
        code: status,
        details: error.data,
      };
    }

    if (status === 404) {
      return {
        type: ErrorType.NOT_FOUND_ERROR,
        message,
        code: status,
        details: error.data,
      };
    }

    if (status >= 500) {
      return {
        type: ErrorType.SERVER_ERROR,
        message,
        code: status,
        details: error.data,
      };
    }

    if (status === 'FETCH_ERROR') {
      return {
        type: ErrorType.NETWORK_ERROR,
        message,
        code: status,
        details: error,
      };
    }
  }

  // Lỗi JavaScript thông thường
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message,
      details: error,
    };
  }

  // Lỗi dạng chuỗi
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error,
    };
  }

  // Lỗi không xác định mặc định
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: 'Đã xảy ra lỗi không xác định.',
    details: error,
  };
};

/**
 * Lấy thông điệp lỗi thân thiện với người dùng
 */
export const getErrorMessage = (
  error: any,
  language: 'vi' | 'en' = 'vi',
): string => {
  const parsedError = parseError(error);

  // Nếu có thông điệp cụ thể từ lỗi, sử dụng nó
  if (
    parsedError.message &&
    !parsedError.message.includes('Đã xảy ra lỗi không xác định.')
  ) {
    return parsedError.message;
  }

  // Nếu không có, sử dụng thông điệp mặc định theo loại lỗi
  return ERROR_MESSAGES[parsedError.type][language];
};

/**
 * Tạo một trình xử lý lỗi để sử dụng trong components
 */
export const createErrorHandler = (onError?: (error: AppError) => void) => {
  return (error: any) => {
    const parsedError = parseError(error);

    // Chỉ log lỗi trong môi trường phát triển
    if (import.meta.env.DEV) {
      console.group('Trình xử lý lỗi');

      console.log('Lỗi gốc:', error);
      console.log('Lỗi đã phân tích:', parsedError);

      console.groupEnd();
    }

    // Gọi callback nếu được cung cấp
    if (onError) {
      onError(parsedError);
    }

    return parsedError;
  };
};

/**
 * Hàm này sẽ thử lại một hàm bất đồng bộ nhiều lần với độ trễ tăng dần nếu nó thất bại
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i === maxRetries - 1) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, i);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Kiểm tra xem lỗi có thể thử lại hay không (thường là lỗi mạng hoặc lỗi server)
 */
export const isRetryableError = (error: any): boolean => {
  const parsedError = parseError(error);

  return [ErrorType.NETWORK_ERROR, ErrorType.SERVER_ERROR].includes(
    parsedError.type,
  );
};

/**
 * Format lỗi để ghi log
 */
export const formatErrorForLogging = (error: any): string => {
  const parsedError = parseError(error);

  return JSON.stringify(
    {
      type: parsedError.type,
      message: parsedError.message,
      code: parsedError.code,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    },
    null,
    2,
  );
};
