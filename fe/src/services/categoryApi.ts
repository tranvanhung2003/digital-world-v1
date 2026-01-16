import { api } from './api';
import { Category } from '@/types/category.types';

export interface CategoryResponse {
  status: string;
  data: Category[] | Category;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
  id: string;
}

export const categoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả danh mục
    getAllCategories: builder.query<CategoryResponse, void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),

    // Lấy cây danh mục
    getCategoryTree: builder.query<CategoryResponse, void>({
      query: () => '/categories/tree',
      providesTags: ['Category'],
    }),

    // Lấy danh mục theo ID
    getCategoryById: builder.query<CategoryResponse, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (_, __, id) => [{ type: 'Category', id }],
    }),

    // Lấy danh mục theo slug
    getCategoryBySlug: builder.query<CategoryResponse, string>({
      query: (slug) => `/categories/slug/${slug}`,
      providesTags: (_, __, slug) => [{ type: 'Category', id: slug }],
    }),

    // Tạo danh mục mới
    createCategory: builder.mutation<CategoryResponse, CreateCategoryRequest>({
      query: (category) => ({
        url: '/categories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),

    // Cập nhật danh mục
    updateCategory: builder.mutation<CategoryResponse, UpdateCategoryRequest>({
      query: ({ id, ...category }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: category,
      }),
      invalidatesTags: (_, __, { id }) => [
        'Category',
        { type: 'Category', id },
      ],
    }),

    // Xóa danh mục
    deleteCategory: builder.mutation<
      { status: string; message: string },
      string
    >({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Lấy sản phẩm theo danh mục
    getProductsByCategory: builder.query<
      any,
      {
        id: string;
        page?: number;
        limit?: number;
        sort?: string;
        order?: 'ASC' | 'DESC';
      }
    >({
      query: ({
        id,
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'DESC',
      }) =>
        `/categories/${id}/products?page=${page}&limit=${limit}&sort=${sort}&order=${order}`,
      providesTags: (_, __, { id }) => [
        { type: 'Product', id: `category-${id}` },
      ],
    }),

    // Lấy các danh mục nổi bật
    getFeaturedCategories: builder.query<CategoryResponse, void>({
      query: () => '/categories/featured',
      providesTags: ['Category'],
    }),

    // Lấy tất cả danh mục (dạng mảng)
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      transformResponse: (response: CategoryResponse) => {
        return Array.isArray(response.data) ? response.data : [response.data];
      },
      providesTags: ['Category'],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useGetCategoryTreeQuery,
  useGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductsByCategoryQuery,
  useGetFeaturedCategoriesQuery,
  useGetCategoriesQuery,
} = categoryApi;

export type { Category } from '@/types/category.types';
