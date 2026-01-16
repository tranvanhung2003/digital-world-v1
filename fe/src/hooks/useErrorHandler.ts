import { useCallback } from 'react';
import { handleUnauthorizedError, getErrorMessage } from '@/utils/authUtils';
import { toast } from '@/utils/toast';

/**
 * Custom hook để xử lý lỗi API một cách nhất quán trên toàn ứng dụng
 */
export const useErrorHandler = () => {
  const handleError = useCallback((error: any, showToast: boolean = true) => {
    // Xử lý lỗi 401 với đăng xuất tự động
    if (handleUnauthorizedError(error)) {
      return;
    }

    // Xử lý các lỗi khác
    if (showToast) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }

    // Ghi log lỗi để debug
    console.error('API Error:', error);
  }, []);

  const handleSuccess = useCallback((message: string, duration?: number) => {
    toast.success(message, duration);
  }, []);

  const handleWarning = useCallback((message: string, duration?: number) => {
    toast.warning(message, duration);
  }, []);

  return {
    handleError,
    handleSuccess,
    handleWarning,
  };
};

export default useErrorHandler;
