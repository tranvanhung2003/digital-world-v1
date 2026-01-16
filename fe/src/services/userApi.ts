import { api } from './api';
import { User, Address } from '@/types/user.types';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Cập nhật thông tin cá nhân
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (userData) => {
        return {
          url: '/users/profile',
          method: 'PUT',
          body: userData,
        };
      },
      transformResponse: (response: any) => {
        if (response?.status === 'success') {
          return response.data;
        }
        return response;
      },
      transformErrorResponse: (response: any) => {
        return response.data || 'Cập nhật thông tin thất bại';
      },
      invalidatesTags: ['CurrentUser'],
    }),

    // Đổi mật khẩu
    changePassword: builder.mutation<
      { message: string },
      ChangePasswordRequest
    >({
      query: (passwordData) => ({
        url: '/users/change-password',
        method: 'POST',
        body: passwordData,
      }),
      transformResponse: (response: any) => {
        if (response?.status === 'success') {
          return { message: response.message };
        }
        return response;
      },
    }),

    // Lấy danh sách địa chỉ
    getAddresses: builder.query<Address[], void>({
      query: () => ({
        url: '/users/addresses',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (response?.status === 'success') {
          return response.data;
        }
        return [];
      },
      providesTags: ['Addresses'],
    }),

    // Thêm địa chỉ mới
    addAddress: builder.mutation<Address, Omit<Address, 'id'>>({
      query: (addressData) => ({
        url: '/users/addresses',
        method: 'POST',
        body: addressData,
      }),
      transformResponse: (response: any) => {
        if (response?.status === 'success') {
          return response.data;
        }
        return response;
      },
      invalidatesTags: ['Addresses'],
    }),

    // Cập nhật địa chỉ
    updateAddress: builder.mutation<Address, Partial<Address> & { id: string }>(
      {
        query: ({ id, ...addressData }) => ({
          url: `/users/addresses/${id}`,
          method: 'PUT',
          body: addressData,
        }),
        transformResponse: (response: any) => {
          if (response?.status === 'success') {
            return response.data;
          }
          return response;
        },
        invalidatesTags: ['Addresses'],
      },
    ),

    // Xóa địa chỉ
    deleteAddress: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/users/addresses/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: any) => {
        if (response?.status === 'success') {
          return { message: response.message };
        }
        return response;
      },
      invalidatesTags: ['Addresses'],
    }),

    // Đặt địa chỉ mặc định
    setDefaultAddress: builder.mutation<Address, string>({
      query: (id) => ({
        url: `/users/addresses/${id}/default`,
        method: 'PATCH',
      }),
      transformResponse: (response: any) => {
        if (response?.status === 'success') {
          return response.data;
        }
        return response;
      },
      invalidatesTags: ['Addresses'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = userApi;
