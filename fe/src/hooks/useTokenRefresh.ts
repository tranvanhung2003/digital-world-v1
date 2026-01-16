import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { refreshTokenIfNeeded, isTokenExpired } from '@/utils/tokenManager';
import { logout } from '@/features/auth/authSlice';

export const useTokenRefresh = () => {
  const dispatch = useDispatch();

  const { token, refreshToken, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    // Nếu không có token hoặc không xác thực, không làm gì cả
    if (!isAuthenticated || !token || !refreshToken) {
      return;
    }

    // Kiểm tra tính hợp lệ của token và làm mới nếu cần sau mỗi 5 phút
    const checkTokenValidity = async () => {
      if (isTokenExpired(token)) {
        // Nếu token hết hạn, cố gắng làm mới
        console.log('Token đã hết hạn, đang thử làm mới...');

        const newToken = await refreshTokenIfNeeded();

        // Nếu làm mới không thành công, đăng xuất người dùng
        if (!newToken) {
          console.log('❌ Làm mới token không thành công, đang đăng xuất...');

          dispatch(logout());
        }
      }
    };

    // Kiểm tra ngay lập tức
    checkTokenValidity();

    // Thiết lập khoảng thời gian kiểm tra là sau mỗi 5 phút
    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, refreshToken, isAuthenticated, dispatch]);

  // Đồng thời kiểm tra khi nào trang hiển thị lại
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isAuthenticated && token) {
        if (isTokenExpired(token)) {
          await refreshTokenIfNeeded();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [token, isAuthenticated]);
};
