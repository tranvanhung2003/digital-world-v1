// @ts-nocheck
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CartItem,
  CartState,
  ServerCart,
  UpdateCartItemPayload,
} from '@/types/cart.types';

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
  isOpen: false,
  isLoading: false,
  totalItems: 0,
  subtotal: 0,
  serverCart: null,
};

// Helper function để chuyển đổi mục giỏ hàng từ server sang định dạng mục giỏ hàng local
const convertServerCartItem = (serverItem: any): CartItem => ({
  id: serverItem.id,
  productId: serverItem.productId,
  name: serverItem.Product.name,
  price: serverItem.ProductVariant?.price || serverItem.Product.price,
  quantity: serverItem.quantity,
  image: serverItem.Product.thumbnail,
  variantId: serverItem.variantId,
  inStock: serverItem.Product.inStock,
  stockQuantity:
    serverItem.ProductVariant?.stockQuantity ||
    serverItem.Product.stockQuantity,
  cartId: serverItem.cartId,
  attributes: serverItem.ProductVariant
    ? { variant: serverItem.ProductVariant.name }
    : undefined,
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Set giỏ hàng từ giỏ hàng ở server
    setServerCart: (state, action: PayloadAction<ServerCart>) => {
      state.serverCart = action.payload;
      state.items = action.payload.items.map(convertServerCartItem);
      state.totalItems = action.payload.totalItems;
      state.subtotal = action.payload.subtotal;

      // Cũng cập nhật localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    // Các thao tác giỏ hàng local
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.productId === action.payload.productId &&
          JSON.stringify(item.attributes) ===
            JSON.stringify(action.payload.attributes),
      );

      // Nếu mục đã tồn tại, chỉ tăng số lượng, nếu không thì thêm mục mới
      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      // Cập nhật tổng số lượng và tổng tiền
      state.totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      state.subtotal = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Lưu vào localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);

      // Cập nhật tổng số lượng và tổng tiền
      state.totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.subtotal = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    updateQuantity: (state, action: PayloadAction<UpdateCartItemPayload>) => {
      const item = state.items.find((item) => item.id === action.payload.id);

      if (item) {
        item.quantity = action.payload.quantity;

        // Cập nhật tổng số lượng và tổng tiền
        state.totalItems = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        state.subtotal = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
      }

      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.subtotal = 0;
      state.serverCart = null;
      localStorage.removeItem('cartItems');
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    closeCart: (state) => {
      state.isOpen = false;
    },

    openCart: (state) => {
      state.isOpen = true;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Khởi tạo tất cả từ localStorage
    initializeCart: (state) => {
      const items = JSON.parse(localStorage.getItem('cartItems') || '[]');

      // Nếu giỏ hàng trống hoặc không hợp lệ, xóa localStorage
      if (!items || !Array.isArray(items) || items.length === 0) {
        localStorage.removeItem('cartItems');
        state.items = [];
        state.totalItems = 0;
        state.subtotal = 0;
        return;
      }

      state.items = items;
      state.totalItems = items.reduce(
        (sum: number, item: CartItem) => sum + item.quantity,
        0,
      );
      state.subtotal = items.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0,
      );
    },

    mergeWithLocalCart: (state, action: PayloadAction<ServerCart>) => {
      const localItems = [...state.items];
      const serverCart = action.payload;

      // Chuyển đổi mục giỏ hàng từ server sang định dạng mục giỏ hàng local
      const serverItems = serverCart.items.map(convertServerCartItem);

      // Với mỗi mục local, kiểm tra xem nó có tồn tại trong giỏ hàng server không
      const mergedItems = [...serverItems];

      localItems.forEach((localItem) => {
        const existingServerItem = mergedItems.find(
          (serverItem) =>
            serverItem.productId === localItem.productId &&
            serverItem.variantId === localItem.variantId &&
            JSON.stringify(serverItem.attributes) ===
              JSON.stringify(localItem.attributes),
        );

        if (existingServerItem) {
          // Nếu mục đã tồn tại trong giỏ hàng server, cập nhật số lượng (local + server)
          existingServerItem.quantity += localItem.quantity;
        } else {
          // Nếu mục không tồn tại trong giỏ hàng server, thêm mới
          mergedItems.push(localItem);
        }
      });

      // Cập nhật trạng thái
      state.serverCart = {
        ...serverCart,
        items: mergedItems.map((item) => ({
          id: item.id,
          cartId: item.cartId || serverCart.id || '',
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          Product: {
            id: item.productId,
            name: item.name,
            slug: '',
            price: item.price,
            thumbnail: item.image,
            inStock: item.inStock || true,
            stockQuantity: item.stockQuantity || 0,
          },
          ProductVariant: item.variantId
            ? {
                id: item.variantId,
                name: item.attributes?.variant || '',
                price: item.price,
                stockQuantity: item.stockQuantity || 0,
              }
            : undefined,
        })),
      };

      state.items = mergedItems;
      state.totalItems = mergedItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.subtotal = mergedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Cập nhật localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
  },
});

export const {
  setServerCart,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  toggleCart,
  closeCart,
  openCart,
  setLoading,
  initializeCart,
  mergeWithLocalCart,
} = cartSlice.actions;

export default cartSlice.reducer;
