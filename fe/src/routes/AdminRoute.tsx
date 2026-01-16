import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetCurrentUserQuery } from '@/services/authApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user, token } = useSelector(
    (state: RootState) => state.auth,
  );
  const location = useLocation();

  // Nếu không có token, chuyển hướng đến trang đăng nhập
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu có token nhưng không có thông tin người dùng, lấy thông tin người dùng
  const shouldFetchUser = token && !user;
  const {
    data: currentUser,
    isLoading,
    error,
  } = useGetCurrentUserQuery(undefined, {
    skip: !shouldFetchUser,
  });

  // Hiện loading nếu đang lấy thông tin người dùng
  if (shouldFetchUser && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Đang xác thực quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  // Nếu lấy thông tin người dùng thất bại, chuyển hướng đến trang đăng nhập
  if (error) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Sử dụng currentUser từ API nếu có, nếu không thì sử dụng user từ state
  const userToCheck = currentUser || user;

  if (!isAuthenticated && !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra xem người dùng có vai trò admin không
  if (userToCheck?.role !== 'admin' && userToCheck?.role !== 'manager') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
