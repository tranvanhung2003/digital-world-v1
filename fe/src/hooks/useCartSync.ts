import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useAuth } from './useAuth';
import { useGetCartQuery, useSyncCartMutation } from '@/services/cartApi';
import { setServerCart, clearCart } from '@/features/cart/cartSlice';

/**
 * Hook để đồng bộ dữ liệu giỏ hàng giữa local storage và server
 * Xử lý việc đồng bộ giỏ hàng khi người dùng đăng nhập/đăng xuất
 */
export const useCartSync = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const localCartItems = useSelector((state: RootState) => state.cart.items);

  // Lấy giỏ hàng từ server khi người dùng đã đăng nhập
  const {
    data: serverCart,
    isLoading: isLoadingCart,
    error: cartError,
  } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Đồng bộ giỏ hàng local lên server
  const [syncCart, { isLoading: isSyncing }] = useSyncCartMutation();

  // Đồng bộ giỏ hàng local lên server khi người dùng đăng nhập
  useEffect(() => {
    const syncLocalCartToServer = async () => {
      if (isAuthenticated && localCartItems.length > 0) {
        try {
          // Chuyển đổi dữ liệu giỏ hàng từ định dạng local sang định dạng server
          const itemsToSync = localCartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            name: item.name,
            price: item.price,
            image: item.image,
            attributes: item.attributes,
          }));

          // Đồng bộ giỏ hàng lên server
          const syncedCart = await syncCart({ items: itemsToSync }).unwrap();

          // Cập nhật Redux store với phản hồi từ server
          dispatch(setServerCart(syncedCart));

          console.log('Đã đồng bộ giỏ hàng lên server thành công');
        } catch (error) {
          console.error('Lỗi khi đồng bộ giỏ hàng lên server:', error);
        }
      }
    };

    syncLocalCartToServer();
  }, [isAuthenticated, dispatch, syncCart]);

  // Cập nhật giỏ hàng từ server vào Redux store khi có thay đổi
  useEffect(() => {
    if (isAuthenticated && serverCart && !isSyncing) {
      dispatch(setServerCart(serverCart));
    }
  }, [serverCart, isAuthenticated, dispatch, isSyncing]);

  // Xóa giỏ hàng khi người dùng đăng xuất
  useEffect(() => {
    if (!isAuthenticated) {
      // Chỉ xóa dữ liệu giỏ hàng trên server, giữ lại giỏ hàng local cho người dùng khách
      dispatch(
        setServerCart({
          id: null,
          items: [],
          totalItems: 0,
          subtotal: 0,
        }),
      );
    }
  }, [isAuthenticated, dispatch]);

  return {
    isLoadingCart,
    isSyncing,
    cartError,
    serverCart,
  };
};

export default useCartSync;
