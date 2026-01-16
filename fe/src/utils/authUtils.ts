import { store } from '@/store';
import { logout } from '@/features/auth/authSlice';
import { toast } from '@/utils/toast';

// Hàm Navigation - sẽ được thiết lập bởi component App
let navigateToLogin: (() => void) | null = null;

export const setNavigateFunction = (navigate: () => void) => {
  navigateToLogin = navigate;
};

// Singleton để quản lý trạng thái đăng xuất
class LogoutManager {
  private static instance: LogoutManager;
  private _isLoggingOut = false;

  static getInstance(): LogoutManager {
    if (!LogoutManager.instance) {
      LogoutManager.instance = new LogoutManager();
    }

    return LogoutManager.instance;
  }

  get isLoggingOut(): boolean {
    return this._isLoggingOut;
  }

  setLoggingOut(value: boolean): void {
    this._isLoggingOut = value;
  }
}

const logoutManager = LogoutManager.getInstance();

/**
 * Xử lý đăng xuất tự động khi tài khoản người dùng bị vô hiệu hóa hoặc không được phép
 * @param errorMessage - Thông báo lỗi tùy chỉnh để hiển thị
 * @param redirectDelay - Thời gian chờ trước khi chuyển hướng đến trang đăng nhập (tính bằng milliseconds)
 */
export const handleAutoLogout = (
  errorMessage: string = 'Phiên đăng nhập đã hết hạn',
  redirectDelay: number = 1000,
) => {
  console.log('Hàm handleAutoLogout được gọi với:', errorMessage);

  // Ngăn chặn đăng xuất trùng lặp
  if (logoutManager.isLoggingOut) {
    console.log('Đang đăng xuất, bỏ qua');

    return;
  }

  console.log('Đang bắt đầu quá trình đăng xuất');

  logoutManager.setLoggingOut(true);

  // Hiển thị thông báo cho người dùng
  toast.warning(errorMessage, 4);

  // Dispatch logout để xóa trạng thái xác thực
  store.dispatch(logout());

  // Xóa dữ liệu ngay lập tức ở phía client
  localStorage.clear();
  sessionStorage.clear();

  // Điều hướng sau một khoảng thời gian ngắn để đảm bảo trạng thái Redux được cập nhật
  setTimeout(() => {
    // Reset flag "đang đăng xuất" để cho phép các lần đăng xuất trong tương lai
    logoutManager.setLoggingOut(false);

    // Bắt buộc reload trang để đăng nhập lại nhằm tránh các vấn đề về trạng thái của React Router
    window.location.href = '/login';
  }, 100); // Delay ngắn để đảm bảo trạng thái được cập nhật trước khi chuyển hướng
};

// Export logoutManager để sử dụng trong các module khác
export { logoutManager };

/**
 * Kiểm tra nếu lỗi là 401 Unauthorized thì xử lý đăng xuất tự động
 * @param error - Error object từ API response
 * @returns boolean - true nếu lỗi 401 đã được xử lý
 */
export const handleUnauthorizedError = (error: any): boolean => {
  console.log('Hàm handleUnauthorizedError được gọi với:', error);

  if (error?.status === 401) {
    console.log('Xác nhận là lỗi 401, đang gọi handleAutoLogout');

    const errorMessage =
      error?.data?.message ||
      'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên';

    handleAutoLogout(errorMessage);

    return true;
  }

  console.log('Không phải lỗi 401, trạng thái:', error?.status);

  return false;
};

/**
 * Trích xuất thông báo lỗi từ các định dạng lỗi khác nhau
 * @param error - Error object
 * @returns string - Formatted error message
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.data?.message) {
    return error.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định';
};
