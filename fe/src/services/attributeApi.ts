import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface AttributeValue {
  id: string;
  name: string;
  value: string;
  colorCode?: string;
  imageUrl?: string;
  priceAdjustment: number;
  sortOrder: number;
  isActive: boolean;
}

export interface AttributeGroup {
  id: string;
  name: string;
  description?: string;
  type: 'color' | 'config' | 'storage' | 'size' | 'custom';
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
  values?: AttributeValue[];
}

export interface CreateAttributeGroupRequest {
  name: string;
  description?: string;
  type: string;
  isRequired: boolean;
  sortOrder: number;
}

export interface CreateAttributeValueRequest {
  name: string;
  value: string;
  colorCode?: string;
  imageUrl?: string;
  priceAdjustment: number;
  sortOrder: number;
}

export const attributeApi = createApi({
  reducerPath: 'attributeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/attributes`,
    credentials: 'include',
  }),
  tagTypes: ['AttributeGroup', 'AttributeValue'],
  endpoints: (builder) => ({
    // Lấy tất cả các nhóm thuộc tính cùng với các giá trị của chúng
    getAttributeGroups: builder.query<
      {
        success: boolean;
        data: AttributeGroup[];
      },
      void
    >({
      query: () => '/groups',
      providesTags: ['AttributeGroup'],
    }),

    // Lấy các nhóm thuộc tính của một sản phẩm cụ thể
    getProductAttributeGroups: builder.query<
      {
        success: boolean;
        data: AttributeGroup[];
      },
      string
    >({
      query: (productId) => `/products/${productId}/groups`,
      providesTags: ['AttributeGroup'],
    }),

    // Tạo nhóm thuộc tính mới
    createAttributeGroup: builder.mutation<
      {
        success: boolean;
        data: AttributeGroup;
      },
      CreateAttributeGroupRequest
    >({
      query: (data) => ({
        url: '/groups',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AttributeGroup'],
    }),

    // Cập nhật nhóm thuộc tính
    updateAttributeGroup: builder.mutation<
      {
        success: boolean;
        data: AttributeGroup;
      },
      { id: string; data: Partial<CreateAttributeGroupRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/groups/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AttributeGroup'],
    }),

    // Xóa nhóm thuộc tính (chuyển trạng thái isActive thành false)
    deleteAttributeGroup: builder.mutation<
      {
        success: boolean;
      },
      string
    >({
      query: (id) => ({
        url: `/groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AttributeGroup'],
    }),

    // Thêm giá trị thuộc tính vào nhóm thuộc tính
    addAttributeValue: builder.mutation<
      {
        success: boolean;
        data: AttributeValue;
      },
      { attributeGroupId: string; data: CreateAttributeValueRequest }
    >({
      query: ({ attributeGroupId, data }) => ({
        url: `/groups/${attributeGroupId}/values`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AttributeGroup', 'AttributeValue'],
    }),

    // Cập nhật giá trị thuộc tính
    updateAttributeValue: builder.mutation<
      {
        success: boolean;
        data: AttributeValue;
      },
      { id: string; data: Partial<CreateAttributeValueRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/values/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AttributeGroup', 'AttributeValue'],
    }),

    // Xóa giá trị thuộc tính (chuyển trạng thái isActive thành false)
    deleteAttributeValue: builder.mutation<
      {
        success: boolean;
      },
      string
    >({
      query: (id) => ({
        url: `/values/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AttributeGroup', 'AttributeValue'],
    }),

    // Gán nhóm thuộc tính cho sản phẩm
    assignAttributeGroupToProduct: builder.mutation<
      {
        success: boolean;
      },
      {
        productId: string;
        attributeGroupId: string;
        isRequired: boolean;
        sortOrder: number;
      }
    >({
      query: ({ productId, attributeGroupId, isRequired, sortOrder }) => ({
        url: `/products/${productId}/groups/${attributeGroupId}`,
        method: 'POST',
        body: { isRequired, sortOrder },
      }),
      invalidatesTags: ['AttributeGroup'],
    }),
  }),
});

export const {
  useGetAttributeGroupsQuery,
  useGetProductAttributeGroupsQuery,
  useCreateAttributeGroupMutation,
  useUpdateAttributeGroupMutation,
  useDeleteAttributeGroupMutation,
  useAddAttributeValueMutation,
  useUpdateAttributeValueMutation,
  useDeleteAttributeValueMutation,
  useAssignAttributeGroupToProductMutation,
} = attributeApi;
