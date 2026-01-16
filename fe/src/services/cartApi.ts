import { api } from './api';
import { RootState } from '@/store';

// Backend Cart Types
export interface BackendCartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  Product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    thumbnail: string;
    inStock: boolean;
    stockQuantity: number;
  };
  ProductVariant?: {
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
  };
}

export interface BackendCart {
  id: string | null;
  items: BackendCartItem[];
  totalItems: number;
  subtotal: number;
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity?: number;
  warrantyPackageIds?: string[];
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface SyncCartRequest {
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    name: string;
    price: number;
    image: string;
    attributes?: any;
  }[];
}

export interface CartResponse {
  status: string;
  data: BackendCart;
}

export interface CartCountResponse {
  status: string;
  data: {
    count: number;
  };
}

export const cartApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy giỏ hàng
    getCart: builder.query<BackendCart, void>({
      query: () => '/cart',
      transformResponse: (response: CartResponse) => response.data,
      providesTags: ['Cart'],
    }),

    // Lấy số lượng sản phẩm trong giỏ hàng
    getCartCount: builder.query<number, void>({
      query: () => '/cart/count',
      transformResponse: (response: CartCountResponse) => response.data.count,
      providesTags: ['CartCount'],
    }),

    // Thêm sản phẩm vào giỏ hàng
    addToCart: builder.mutation<BackendCart, AddToCartRequest>({
      query: (data) => ({
        url: '/cart',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: CartResponse) => response.data,
      invalidatesTags: ['Cart', 'CartCount'],
    }),

    // Cập nhật số lượng sản phẩm
    updateCartItem: builder.mutation<
      BackendCart,
      { id: string; data: UpdateCartItemRequest }
    >({
      query: ({ id, data }) => ({
        url: `/cart/items/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: CartResponse) => response.data,
      invalidatesTags: ['Cart', 'CartCount'],
    }),

    // Xóa sản phẩm khỏi giỏ hàng
    removeCartItem: builder.mutation<BackendCart, string>({
      query: (id) => ({
        url: `/cart/items/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: CartResponse) => response.data,
      invalidatesTags: ['Cart', 'CartCount'],
    }),

    // Xóa tất cả sản phẩm trong giỏ hàng
    clearCart: builder.mutation<BackendCart, void>({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      transformResponse: (response: CartResponse) => response.data,
      invalidatesTags: ['Cart', 'CartCount'],
    }),

    // Sync giỏ hàng từ local storage lên server
    syncCart: builder.mutation<BackendCart, SyncCartRequest>({
      query: (data) => ({
        url: '/cart/sync',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: CartResponse) => response.data,
      invalidatesTags: ['Cart', 'CartCount'],
    }),

    // Gộp giỏ hàng của guest vào giỏ hàng người dùng (khi người dùng đăng nhập)
    mergeCart: builder.mutation<BackendCart, void>({
      query: () => ({
        url: '/cart/merge',
        method: 'POST',
      }),
      transformResponse: (response: CartResponse) => response.data,
      invalidatesTags: ['Cart', 'CartCount'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useGetCartCountQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useSyncCartMutation,
  useMergeCartMutation,
} = cartApi;
