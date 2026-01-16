import { store } from '@/store';
import { updateTokens, logout } from '@/features/auth/authSlice';
import { handleAutoLogout, logoutManager } from '@/utils/authUtils';

// Flag để theo dõi trạng thái "đang làm mới token"
let isRefreshing = false;

//
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

//
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Hàm làm mới token nếu cần thiết
 */
export const refreshTokenIfNeeded = async (): Promise<string | null> => {
  const state = store.getState();
  const { refreshToken } = state.auth;

  // Nếu không có refresh token, đăng xuất người dùng
  if (!refreshToken) {
    store.dispatch(logout());

    return null;
  }

  // Nếu đang trong quá trình làm mới, chờ cho đến khi hoàn thành
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  // Bắt đầu quá trình làm mới token
  isRefreshing = true;

  try {
    // Xác định URL API chính xác
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8888/api';
    const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
    console.log(
      'Đang làm mới token bằng cách sử dụng URL:',
      `${apiUrl}/auth/refresh`,
    );

    // Gửi yêu cầu làm mới token
    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Nếu nhận được mã lỗi 401 (tài khoản bị vô hiệu hóa hoặc không được phép)
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.message ||
          'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên';

        // Đăng xuất tự động
        handleAutoLogout(errorMessage);

        throw new Error(errorMessage);
      }

      // Nếu lỗi khác, ném lỗi chung
      throw new Error('Làm mới token thất bại');
    }

    // Xử lý phản hồi thành công
    const data = await response.json();

    if (data.status === 'success') {
      const { token, refreshToken: newRefreshToken } = data;

      // Cập nhật token mới
      store.dispatch(
        updateTokens({
          token,
          refreshToken: newRefreshToken,
        }),
      );

      // Xử lý hàng đợi các yêu cầu bị thất bại
      processQueue(null, token);

      return token;
    } else {
      // Nếu phản hồi không thành công, ném lỗi
      throw new Error('Làm mới token thất bại');
    }
  } catch (error) {
    console.error('Làm mới token thất bại:', error);

    processQueue(error, null);

    // Chỉ gọi logout nếu chưa được xử lý bởi đăng xuất tự động
    if (!logoutManager.isLoggingOut) {
      store.dispatch(logout());
    }

    return null;
  } finally {
    // Đặt lại trạng thái "đang làm mới token" là false
    isRefreshing = false;
  }
};

/**
 * Kiểm tra nếu token đã hết hạn
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Giải mã payload của JWT
    const currentTime = Date.now() / 1000; // Lấy thời gian hiện tại (đơn vị: giây)

    // Trả về true nếu token đã hết hạn
    return payload.exp < currentTime;
  } catch (error) {
    // Nếu có lỗi trong quá trình phân tích token, coi như token không hợp lệ (hết hạn)
    return true;
  }
};

/**
 * Lấy token hợp lệ, nếu hết hạn thì làm mới token
 */
export const getValidToken = async (): Promise<string | null> => {
  const state = store.getState();
  const { token } = state.auth;

  // Nếu không có token, trả về null
  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    console.log('Access token đã hết hạn, đang làm mới');

    return await refreshTokenIfNeeded();
  }

  return token;
};
