import { message } from 'antd';
import { store } from '@/store';

// Cấu hình mặc định cho toast
message.config({
  top: 70,
  duration: 3,
  maxCount: 5,
});

// Helper function để lấy theme hiện tại từ Redux store
const isDarkMode = () => {
  try {
    // Lấy theme từ Redux store
    const theme = store.getState().ui.theme;

    // Nếu không có theme trong Redux, kiểm tra class trên document
    if (!theme) {
      return document.documentElement.classList.contains('dark');
    }

    return theme === 'dark';
  } catch (error) {
    // Fallback nếu có lỗi khi truy cập store
    return document.documentElement.classList.contains('dark');
  }
};

/**
 * Lấy className dựa trên theme hiện tại
 * Nếu là dark mode, trả về 'ant-message-dark' để áp dụng style tối
 * Ngược lại, trả về chuỗi rỗng để sử dụng style mặc định
 */
const getClassName = () => {
  return isDarkMode() ? 'ant-message-dark' : '';
};

// Export toast API để sử dụng trong toàn bộ ứng dụng
export const toast = {
  success: (content: string, duration?: number, key?: string) => {
    return message.success({
      content,
      duration,
      key,
      className: getClassName(),
    });
  },

  error: (content: string, duration?: number, key?: string) => {
    return message.error({
      content,
      duration,
      key,
      className: getClassName(),
    });
  },

  info: (content: string, duration?: number, key?: string) => {
    return message.info({
      content,
      duration,
      key,
      className: getClassName(),
    });
  },

  warning: (content: string, duration?: number, key?: string) => {
    return message.warning({
      content,
      duration,
      key,
      className: getClassName(),
    });
  },

  loading: (content: string, duration?: number, key?: string) => {
    return message.loading({
      content,
      duration,
      key,
      className: getClassName(),
    });
  },

  // Đóng toast dựa trên key (nếu có) hoặc đóng tất cả toast nếu không có key
  close: (key?: string) => {
    if (key) {
      message.destroy(key);
    } else {
      message.destroy();
    }
  },
};
