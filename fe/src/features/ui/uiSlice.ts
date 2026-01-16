import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Notification,
  UIState,
  AddNotificationPayload,
} from '@/types/ui.types';

// Lấy theme từ localStorage hoặc mặc định là 'light'
const savedTheme =
  typeof window !== 'undefined'
    ? (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
    : 'light';

const initialState: UIState = {
  notifications: [],
  isSearchOpen: false,
  isMobileMenuOpen: false,
  isLoading: false,
  theme: savedTheme,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Thêm thông báo mới
    addNotification: (state, action: PayloadAction<AddNotificationPayload>) => {
      const id = Date.now().toString();
      state.notifications.push({
        id,
        ...action.payload,
      });
    },

    // Xóa thông báo theo ID
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload,
      );
    },

    // Xóa tất cả thông báo
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Chuyển đổi trạng thái tìm kiếm
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen;
    },

    // Chuyển đổi trạng thái menu di động
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },

    // Đặt trạng thái loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Đặt theme (light hoặc dark)
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;

      localStorage.setItem('theme', action.payload);
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  toggleSearch,
  toggleMobileMenu,
  setLoading,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer;
