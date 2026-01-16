import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useNotifications } from '@/hooks/useNotifications';
import { useTranslation } from 'react-i18next';
import { clearJustLoggedIn } from '@/features/auth/authSlice';

const LoginSuccess: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, isAuthenticated, justLoggedIn } = useSelector(
    (state: RootState) => state.auth,
  );
  const { showNotification } = useNotifications();

  useEffect(() => {
    // Nếu người dùng vừa đăng nhập thành công, hiển thị thông báo chào mừng
    if (isAuthenticated && user && justLoggedIn) {
      // Tạo tên người dùng để hiển thị trong thông báo
      const userName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.name || user.email;

      showNotification({
        type: 'success',
        title: t('auth.welcome.title'),
        message: t('auth.welcome.message', { name: userName }),
        duration: 5000,
      });

      // Dispatch clearJustLoggedIn để tránh hiển thị lại thông báo
      dispatch(clearJustLoggedIn());
    }
  }, [isAuthenticated, user, justLoggedIn, showNotification, t, dispatch]);

  return null;
};

export default LoginSuccess;
